import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const LocationContext = createContext();

const DEFAULT_LOCATIONS = [
  { area: 'Andheri', city: 'Mumbai' },
  { area: 'Bandra', city: 'Mumbai' },
  { area: 'Baner', city: 'Pune' },
  { area: 'Kothrud', city: 'Pune' },
  { area: 'Deccan', city: 'Pune' }
];

export const LocationProvider = ({ children }) => {
  // geoLoc stores detected geolocation: { lat, lng, city, area }
  const [geoLoc, setGeoLoc] = useState(null);
  
  // selectedLocation stores active location string (e.g. "Sion, Mumbai" or "Select your area")
  const [selectedLocation, setSelectedLocation] = useState(() => 
    localStorage.getItem("selectedLocation") || "Select your area"
  );
  
  const [locationsList, setLocationsList] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [errorLocations, setErrorLocations] = useState(null);

  // Sync selectedLocation to localStorage
  const handleSetSelectedLocation = (value) => {
    setSelectedLocation(value);
    if (value && value !== 'Select your area') {
      localStorage.setItem("selectedLocation", value);
    } else {
      localStorage.removeItem("selectedLocation");
    }
  };

  // Fetch unique locations on mount once
  useEffect(() => {
    const controller = new AbortController();

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        setErrorLocations(null);
        const res = await api.get('/providers/locations', {
          signal: controller.signal
        });

        if (res.data && res.data.success && Array.isArray(res.data.locations)) {
          const list = res.data.locations;

          if (import.meta.env.DEV) {
            console.log('Fetched unique locations count:', list.length);
          }

          if (list.length === 0) {
            setLocationsList(DEFAULT_LOCATIONS);
          } else {
            // client-side deduplication safeguard using city + area
            const unique = [];
            const seen = new Set();
            list.forEach(item => {
              if (item && item.city && item.area) {
                const key = `${item.city.trim().toLowerCase()}_${item.area.trim().toLowerCase()}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  unique.push({
                    city: item.city.trim(),
                    area: item.area.trim()
                  });
                }
              }
            });

            // Sort alphabetically by city first, then area
            unique.sort((a, b) => {
              const cityCompare = a.city.localeCompare(b.city);
              if (cityCompare !== 0) return cityCompare;
              return a.area.localeCompare(b.area);
            });

            setLocationsList(unique);
          }
        } else {
          throw new Error('Invalid locations format');
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          if (import.meta.env.DEV) {
            console.error('API Error fetching locations, falling back to defaults:', err);
          }
          setErrorLocations(err.message || 'Error');
          setLocationsList(DEFAULT_LOCATIONS);
        }
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();

    return () => {
      controller.abort();
    };
  }, []);

  // Auto match geolocation resolving to locations list
  useEffect(() => {
    if (localStorage.getItem('selectedLocation')) {
      return; // Do not override user's saved location
    }

    if (geoLoc && geoLoc.city && geoLoc.area && locationsList.length > 0) {
      const normCity = geoLoc.city.trim().toLowerCase();
      const normArea = geoLoc.area.trim().toLowerCase();

      const matched = locationsList.find(loc => 
        loc.city.trim().toLowerCase() === normCity &&
        loc.area.trim().toLowerCase() === normArea
      );

      if (matched) {
        const formatted = `${matched.area}, ${matched.city}`;
        setSelectedLocation(formatted);

        if (import.meta.env.DEV) {
          console.log('Automatically set location from geolocation:', formatted);
        }
      }
    }
  }, [geoLoc, locationsList]);

  // Log changes to selected location in dev mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Selected location state:', selectedLocation);
    }
  }, [selectedLocation]);

  return (
    <LocationContext.Provider value={{ 
      location: geoLoc, 
      setLocation: setGeoLoc,
      selectedLocation,
      setSelectedLocation: handleSetSelectedLocation,
      locationsList,
      loadingLocations,
      errorLocations
    }}>
      {children}
    </LocationContext.Provider>
  );
};
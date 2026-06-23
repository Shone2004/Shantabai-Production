import { useEffect, useContext, useRef } from 'react';
import { LocationContext } from '../context/LocationContext';
import api from '../services/api';
import axios from 'axios';

export default function useGeoLocation() {
  const { location, setLocation } = useContext(LocationContext);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // If location lat/lng already exists, or we have already run this hook instance, don't execute
    if (fetchedRef.current || (location && location.lat && location.lng)) {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    fetchedRef.current = true;
    const controller = new AbortController();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await api.get(`/providers/reverse-geocode?lat=${lat}&lng=${lng}`, {
            signal: controller.signal
          });

          if (res.data && res.data.success) {
            const { city, area } = res.data;
            setLocation(prev => ({
              ...prev,
              lat,
              lng,
              city: city || '',
              area: area || ''
            }));
          } else {
            setLocation(prev => ({
              ...prev,
              lat,
              lng,
              city: '',
              area: ''
            }));
          }
        } catch (err) {
          if (!axios.isCancel(err)) {
            if (import.meta.env.DEV) {
              console.error('Reverse geocoding failed:', err);
            }
            setLocation(prev => ({
              ...prev,
              lat,
              lng,
              city: '',
              area: ''
            }));
          }
        }
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('Location detection error:', error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    return () => {
      controller.abort();
    };
  }, [location, setLocation]);
}
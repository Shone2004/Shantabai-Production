import { useEffect, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';

export default function useGeoLocation() {
  const { setLocation } = useContext(LocationContext);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
  }, [setLocation]);
}
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFoodDetail = (id) => {
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFood = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/foods/${id}`);
      if (!data.success) throw new Error('Dish details could not be loaded.');
      
      const item = data.foodItem;
      const p = item.provider || {};
      
      setFood({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.images?.[0] || 'fallback-url',
        category: item.category,
        availabilityTime: item.timeWindow || 'Contact Provider',
        quantityAvailable: item.quantity,
        bringContainer: item.bringContainer ?? false,
        provider: {
          id: p._id,
          name: p.kitchenName || 'Home Cook',
          address: p.fullAddress || 'Contact Provider'
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFood(); }, [id]);

  return { food, loading, error, refreshFood: fetchFood };
};
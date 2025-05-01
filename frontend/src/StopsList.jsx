import React, { useEffect, useState } from 'react';
import { fetchStops } from './api';

export default function StopsList({ route, onSelectStop, onBack }) {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route) {
      setLoading(true);
      fetchStops(route.id).then(data => {
        setStops(data);
        setLoading(false);
      });
    }
  }, [route]);

  if (!route) return null;

  return (
    <div>
      <button onClick={onBack}>Back to Routes</button>
      <h3>Stops for {route.name}</h3>
      {loading && <div>Loading...</div>}
      <ul>
        {stops.map(stop => (
          <li key={stop.id}>
            <button onClick={() => onSelectStop(stop)}>{stop.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

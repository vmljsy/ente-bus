import React, { useState } from 'react';
import { fetchRoutes } from './api';

export default function RoutesSearch({ onSelectRoute }) {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await fetchRoutes(query);
    setRoutes(data);
    setLoading(false);
  };

  return (
    <div>
      <h2>Search Bus Routes</h2>
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter route name or number"
        />
        <button type="submit">Search</button>
      </form>
      {loading && <div>Loading...</div>}
      <ul>
        {routes.map(route => (
          <li key={route.id}>
            <button onClick={() => onSelectRoute(route)}>{route.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

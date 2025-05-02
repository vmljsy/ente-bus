import React, { useState, useEffect } from 'react';
import { fetchRoutes, fetchStops } from './api';
import { FaSearch, FaBus, FaMapMarkerAlt, FaExchangeAlt } from 'react-icons/fa';

export default function RoutesSearch({ onSelectRoute }) {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startStop, setStartStop] = useState('');
  const [endStop, setEndStop] = useState('');
  const [stops, setStops] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStops = async () => {
      try {
        const data = await fetchStops();
        setStops(data || []);
      } catch (err) {
        console.error('Failed to load stops:', err);
        setError('Failed to load stops');
      }
    };
    loadStops();

    // Clear state when component mounts
    setQuery('');
    setRoutes([]);
    setStartStop('');
    setEndStop('');
    setError(null);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!startStop && !endStop && !query) {
      setError('Please select at least one stop or enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRoutes([]); // Clear routes before new search
      const data = await fetchRoutes(query, startStop, endStop);
      setRoutes(data || []);
    } catch (err) {
      console.error('Failed to search routes:', err);
      setError('Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  const handleStopChange = (type, value) => {
    if (type === 'start') {
      setStartStop(value);
      if (value === endStop) {
        setEndStop('');
      }
    } else {
      setEndStop(value);
      if (value === startStop) {
        setStartStop('');
      }
    }
    setError(null);
  };

  return (
    <div className="route-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="select-group">
          <div className="form-group">
            <div className="form-label-wrapper">
              <FaMapMarkerAlt className="input-icon" />
            <label htmlFor="start-stop">Start Location</label>
            </div>
            <div className="input-wrapper">
              <select 
                id="start-stop"
                value={startStop} 
                onChange={e => handleStopChange('start', e.target.value)} 
                className="select-input"
              >
                <option value="">Select Start Stop</option>
                {stops.map(stop => (
                  <option 
                    key={stop.stop_id} 
                    value={stop.stop_name}
                    disabled={stop.stop_name === endStop}
                  >
                    {stop.stop_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FaExchangeAlt className="exchange-icon" />

          <div className="form-group">
            <div className="form-label-wrapper">
              <FaMapMarkerAlt className="input-icon" />
              <label htmlFor="end-stop">End Location</label>
            </div>
            <div className="input-wrapper">
              <select 
                id="end-stop"
                value={endStop} 
                onChange={e => handleStopChange('end', e.target.value)} 
                className="select-input"
              >
                <option value="">Select End Stop</option>
                {stops.map(stop => (
                  <option 
                    key={stop.stop_id} 
                    value={stop.stop_name}
                    disabled={stop.stop_name === startStop}
                  >
                    {stop.stop_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="search-button" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Searching...
            </>
          ) : (
            <>
              <FaSearch />
              Search Routes
            </>
          )}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {routes.length > 0 && (
        <div className="routes-list">
          <h3>Available Routes</h3>
          <div className="route-cards">
            {routes.map(route => (
              <button
                key={route.route_id}
                onClick={() => onSelectRoute(route)}
                className="route-card"
              >
                <div className="route-number">
                  <FaBus className="route-icon" />
                  {route.route_short_name}
                </div>
                <div className="route-name">{route.route_long_name || ''}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {routes.length === 0 && !loading && (startStop || endStop) && (
        <div className="no-routes">No routes found for the selected stops.</div>
      )}
    </div>
  );
}

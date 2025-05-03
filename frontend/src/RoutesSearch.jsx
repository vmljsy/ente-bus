import React, { useState, useEffect } from 'react';
import { fetchRoutes } from './api';
import { FaSearch, FaBus, FaArrowRight } from 'react-icons/fa';
import StopSelect from './StopSelect';
import './RoutesSearch.css';

export default function RoutesSearch({ onSelectRoute, onAddStop }) {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startStop, setStartStop] = useState('');
  const [endStop, setEndStop] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
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
      setRoutes([]); 
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
          <StopSelect
            id="start-stop"
            value={startStop}
            onChange={(value) => handleStopChange('start', value)}
            label="From"
            disabledValue={endStop}
            required
          />

          <FaArrowRight className="exchange-icon" />

          <StopSelect
            id="end-stop"
            value={endStop}
            onChange={(value) => handleStopChange('end', value)}
            label="To"
            disabledValue={startStop}
            required
          />
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

      {routes.length === 0 && !loading && (startStop || endStop || query) && (
        <div className="no-routes">No routes found for the selected criteria.</div>
      )}
    </div>
  );
}

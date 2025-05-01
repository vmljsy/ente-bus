import React, { useState, useEffect } from 'react';
import { fetchRoutes, fetchStops } from './api';
import RoutesSearch from './RoutesSearch';
import StopsList from './StopsList';
import SightingForm from './SightingForm';
import TripSchedule from './TripSchedule';
import { FaBus, FaMapMarkerAlt, FaExchangeAlt, FaSearch, FaTimes, FaClock } from 'react-icons/fa';
import './App.css';

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [stops, setStops] = useState([]);
  const [startStop, setStartStop] = useState('');
  const [endStop, setEndStop] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingStops, setLoadingStops] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('stops'); // 'stops' or 'schedule'

  useEffect(() => {
    const loadStops = async () => {
      try {
        setLoadingStops(true);
        setError(null);
        const data = await fetchStops();
        setStops(data || []);
      } catch (err) {
        console.error('Failed to load stops:', err);
        setError('Failed to load stops. The backend server might not be running.');
      } finally {
        setLoadingStops(false);
      }
    };
    loadStops();
  }, []);

  const handleFindRoutes = async (e) => {
    e.preventDefault();
    try {
      setLoadingRoutes(true);
      setError(null);
      setRoutes([]);
      const data = await fetchRoutes('', startStop, endStop);
      setRoutes(data);
    } catch (err) {
      console.error('Failed to load routes:', err);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleViewToggle = () => {
    setViewType(viewType === 'stops' ? 'schedule' : 'stops');
  };

  return (
    <div className="app-container">
      <div className="header">
        <FaBus size={48} className="bus-icon" />
        <h1>Ente Bus</h1>
        <p className="subtitle">Crowdsource Bus Data</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>
            <FaTimes />
            Dismiss
          </button>
        </div>
      )}

      {!selectedRoute && (
        <div className="search-container">
          <h2><FaSearch className="section-icon" /> Find Buses Between Stops</h2>
          {loadingStops ? (
            <div className="loading">Loading stops...</div>
          ) : (
            <form onSubmit={handleFindRoutes} className="search-form">
              <div className="select-group">
                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />
                  <select 
                    value={startStop} 
                    onChange={e => setStartStop(e.target.value)} 
                    required
                    className="select-input"
                  >
                    <option value="">Select Start</option>
                    {stops.map(stop => (
                      <option key={stop.stop_id} value={stop.stop_name}>
                        {stop.stop_name}
                      </option>
                    ))}
                  </select>
                </div>

                <FaExchangeAlt className="exchange-icon" />

                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />
                  <select 
                    value={endStop} 
                    onChange={e => setEndStop(e.target.value)} 
                    required
                    className="select-input"
                  >
                    <option value="">Select Destination</option>
                    {stops.map(stop => (
                      <option key={stop.stop_id} value={stop.stop_name}>
                        {stop.stop_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button type="submit" className="search-button" disabled={loadingRoutes}>
                {loadingRoutes ? (
                  <>
                    <div className="spinner"></div>
                    Finding Buses...
                  </>
                ) : (
                  <>
                    <FaSearch />
                    Find Buses
                  </>
                )}
              </button>
            </form>
          )}

          {routes.length > 0 && (
            <div className="routes-list">
              <h3>Available Routes</h3>
              <div className="route-cards">
                {routes.map(route => (
                  <button
                    key={route.route_id}
                    onClick={() => {
                      setSelectedRoute(route);
                      setSelectedStop(null);
                    }}
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

          {routes.length === 0 && !loadingRoutes && (startStop && endStop) && (
            <div className="no-routes">No routes found for this selection.</div>
          )}
        </div>
      )}

      {selectedRoute && !selectedStop && (
        <>
          {viewType === 'stops' ? (
            <StopsList
              route={selectedRoute}
              onSelectStop={stop => setSelectedStop(stop)}
              onBack={() => setSelectedRoute(null)}
            />
          ) : (
            <TripSchedule
              route={selectedRoute}
              onBack={() => setSelectedRoute(null)}
            />
          )}
          <button className="view-toggle" onClick={handleViewToggle}>
            {viewType === 'stops' ? (
              <>
                <FaClock /> View Schedule
              </>
            ) : (
              <>
                <FaMapMarkerAlt /> View Stops
              </>
            )}
          </button>
        </>
      )}

      {selectedRoute && selectedStop && (
        <SightingForm
          stop={selectedStop}
          onBack={() => setSelectedStop(null)}
        />
      )}
    </div>
  );
}

export default App;

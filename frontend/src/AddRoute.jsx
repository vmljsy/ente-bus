import React, { useState, useEffect } from 'react';
import { FaBus, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { createRoute, fetchStops } from './api';

export default function AddRoute({ isOpen, onClose, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stops, setStops] = useState([]);
  const [routeData, setRouteData] = useState({
    route_id: '',
    route_short_name: '',
    route_long_name: '',
    route_type: 3,
    start_stop: '',
    end_stop: ''
  });

  useEffect(() => {
    const loadStops = async () => {
      try {
        const data = await fetchStops();
        setStops(data || []);
      } catch (err) {
        setError('Failed to load stops');
      }
    };
    if (isOpen) {
      loadStops();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await createRoute(routeData);
      if (result.success) {
        onAdd(result.route);
        onClose();
        // Reset form
        setRouteData({
          route_id: '',
          route_short_name: '',
          route_long_name: '',
          route_type: 3,
          start_stop: '',
          end_stop: ''
        });
      } else {
        setError('Failed to create route');
      }
    } catch (err) {
      setError(err.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const handleStopChange = (type, value) => {
    if (type === 'start') {
      setRouteData(prev => ({
        ...prev,
        start_stop: value,
        end_stop: value === prev.end_stop ? '' : prev.end_stop
      }));
    } else {
      setRouteData(prev => ({
        ...prev,
        end_stop: value,
        start_stop: value === prev.start_stop ? '' : prev.start_stop
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <FaBus className="modal-icon" />
          <h2>Add New Route</h2>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
          <div className="form-group">
            <label htmlFor="route_id">Route ID</label>
            <input
              id="route_id"
              type="text"
              value={routeData.route_id}
              onChange={(e) => setRouteData({ ...routeData, route_id: e.target.value })}
              required
              placeholder="Enter route ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="route_short_name">Route Number</label>
            <input
              id="route_short_name"
              type="text"
              value={routeData.route_short_name}
              onChange={(e) => setRouteData({ ...routeData, route_short_name: e.target.value })}
              required
              placeholder="e.g., TVM-KCH-1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="route_long_name">Route Name</label>
            <input
              id="route_long_name"
              type="text"
              value={routeData.route_long_name}
              onChange={(e) => setRouteData({ ...routeData, route_long_name: e.target.value })}
              placeholder="e.g., Thiruvananthapuram - Kochi Express"
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_stop">
              <FaMapMarkerAlt className="input-icon" />
              Start Location
            </label>
            <select
              id="start_stop"
              value={routeData.start_stop}
              onChange={(e) => handleStopChange('start', e.target.value)}
              required
              className="select-input"
            >
              <option value="">Select Start Stop</option>
              {stops.map(stop => (
                <option
                  key={stop.stop_id}
                  value={stop.stop_name}
                  disabled={stop.stop_name === routeData.end_stop}
                >
                  {stop.stop_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="end_stop">
              <FaMapMarkerAlt className="input-icon" />
              End Location
            </label>
            <select
              id="end_stop"
              value={routeData.end_stop}
              onChange={(e) => handleStopChange('end', e.target.value)}
              required
              className="select-input"
            >
              <option value="">Select End Stop</option>
              {stops.map(stop => (
                <option
                  key={stop.stop_id}
                  value={stop.stop_name}
                  disabled={stop.stop_name === routeData.start_stop}
                >
                  {stop.stop_name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Adding Route...' : 'Add Route'}
          </button>
        </form>
      </div>
    </div>
  );
}
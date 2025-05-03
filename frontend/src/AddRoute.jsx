import React, { useState, useEffect } from 'react';
import { FaBus, FaTimes } from 'react-icons/fa';
import { createRoute, fetchStops } from './api';
import StopSelect from './StopSelect';

export default function AddRoute({ isOpen, onClose, onAdd, onAddStop }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stops, setStops] = useState([]);
  const [routeData, setRouteData] = useState({
    route_id: '',
    route_short_name: '',
    route_long_name: '',
    route_type: 3,
    start_stop: '',
    end_stop: ''
  });

  const loadStops = async () => {
    try {
      const data = await fetchStops();
      setStops(data || []);
    } catch (err) {
      setError('Failed to load stops');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStops();
    }
  }, [isOpen]);

  // Wrap onAddStop to refresh stops after adding a new one
  const handleAddStop = () => {
    const originalOnAddStop = onAddStop;
    originalOnAddStop();
    // Set a small delay to ensure the stop is added before refreshing
    setTimeout(loadStops, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await createRoute(routeData);
      if (result.success) {
        setSuccess('Route added successfully!');
        onAdd(result.route);
        // Reset form after a short delay to show success message
        setTimeout(() => {
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
          setSuccess('');
        }, 1500);
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
        start_stop: value,  // This now receives stop_id instead of stop_name
        end_stop: value === prev.end_stop ? '' : prev.end_stop
      }));
    } else {
      setRouteData(prev => ({
        ...prev,
        end_stop: value,  // This now receives stop_id instead of stop_name
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

          <StopSelect
            id="start_stop"
            value={routeData.start_stop}
            onChange={(value) => handleStopChange('start', value)}
            onAddStop={handleAddStop}
            label="Start Location"
            stops={stops}
            disabledValue={routeData.end_stop}
            required
          />

          <StopSelect
            id="end_stop"
            value={routeData.end_stop}
            onChange={(value) => handleStopChange('end', value)}
            onAddStop={handleAddStop}
            label="End Location"
            stops={stops}
            disabledValue={routeData.start_stop}
            required
          />

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

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
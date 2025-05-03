import React, { useState } from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { createStop } from './api';

export default function AddStop({ isOpen, onClose, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState('');
  const [stopData, setStopData] = useState({
    stop_id: '',
    stop_name: '',
    stop_lat: '',
    stop_lon: ''
  });

  const validateForm = () => {
    const newErrors = {};
    
    // Stop ID validation
    if (!stopData.stop_id) {
      newErrors.stop_id = 'Stop ID is required';
    } else if (!/^[A-Za-z0-9-_]+$/.test(stopData.stop_id)) {
      newErrors.stop_id = 'Stop ID can only contain letters, numbers, hyphens and underscores';
    }

    // Stop name validation
    if (!stopData.stop_name) {
      newErrors.stop_name = 'Stop name is required';
    } else if (stopData.stop_name.length < 3) {
      newErrors.stop_name = 'Stop name must be at least 3 characters long';
    }

    // Latitude validation
    const lat = parseFloat(stopData.stop_lat);
    if (!stopData.stop_lat) {
      newErrors.stop_lat = 'Latitude is required';
    } else if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.stop_lat = 'Latitude must be between -90 and 90';
    }

    // Longitude validation
    const lon = parseFloat(stopData.stop_lon);
    if (!stopData.stop_lon) {
      newErrors.stop_lon = 'Longitude is required';
    } else if (isNaN(lon) || lon < -180 || lon > 180) {
      newErrors.stop_lon = 'Longitude must be between -180 and 180';
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError({});
    setSuccess('');

    try {
      const result = await createStop({
        ...stopData,
        stop_lat: parseFloat(stopData.stop_lat),
        stop_lon: parseFloat(stopData.stop_lon)
      });

      if (result && result.stop) {  // Check if we have a valid response with stop data
        setSuccess('Stop added successfully!');
        onAdd(result.stop);
        // Reset form after a short delay to show success message
        setTimeout(() => {
          onClose();
          // Reset form
          setStopData({
            stop_id: '',
            stop_name: '',
            stop_lat: '',
            stop_lon: ''
          });
          setSuccess('');
        }, 1500);
      } else {
        // If we have a failure message from the API, use it
        setError({ api: result?.message || 'Failed to create stop. Please try again.' });
      }
    } catch (err) {
      setError({ api: err.message || 'Failed to create stop. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setStopData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (error[field]) {
      setError(prev => ({ ...prev, [field]: '' }));
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
          <FaMapMarkerAlt className="modal-icon" />
          <h2>Add New Stop</h2>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
          <div className="form-group">
            <label htmlFor="stop_id">Stop ID</label>
            <input
              id="stop_id"
              type="text"
              value={stopData.stop_id}
              onChange={(e) => handleInputChange('stop_id', e.target.value)}
              className={error.stop_id ? 'error' : ''}
              placeholder="Enter stop ID (e.g., TVM-01)"
            />
            {error.stop_id && <div className="field-error">{error.stop_id}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="stop_name">Stop Name</label>
            <input
              id="stop_name"
              type="text"
              value={stopData.stop_name}
              onChange={(e) => handleInputChange('stop_name', e.target.value)}
              className={error.stop_name ? 'error' : ''}
              placeholder="Enter stop name"
            />
            {error.stop_name && <div className="field-error">{error.stop_name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="stop_lat">Latitude</label>
            <input
              id="stop_lat"
              type="number"
              step="any"
              value={stopData.stop_lat}
              onChange={(e) => handleInputChange('stop_lat', e.target.value)}
              className={error.stop_lat ? 'error' : ''}
              placeholder="Enter latitude (e.g., 8.5241)"
            />
            {error.stop_lat && <div className="field-error">{error.stop_lat}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="stop_lon">Longitude</label>
            <input
              id="stop_lon"
              type="number"
              step="any"
              value={stopData.stop_lon}
              onChange={(e) => handleInputChange('stop_lon', e.target.value)}
              className={error.stop_lon ? 'error' : ''}
              placeholder="Enter longitude (e.g., 76.9366)"
            />
            {error.stop_lon && <div className="field-error">{error.stop_lon}</div>}
          </div>

          {error.api && <div className="error-message">{error.api}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Adding Stop...' : 'Add Stop'}
          </button>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { createStop } from './api';

export default function AddStop({ isOpen, onClose, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stopData, setStopData] = useState({
    stop_id: '',
    stop_name: '',
    stop_lat: '',
    stop_lon: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createStop({
        ...stopData,
        stop_lat: parseFloat(stopData.stop_lat),
        stop_lon: parseFloat(stopData.stop_lon)
      });

      if (result.success) {
        onAdd(result.stop);
        onClose();
        // Reset form
        setStopData({
          stop_id: '',
          stop_name: '',
          stop_lat: '',
          stop_lon: ''
        });
      } else {
        setError('Failed to create stop');
      }
    } catch (err) {
      setError(err.message || 'Failed to create stop');
    } finally {
      setLoading(false);
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
              onChange={(e) => setStopData({ ...stopData, stop_id: e.target.value })}
              required
              placeholder="Enter stop ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stop_name">Stop Name</label>
            <input
              id="stop_name"
              type="text"
              value={stopData.stop_name}
              onChange={(e) => setStopData({ ...stopData, stop_name: e.target.value })}
              required
              placeholder="Enter stop name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stop_lat">Latitude</label>
            <input
              id="stop_lat"
              type="number"
              step="any"
              value={stopData.stop_lat}
              onChange={(e) => setStopData({ ...stopData, stop_lat: e.target.value })}
              required
              placeholder="Enter latitude"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stop_lon">Longitude</label>
            <input
              id="stop_lon"
              type="number"
              step="any"
              value={stopData.stop_lon}
              onChange={(e) => setStopData({ ...stopData, stop_lon: e.target.value })}
              required
              placeholder="Enter longitude"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

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
import React, { useState } from 'react';
import { fetchTrips, fetchStops } from './api';
import { FaBus, FaStopCircle, FaClock, FaPlus } from 'react-icons/fa';

export default function AddTrip({ route, onBack }) {
  const [tripId, setTripId] = useState('');
  const [serviceId, setServiceId] = useState('WEEKDAY');
  const [tripHeadsign, setTripHeadsign] = useState('');
  const [directionId, setDirectionId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id: tripId,
          route_id: route.route_id,
          service_id: serviceId,
          trip_headsign: tripHeadsign,
          direction_id: directionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      setSuccess(true);
      setTripId('');
      setTripHeadsign('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!route) {
    return (
      <div className="add-trip-container">
        <div className="info-message">
          Please select a route from the Search Routes page first to add a trip.
        </div>
      </div>
    );
  }

  return (
    <div className="add-trip-container">
      <button onClick={onBack} className="back-button">
        Back to Routes
      </button>
      
      <h2>
        <FaBus className="icon" />
        Add New Trip for {route.route_short_name}
      </h2>

      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label>
            <FaBus className="input-icon" />
            Trip ID:
          </label>
          <input
            type="text"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            required
            placeholder="Enter unique trip ID"
          />
        </div>

        <div className="form-group">
          <label>
            <FaStopCircle className="input-icon" />
            Trip Headsign:
          </label>
          <input
            type="text"
            value={tripHeadsign}
            onChange={(e) => setTripHeadsign(e.target.value)}
            placeholder="Enter trip headsign"
          />
        </div>

        <div className="form-group">
          <label>
            <FaClock className="input-icon" />
            Service Type:
          </label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="WEEKDAY">Weekday</option>
            <option value="SATURDAY">Saturday</option>
            <option value="SUNDAY">Sunday</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Direction:
          </label>
          <select
            value={directionId}
            onChange={(e) => setDirectionId(Number(e.target.value))}
          >
            <option value={0}>Outbound</option>
            <option value={1}>Inbound</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          <FaPlus />
          {loading ? 'Adding Trip...' : 'Add Trip'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Trip added successfully!
        </div>
      )}
    </div>
  );
}
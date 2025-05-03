import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchStops, fetchRoutes } from './api';
import { FaBus, FaStopCircle, FaClock, FaPlus, FaArrowRight, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import StopSelect from './StopSelect';

export default function AddTrip({ onBack, onAddRoute, onAddStop }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [startStop, setStartStop] = useState('');
  const [endStop, setEndStop] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [tripData, setTripData] = useState({
    trip_id: '',
    service_id: 'WEEKDAY',
    trip_headsign: '',
    direction_id: 0
  });
  const [stopTimes, setStopTimes] = useState([]);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      const data = await fetchStops();
      setStops(data || []);
    } catch (err) {
      setError('Failed to load stops');
    }
  };

  const handleAddStop = () => {
    const originalOnAddStop = onAddStop;
    originalOnAddStop();
    setTimeout(loadStops, 500);
  };

  const handleSearch = async () => {
    if (!startStop && !endStop) {
      setError('Please select at least one stop');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchRoutes('', startStop, endStop);
      setRoutes(data || []);
      setStep(2); // Move to route selection step after search
    } catch (err) {
      setError('Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  const handleStopChange = (type, value) => {
    if (type === 'start') {
      setStartStop(value);  // This now receives stop_id instead of stop_name
      if (value === endStop) setEndStop('');
    } else {
      setEndStop(value);  // This now receives stop_id instead of stop_name
      if (value === startStop) setStartStop('');
    }
    setError(null);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setStep(3);
  };

  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return '';
    // Convert HH:MM:SS to HH:MM format for input
    return timeStr.split(':').slice(0, 2).join(':');
  };

  const formatTimeForAPI = (timeStr) => {
    if (!timeStr) return '';
    // Convert HH:MM to HH:MM:SS format for API
    return `${timeStr}:00`;
  };

  const handleAddStopTime = () => {
    setStopTimes([...stopTimes, { stop_id: '', arrival_time: '', departure_time: '' }]);
  };

  const handleStopTimeChange = (index, field, value) => {
    const newStopTimes = [...stopTimes];
    if (field === 'stop_id') {
      newStopTimes[index] = { 
        ...newStopTimes[index], 
        stop_id: value  // Directly use the stop_id now
      };
    } else {
      newStopTimes[index] = { 
        ...newStopTimes[index], 
        [field]: field.includes('time') ? formatTimeForAPI(value) : value 
      };
    }
    setStopTimes(newStopTimes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // First try to create the trip
      const tripResponse = await fetch('http://localhost:8000/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tripData,
          route_id: selectedRoute.route_id,
        }),
      });

      if (!tripResponse.ok) {
        const errorData = await tripResponse.json();
        // Check for duplicate trip ID error
        if (tripResponse.status === 400 && errorData.detail?.includes('duplicate')) {
          throw new Error('Trip ID already exists. Please use a different ID.');
        }
        throw new Error(errorData.detail || 'Failed to create trip');
      }

      // If trip creation succeeds, submit stop times
      for (const [index, stopTime] of stopTimes.entries()) {
        const response = await fetch('http://localhost:8000/api/v1/stop_times', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...stopTime,
            trip_id: tripData.trip_id,
            stop_sequence: index + 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to add stop time');
        }
      }

      setStep(1);
      setSelectedRoute(null);
      setStopTimes([]);
      setTripData({
        trip_id: '',
        service_id: 'WEEKDAY',
        trip_headsign: '',
        direction_id: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 3) {
        setSelectedRoute(null);
      }
    } else {
      onBack();
    }
  };

  const renderStepOne = () => (
    <div className="search-form">
      <div className="select-group">
        <StopSelect
          id="start-stop"
          value={startStop}
          onChange={(value) => handleStopChange('start', value)}
          onAddStop={handleAddStop}
          label="Start Location"
          stops={stops}
          disabledValue={endStop}
          required
        />

        <FaArrowRight className="exchange-icon" />

        <StopSelect
          id="end-stop"
          value={endStop}
          onChange={(value) => handleStopChange('end', value)}
          onAddStop={handleAddStop}
          label="End Location"
          stops={stops}
          disabledValue={startStop}
          required
        />
      </div>

      <button
        onClick={handleSearch}
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
            Find Routes
          </>
        )}
      </button>
    </div>
  );

  const renderStepTwo = () => (
    <div className="routes-container">
      {routes.length > 0 && (
        <>
          <h3>Select Existing Route</h3>
          <div className="route-cards">
            {routes.map(route => (
              <button
                key={route.route_id}
                onClick={() => handleRouteSelect(route)}
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
        </>
      )}
      
      <div className="new-route-section">
        <div className="section-divider">
          <span>OR</span>
        </div>
        <button 
          className="add-detail-button"
          onClick={onAddRoute}
        >
          <FaPlus />
          Add New Route
        </button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <form onSubmit={handleSubmit} className="trip-form">
      <div className="form-group">
        <label>
          <FaBus className="input-icon" />
          Trip ID:
        </label>
        <input
          type="text"
          value={tripData.trip_id}
          onChange={(e) => setTripData({ ...tripData, trip_id: e.target.value })}
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
          value={tripData.trip_headsign}
          onChange={(e) => setTripData({ ...tripData, trip_headsign: e.target.value })}
          placeholder="Enter trip headsign"
        />
      </div>

      <div className="form-group">
        <label>
          <FaClock className="input-icon" />
          Service Type:
        </label>
        <select
          value={tripData.service_id}
          onChange={(e) => setTripData({ ...tripData, service_id: e.target.value })}
        >
          <option value="WEEKDAY">Weekday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>
      </div>

      <div className="form-group">
        <label>Direction:</label>
        <select
          value={tripData.direction_id}
          onChange={(e) => setTripData({ ...tripData, direction_id: Number(e.target.value) })}
        >
          <option value={0}>Outbound</option>
          <option value={1}>Inbound</option>
        </select>
      </div>

      <div className="stop-times-section">
        <h3>Stop Schedule</h3>
        <div className="stop-times-list">
          {stopTimes.map((stopTime, index) => (
            <div key={index} className="stop-time-item">
              <StopSelect
                value={stopTime.stop_id}
                onChange={(value) => handleStopTimeChange(index, 'stop_id', value)}
                onAddStop={handleAddStop}
                stops={stops}
                required
              />
              <div className="time-input-group">
                <input
                  type="time"
                  value={formatTimeForInput(stopTime.arrival_time)}
                  onChange={(e) => handleStopTimeChange(index, 'arrival_time', e.target.value)}
                  className="modern-time-input"
                  required
                />
                <input
                  type="time"
                  value={formatTimeForInput(stopTime.departure_time)}
                  onChange={(e) => handleStopTimeChange(index, 'departure_time', e.target.value)}
                  className="modern-time-input"
                  required
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="add-detail-button"
          onClick={handleAddStopTime}
        >
          <FaPlus />
          Add Stop Time
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-button" disabled={loading}>
        <FaPlus />
        {loading ? 'Adding Trip...' : 'Add Trip'}
      </button>
    </form>
  );

  return (
    <div className="add-trip-container">
      <button onClick={handleBackStep} className="back-button">
        Back
      </button>
      
      <h2>
        <FaBus className="icon" />
        Add New Trip
      </h2>

      <div className="step-indicator">
        Step {step} of 3: {step === 1 ? 'Select Stops' : step === 2 ? 'Choose Route' : 'Add Trip Details'}
      </div>

      {step === 1 && renderStepOne()}
      {step === 2 && renderStepTwo()}
      {step === 3 && renderStepThree()}
    </div>
  );
}
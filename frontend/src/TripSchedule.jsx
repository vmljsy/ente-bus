import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchTripStopTimes } from './api';
import { FaClock, FaBus, FaArrowRight } from 'react-icons/fa';

export default function TripSchedule({ route, onBack }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [stopTimes, setStopTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route) {
      loadTrips();
    }
  }, [route]);

  useEffect(() => {
    if (selectedTrip) {
      loadStopTimes();
    }
  }, [selectedTrip]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await fetchTrips(route.route_id);
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    }
    setLoading(false);
  };

  const loadStopTimes = async () => {
    setLoading(true);
    try {
      const data = await fetchTripStopTimes(selectedTrip.trip_id);
      setStopTimes(data);
    } catch (error) {
      console.error('Error loading stop times:', error);
    }
    setLoading(false);
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  if (!route) return null;

  return (
    <div className="trip-schedule">
      <button onClick={onBack} className="back-button">
        Back to Routes
      </button>
      
      <h2>
        <FaBus className="icon" />
        Trip Schedule for {route.route_short_name}
      </h2>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {!selectedTrip ? (
            <div className="trips-list">
              <h3>Select a Trip</h3>
              {trips.map(trip => (
                <button
                  key={trip.trip_id}
                  className="trip-button"
                  onClick={() => setSelectedTrip(trip)}
                >
                  <FaClock className="icon" />
                  {trip.trip_headsign || `Trip ${trip.trip_id}`}
                </button>
              ))}
            </div>
          ) : (
            <div className="stop-times">
              <button 
                onClick={() => setSelectedTrip(null)}
                className="back-button"
              >
                Back to Trips
              </button>
              
              <h3>{selectedTrip.trip_headsign || `Trip ${selectedTrip.trip_id}`}</h3>
              
              <div className="schedule-list">
                {stopTimes.map((stopTime, index) => (
                  <div key={index} className="schedule-item">
                    <div className="time">
                      <FaClock className="icon" />
                      {formatTime(stopTime.arrival_time)}
                    </div>
                    <FaArrowRight className="arrow-icon" />
                    <div className="stop-name">
                      {stopTime.stop_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
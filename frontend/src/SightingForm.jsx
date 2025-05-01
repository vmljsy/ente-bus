import React, { useState } from 'react';
import { submitSighting } from './api';

export default function SightingForm({ stop, onBack }) {
  const [busNumber, setBusNumber] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const data = {
      stop_id: stop.id,
      bus_number: busNumber,
      time: time || new Date().toISOString(),
    };
    try {
      await submitSighting(data);
      setSuccess(true);
      setBusNumber('');
      setTime('');
    } catch (err) {
      setMessage('Error submitting sighting');
    }
    setLoading(false);
  };

  if (!stop) return null;

  return (
    <div>
      <button onClick={onBack}>Back to Stops</button>
      <h3>Submit Sighting for {stop.name}</h3>
      <form onSubmit={handleSubmit}>
        <input
          value={busNumber}
          onChange={e => setBusNumber(e.target.value)}
          placeholder="Bus Number"
          required
        />
        <input
          type="datetime-local"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
        <button type="submit" disabled={loading}>Submit</button>
      </form>
      {success && <div>Sighting submitted!</div>}
      {message && <div>{message}</div>}
    </div>
  );
}

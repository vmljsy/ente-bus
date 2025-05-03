import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { searchStops } from './api';
import './StopSelect.css';

export default function StopSelect({ 
  value, 
  onChange, 
  label,
  disabledValue,
  required,
  id 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const prevSearchRef = useRef('');
  const blurTimeoutRef = useRef(null);

  const fetchStops = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await searchStops(query);
      setStops(results);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching stops:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setStops([]);
      setIsOpen(false);
      return;
    }

    if (!selectedStop && searchQuery !== prevSearchRef.current) {
      const delayDebounce = setTimeout(() => {
        fetchStops(searchQuery);
      }, 300);
      prevSearchRef.current = searchQuery;
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, fetchStops, selectedStop]);

  // Only update searchQuery if value changes externally (not while typing)
  useEffect(() => {
    if (value && (!selectedStop || selectedStop.stop_id !== value)) {
      // If the value changed but doesn't match current selection,
      // find the stop in our current list or fetch it
      const stop = stops.find(s => s.stop_id === value);
      if (stop) {
        setSelectedStop(stop);
        setSearchQuery(stop.stop_name);
      } else {
        // If not in current stops, just set the value as is (for controlled input)
        setSearchQuery(value);
      }
    }
    if (!value && selectedStop) {
      setSelectedStop(null);
      setSearchQuery('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (stop) => {
    setSelectedStop(stop);
    setSearchQuery(stop.stop_name);
    setIsOpen(false);
    setStops([]);
    onChange(stop.stop_id);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSelectedStop(null);
    onChange('');
    if (newValue.trim()) {
      setIsOpen(true);
      fetchStops(newValue);
    } else {
      setIsOpen(false);
      setStops([]);
    }
  };

  const handleFocus = () => {
    if (searchQuery.trim()) {
      setIsOpen(true);
      fetchStops(searchQuery);
    }
  };

  const handleBlur = (e) => {
    if (dropdownRef.current?.contains(e.relatedTarget)) {
      return;
    }

    blurTimeoutRef.current = setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (!selectedStop) {
          setSearchQuery('');
          onChange('');
        }
      }
    }, 150);
  };

  return (
    <div className="stop-select-container">
      {label && (
        <div className="stop-select-label">
          <FaMapMarkerAlt className="stop-select-icon" />
          <label htmlFor={id}>{label}</label>
        </div>
      )}
      <div className="stop-select-wrapper" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search and select a stop"
          className="stop-select-input"
          required={required}
          autoComplete="off"
        />
        {loading && <div className="stop-select-spinner" />}
        {isOpen && !selectedStop && (
          <>
            {stops.length > 0 ? (
              <ul className="stop-select-dropdown">
                {stops.map((stop) => (
                  <li
                    key={stop.stop_id}
                    className="stop-select-item"
                    onMouseDown={() => handleItemClick(stop)}
                  >
                    {stop.stop_name}
                  </li>
                ))}
              </ul>
            ) : (
              searchQuery.trim() !== '' && !loading && (
                <div className="stop-select-no-results">
                  No stops found
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
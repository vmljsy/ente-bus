import React from 'react';
import { FaSearch, FaBus, FaPlus } from 'react-icons/fa';

export default function Navigation({ activePage, onPageChange }) {
  return (
    <nav className="main-nav">
      <div className="nav-links">
        <button
          className={`nav-link ${activePage === 'search' ? 'active' : ''}`}
          onClick={() => onPageChange('search')}
        >
          <FaSearch />
          Search Routes
        </button>
        <button
          className={`nav-link ${activePage === 'trips' ? 'active' : ''}`}
          onClick={() => onPageChange('trips')}
        >
          <FaBus />
          Trip Schedule
        </button>
        <button
          className={`nav-link ${activePage === 'contribute' ? 'active' : ''}`}
          onClick={() => onPageChange('contribute')}
        >
          <FaPlus />
          Contribute
        </button>
      </div>
    </nav>
  );
}
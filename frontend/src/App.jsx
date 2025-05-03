import React, { useState, useCallback } from 'react';
import Navigation from './Navigation';
import RoutesSearch from './RoutesSearch';
import StopsList from './StopsList';
import SightingForm from './SightingForm';
import TripSchedule from './TripSchedule';
import AddTrip from './AddTrip';
import AddRoute from './AddRoute';
import AddStop from './AddStop';
import { createRoute, createStop } from './api';
import { FaBus, FaPlus } from 'react-icons/fa';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);

  // Handle page changes with proper state management
  const handlePageChange = useCallback((page) => {
    // Only reset route if changing to search page
    if (page !== currentPage) {
      setCurrentPage(page);
      setSelectedStop(null);
      if (page === 'search') {
        setSelectedRoute(null);
      }
    }
  }, [currentPage]);

  // Handle route selection
  const handleRouteSelect = useCallback((route) => {
    setSelectedRoute(route);
    setSelectedStop(null);
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (selectedStop) {
      setSelectedStop(null);
    } else if (selectedRoute) {
      setSelectedRoute(null);
    }
  }, [selectedStop, selectedRoute]);

  // Handle adding a new route
  const handleAddRoute = useCallback(async (routeData) => {
    try {
      const result = await createRoute(routeData);
      if (result.success) {
        setIsAddRouteOpen(false);
        // Force a re-render of components that show routes
        setCurrentPage(prevPage => {
          if (prevPage === 'search') {
            return 'search';  // This will trigger a re-render
          }
          return prevPage;
        });
      }
    } catch (err) {
      console.error('Failed to add route:', err);
    }
  }, []);

  const handleAddStop = useCallback(async (stopData) => {
    try {
      const result = await createStop(stopData);
      if (result?.stop) {
        setIsAddStopOpen(false);
        // Force components that show stops to refresh their data
        setCurrentPage(prevPage => {
          if (prevPage === 'search') {
            return 'search';  // This will trigger a re-render
          }
          return prevPage;
        });
      }
    } catch (err) {
      console.error('Failed to add stop:', err);
    }
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'search':
        if (!selectedRoute) {
          return (
            <div className="search-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2><FaBus className="section-icon" />Find Bus Routes</h2>
              </div>
              <RoutesSearch 
                onSelectRoute={handleRouteSelect} 
                onAddStop={() => setIsAddStopOpen(true)}
              />
            </div>
          );
        }
        return selectedStop ? (
          <SightingForm
            stop={selectedStop}
            onBack={handleBack}
          />
        ) : (
          <StopsList
            route={selectedRoute}
            onSelectStop={setSelectedStop}
            onBack={handleBack}
          />
        );

      case 'trips':
        return (
          <TripSchedule
            route={selectedRoute}
            onBack={handleBack}
          />
        );

      case 'contribute':
        return (
          <div className="add-trip-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2><FaBus className="section-icon" />Contribute Details</h2>
            </div>
            <div className="contribute-form">
              <div className="button-container">
                <button 
                  className="add-detail-button"
                  onClick={() => setIsAddStopOpen(true)}
                >
                  <FaPlus />
                  Add Stop
                </button>
                <button 
                  className="add-detail-button"
                  onClick={() => setIsAddRouteOpen(true)}
                >
                  <FaPlus />
                  Add Route
                </button>
                <button 
                  className="add-detail-button"
                  onClick={() => setCurrentPage('add-trip')}
                >
                  <FaPlus />
                  Add Trip
                </button>
              </div>
            </div>
          </div>
        );

      case 'add-trip':
        return (
          <AddTrip
            onBack={handleBack}
            onAddRoute={() => setIsAddRouteOpen(true)}
            onAddStop={() => setIsAddStopOpen(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <FaBus size={48} className="bus-icon" />
        <h1>Ente Bus</h1>
        <p className="subtitle">Crowdsource Bus Data</p>
      </div>

      <Navigation 
        activePage={currentPage} 
        onPageChange={handlePageChange}
      />

      <div className={`page-content ${currentPage}`}>
        {renderContent()}
      </div>

      <AddRoute 
        isOpen={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
        onAdd={handleAddRoute}
        onAddStop={() => setIsAddStopOpen(true)}
      />
      
      <AddStop
        isOpen={isAddStopOpen}
        onClose={() => setIsAddStopOpen(false)}
        onAdd={handleAddStop}
      />
    </div>
  );
}

export default App;

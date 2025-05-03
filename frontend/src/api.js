// src/api.js
// Utility functions to interact with FastAPI backend
const API_BASE = 'http://localhost:8000'; // Change if backend runs elsewhere

// Dummy data for when backend is unavailable
const DUMMY_STOPS = [
  { stop_id: 'THI', stop_name: 'Thiruvananthapuram', stop_lat: 8.5241, stop_lon: 76.9366 },
  { stop_id: 'KOC', stop_name: 'Kochi', stop_lat: 9.9312, stop_lon: 76.2673 },
  { stop_id: 'KOZ', stop_name: 'Kozhikode', stop_lat: 11.2588, stop_lon: 75.7804 },
  { stop_id: 'ALU', stop_name: 'Alappuzha', stop_lat: 9.4981, stop_lon: 76.3388 },
  { stop_id: 'KOL', stop_name: 'Kollam', stop_lat: 8.8932, stop_lon: 76.6141 }
];

const DUMMY_ROUTES = [
  { 
    route_id: 'TK1',
    route_short_name: 'TVM-KCH-1', 
    route_long_name: 'Thiruvananthapuram - Kochi Express',
    route_type: 3,
    start_stop: 'Thiruvananthapuram',
    end_stop: 'Kochi'
  },
  { 
    route_id: 'KT1',
    route_short_name: 'KCH-TVM-1', 
    route_long_name: 'Kochi - Thiruvananthapuram Express',
    route_type: 3,
    start_stop: 'Kochi',
    end_stop: 'Thiruvananthapuram'
  }
];

// Dummy trip data
const DUMMY_TRIPS = [
  {
    trip_id: 'TK1-1',
    route_id: 'TK1',
    service_id: 'WEEKDAY',
    trip_headsign: 'Thiruvananthapuram - Kochi',
    direction_id: 0
  },
  {
    trip_id: 'KT1-1',
    route_id: 'KT1',
    service_id: 'WEEKDAY',
    trip_headsign: 'Kochi - Thiruvananthapuram',
    direction_id: 1
  }
];

const DUMMY_STOP_TIMES = [
  {
    trip_id: 'TK1-1',
    arrival_time: '08:00:00',
    departure_time: '08:00:00',
    stop_id: 'THI',
    stop_sequence: 1
  },
  {
    trip_id: 'TK1-1',
    arrival_time: '11:00:00',
    departure_time: '11:15:00',
    stop_id: 'KOC',
    stop_sequence: 2
  }
];

async function tryFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.warn(`API call failed: ${error.message}. Using dummy data.`);
    return { success: false, error };
  }
}

export async function fetchRoutes(query = '', start_stop = '', end_stop = '') {
  const params = new URLSearchParams();
  if (query) params.append('search', query);
  if (start_stop) params.append('start_stop', start_stop);
  if (end_stop) params.append('end_stop', end_stop);

  const { success, data } = await tryFetch(`${API_BASE}/api/v1/routes?${params}`);
  
  if (!success) {
    // Return filtered dummy routes if start/end stops are provided
    if (start_stop || end_stop) {
      return DUMMY_ROUTES.filter(route => 
        (!start_stop || route.start_stop === start_stop) &&
        (!end_stop || route.end_stop === end_stop)
      );
    }
    return DUMMY_ROUTES;
  }
  
  return data;
}

export async function fetchStops(routeId) {
  const { success, data } = await tryFetch(`${API_BASE}/api/v1/stops`);
  
  if (!success) {
    if (routeId) {
      // Return a subset of stops for the specific route
      return DUMMY_STOPS.slice(0, 3);
    }
    return DUMMY_STOPS;
  }
  
  return data;
}

export async function fetchTimes(stopId) {
  const { success, data } = await tryFetch(`${API_BASE}/api/v1/stops/${stopId}/times`);
  
  if (!success) {
    // Return dummy times for the current day
    const now = new Date();
    return Array.from({ length: 5 }, (_, i) => ({
      time: new Date(now.getTime() + i * 30 * 60000).toISOString(),
      route_id: 'TK1',
      route_name: 'TVM-KCH-1'
    }));
  }
  
  return data;
}

export async function searchBuses(query = '') {
  const { success, data } = await tryFetch(`${API_BASE}/api/v1/buses?search=${encodeURIComponent(query)}`);
  
  if (!success) {
    return DUMMY_ROUTES.filter(route => 
      route.route_short_name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  return data;
}

export async function searchStops(query, limit = 5) {
  const params = new URLSearchParams({ query, limit });
  const { success, data } = await tryFetch(`${API_BASE}/api/v1/stops/search?${params}`);

  if (!success) {
    // Return filtered dummy stops for demo purposes
    return DUMMY_STOPS.filter(stop =>
      stop.stop_name.toLowerCase().includes(query.toLowerCase())
    );
  }

  return data;
}

export async function submitSighting(data) {
  const { success, data: responseData, error } = await tryFetch(`${API_BASE}/api/v1/sightings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!success) {
    // Simulate successful submission
    return {
      success: true,
      id: 'dummy-' + Date.now(),
      message: 'Sighting recorded (Demo Mode)'
    };
  }
  
  return responseData;
}

export async function fetchTrips(routeId = '') {
  const params = new URLSearchParams();
  if (routeId) params.append('route_id', routeId);

  const { success, data } = await tryFetch(`${API_BASE}/api/v1/trips?${params}`);
  
  if (!success) {
    if (routeId) {
      return DUMMY_TRIPS.filter(trip => trip.route_id === routeId);
    }
    return DUMMY_TRIPS;
  }
  
  return data;
}

export async function fetchTripStopTimes(tripId) {
  const { success, data } = await tryFetch(`${API_BASE}/api/v1/trips/${tripId}/stop_times`);
  
  if (!success) {
    return DUMMY_STOP_TIMES.filter(st => st.trip_id === tripId);
  }
  
  return data;
}

export async function fetchStopStopTimes(stopId, routeId = '') {
  const params = new URLSearchParams();
  if (routeId) params.append('route_id', routeId);

  const { success, data } = await tryFetch(`${API_BASE}/api/v1/stops/${stopId}/stop_times?${params}`);
  
  if (!success) {
    if (routeId) {
      return DUMMY_STOP_TIMES.filter(st => 
        st.stop_id === stopId && 
        DUMMY_TRIPS.find(t => t.trip_id === st.trip_id && t.route_id === routeId)
      );
    }
    return DUMMY_STOP_TIMES.filter(st => st.stop_id === stopId);
  }
  
  return data;
}

export async function createRoute(routeData) {
  const { success, data, error } = await tryFetch(`${API_BASE}/api/v1/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData),
  });
  
  if (!success) {
    // Simulate successful creation in demo mode
    return {
      success: true,
      route: {
        ...routeData,
        id: 'dummy-' + Date.now()
      }
    };
  }
  
  return data;
}

export async function createStop(stopData) {
  const { success, data, error } = await tryFetch(`${API_BASE}/api/v1/stops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stopData),
  });
  
  if (!success) {
    // In demo mode, simulate successful creation
    return {
      success: true,
      stop: {
        ...stopData,
        id: 'dummy-' + Date.now()
      }
    };
  }
  
  // For successful API response, ensure we return in expected format
  return {
    success: true,
    stop: data
  };
}

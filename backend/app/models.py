from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Route(Base):
    __tablename__ = 'routes'

    route_id = Column(String, primary_key=True, index=True)
    route_short_name = Column(String, nullable=False)
    route_long_name = Column(String, nullable=True)
    route_type = Column(Integer, nullable=False)
    start_stop = Column(String, nullable=True)
    end_stop = Column(String, nullable=True)
    via_stops = Column(String, nullable=True)

class Stop(Base):
    __tablename__ = 'stops'

    stop_id = Column(String, primary_key=True, index=True)
    stop_name = Column(String, nullable=False)
    stop_lat = Column(Float, nullable=False)
    stop_lon = Column(Float, nullable=False)

class Sighting(Base):
    __tablename__ = 'sightings'

    sighting_id = Column(Integer, primary_key=True, index=True)
    route_id = Column(String, ForeignKey('routes.route_id'), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sighting_timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Trip(Base):
    __tablename__ = 'trips'

    trip_id = Column(String, primary_key=True, index=True)
    route_id = Column(String, ForeignKey('routes.route_id'), nullable=False)
    service_id = Column(String, nullable=False)
    trip_headsign = Column(String)
    direction_id = Column(Integer)
    shape_id = Column(String)

class StopTime(Base):
    __tablename__ = 'stop_times'

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey('trips.trip_id'), nullable=False)
    arrival_time = Column(Time, nullable=False)
    departure_time = Column(Time, nullable=False)
    stop_id = Column(String, ForeignKey('stops.stop_id'), nullable=False)
    stop_sequence = Column(Integer, nullable=False)
    stop_headsign = Column(String)
    pickup_type = Column(Integer)
    drop_off_type = Column(Integer)
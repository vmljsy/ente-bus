from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RouteBase(BaseModel):
    route_id: str
    route_short_name: str
    route_long_name: Optional[str] = None
    route_type: int
    start_stop_id: Optional[str] = None
    end_stop_id: Optional[str] = None
    via_stops: Optional[str] = None

class RouteCreate(RouteBase):
    pass

class RouteRead(RouteBase):
    class Config:
        from_attributes = True

class Stop(BaseModel):
    stop_id: str
    stop_name: str
    stop_lat: float
    stop_lon: float

    class Config:
        from_attributes = True

class SightingCreate(BaseModel):
    route_id: str
    latitude: float
    longitude: float

class SightingRead(BaseModel):
    sighting_id: int
    route_id: str
    latitude: float
    longitude: float
    sighting_timestamp: datetime

    class Config:
        from_attributes = True

class trip(BaseModel):
    trip_id: str
    route_id: str
    service_id: str
    trip_headsign: Optional[str] = None
    direction_id: Optional[int] = None
    shape_id: Optional[str] = None

    class Config:
        from_attributes = True

class StopTime(BaseModel):
    trip_id: str
    arrival_time: str
    departure_time: str
    stop_id: str
    stop_sequence: int
    stop_headsign: Optional[str] = None
    pickup_type: Optional[int] = None
    drop_off_type: Optional[int] = None
    stop_name: Optional[str] = None

    class Config:
        from_attributes = True
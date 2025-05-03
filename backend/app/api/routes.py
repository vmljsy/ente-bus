# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, time
from typing import List, Optional

from ..db.db import get_db
from ..models import Route, Stop, Sighting, Trip, StopTime
from .schemas import (
    RouteRead, RouteCreate, SightingCreate, SightingRead, 
    Stop as StopSchema, trip as TripSchema, StopTime as StopTimeSchema
)

router = APIRouter()

@router.post("/routes", response_model=RouteRead)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    db_route = Route(**route.dict())
    try:
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        return db_route
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/routes", response_model=List[RouteRead])
def get_routes(
    start_stop_id: Optional[str] = None,
    end_stop_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Route)
    if start_stop_id:
        query = query.filter(Route.start_stop_id == start_stop_id)
    if end_stop_id:
        query = query.filter(Route.end_stop_id == end_stop_id)
    return query.all()

@router.get("/routes/{route_id}", response_model=RouteRead)
def get_route(route_id: str, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.route_id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.post("/sightings", response_model=SightingRead)
def create_sighting(sighting: SightingCreate, db: Session = Depends(get_db)):
    db_sighting = Sighting(**sighting.dict())
    db.add(db_sighting)
    db.commit()
    db.refresh(db_sighting)
    return db_sighting

@router.get("/sightings/search", response_model=List[SightingRead])
def search_sightings(
    route_id: str,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return db.query(Sighting)\
        .filter(Sighting.route_id == route_id)\
        .order_by(Sighting.sighting_timestamp.desc())\
        .limit(limit)\
        .all()

@router.get("/stops", response_model=List[StopSchema])
def get_stops(db: Session = Depends(get_db)):
    return db.query(Stop).all()

@router.get("/stops/search", response_model=List[StopSchema])
def search_stops(
    query: str,
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return db.query(Stop)\
        .filter(Stop.stop_name.ilike(f"%{query}%"))\
        .limit(limit)\
        .all()

@router.post("/stops", response_model=StopSchema)
def create_stop(stop: StopSchema, db: Session = Depends(get_db)):
    db_stop = Stop(**stop.dict())
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    return db_stop

@router.get("/trips", response_model=List[TripSchema])
def get_trips(
    route_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Trip)
    if route_id:
        query = query.filter(Trip.route_id == route_id)
    return query.all()

@router.post("/trips", response_model=TripSchema)
def create_trip(trip: TripSchema, db: Session = Depends(get_db)):
    db_trip = Trip(**trip.dict())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/trips/{trip_id}", response_model=TripSchema)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.trip_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.get("/trips/{trip_id}/stop_times", response_model=List[StopTimeSchema])
def get_trip_stop_times(trip_id: str, db: Session = Depends(get_db)):
    stop_times = db.query(StopTime)\
        .join(Stop, Stop.stop_id == StopTime.stop_id)\
        .add_columns(Stop.stop_name)\
        .filter(StopTime.trip_id == trip_id)\
        .order_by(StopTime.stop_sequence)\
        .all()
    if not stop_times:
        raise HTTPException(status_code=404, detail="No stop times found for this trip")
    
    # Format the response to include stop_name
    result = []
    for stop_time, stop_name in stop_times:
        stop_time_dict = {
            "trip_id": stop_time.trip_id,
            "arrival_time": stop_time.arrival_time.strftime("%H:%M:%S"),
            "departure_time": stop_time.departure_time.strftime("%H:%M:%S"),
            "stop_id": stop_time.stop_id,
            "stop_sequence": stop_time.stop_sequence,
            "stop_headsign": stop_time.stop_headsign,
            "pickup_type": stop_time.pickup_type,
            "drop_off_type": stop_time.drop_off_type,
            "stop_name": stop_name
        }
        result.append(stop_time_dict)
    return result

@router.post("/stop_times", response_model=StopTimeSchema)
def create_stop_time(stop_time: StopTimeSchema, db: Session = Depends(get_db)):
    def parse_time(time_str: str) -> time:
        try:
            return datetime.strptime(time_str, "%H:%M:%S").time()
        except ValueError:
            try:
                # Try HH:MM format and append :00 for seconds
                return datetime.strptime(time_str + ":00", "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid time format: {time_str}. Expected HH:MM or HH:MM:SS"
                )
    
    # Create a dict of the values and update times separately
    stop_time_data = stop_time.dict()
    stop_time_data["arrival_time"] = parse_time(stop_time.arrival_time)
    stop_time_data["departure_time"] = parse_time(stop_time.departure_time)
    
    db_stop_time = StopTime(**stop_time_data)
    db.add(db_stop_time)
    db.commit()
    db.refresh(db_stop_time)
    return db_stop_time

@router.get("/stops/{stop_id}/stop_times", response_model=List[StopTimeSchema])
def get_stop_times_for_stop(
    stop_id: str,
    route_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(StopTime)\
        .filter(StopTime.stop_id == stop_id)
    
    if route_id:
        query = query.join(Trip)\
            .filter(Trip.route_id == route_id)
    
    stop_times = query.order_by(StopTime.arrival_time).all()
    
    if not stop_times:
        raise HTTPException(
            status_code=404, 
            detail="No stop times found for this stop"
        )
    return stop_times


# Crowdsourced Bus Timing - MVP

This repository contains the Minimum Viable Product (MVP) for a crowdsourced bus timing application. The goal of this MVP is to quickly build and deploy a core application that demonstrates the value of allowing users to report bus sightings and view recent reports.

This MVP focuses *solely* on the essential functionality outlined in the accelerated plan, deferring all non-core features for future iterations.

## MVP Core Features

* **Submit Sighting:** Anonymously report seeing a specific bus route at your current location (latitude/longitude) at the current time.
* **Search Sightings:** Search for the most recent sightings reported for a single, specified bus route.
* **Display Sightings:** Show a simple, time-ordered list of the most recent sightings found for the searched route, including basic location and timestamp information.

## Technology Stack

* **Frontend:** React (using Vite for a fast development setup)
* **Backend:** FastAPI (Python)
* **Database:** PostgreSQL
* **ORM/Migrations:** SQLAlchemy / Alembic

## Project Structure

The project is organized as a monorepo with separate directories for the backend and frontend:
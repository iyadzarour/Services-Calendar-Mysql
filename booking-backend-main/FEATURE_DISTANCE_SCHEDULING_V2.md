# Feature Implementation: Distance-Based Smart Scheduling (V2)

This document details the refinement and extension of the Location-Aware Scheduling feature into a Distance-Based Smart Scheduling system, fully integrated into both Secretary and Customer booking flows.

## Core Logic and Terminology

- **Goal**: Ensure appointments assigned to the same **Worker/Technician** on the same day are geographically close to each other.
- **Roles**:
    - **Secretary**: Staff member who creates bookings on behalf of a **Customer**.
    - **Customer**: Person receiving the service.
    - **Worker/Technician**: Employee performing the service (the subject of the scheduling optimization).
- **Algorithm**:
    1.  Resolve the coordinates (lat/lng) for the new **Customer's** address (using optional geocoding or mandatory district center fallback).
    2.  Fetch all existing appointments for the selected **Worker** on the selected date.
    3.  Resolve coordinates for all existing **Customer** addresses on that day.
    4.  Calculate the **minimum distance** (in km) between the new **Customer's** location and *any* existing **Customer's** location for that **Worker** on that day.
    5.  Mark time slots as **Optimal** if the minimum distance is less than or equal to the defined threshold (5 km).

## Backend Changes (`booking-backend-main`)

### 1. Geospatial Utilities (`src/utils/geospatial.ts`)

- **New File**: Implements the `calculateDistance` (Haversine formula), `getDistrictCoordinates` (for Vienna districts 1-23), and a `geocodeAddress` placeholder with a fallback mechanism.
- **Threshold**: `OPTIMAL_DISTANCE_THRESHOLD_KM` is set to **5 km**.

### 2. Data Model Changes (Contact)

- **Schema Update (`src/database-client/src/Schema/Contact.ts`)**: Added optional fields for geocoding results:
  ```typescript
  lat?: number;
  lng?: number;
  ```
- **DAO Update (`src/database-client/src/Contact/ContactDaoMySql.ts`)**: Updated `addContact` and `updateContact` to persist `lat` and `lng`.
- **Schema Migration (`mysql_schema.sql`)**: Added new columns to the `contacts` table:
  ```sql
  ALTER TABLE contacts ADD COLUMN lat DECIMAL(10, 8);
  ALTER TABLE contacts ADD COLUMN lng DECIMAL(11, 8);
  ```

### 3. Location-Aware Service Refinement (`src/server/app/schedule/LocationAwareService.ts`)

- **Logic Update**: The simplistic district-to-district comparison was replaced with the distance-based algorithm described above.
- **Coordinate Resolution**: Implemented `resolveCoordinates` to handle the geocoding fallback: `lat/lng` on contact -> `geocodeAddress` (placeholder) -> `getDistrictCoordinates`.
- **API Response**: The service now returns time slots annotated with:
    - `isOptimal: boolean` (based on the 5km threshold)
    - `distanceKm?: number` (the minimum distance to an existing appointment, or undefined if no existing appointments)

## Frontend Changes (`booking-frontend-main`)

### 1. Secretary Booking UI Integration (`src/pages/Appointment/index.tsx`)

- **Modal Update (`src/components/CreateAppointmentModal.tsx`)**:
    - The `fetchLocationAwareTimeSlots` action is now called when a **Customer** is selected in the modal.
    - The full `Contact` object is passed to the action to enable the backend's coordinate resolution logic.
- **Time Slot Display**: The main `AppointmentPage` now:
    - Uses the new `isOptimal` and `distanceKm` fields from the time slot data.
    - Highlights optimal slots with a green style.
    - Displays the calculated distance in kilometers.

### 2. Customer Self-Booking UI Update (`src/pages/Category/index.tsx`)

- **Logic Update**: The `fetchData` method was updated to pass the full `Contact` object (`this.props.profile as Contact`) to the `fetchLocationAwareTimeSlots` action, ensuring the new distance-based logic is used.
- **Visual Update**: The time slot rendering was updated to display the `distanceKm` field alongside the `isOptimal` tag.

## Summary of Deliverables

- **Backend Archive**: `booking-backend-main-distance-scheduling.tar.gz`
- **Frontend Archive**: `booking-frontend-main-distance-scheduling.tar.gz`
- **Documentation**: This file (`FEATURE_DISTANCE_SCHEDULING_V2.md`)

The feature is now fully implemented according to the corrected requirements, focusing on **Worker** schedule optimization based on geographical proximity.

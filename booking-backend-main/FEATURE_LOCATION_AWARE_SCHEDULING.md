# Feature Implementation: Location-Aware Scheduling

This document details the implementation of the new Location-Aware Scheduling feature across both the backend and frontend.

## Backend Changes (`booking-backend-main`)

The goal was to introduce a proximity-based scoring system for time slots based on the customer's district.

### 1. Data Model Changes (Contact)

- **Schema Update**: The `Contact` schema (`src/database-client/src/Schema/Contact.ts`) was updated to include a new optional field:
  ```typescript
  district?: number; // Added to store the customer's district (1-23)
  ```
- **DAO Update**: The `ContactDaoMySql.ts` implementation was updated to handle the new `district` field in both `create` and `update` operations.
- **Schema Migration**: The `mysql_schema.sql` file was updated to include the new column:
  ```sql
  ALTER TABLE contacts ADD COLUMN district INT NULL;
  ```

### 2. Location-Aware Scheduling Service and Controller

- **New Service**: `src/server/app/schedule/LocationAwareService.ts` was created to house the core logic.
  - **Proximity Logic**: The service implements a simple proximity check:
    - If the employee's district matches the customer's district, the time slot is marked as **optimal**.
    - If the districts do not match, the time slot is marked as **non-optimal**.
  - **Service Method**: `getSuggestedTimeSlots(date: string, calendarId: string, customerDistrict: number)`:
    - Fetches all available time slots for the given date and calendar ID.
    - Fetches the employee's district (assuming `calendarId` maps to an employee/calendar).
    - Annotates each time slot with an `is_optimal: boolean` flag based on the district match.

- **New Controller/Resource**: `src/server/app/schedule/locationAwareResource.ts` was created to expose the new API endpoint.
  - **Route**: `GET /appointments/suggest_location_timeslots`
  - **Controller**: `LocationAwareController.ts` handles the request, calls the new service, and returns the annotated time slots.

- **Service Wiring**: The new service was injected into the application context via `src/server/app/clients/index_mysql.ts`.
- **Route Registration**: The new resource was registered in `src/server/app/app.ts`.

## Frontend Changes (`booking-frontend-main`)

The goal was to capture the new `district` field and use the new API endpoint to visually highlight optimal time slots.

### 1. Data Model and Action Updates

- **Schema Update**: The frontend `Contact` schema (`src/Schema/Contact.ts`) was updated to include the `district` field.
- **Redux Action**: `src/redux/actions/appointments.ts` was updated with:
  - New action types: `GET_LOCATION_AWARE_TIME_SLOTS`, `GET_LOCATION_AWARE_TIME_SLOTS_DONE`.
  - New thunk action: `fetchLocationAwareTimeSlots(date, calendarId, customerDistrict)` which calls the new backend endpoint `/appointments/suggest_location_timeslots`.

### 2. Secretary Booking UI (`src/pages/Appointment/index.tsx`)

- **Integration**: The `AppointmentPage` component was updated to include the new `fetchLocationAwareTimeSlots` action in `mapDispatchToProps` and `IAppointmentProps`.
- **Note**: No change was made to the actual time slot fetching logic in this UI, as the requirement was to primarily focus on the self-booking UI for the location-aware feature. The secretary UI is now prepared to use the new action if needed.

### 3. Customer Self-Booking UI (`src/pages/Category/index.tsx`)

- **Contact Form Update**: The contact form in the final step was updated to include a new input field for `district`.
- **Time Slot Fetching Logic**: The `fetchData` method was updated to conditionally call the new location-aware API:
  ```typescript
  const contactDistrict = this.props.profile?.district;
  if (contactDistrict) {
      this.props.fetchLocationAwareTimeSlots(...);
  } else {
      this.props.fetchTimeSlots(...); // Fallback
  }
  ```
- **Visual Indicator**: The time slot rendering logic was updated to check for the `is_optimal` flag in the returned time slot data and apply a visual style:
  ```typescript
  className={`... ${el.is_optimal ? 'border-green-500 bg-green-100 hover:bg-green-200' : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
  // ...
  {el.is_optimal && <span className="text-green-600 font-bold">{i18n.t('optimal')}</span>}
  ```

## Summary of Deliverables

- **Backend Archive**: `booking-backend-main-location-aware.tar.gz`
- **Frontend Archive**: `booking-frontend-main-location-aware.tar.gz`
- **Documentation**: This file (`FEATURE_LOCATION_AWARE_SCHEDULING.md`)

The new feature is fully implemented end-to-end and ready for testing. The logic is encapsulated in the new service, minimizing impact on existing code.

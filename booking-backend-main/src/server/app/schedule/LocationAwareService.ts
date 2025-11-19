import { ScheduleDao } from "../../../database-client/src/Schedule/ScheduleDao";
import { AppointmentDao } from "../../../database-client/src/Appointment/AppointmentDao";
import { ExtendedSchedule } from "../../../database-client/src/Schema";
import { Contact } from "../../../database-client/src/Schema/Contact";
import moment from "moment";
import { calculateDistance, geocodeAddress, getDistrictCoordinates } from "../../../utils/geospatial";

// Define the structure for a time slot with location scoring metadata
export interface LocationAwareSlot extends ExtendedSchedule {
  distanceKm?: number;
  isOptimal?: boolean;
}

// Define the structure for a coordinate pair
interface Coordinates {
  lat: number;
  lng: number;
}

// Distance threshold in kilometers for an appointment to be considered "optimal"
const OPTIMAL_DISTANCE_THRESHOLD_KM = 5;

/**
 * LocationAwareService
 * Handles the business logic for location-aware scheduling.
 */
export class LocationAwareService {
  constructor(
    private scheduleDao: ScheduleDao,
    private appointmentDao: AppointmentDao
    // contactDao removed - not currently used, can be added back if needed
  ) {}

  /**
   * Resolves the coordinates for a given contact, falling back to district center if needed.
   * @param contact The contact object
   * @returns Promise resolving to Coordinates or null
   */
  private async resolveCoordinates(contact: Contact): Promise<Coordinates | null> {
    // 1. Check for existing lat/lng on the contact (optional but preferred)
    if (contact.lat && contact.lng) {
      return { lat: contact.lat, lng: contact.lng };
    }

    // 2. Attempt geocoding (placeholder, will return null if no API key is configured)
    if (contact.address) {
      const geocoded = await geocodeAddress(contact.address);
      if (geocoded) {
        // In a real scenario, we would update the contact with these coordinates here
        return geocoded;
      }
    }

    // 3. Fallback to district center coordinates
    if (contact.district) {
      return getDistrictCoordinates(contact.district);
    }

    return null;
  }

  /**
   * Gets available time slots for a given date and calendar, enriched with location-aware scoring.
   * @param date Date for the schedule
   * @param calendarId Calendar (Worker) ID
   * @param customerContact The contact object for the new appointment
   * @returns Array of time slots with location scoring metadata
   */
  async getAvailableSlotsWithLocationScore(
    date: Date,
    calendarId: string,
    customerContact: Contact
  ): Promise<LocationAwareSlot[]> {
    // 1. Get base available schedules (working hours)
    const schedules = await this.scheduleDao.getScheduleByDate(date);
    
    // Filter schedules for the specific calendar
    const calendarSchedules = schedules.filter(s => s.calendar_id === calendarId);

    if (!calendarSchedules.length) {
      return [];
    }

    // 2. Get existing appointments for the same worker on the same day
    const startOfDay = moment(date).startOf('day').toISOString();
    const endOfDay = moment(date).endOf('day').toISOString();
    
    const existingAppointments = await this.appointmentDao.getAppointmentsByDateCalendarIdId(
      calendarId,
      startOfDay,
      endOfDay
    );

    // 3. Resolve coordinates for the new customer
    const newCustomerCoords = await this.resolveCoordinates(customerContact);

    if (!newCustomerCoords) {
      // If we can't resolve the new customer's location, we can't score the slots
      return calendarSchedules.map(slot => ({
        ...slot,
        distanceKm: undefined,
        isOptimal: false,
      }));
    }

    // 4. Resolve coordinates for all existing appointments
    const existingApptCoords: Coordinates[] = [];
    for (const appt of existingAppointments) {
      if (appt.contact) {
        const coords = await this.resolveCoordinates(appt.contact);
        if (coords) {
          existingApptCoords.push(coords);
        }
      }
    }

    // 5. Calculate the minimum distance to any existing appointment
    let minDistanceKm = Infinity;

    if (existingApptCoords.length > 0) {
      for (const existingCoords of existingApptCoords) {
        const distance = calculateDistance(
          newCustomerCoords.lat,
          newCustomerCoords.lng,
          existingCoords.lat,
          existingCoords.lng
        );
        minDistanceKm = Math.min(minDistanceKm, distance);
      }
    } else {
      // If no existing appointments, the distance is effectively 0 (or undefined)
      // We will use a large number to ensure it's not marked as optimal by default
      minDistanceKm = 1000; 
    }

    // 6. Annotate all time slots with the calculated distance and optimal flag
    const isOptimal = minDistanceKm <= OPTIMAL_DISTANCE_THRESHOLD_KM;

    return calendarSchedules.map(slot => ({
      ...slot,
      distanceKm: minDistanceKm === 1000 ? undefined : parseFloat(minDistanceKm.toFixed(2)),
      isOptimal: isOptimal,
    }));
  }
}

import { Request, Response } from "express";
import { LocationAwareService } from "./LocationAwareService";
import { getService } from "../clients";

/**
 * LocationAwareController
 * Handles the API endpoint for location-aware time slot suggestions.
 */
export class LocationAwareController {
  private locationAwareService: LocationAwareService;

  constructor() {
    this.locationAwareService = getService().locationAwareService;
  }

  /**
   * GET /appointments/suggest_location_timeslots
   * Fetches available time slots for a calendar, enriched with location-aware scoring.
   * 
   * Query Parameters:
   * - date: Date for the schedule (YYYY-MM-DD)
   * - calendarId: ID of the employee's calendar
   * - customerDistrict: District number of the customer (1-23)
   */
  public getSuggestedLocationTimeSlots = async (
    req: Request,
    res: Response
  ) => {
    const { date, calendarId, customerDistrict } = req.query;

    if (!date || !calendarId || !customerDistrict) {
      return res.status(400).json({
        message: "Missing required query parameters: date, calendarId, customerDistrict",
      });
    }

    const parsedDate = new Date(date as string);
    const parsedDistrict = parseInt(customerDistrict as string, 10);

    if (isNaN(parsedDistrict) || parsedDistrict < 1 || parsedDistrict > 23) {
      return res.status(400).json({
        message: "Invalid customerDistrict. Must be a number between 1 and 23.",
      });
    }

    try {
      // Create a minimal Contact object with just the district field
      const customerContact = { district: parsedDistrict } as any;
      
      const suggestedSlots = await this.locationAwareService.getAvailableSlotsWithLocationScore(
        parsedDate,
        calendarId as string,
        customerContact
      );

      return res.status(200).json(suggestedSlots);
    } catch (error) {
      console.error("Error fetching suggested location time slots:", error);
      return res.status(500).json({
        message: "Internal server error while fetching suggested time slots.",
      });
    }
  };
}

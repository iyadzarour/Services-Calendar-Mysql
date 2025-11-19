import { Router } from "express";
import { LocationAwareController } from "./LocationAwareController";

/**
 * Resource file for the new location-aware scheduling endpoint.
 * This is a new, additive endpoint.
 */
export const configure = (router: Router) => {
  const controller = new LocationAwareController();

  // GET /appointments/suggest_location_timeslots
  // Fetches available time slots for a calendar, enriched with location-aware scoring.
  router.get(
    "/appointments/suggest_location_timeslots",
    controller.getSuggestedLocationTimeSlots
  );
};

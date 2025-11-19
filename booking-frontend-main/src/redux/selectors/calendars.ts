import { RootState } from '../store';

export const selectCalendars = (state: RootState) => state.calendars.calendars;
export const selectCalendarsLoading = (state: RootState) => state.calendars.loading;

export const selectUpdateCalendarLoading = (state: RootState) => state.calendars.updateCalendarLoading;
export const selectDeleteCalendarLoading = (state: RootState) => state.calendars.deleteCalendarLoading;



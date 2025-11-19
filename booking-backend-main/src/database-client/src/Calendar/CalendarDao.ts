import { Calendar } from "../Schema";

export interface CalendarDao {
  getCalendars(
    page: number,
    limit: number,
    search?: string
  ): Promise<Calendar[]>;
  getCalendarById(id: string): Promise<Calendar | null>;
  getCalendarByEmail(email: string): Promise<Calendar | null>;
  getCalendarsByIds(ids: string[]): Promise<Calendar[]>;
  getActiveCalendarsByIds(ids: string[]): Promise<Calendar[]>;
  getCalendarsCount(search?: string): Promise<number>;
  addCalendar(calendar: Partial<Calendar>): Promise<Calendar>;
  updateCalendar(id: string, newCalendar: Partial<Calendar>): Promise<Calendar>;
  deleteCalendar(id: string): Promise<Calendar | null>;
}

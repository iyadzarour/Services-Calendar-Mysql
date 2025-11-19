import { ExtendedSchedule, Schedule } from "../Schema";

export interface ScheduleDao {
  getSchedules(
    page: number,
    limit: number,
    search?: string
  ): Promise<Schedule[]>;
  getScheduleById(id: string): Promise<Schedule | null>;
  getSchedulesCount(): Promise<number>;
  addSchedule(schedule: Partial<Schedule>): Promise<Schedule>;
  updateSchedule(id: string, newSchedule: Partial<Schedule>): Promise<Schedule>;
  deleteSchedule(id: string): Promise<Schedule | null>;
  getScheduleByDate(date: Date): Promise<ExtendedSchedule[]>;
  getSchedulesByCalendarId(calendarId: string): Promise<Schedule[]>;
}

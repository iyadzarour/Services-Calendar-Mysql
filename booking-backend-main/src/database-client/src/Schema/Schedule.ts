export enum WeekDay {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export enum ScheduleType {
  Weekly = "weekly",
  Certain = "certain",
}

export interface Schedule {
  _id?: string;
  calendar_id: string;
  working_hours_type: ScheduleType;
  weekday?: WeekDay;
  date_from?: Date;
  date_to?: Date;
  time_from: string;
  time_to: string;
  reason?: string;
  deactivate_working_hours?: boolean;
  one_time_appointment_link?: string;
  only_internally?: boolean;
  restricted_to_services?: string[];
  possible_appointment?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExtendedSchedule extends Schedule {
  employee_name: string;
  assignments_services: string[];
}

export interface AddScheduleRequest extends Omit<Schedule, "_id" | "createdAt" | "updatedAt"> {}

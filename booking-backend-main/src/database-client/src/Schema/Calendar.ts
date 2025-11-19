export enum DescriptionDisplayType {
  None = "None",
  Text = "Text",
  Tooltip = "Tooltip",
}

export enum AppointmentScheduling {
  APPOINTMENT_LENGTH = "Appointment Length",
  MINUTES_5 = "5 Minutes",
  MINUTES_10 = "10 Minutes",
  MINUTES_15 = "15 Minutes",
  MINUTES_20 = "20 Minutes",
  MINUTES_30 = "30 Minutes",
  MINUTES_40 = "40 Minutes",
  MINUTES_45 = "45 Minutes",
  MINUTES_50 = "50 Minutes",
  MINUTES_60 = "60 Minutes",
  MINUTES_75 = "75 Minutes",
  MINUTES_90 = "90 Minutes",
  MINUTES_120 = "120 Minutes",
  MINUTES_180 = "180 Minutes",
}

export enum CalendarType {
  Main = "Main Calendar",
  Side = "Side Calendar",
}

export enum AppointmentCluster {
  GLOBAL = "global Attitude",
  ACTIVE = "Active",
  NOT_ACTIVE = "Not Active",
}

export enum AppointmentDuration {
  Auto = "Auto",
  MINUTES_5 = "5 Minutes",
  MINUTES_10 = "10 Minutes",
  MINUTES_15 = "15 Minutes",
  MINUTES_20 = "20 Minutes",
  MINUTES_30 = "30 Minutes",
  MINUTES_40 = "40 Minutes",
  MINUTES_45 = "45 Minutes",
  MINUTES_50 = "50 Minutes",
  MINUTES_60 = "60 Minutes",
  MINUTES_75 = "75 Minutes",
  MINUTES_90 = "90 Minutes",
  MINUTES_120 = "120 Minutes",
  MINUTES_180 = "180 Minutes",
  HOURS_4 = "4 Hours",
  HOURS_5 = "5 Hours",
  HOURS_8 = "8 Hours",
  HOURS_10 = "10 Hours",
  HOURS_12 = "12 Hours",
  HOURS_24 = "24 Hours",
}

export interface CalendarAdvancedSettings {
  multiple_occupanc?: boolean;
  notification_email?: string; // valid email address
  notification_email_as_sender?: boolean;
  sms_notification?: boolean;
  manual_email_confirmation?: string; // valid email address
  manually_confirmation_for_manually_booked_appointments?: boolean;
  limit_maximum_appointment_duration?: boolean;
  call_waiting_number?: boolean;
  within_availability_times?: boolean; // default true
  calendar_group?: string;
  calendar_type?: CalendarType;
  appointment_cluster?: AppointmentCluster;
  appointment_duration?: AppointmentDuration;
  calendar_order?: number;
  duration_factor?: number;
  reference_system?: string;
  calendar_id?: number;
}

export enum AssignmentOfServices {
  ALL = "All",
  CERTAIN = "Certain",
}

export enum InsertAppointmentOption {
  FIRST = "First Calendar",
  ALL = "All Calendar",
}

export interface Calendar {
  _id?: string;
  employee_name: string;
  description?: string;
  show_description?: DescriptionDisplayType;
  appointment_scheduling?: AppointmentScheduling;
  employee_image?: string;
  email?: string;
  password?: string;
  online_booked?: boolean;
  advanced_settings?: CalendarAdvancedSettings;
  assignment_of_services?: AssignmentOfServices;
  assignments_services?: string[];
  link_calendar?: boolean;
  priority_link?: number;
  skills?: {
    service: string;
    level: number;
  }[];
  paired_calendars?: string[];
  insert_appointments?: InsertAppointmentOption;
  coupling_on_certain_services?: boolean;
  certain_services?: string[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

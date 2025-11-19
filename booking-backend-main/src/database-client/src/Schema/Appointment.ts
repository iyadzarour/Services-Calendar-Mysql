import { Service } from "./Category";
import { Attachment } from "./Common";
import { Contact } from "./Contact";

export enum ControlPointsValues {
  IN_ORDER = 1,
  ERROR = 2,
  DOES_NOT_APPLY = 3,
}

export interface ControlPoints {
  title: string;
  value: ControlPointsValues;
}

export enum AppointmentStatus {
  Confirmed = "Confirmed",
  Cancelled = "Cancelled",
}
export interface Appointment {
  _id?: string;
  category_id: string;
  service_id: string;
  calendar_id: string;
  new_user?: boolean;
  start_date: string;
  end_date: string;
  contact: Contact;
  contact_id?: string;
  brand_of_device?: string;
  model?: string;
  selected_devices?: string;
  exhaust_gas_measurement?: boolean;
  has_maintenance_agreement?: boolean;
  has_bgas_before?: boolean;
  year?: string;
  invoice_number?: number;
  contract_number?: number;
  imported_service_name?: string,
  imported_service_duration?: string,
  imported_service_price?: string,
  appointment_status: AppointmentStatus;
  archived?: boolean;
  updated_by?: string;
  attachments?: Attachment[];
  remarks?: string;
  employee_attachments?: Attachment[];
  employee_remarks?: string;
  company_remarks?: string;
  created_by?: string;
  ended_at?: string;
  control_points?: ControlPoints[],
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentForm {
  start: string;
  end: string;
}

export interface AddAppointmentRequest
  extends Omit<Appointment, "_id" | "contact" | "createdAt" | "updatedAt"> {
    contact_id: string;
}
export interface TimeSlotsForm {
  date: string;
  category_id?: string;
  service_id?: string;
}

export interface ExtendedAppointment extends Appointment {
  service?: Service;
}

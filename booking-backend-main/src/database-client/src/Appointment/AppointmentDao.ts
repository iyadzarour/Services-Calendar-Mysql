import { AddAppointmentRequest, Appointment } from "../Schema";

export interface AppointmentDao {
  getAppointments(
    start: string,
    end: string,
  ): Promise<Appointment[]>;
  getAppointmentsByContactId(contactId: string): Promise<Appointment[]>;
  getAppointmentsByDateCalendarIdId(calendar_id: string, start: string, end: string): Promise<Appointment[]>;
  getAppointmentsByCalendarIdId(calendarId: string): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | null>;
  addAppointment(appointment: AddAppointmentRequest): Promise<Appointment>;
  updateAppointment(id: string, newAppointment: AddAppointmentRequest): Promise<Appointment>;
  deleteAppointment(id: string): Promise<Appointment | null>;
  getDueReminderAppointments(): Promise<Appointment[]>;
}

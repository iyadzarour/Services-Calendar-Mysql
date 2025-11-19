import { Dispatch } from "redux";
import {
  Appointment,
  AppointmentForm,
  Calendar,
  ExtendedAppointment,
  PaginatedForm,
} from "../../Schema";
import { API_URL } from "../network/api";
import { getProfile } from "../../utils";

const GET_TIME_SLOTS = "appointments/GET_TIME_SLOTS" as const;
const GET_TIME_SLOTS_DONE = "appointments/GET_TIME_SLOTS_DONE" as const;
const GET_SELECTOR_TIME_SLOTS = "appointments/GET_SELECTOR_TIME_SLOTS" as const;
const GET_LOCATION_AWARE_TIME_SLOTS = "appointments/GET_LOCATION_AWARE_TIME_SLOTS" as const;
const GET_LOCATION_AWARE_TIME_SLOTS_DONE = "appointments/GET_LOCATION_AWARE_TIME_SLOTS_DONE" as const;
const GET_SELECTOR_TIME_SLOTS_DONE =
  "appointments/GET_SELECTOR_TIME_SLOTS_DONE" as const;
const GET_APPOINTMENTS = "appointments/GET_APPOINTMENTS" as const;
const GET_APPOINTMENTS_DONE = "appointments/GET_APPOINTMENTS_DONE" as const;
const ADD_APPOINTMENT = "appointments/ADD_APPOINTMENT" as const;
const ADD_APPOINTMENT_DONE = "appointments/ADD_APPOINTMENT_DONE" as const;
const UPDATE_APPOINTMENT = "appointments/UPDATE_APPOINTMENT" as const;
const UPDATE_APPOINTMENT_DONE = "appointments/UPDATE_APPOINTMENT_DONE" as const;
const DELETE_APPOINTMENT = "appointments/DELETE_APPOINTMENT" as const;
const DELETE_APPOINTMENT_DONE = "appointments/DELETE_APPOINTMENT_DONE" as const;
const GET_EMPLOYEES = "appointments/GET_EMPLOYEES" as const;
const GET_EMPLOYEES_DONE = "appointments/GET_EMPLOYEES_DONE" as const;
const GET_CONTACT_APPOINTMENTS =
  "appointments/GET_CONTACT_APPOINTMENTS" as const;
const GET_CONTACT_APPOINTMENTS_DONE =
  "appointments/GET_CONTACT_APPOINTMENTS_DONE" as const;
const GET_CALENDAR_APPOINTMENTS =
  "appointments/GET_CALENDAR_APPOINTMENTS" as const;
const GET_CALENDAR_APPOINTMENTS_DONE =
  "appointments/GET_CALENDAR_APPOINTMENTS_DONE" as const;

export const getTimeSlots = () => ({
  type: GET_TIME_SLOTS,
});

export const getTimeSlotsDone = (
  data: {
    start: string;
    end: string;
    calendar_id: string;
    employee_name: string;
  }[]
) => ({
  type: GET_TIME_SLOTS_DONE,
  payload: data,
});

export const getSelectorTimeSlots = () => ({
  type: GET_SELECTOR_TIME_SLOTS,
});

export const getLocationAwareTimeSlots = () => ({
  type: GET_LOCATION_AWARE_TIME_SLOTS,
});

export const getLocationAwareTimeSlotsDone = (
  data: any[] // Use any for now, will define interface later
) => ({
  type: GET_LOCATION_AWARE_TIME_SLOTS_DONE,
  payload: data,
});

export const getSelectorTimeSlotsDone = (
  data: {
    start: string;
    end: string;
    calendar_id: string;
    employee_name: string;
  }[]
) => ({
  type: GET_SELECTOR_TIME_SLOTS_DONE,
  payload: data,
});

export const fetchLocationAwareTimeSlots = (
  date: string,
  calendarId: string,
  customerDistrict: number
) => {
  return async (dispatch: Dispatch) => {
    dispatch(getLocationAwareTimeSlots());

    try {
      const queryparams = new URLSearchParams();
      date && queryparams.append("date", date);
      calendarId && queryparams.append("calendarId", calendarId);
      customerDistrict && queryparams.append("customerDistrict", customerDistrict.toString());

      const response = await fetch(
        `${API_URL}/appointments/suggest_location_timeslots?${queryparams.toString()}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getLocationAwareTimeSlotsDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching location aware time slots:", error);
      dispatch(getLocationAwareTimeSlotsDone([]));
    }
  };
};

export const fetchTimeSlots = (
  date: string,
  category_id?: string,
  service_id?: string,
  selector: boolean = false
) => {
  return async (dispatch: Dispatch) => {
    if (selector) {
      dispatch(getSelectorTimeSlots());
    } else {
      dispatch(getTimeSlots());
    }

    try {
      const queryparams = new URLSearchParams();
      date && queryparams.append("date", date);
      category_id && queryparams.append("category_id", category_id);
      service_id && queryparams.append("service_id", service_id);

      const response = await fetch(
        `${API_URL}/appointments/timeslots?${queryparams.toString()}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      if (selector) {
        dispatch(getSelectorTimeSlotsDone(data));
      } else {
        dispatch(getTimeSlotsDone(data));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (selector) {
        dispatch(getSelectorTimeSlotsDone([]));
      } else {
        dispatch(getTimeSlotsDone([]));
      }
    }
  };
};

export const deleteAppointment = () => ({
  type: DELETE_APPOINTMENT,
});

export const deleteAppointmentDone = (id: string | null) => ({
  type: DELETE_APPOINTMENT_DONE,
  id,
});

export const deleteAppointmentRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteAppointment());

    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteAppointmentDone(id));
      else {
        dispatch(deleteAppointmentDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching calendars:", error);

      dispatch(deleteAppointmentDone(null));
    }
  };
};

export const updateAppointment = () => ({
  type: UPDATE_APPOINTMENT,
});

export const updateAppointmentDone = (appointment: Appointment | null) => ({
  type: UPDATE_APPOINTMENT_DONE,
  appointment,
});

export const addAppointment = () => ({
  type: ADD_APPOINTMENT,
});

export const addAppointmentDone = (appointment: Appointment | null) => ({
  type: ADD_APPOINTMENT_DONE,
  appointment,
});

export const updateAppointmentRequest = (
  id: string,
  appointment: Appointment
) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateAppointment());

    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(appointment),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateAppointmentDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(updateAppointmentDone(null));
    }
  };
};

export const getCalendarAppointments = () => ({
  type: GET_CALENDAR_APPOINTMENTS,
});

export const getCalendarAppointmentsDone = (data: ExtendedAppointment[]) => ({
  type: GET_CALENDAR_APPOINTMENTS_DONE,
  payload: data,
});

export const fetchCalendarAppointments = (calendarId: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(getCalendarAppointments());

    try {
      const response = await fetch(
        `${API_URL}/appointments/calendar/${calendarId}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getCalendarAppointmentsDone(data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getCalendarAppointmentsDone([]));
    }
  };
};

export const getContactAppointments = () => ({
  type: GET_CONTACT_APPOINTMENTS,
});

export const getContactAppointmentsDone = (data: ExtendedAppointment[]) => ({
  type: GET_CONTACT_APPOINTMENTS_DONE,
  payload: data,
});

export const fetchContactAppointments = (contactId: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(getContactAppointments());

    try {
      const response = await fetch(
        `${API_URL}/appointments/contact/${contactId}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getContactAppointmentsDone(data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getContactAppointmentsDone([]));
    }
  };
};

export const getAppointments = () => ({
  type: GET_APPOINTMENTS,
});

export const getAppointmentsDone = (data: Appointment[]) => ({
  type: GET_APPOINTMENTS_DONE,
  payload: data,
});

export const fetchAppointments = (form: AppointmentForm) => {
  return async (dispatch: Dispatch) => {
    dispatch(getAppointments());

    try {
      const queryparams = new URLSearchParams();
      form.start && queryparams.append("start", form.start);
      form.end && queryparams.append("end", form.end);

      const response = await fetch(
        `${API_URL}/appointments?${queryparams.toString()}`, {
          headers: { "x-user-role": getProfile()?.role },
          cache: 'no-cache', // Force fresh data
        }
      );
      
      console.log('Appointments API Response Status:', response.status);
      console.log('Appointments API Response Headers:', response.headers);
      
      const data = await response.json();
      console.log('Appointments API Data:', data);
      console.log('Appointments API Data Type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('Appointments API Data Length:', Array.isArray(data) ? data.length : 'N/A');

      dispatch(getAppointmentsDone(Array.isArray(data) ? data : []));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getAppointmentsDone([]));
    }
  };
};

export const addAppointmentRequest = (appointment: Appointment) => {
  return async (dispatch: Dispatch) => {
    dispatch(addAppointment());

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        body: JSON.stringify(appointment),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addAppointmentDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(addAppointmentDone(null));
    }
  };
};

export const addAppointmentRequestWithSign = (appointment: Appointment,url:string) => {
  return async (dispatch: Dispatch) => {
    dispatch(addAppointment());
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        body: JSON.stringify(appointment),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addAppointmentDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(addAppointmentDone(null));
    }
  };
};

export const getEmployees = () => ({
  type: GET_EMPLOYEES,
});

export const getEmployeesDone = (data: Calendar[]) => ({
  type: GET_EMPLOYEES_DONE,
  payload: data,
});

export const fetchEmployees = (form: PaginatedForm) => {
  return async (dispatch: Dispatch) => {
    dispatch(getEmployees());

    try {
      const queryparams = new URLSearchParams();
      form.page && queryparams.append("page", form.page.toString());
      form.limit && queryparams.append("limit", form.limit.toString());
      form.search && queryparams.append("search", form.search.toString());

      const response = await fetch(
        `${API_URL}/calendars?${queryparams.toString()}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getEmployeesDone(data.data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getEmployeesDone([]));
    }
  };
};

export type AppointmentsAction = ReturnType<
  | typeof getTimeSlots
  | typeof getTimeSlotsDone
  | typeof getSelectorTimeSlots
  | typeof getSelectorTimeSlotsDone
  | typeof getAppointments
  | typeof getAppointmentsDone
  | typeof getEmployees
  | typeof getEmployeesDone
  | typeof getLocationAwareTimeSlots
  | typeof getLocationAwareTimeSlotsDone
  | typeof getContactAppointments
  | typeof getContactAppointmentsDone
  | typeof updateAppointment
  | typeof updateAppointmentDone
  | typeof deleteAppointment
  | typeof deleteAppointmentDone
  | typeof getCalendarAppointments
  | typeof getCalendarAppointmentsDone
  | typeof addAppointment
  | typeof addAppointmentDone
>;

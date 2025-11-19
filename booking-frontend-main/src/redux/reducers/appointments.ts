import { Appointment, Calendar, ExtendedAppointment } from "../../Schema";
import { AppointmentsAction } from "../actions";

interface CategoriesState {
  timeslots: {
    start: string;
    end: string;
    calendar_id: string;
    employee_name: string;
  }[];
  timeslotsLoading: boolean;
  selectorTimeslots: {
    start: string;
    end: string;
    calendar_id: string;
    employee_name: string;
  }[];
  selectorTimeslotsLoading: boolean;
  appointments: Appointment[];
  appointmentsLoading: boolean;
  contactAppointments: ExtendedAppointment[];
  contactAppointmentsLoading: boolean;
  calendarAppointments: ExtendedAppointment[];
  calendarAppointmentsLoading: boolean;
  updateAppointmentLoading: boolean;
  addAppointmentLoading: boolean;
  deleteAppointmentLoading: boolean;
  employees: Calendar[];
  employeesLoading: boolean;
}

const initialState: CategoriesState = {
  timeslots: [],
  timeslotsLoading: true,
  selectorTimeslots: [],
  selectorTimeslotsLoading: true,
  appointments: [],
  appointmentsLoading: true,
  contactAppointments: [],
  contactAppointmentsLoading: true,
  calendarAppointments: [],
  calendarAppointmentsLoading: true,
  updateAppointmentLoading: false,
  addAppointmentLoading: false,
  deleteAppointmentLoading: false,
  employees: [],
  employeesLoading: true,
};

const categoriesReducer = (
  state: CategoriesState = initialState,
  action: AppointmentsAction
): CategoriesState => {
  switch (action.type) {
    case "appointments/GET_TIME_SLOTS":
      return {
        ...state,
        timeslotsLoading: true,
      };
    case "appointments/GET_TIME_SLOTS_DONE":
      return {
        ...state,
        timeslotsLoading: false,
        timeslots: [...action.payload],
      };
    case "appointments/GET_SELECTOR_TIME_SLOTS":
      return {
        ...state,
        selectorTimeslotsLoading: true,
      };
    case "appointments/GET_SELECTOR_TIME_SLOTS_DONE":
      return {
        ...state,
        selectorTimeslotsLoading: false,
        selectorTimeslots: [...action.payload],
      };
    case "appointments/GET_APPOINTMENTS":
      return {
        ...state,
        appointmentsLoading: true,
      };
    case "appointments/GET_APPOINTMENTS_DONE":
      return {
        ...state,
        appointmentsLoading: false,
        appointments: action.payload,
      };
    case "appointments/GET_CONTACT_APPOINTMENTS":
      return {
        ...state,
        contactAppointmentsLoading: true,
      };
    case "appointments/GET_CONTACT_APPOINTMENTS_DONE":
      return {
        ...state,
        contactAppointmentsLoading: false,
        contactAppointments: action.payload,
      };
    case "appointments/GET_CALENDAR_APPOINTMENTS":
      return {
        ...state,
        calendarAppointmentsLoading: true,
      };
    case "appointments/GET_CALENDAR_APPOINTMENTS_DONE":
      return {
        ...state,
        calendarAppointmentsLoading: false,
        calendarAppointments: action.payload,
      };
    case "appointments/DELETE_APPOINTMENT":
      return {
        ...state,
        deleteAppointmentLoading: true,
      };
    case "appointments/DELETE_APPOINTMENT_DONE": {
      let filteredAppointments = state.appointments;
      let filteredContactAppointments = state.contactAppointments;
      if (action.id) {
        filteredAppointments = state.appointments.filter(
          (el) => el._id !== action.id
        );
        filteredContactAppointments = state.contactAppointments.filter(
          (el) => el._id !== action.id
        );
      }
      return {
        ...state,
        deleteAppointmentLoading: false,
        appointments: filteredAppointments,
        contactAppointments: filteredContactAppointments,
      };
    }
    case "appointments/GET_EMPLOYEES":
      return {
        ...state,
        employeesLoading: true,
      };
    case "appointments/GET_EMPLOYEES_DONE":
      return {
        ...state,
        employeesLoading: false,
        employees: action.payload,
      };
    case "appointments/UPDATE_APPOINTMENT":
      return {
        ...state,
        updateAppointmentLoading: true,
      };
    case "appointments/UPDATE_APPOINTMENT_DONE":
      return {
        ...state,
        updateAppointmentLoading: false,
      };
      case "appointments/ADD_APPOINTMENT":
      return {
        ...state,
        addAppointmentLoading: true,
      };
    case "appointments/ADD_APPOINTMENT_DONE":
      return {
        ...state,
        addAppointmentLoading: false,
      };
    default:
      return state;
  }
};

export default categoriesReducer;

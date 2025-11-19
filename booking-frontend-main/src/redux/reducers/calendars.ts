import { Calendar } from "../../Schema";
import { CalendarsAction } from "../actions";

interface CalendarsState {
  calendars: Calendar[];
  loading: boolean;
  updateCalendarLoading: boolean;
  deleteCalendarLoading: boolean;
  addCalendarLoading: boolean;
}

const initialState: CalendarsState = {
  calendars: [],
  loading: true,
  updateCalendarLoading: false,
  deleteCalendarLoading: false,
  addCalendarLoading: false,
};

const calendarsReducer = (
  state: CalendarsState = initialState,
  action: CalendarsAction
): CalendarsState => {
  switch (action.type) {
    case "calendars/GET_ALL":
      return {
        ...state,
        loading: true,
      };
    case "calendars/GET_ALL_DONE":
      return {
        ...state,
        loading: false,
        calendars: action.payload,
      };
    case "calendars/UPDATE_ONE":
      return {
        ...state,
        updateCalendarLoading: true,
      };
    case "calendars/UPDATE_ONE_DONE": {
      let updatedCalendars = state.calendars;
      if (action.calendar && action.calendar._id) {
        updatedCalendars = state.calendars.map((calendar) =>
          action.calendar && calendar._id === action.calendar._id
            ? action.calendar
            : calendar
        );
      }
      return {
        ...state,
        updateCalendarLoading: false,
        calendars: updatedCalendars,
      };
    }
    case "calendars/DELETE_ONE":
      return {
        ...state,
        deleteCalendarLoading: true,
      };
    case "calendars/DELETE_ONE_DONE": {
      let filteredCalendars = state.calendars;
      if (action.id) {
        filteredCalendars = state.calendars.filter(
          (calendar) => calendar._id !== action.id
        );
      }
      return {
        ...state,
        deleteCalendarLoading: false,
        calendars: filteredCalendars,
      };
    }
    case "calendars/ADD_ONE":
      return {
        ...state,
        addCalendarLoading: true,
      };
    case "calendars/ADD_ONE_DONE": {
      return action.calendar?._id
        ? {
            ...state,
            addCalendarLoading: false,
            calendars: [...state.calendars, action.calendar],
          }
        : {
            ...state,
            addCalendarLoading: false,
          };
    }
    default:
      return state;
  }
};

export default calendarsReducer;

import { Calendar } from "../../Schema";
import { Dispatch } from "redux";
import { API_URL } from "../network/api";
import { getProfile } from "../../utils";

const GET_CALENDARS = "calendars/GET_ALL" as const;
const GET_CALENDARS_DONE = "calendars/GET_ALL_DONE" as const;
const UPDATE_CALENDAR = "calendars/UPDATE_ONE" as const;
const UPDATE_CALENDAR_DONE = "calendars/UPDATE_ONE_DONE" as const;
const DELETE_CALENDAR = "calendars/DELETE_ONE" as const;
const DELETE_CALENDAR_DONE = "calendars/DELETE_ONE_DONE" as const;
const ADD_CALENDAR = "calendars/ADD_ONE" as const;
const ADD_CALENDAR_DONE = "calendars/ADD_ONE_DONE" as const;

export const addCalendar = () => ({
  type: ADD_CALENDAR,
});

export const addCalendarDone = (calendar: Calendar | null) => ({
  type: ADD_CALENDAR_DONE,
  calendar,
});

export const deleteCalendar = () => ({
  type: DELETE_CALENDAR,
});

export const deleteCalendarDone = (id: string | null) => ({
  type: DELETE_CALENDAR_DONE,
  id,
});

export const updateCalendar = () => ({
  type: UPDATE_CALENDAR,
});

export const updateCalendarDone = (calendar: Calendar | null) => ({
  type: UPDATE_CALENDAR_DONE,
  calendar,
});

export const getCalendars = () => ({
  type: GET_CALENDARS,
});

export const getCalendarsDone = (data: Calendar[]) => ({
  type: GET_CALENDARS_DONE,
  payload: data,
});

export const fetchCalendars = (page: number = 1, limit: number = 10) => {
  return async (dispatch: Dispatch) => {
    dispatch(getCalendars());

    try {
      const response = await fetch(
        `${API_URL}/calendars?page=${page}&limit=${limit}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      // TODO: handle pagination
      dispatch(getCalendarsDone(data.data));
      return data;
    } catch (error) {
      console.error("Error fetching calendars:", error);

      dispatch(getCalendarsDone([]));
    }
  };
};

export const updateCalendarRequest = (id: string, calendar: Calendar) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateCalendar());

    try {
      const response = await fetch(`${API_URL}/calendars/${id}`, {
        method: "PUT",
        body: JSON.stringify(calendar),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateCalendarDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching calendars:", error);

      dispatch(updateCalendarDone(null));
    }
  };
};

export const deleteCalendarRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteCalendar());

    try {
      const response = await fetch(`${API_URL}/calendars/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteCalendarDone(id));
      else {
        dispatch(deleteCalendarDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching calendars:", error);

      dispatch(deleteCalendarDone(null));
    }
  };
};

export const createCalendarRequest = (calendar: Calendar) => {
  return async (dispatch: Dispatch) => {
    dispatch(addCalendar());

    try {
      const response = await fetch(`${API_URL}/calendars`, {
        method: "POST",
        body: JSON.stringify(calendar),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addCalendarDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching calendars:", error);

      dispatch(addCalendarDone(null));
    }
  };
};

export type CalendarsAction = ReturnType<
  | typeof getCalendars
  | typeof getCalendarsDone
  | typeof updateCalendar
  | typeof updateCalendarDone
  | typeof deleteCalendar
  | typeof deleteCalendarDone
  | typeof addCalendar
  | typeof addCalendarDone
>;

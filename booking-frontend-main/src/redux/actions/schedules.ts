import { Schedule } from "../../Schema";
import { Dispatch } from "redux";
import { API_URL } from "../network/api";
import { getProfile } from "../../utils";

const GET_SCHEDULES = "schedules/GET_ALL" as const;
const GET_SCHEDULES_DONE = "schedules/GET_ALL_DONE" as const;
const UPDATE_SCHEDULE = "schedules/UPDATE_ONE" as const;
const UPDATE_SCHEDULE_DONE = "schedules/UPDATE_ONE_DONE" as const;
const DELETE_SCHEDULE = "schedules/DELETE_ONE" as const;
const DELETE_SCHEDULE_DONE = "schedules/DELETE_ONE_DONE" as const;
const ADD_SCHEDULE = "schedules/ADD_ONE" as const;
const ADD_SCHEDULE_DONE = "schedules/ADD_ONE_DONE" as const;

export const addSchedule = () => ({
  type: ADD_SCHEDULE,
});

export const addScheduleDone = (schedule: Schedule | null) => ({
  type: ADD_SCHEDULE_DONE,
  schedule,
});

export const deleteSchedule = () => ({
  type: DELETE_SCHEDULE,
});

export const deleteScheduleDone = (id: string | null) => ({
  type: DELETE_SCHEDULE_DONE,
  id,
});

export const updateSchedule = () => ({
  type: UPDATE_SCHEDULE,
});

export const updateScheduleDone = (schedule: Schedule | null) => ({
  type: UPDATE_SCHEDULE_DONE,
  schedule,
});

export const getSchedules = () => ({
  type: GET_SCHEDULES,
});

export const getSchedulesDone = (data: Schedule[]) => ({
  type: GET_SCHEDULES_DONE,
  payload: data,
});


export const fetchSchedulesByCalendarId = (calendarId: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(getSchedules());

    try {
      const response = await fetch(
        `${API_URL}/schedules/calendar/${calendarId}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getSchedulesDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching schedules:", error);

      dispatch(getSchedulesDone([]));
    }
  };
};

export const updateScheduleRequest = (id: string, schedule: Schedule) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateSchedule());

    try {
      const response = await fetch(`${API_URL}/schedules/${id}`, {
        method: "PUT",
        body: JSON.stringify(schedule),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateScheduleDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching schedules:", error);

      dispatch(updateScheduleDone(null));
    }
  };
};

export const deleteScheduleRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteSchedule());

    try {
      const response = await fetch(`${API_URL}/schedules/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteScheduleDone(id));
      else {
        dispatch(deleteScheduleDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching schedules:", error);

      dispatch(deleteScheduleDone(null));
    }
  };
};

export const createScheduleRequest = (schedule: Schedule) => {
  return async (dispatch: Dispatch) => {
    dispatch(addSchedule());

    try {
      const response = await fetch(`${API_URL}/schedules`, {
        method: "POST",
        body: JSON.stringify(schedule),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addScheduleDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching schedules:", error);

      dispatch(addScheduleDone(null));
    }
  };
};

export type SchedulesAction = ReturnType<
  | typeof getSchedules
  | typeof getSchedulesDone
  | typeof updateSchedule
  | typeof updateScheduleDone
  | typeof deleteSchedule
  | typeof deleteScheduleDone
  | typeof addSchedule
  | typeof addScheduleDone
>;

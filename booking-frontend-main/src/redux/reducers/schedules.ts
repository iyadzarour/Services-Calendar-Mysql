import { Schedule } from "../../Schema";
import { SchedulesAction } from "../actions";

interface SchedulesState {
  schedules: Schedule[];
  loading: boolean;
  updateScheduleLoading: boolean;
  deleteScheduleLoading: boolean;
  addScheduleLoading: boolean;
}

const initialState: SchedulesState = {
  schedules: [],
  loading: true,
  updateScheduleLoading: false,
  deleteScheduleLoading: false,
  addScheduleLoading: false,
};

const schedulesReducer = (
  state: SchedulesState = initialState,
  action: SchedulesAction
): SchedulesState => {
  switch (action.type) {
    case "schedules/GET_ALL":
      return {
        ...state,
        loading: true,
      };
    case "schedules/GET_ALL_DONE":
      return {
        ...state,
        loading: false,
        schedules: action.payload,
      };
    case "schedules/UPDATE_ONE":
      return {
        ...state,
        updateScheduleLoading: true,
      };
    case "schedules/UPDATE_ONE_DONE": {
      let updatedSchedules = state.schedules;
      if (action.schedule && action.schedule._id) {
        updatedSchedules = state.schedules.map((schedule) =>
          action.schedule && schedule._id === action.schedule._id
            ? action.schedule
            : schedule
        );
      }
      return {
        ...state,
        updateScheduleLoading: false,
        schedules: updatedSchedules,
      };
    }
    case "schedules/DELETE_ONE":
      return {
        ...state,
        deleteScheduleLoading: true,
      };
    case "schedules/DELETE_ONE_DONE": {
      let filteredSchedules = state.schedules;
      if (action.id) {
        filteredSchedules = state.schedules.filter(
          (schedule) => schedule._id !== action.id
        );
      }
      return {
        ...state,
        deleteScheduleLoading: false,
        schedules: filteredSchedules,
      };
    }
    case "schedules/ADD_ONE":
      return {
        ...state,
        addScheduleLoading: true,
      };
    case "schedules/ADD_ONE_DONE": {
      return action.schedule?._id
        ? {
            ...state,
            addScheduleLoading: false,
            schedules: [...state.schedules, action.schedule],
          }
        : {
            ...state,
            addScheduleLoading: false,
          };
    }
    default:
      return state;
  }
};

export default schedulesReducer;

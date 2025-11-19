import { combineReducers } from "redux";
import categoriesReducer from "./reducers/categories";
import appointmentsReducer from "./reducers/appointments";
import authReducer from "./reducers/auth";
import calendarsReducer from "./reducers/calendars";
import schedulesReducer from "./reducers/schedules";
import contactsReducer from "./reducers/contacts";
import settingsReducer from "./reducers/settings";

const rootReducer = combineReducers({
  categories: categoriesReducer,
  appointments: appointmentsReducer,
  auth: authReducer,
  calendars: calendarsReducer,
  schedules: schedulesReducer,
  contacts: contactsReducer,
  settings: settingsReducer
});

export default rootReducer;

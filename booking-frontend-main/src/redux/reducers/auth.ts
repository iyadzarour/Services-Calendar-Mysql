import { AuthAction } from "../actions";

interface AuthState {
  profile: any;
  loggedIn: boolean;
  loading: boolean;
  resetPasswordLoading: boolean;
  forgotLoading: boolean;
}

const initialState: AuthState = {
  profile: null,
  loggedIn: false,
  loading: true,
  resetPasswordLoading: false,
  forgotLoading: false,
};

const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "auth/LOGIN":
      return {
        ...state,
        loading: true,
      };
    case "auth/LOGIN_DONE":
      return {
        ...state,
        loading: false,
        loggedIn: true,
        profile: action.payload,
      };
    case "auth/START_UP":
      return {
        ...state,
        loading: true,
      };
    case "auth/START_UP_DONE":
      return action.payload
        ? {
            ...state,
            loading: false,
            loggedIn: true,
            profile: action.payload,
          }
        : {
            ...state,
            loading: false,
            loggedIn: false,
            profile: null,
          };
    case "auth/LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        loggedIn: false,
        profile: null,
      };
    case "auth/LOGOUT":
      return {
        ...state,
        loggedIn: false,
        profile: null,
      };
    case "auth/RESET_PASSWORD":
      return {
        ...state,
        resetPasswordLoading: true,
      };
    case "auth/RESET_PASSWORD_DONE":
      return {
        ...state,
        resetPasswordLoading: false,
      };
    case "auth/FORGOT_PASSWORD":
      return {
        ...state,
        forgotLoading: true,
      };
    case "auth/FORGOT_PASSWORD_DONE":
      return {
        ...state,
        forgotLoading: false,
      };
    default:
      return state;
  }
};

export default authReducer;

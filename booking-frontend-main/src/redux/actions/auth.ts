import { Dispatch } from "redux";
import { API_URL } from "../network/api";
import { ResetPasswordForm } from "../../Schema";
import { getProfile } from "../../utils";

const START_UP = "auth/START_UP" as const;
const START_UP_DONE = "auth/START_UP_DONE" as const;
const LOGIN = "auth/LOGIN" as const;
const LOGIN_DONE = "auth/LOGIN_DONE" as const;
const LOGIN_ERROR = "auth/LOGIN_ERROR" as const;
const LOGOUT = "auth/LOGOUT" as const;
const RESET_PASSWORD = "auth/RESET_PASSWORD" as const;
const RESET_PASSWORD_DONE = "auth/RESET_PASSWORD_DONE" as const;
const FORGOT_PASSWORD = "auth/FORGOT_PASSWORD" as const;
const FORGOT_PASSWORD_DONE = "auth/FORGOT_PASSWORD_DONE" as const;


export const forgotPassword = () => ({
  type: FORGOT_PASSWORD
});

export const forgotPasswordDone = () => ({
  type: FORGOT_PASSWORD_DONE
});

export const resetPassword = () => ({
  type: RESET_PASSWORD
});

export const resetPasswordDone = () => ({
  type: RESET_PASSWORD_DONE
});

export const startUp = () => ({
  type: START_UP
});

export const startUpDone = (data: any) => ({
  type: START_UP_DONE,
  payload: data,
});

export const login = () => ({
  type: LOGIN
});

export const loginDone = (data: any) => ({
  type: LOGIN_DONE,
  payload: data,
});

export const loginFaild = (data: any) => ({
    type: LOGIN_ERROR,
    payload: data,
});

export const logout = () => ({
  type: LOGOUT
});

export const resetPasswordRequest = (form: ResetPasswordForm) => {
  return async (dispatch: Dispatch) => {
    dispatch(resetPassword());

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(resetPasswordDone());
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(resetPasswordDone());
      return null
    }
  };
};

export const updateProfileRequest = (profile: any) => {
  return async (dispatch: Dispatch) => {
    let existingProfile = {};
    const res = localStorage.getItem('profile');
    if(res){
      existingProfile = JSON.parse(res)
    }

    const updatedProfile = {...existingProfile, ...profile}

    dispatch(startUpDone(updatedProfile));
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
  };
};

export const logoutRequest = () => {
  return async (dispatch: Dispatch) => {
    dispatch(logout());
    localStorage.removeItem('profile');
  };
};

export const loginRequest = (form: {email: string; password: string}) => {
  return async (dispatch: Dispatch) => {
    dispatch(login());

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if(data){
        dispatch(loginDone(data));
        localStorage.setItem('profile', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(loginDone(null));
      return null
    }
  };
};

export const forgotPasswordRequest = (email: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(forgotPassword());

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify({email}),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(forgotPasswordDone());
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(forgotPasswordDone());
      return null
    }
  };
};


export const resetContactPasswordRequest = (password: string, token: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(resetPassword());

    try {
      const response = await fetch(`${API_URL}/auth/reset-contact-password`, {
        method: "POST",
        body: JSON.stringify({password, token}),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(resetPasswordDone());
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(resetPasswordDone());
      return null
    }
  };
};

export type AuthAction = ReturnType<
  typeof login | typeof loginDone | typeof loginFaild | typeof logout | typeof startUp | typeof startUpDone | typeof resetPassword | typeof resetPasswordDone | typeof forgotPassword | typeof forgotPasswordDone
>;

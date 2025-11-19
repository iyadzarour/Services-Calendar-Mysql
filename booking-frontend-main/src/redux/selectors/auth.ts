import { RootState } from '../store';

export const selectProfile = (state: RootState) => state.auth.profile;
export const selectLoginLoading = (state: RootState) => state.auth.loading;
export const selectLoggedIn = (state: RootState) => state.auth.loggedIn;
export const selectResetPasswordLoading = (state: RootState) => state.auth.resetPasswordLoading;

export const selectForgotLoading = (state: RootState) => state.auth.forgotLoading;

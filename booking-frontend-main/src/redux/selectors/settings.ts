import { RootState } from '../store';

export const selectEmailConfig = (state: RootState) => state.settings.emailConfig;
export const selectEmailConfigLoading = (state: RootState) => state.settings.emailConfigLoading;

export const selectUpdateEmailConfigLoading = (state: RootState) => state.settings.updateEmailConfigLoading;
export const selectDeleteEmailConfigLoading = (state: RootState) => state.settings.deleteEmailConfigLoading;

export const selectEmailTemplates = (state: RootState) => state.settings.emailTemplates;
export const selectEmailTemplatesLoading = (state: RootState) => state.settings.emailTemplatesLoading;

export const selectLanguage = (state: RootState) => state.settings.language;
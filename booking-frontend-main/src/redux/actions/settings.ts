import { EmailConfig, EmailTemplate } from "../../Schema";
import { Dispatch } from "redux";
import { API_URL } from "../network/api";
import { getProfile } from "../../utils";

const GET_EMAIL_CONFIG = "settings/GET_EMAIL_CONFIG" as const;
const GET_EMAIL_CONFIG_DONE = "settings/GET_EMAIL_CONFIG_DONE" as const;
const UPDATE_EMAIL_CONFIG = "settings/UPDATE_EMAIL_CONFIG" as const;
const UPDATE_EMAIL_CONFIG_DONE = "settings/UPDATE_EMAIL_CONFIG_DONE" as const;
const DELETE_EMAIL_CONFIG = "settings/DELETE_EMAIL_CONFIG" as const;
const DELETE_EMAIL_CONFIG_DONE = "settings/DELETE_EMAIL_CONFIG_DONE" as const;
const ADD_EMAIL_CONFIG = "settings/ADD_EMAIL_CONFIG" as const;
const ADD_EMAIL_CONFIG_DONE = "settings/ADD_EMAIL_CONFIG_DONE" as const;

const GET_EMAIL_TEMPLATES = "settings/GET_EMAIL_TEMPLATES" as const;
const GET_EMAIL_TEMPLATES_DONE = "settings/GET_EMAIL_TEMPLATES_DONE" as const;
const UPDATE_EMAIL_TEMPLATE = "settings/UPDATE_EMAIL_TEMPLATE" as const;
const UPDATE_EMAIL_TEMPLATE_DONE = "settings/UPDATE_EMAIL_TEMPLATE_DONE" as const;
const DELETE_EMAIL_TEMPLATE = "settings/DELETE_EMAIL_TEMPLATE" as const;
const DELETE_EMAIL_TEMPLATE_DONE = "settings/DELETE_EMAIL_TEMPLATE_DONE" as const;
const ADD_EMAIL_TEMPLATE = "settings/ADD_EMAIL_TEMPLATE" as const;
const ADD_EMAIL_TEMPLATE_DONE = "settings/ADD_EMAIL_TEMPLATE_DONE" as const;

export const SET_LANGUAGE = 'settings/SET_LANGUAGE' as const;

export const setLanguage = (lang: string) => ({
  type: SET_LANGUAGE,
  language: lang,
});

export const setLanguageRequest = (lang: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(setLanguage(lang));
  };
};

export const addEmailConfig = () => ({
  type: ADD_EMAIL_CONFIG,
});

export const addEmailConfigDone = (config: EmailConfig | null) => ({
  type: ADD_EMAIL_CONFIG_DONE,
  config,
});

export const deleteEmailConfig = () => ({
  type: DELETE_EMAIL_CONFIG,
});

export const deleteEmailConfigDone = (id: string | null) => ({
  type: DELETE_EMAIL_CONFIG_DONE,
  id,
});

export const updateEmailConfig = () => ({
  type: UPDATE_EMAIL_CONFIG,
});

export const updateEmailConfigDone = (config: EmailConfig | null) => ({
  type: UPDATE_EMAIL_CONFIG_DONE,
  config,
});

export const getEmailConfig = () => ({
  type: GET_EMAIL_CONFIG,
});

export const getEmailConfigDone = (data: EmailConfig | null) => ({
  type: GET_EMAIL_CONFIG_DONE,
  config: data,
});

export const addEmailTemplate = () => ({
  type: ADD_EMAIL_TEMPLATE,
});

export const addEmailTemplateDone = (template: EmailTemplate | null) => ({
  type: ADD_EMAIL_TEMPLATE_DONE,
  template,
});

export const deleteEmailTemplate = () => ({
  type: DELETE_EMAIL_TEMPLATE,
});

export const deleteEmailTemplateDone = (id: string | null) => ({
  type: DELETE_EMAIL_TEMPLATE_DONE,
  id,
});

export const updateEmailTemplate = () => ({
  type: UPDATE_EMAIL_TEMPLATE,
});

export const updateEmailTemplateDone = (template: EmailTemplate | null) => ({
  type: UPDATE_EMAIL_TEMPLATE_DONE,
  template,
});

export const getEmailTemplates = () => ({
  type: GET_EMAIL_TEMPLATES,
});

export const getEmailTemplatesDone = (data: EmailTemplate[]) => ({
  type: GET_EMAIL_TEMPLATES_DONE,
  data,
});


export const fetchEmailTemplate = (type: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(getEmailTemplates());

    try {
      const response = await fetch(
        `${API_URL}/mailer/template?type=${type}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      if(data && data.length){
          dispatch(getEmailTemplatesDone(data));
          return data;
      } else {
        dispatch(getEmailTemplatesDone([]));
        return null;
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
      dispatch(getEmailTemplatesDone([]));
    }
  };
};

export const updateEmailTemplateRequest = (id: string, template: EmailTemplate) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateEmailTemplate());

    try {
      const response = await fetch(`${API_URL}/mailer/template/${id}`, {
        method: "PUT",
        body: JSON.stringify(template),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateEmailTemplateDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(updateEmailTemplateDone(null));
    }
  };
};

export const deleteEmailTemplateRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteEmailTemplate());

    try {
      const response = await fetch(`${API_URL}/mailer/template/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteEmailTemplateDone(id));
      else {
        dispatch(deleteEmailTemplateDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(deleteEmailTemplateDone(null));
    }
  };
};

export const addEmailTemplateRequest = (template: EmailTemplate) => {
  return async (dispatch: Dispatch) => {
    dispatch(addEmailTemplate());

    try {
      const response = await fetch(`${API_URL}/mailer/template`, {
        method: "POST",
        body: JSON.stringify(template),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addEmailTemplateDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(addEmailTemplateDone(null));
    }
  };
};


export const fetchEmailConfig = () => {
  return async (dispatch: Dispatch) => {
    dispatch(getEmailConfig());

    try {
      const response = await fetch(
        `${API_URL}/mailer/config`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      if(data && data.length){
          dispatch(getEmailConfigDone(data[0]));
          return data[0];
      } else {
        dispatch(getEmailConfigDone(null));
        return null;
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
      dispatch(getEmailConfigDone(null));
    }
  };
};

export const updateEmailConfigRequest = (id: string, config: EmailConfig) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateEmailConfig());

    try {
      const response = await fetch(`${API_URL}/mailer/config/${id}`, {
        method: "PUT",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateEmailConfigDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(updateEmailConfigDone(null));
    }
  };
};

export const deleteEmailConfigRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteEmailConfig());

    try {
      const response = await fetch(`${API_URL}/mailer/config/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteEmailConfigDone(id));
      else {
        dispatch(deleteEmailConfigDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(deleteEmailConfigDone(null));
    }
  };
};

export const addEmailConfigRequest = (config: EmailConfig) => {
  return async (dispatch: Dispatch) => {
    dispatch(addEmailConfig());

    try {
      const response = await fetch(`${API_URL}/mailer/config`, {
        method: "POST",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addEmailConfigDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(addEmailConfigDone(null));
    }
  };
};

export type EmailConfigAction = ReturnType<
  | typeof getEmailConfig
  | typeof getEmailConfigDone
  | typeof updateEmailConfig
  | typeof updateEmailConfigDone
  | typeof deleteEmailConfig
  | typeof deleteEmailConfigDone
  | typeof addEmailConfig
  | typeof addEmailConfigDone
  | typeof addEmailTemplate
  | typeof addEmailTemplateDone
  | typeof deleteEmailTemplate
  | typeof deleteEmailTemplateDone
  | typeof updateEmailTemplate
  | typeof updateEmailTemplateDone
  | typeof getEmailTemplates
  | typeof getEmailTemplatesDone
  | typeof setLanguage
>;

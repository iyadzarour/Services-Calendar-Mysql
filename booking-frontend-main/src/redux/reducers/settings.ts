import { EmailConfig, EmailTemplate } from "../../Schema";
import { EmailConfigAction } from "../actions";

interface EmailConfigState {
  emailConfig: EmailConfig | null;
  emailConfigLoading: boolean;
  updateEmailConfigLoading: boolean;
  deleteEmailConfigLoading: boolean;
  addEmailConfigLoading: boolean;
  emailTemplates: EmailTemplate[];
  emailTemplatesLoading: boolean;
  updateEmailTemplateLoading: boolean;
  deleteEmailTemplateLoading: boolean;
  addEmailTemplateLoading: boolean;
  language: string;
}

const initialState: EmailConfigState = {
  emailConfig: null,
  emailConfigLoading: true,
  updateEmailConfigLoading: false,
  deleteEmailConfigLoading: false,
  addEmailConfigLoading: false,
  emailTemplates: [],
  emailTemplatesLoading: true,
  updateEmailTemplateLoading: false,
  deleteEmailTemplateLoading: false,
  addEmailTemplateLoading: false,
  language: "de",
};

const settingsReducer = (
  state: EmailConfigState = initialState,
  action: EmailConfigAction
): EmailConfigState => {
  switch (action.type) {
    case "settings/GET_EMAIL_CONFIG":
      return {
        ...state,
        emailConfigLoading: true,
      };
    case "settings/GET_EMAIL_CONFIG_DONE":
      return {
        ...state,
        emailConfigLoading: false,
        emailConfig: action.config,
      };
    case "settings/UPDATE_EMAIL_CONFIG":
      return {
        ...state,
        updateEmailConfigLoading: true,
      };
    case "settings/UPDATE_EMAIL_CONFIG_DONE": {
      let emailConfig = state.emailConfig;
      if (action.config && action.config._id) {
        emailConfig = state.emailConfig;
      }
      return {
        ...state,
        updateEmailConfigLoading: false,
        emailConfig: emailConfig,
      };
    }
    case "settings/DELETE_EMAIL_CONFIG":
      return {
        ...state,
        deleteEmailConfigLoading: true,
      };
    case "settings/DELETE_EMAIL_CONFIG_DONE": {
      let emailConfig = state.emailConfig;
      if (action.id) {
        emailConfig = null;
      }
      return {
        ...state,
        deleteEmailConfigLoading: false,
        emailConfig: emailConfig,
      };
    }
    case "settings/ADD_EMAIL_CONFIG":
      return {
        ...state,
        addEmailConfigLoading: true,
      };
    case "settings/ADD_EMAIL_CONFIG_DONE": {
      return action.config?._id
        ? {
            ...state,
            addEmailConfigLoading: false,
            emailConfig: action.config,
          }
        : {
            ...state,
            addEmailConfigLoading: false,
          };
    }
    case "settings/GET_EMAIL_TEMPLATES":
      return {
        ...state,
        emailTemplatesLoading: true,
      };
    case "settings/GET_EMAIL_TEMPLATES_DONE":
      return {
        ...state,
        emailTemplatesLoading: false,
        emailTemplates: action.data,
      };
    case "settings/ADD_EMAIL_TEMPLATE":
      return {
        ...state,
        addEmailTemplateLoading: true,
      };
    case "settings/ADD_EMAIL_TEMPLATE_DONE": {
      return action.template?._id && action.template
        ? {
            ...state,
            addEmailTemplateLoading: false,
            emailTemplates: state.emailTemplates.concat([action.template]),
          }
        : {
            ...state,
            addEmailTemplateLoading: false,
          };
    }
    case "settings/DELETE_EMAIL_TEMPLATE":
      return {
        ...state,
        deleteEmailTemplateLoading: true,
      };
    case "settings/DELETE_EMAIL_TEMPLATE_DONE": {
      let emailTemplates = state.emailTemplates;
      if (action.id) {
        emailTemplates = state.emailTemplates.filter(el => el._id !== action.id);
      }
      return {
        ...state,
        deleteEmailTemplateLoading: false,
        emailTemplates: emailTemplates,
      };
    }
    case "settings/UPDATE_EMAIL_TEMPLATE":
      return {
        ...state,
        updateEmailTemplateLoading: true,
      };
    case "settings/UPDATE_EMAIL_TEMPLATE_DONE": {
      let updatedTemplates = state.emailTemplates;
      if (action.template && action.template._id) {
        updatedTemplates = state.emailTemplates.map((template) =>
          action.template && template._id === action.template._id
            ? action.template
            : template
        );
      }
      return {
        ...state,
        updateEmailTemplateLoading: false,
        emailTemplates: updatedTemplates,
      };
    }
    case "settings/SET_LANGUAGE":
      return {
        ...state,
        language: action.language,
      };
    default:
      return state;
  }
};

export default settingsReducer;

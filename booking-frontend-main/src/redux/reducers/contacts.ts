import { Contact } from "../../Schema";
import { ContactsAction } from "../actions";

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  updateContactLoading: boolean;
  deleteContactLoading: boolean;
  addContactLoading: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  loading: true,
  updateContactLoading: false,
  deleteContactLoading: false,
  addContactLoading: false,
};

const contactsReducer = (
  state: ContactsState = initialState,
  action: ContactsAction
): ContactsState => {
  switch (action.type) {
    case "contacts/GET_ALL":
      return {
        ...state,
        loading: true,
      };
    case "contacts/GET_ALL_DONE":
      return {
        ...state,
        loading: false,
        contacts: action.payload,
      };
    case "contacts/UPDATE_ONE":
      return {
        ...state,
        updateContactLoading: true,
      };
    case "contacts/UPDATE_ONE_DONE": {
      let updatedContacts = state.contacts;
      if (action.contact && action.contact._id) {
        updatedContacts = state.contacts.map((contact) =>
          action.contact && contact._id === action.contact._id
            ? action.contact
            : contact
        );
      }
      return {
        ...state,
        updateContactLoading: false,
        contacts: updatedContacts,
      };
    }
    case "contacts/DELETE_ONE":
      return {
        ...state,
        deleteContactLoading: true,
      };
    case "contacts/DELETE_ONE_DONE": {
      let filteredContacts = state.contacts;
      if (action.id) {
        filteredContacts = state.contacts.filter(
          (contact) => contact._id !== action.id
        );
      }
      return {
        ...state,
        deleteContactLoading: false,
        contacts: filteredContacts,
      };
    }
    case "contacts/ADD_ONE":
      return {
        ...state,
        addContactLoading: true,
      };
    case "contacts/ADD_ONE_DONE": {
      return action.contact?._id
        ? {
            ...state,
            addContactLoading: false,
            contacts: [...state.contacts, action.contact],
          }
        : {
            ...state,
            addContactLoading: false,
          };
    }
    default:
      return state;
  }
};

export default contactsReducer;

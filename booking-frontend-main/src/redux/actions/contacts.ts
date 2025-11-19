import { Contact, PaginatedForm } from "../../Schema";
import { Dispatch } from "redux";
import { API_URL } from "../network/api";
import { RcFile } from "antd/es/upload";
import { getProfile } from "../../utils";

const GET_CONTACTS = "contacts/GET_ALL" as const;
const GET_CONTACTS_DONE = "contacts/GET_ALL_DONE" as const;
const UPDATE_CONTACT = "contacts/UPDATE_ONE" as const;
const UPDATE_CONTACT_DONE = "contacts/UPDATE_ONE_DONE" as const;
const DELETE_CONTACT = "contacts/DELETE_ONE" as const;
const DELETE_CONTACT_DONE = "contacts/DELETE_ONE_DONE" as const;
const ADD_CONTACT = "contacts/ADD_ONE" as const;
const ADD_CONTACT_DONE = "contacts/ADD_ONE_DONE" as const;

export const addContact = () => ({
  type: ADD_CONTACT,
});

export const addContactDone = (contact: Contact | null) => ({
  type: ADD_CONTACT_DONE,
  contact,
});

export const deleteContact = () => ({
  type: DELETE_CONTACT,
});

export const deleteContactDone = (id: string | null) => ({
  type: DELETE_CONTACT_DONE,
  id,
});

export const updateContact = () => ({
  type: UPDATE_CONTACT,
});

export const updateContactDone = (contact: Contact | null) => ({
  type: UPDATE_CONTACT_DONE,
  contact,
});

export const getContacts = () => ({
  type: GET_CONTACTS,
});

export const getContactsDone = (data: Contact[]) => ({
  type: GET_CONTACTS_DONE,
  payload: data,
});

export const fetchContacts = (form: PaginatedForm) => {
  return async (dispatch: Dispatch) => {
    dispatch(getContacts());

    const queryparams = new URLSearchParams();
    form.page && queryparams.append("page", form.page.toString());
    form.limit && queryparams.append("limit", form.limit.toString());
    form.search && queryparams.append("search", form.search.toString());

    try {
      const response = await fetch(
        `${API_URL}/contacts?${queryparams.toString()}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      // TODO: handle pagination
      dispatch(getContactsDone(data.data));
      return data;
    } catch (error) {
      console.error("Error fetching contacts:", error);

      dispatch(getContactsDone([]));
    }
  };
};

export const fetchContactById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      headers: { "x-user-role": getProfile()?.role },
    });
    const data = await response.json();

    return data;
  } catch (error) {
    return null;
  }
};

export const importContactsRequest = async (file: RcFile) => {
  try {
  const uploadFileData = new FormData();
  uploadFileData.append("file", file);
  const result = await fetch(`${API_URL}/files/import-contacts-file`, {
    method: "POST",
    body: uploadFileData,
    headers: { "x-user-role": getProfile()?.role },
  });
  const data = await result.json();

  return data;
} catch (error) {
  return null;
}
};

export const updateContactRequest = (id: string, contact: Contact) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateContact());

    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(contact),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateContactDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching contacts:", error);

      dispatch(updateContactDone(null));
    }
  };
};

export const deleteContactRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteContact());

    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteContactDone(id));
      else {
        dispatch(deleteContactDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching contacts:", error);

      dispatch(deleteContactDone(null));
    }
  };
};

export const resetContactPasswordManually = (id: string, password: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await fetch(`${API_URL}/contacts/reset-password/${id}`, {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching contacts:", error);

      return null;
    }
  };
};

export const createContactRequest = (contact: Contact) => {
  return async (dispatch: Dispatch) => {
    dispatch(addContact());

    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        body: JSON.stringify(contact),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addContactDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching contacts:", error);

      dispatch(addContactDone(null));
    }
  };
};

export type ContactsAction = ReturnType<
  | typeof getContacts
  | typeof getContactsDone
  | typeof updateContact
  | typeof updateContactDone
  | typeof deleteContact
  | typeof deleteContactDone
  | typeof addContact
  | typeof addContactDone
>;

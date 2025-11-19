import { RootState } from '../store';

export const selectContacts = (state: RootState) => state.contacts.contacts;
export const selectContactsLoading = (state: RootState) => state.contacts.loading;

export const selectUpdateContactLoading = (state: RootState) => state.contacts.updateContactLoading;
export const selectDeleteContactLoading = (state: RootState) => state.contacts.deleteContactLoading;



import { Contact } from "../Schema";

export interface ContactDao {
  getContacts(
    page: number,
    limit: number,
    search?: string
  ): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | null>;
  getContactByEmail(email: string): Promise<Contact | null>;
  getContactsCount(search?: string): Promise<number>;
  addContact(contact: Partial<Contact>): Promise<Contact>;
  updateContact(id: string, newContact: Partial<Contact>): Promise<Contact>;
  deleteContact(id: string): Promise<Contact | null>;
  getContactsWithAppointments(): Promise<any>;
}

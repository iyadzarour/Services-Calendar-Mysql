import { Attachment } from "./Common";

export enum SortDirection {
  NONE = "none",
  DESC = "desc",
  ASC = "asc",
}

export enum DisplayStatus {
  SHOW = "show",
  HIDE = "hide",
}

export interface CategorySettings {
  sorting_order?: SortDirection;
  show_performance_in_summary?: boolean;
  show_service_in_email?: boolean;
  info_display_type?: string;
  show_performance_on?: string;
}

export interface Service {
  _id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  abbreviation_id: number;
  attachment?: Attachment;
}

export interface ExtendedService extends Service {
  category_id: string;
}
export interface Category {
  _id?: string;
  name: string;
  category: string;
  choices: string;
  selection_is_optional: boolean;
  show_price: boolean;
  show_appointment_duration: boolean;
  no_columns_of_services: number;
  full_screen: boolean;
  folded: boolean;
  online_booking: boolean;
  remarks: string;
  unique_id: number;
  display_status: DisplayStatus;
  advanced_settings: CategorySettings;
  services: Service[];
  createdAt?: Date;
  updatedAt?: Date;
}

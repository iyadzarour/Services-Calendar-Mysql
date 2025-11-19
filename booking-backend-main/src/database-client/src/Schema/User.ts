export enum UserRole {
  Admin = "admin",
  User = "user",
  Secretaria = "secretaria",
  Employee = "employee",
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  remarks?: string;
  role: UserRole;
  /**
   * communication channel flags to control notifications sent to user.
   */
  channels: {
    email?: boolean;
    sms?: boolean;
    push_notification?: boolean;
  };
  internal: {
    blacklisted?: boolean;
    verified?: boolean;
    verification?: {
      otp: string;
      otp_generated_at: Date;
    };
  };
  token?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResetToken {
  _id?: string;
  token: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RefreshToken {
  refreshToken: string;
}

export interface ResetPasswordForm {
  email: string;
  password: string;
  oldPassword: string;
}

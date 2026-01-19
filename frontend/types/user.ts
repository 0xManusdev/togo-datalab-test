export type Role = "EMPLOYEE" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  userId: string;
  role: Role;
}

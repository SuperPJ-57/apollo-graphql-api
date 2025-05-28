// filepath: src/types/user.types.ts
export interface SignupInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface UserWithPassword extends User{
    password: string;
  }
export interface LoginInput {
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}
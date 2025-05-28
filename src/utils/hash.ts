import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePasswords = (input: string, stored: string) => bcrypt.compare(input, stored);

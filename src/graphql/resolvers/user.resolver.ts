import { db } from '../../config/db.js';
import { hashPassword, comparePasswords } from '../../utils/hash.js';
import { generateTokens } from '../../utils/jwt.js';
import { User,UserWithPassword, SignupInput, LoginInput, AuthPayload } from '../../types/user.types.js';
import jwt from 'jsonwebtoken';

export const userResolvers = {
  Mutation: {
    signup: async (_: unknown, { input }: { input: SignupInput }): Promise<User> => {
      const { firstname, lastname, email, password, confirmPassword } = input;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const [existingRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      const existing = existingRows as { id: number }[];

      if (existing.length > 0) {
        throw new Error('Email already exists');
      }

      const hashedPassword = await hashPassword(password);
      await db.query(
        'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword]
      );

      const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      const insertedUser = (rows as { id: number }[])[0];

      return {
        id: insertedUser.id,
        firstname,
        lastname,
        email,
      };
    },

    login: async (_: unknown, { input }: { input: LoginInput }): Promise<AuthPayload> => {
      const { email, password } = input;

      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      const users = rows as UserWithPassword[];

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      const isValid = await comparePasswords(password, user.password);

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const tokens = generateTokens({ id: user.id, email: user.email });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
      };
    },

    refreshToken: async (
      _: unknown,
      { refreshToken }: { refreshToken: string }
    ): Promise<AuthPayload> => {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      let payload: any;
      try {
        payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as { id: number; email: string };
      } catch (err) {
        throw new Error('Invalid refresh token');
      }

      // Fetch user from DB to ensure user still exists and is valid
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [payload.id]);
      const users = rows as UserWithPassword[];
      if (users.length === 0) {
        throw new Error('User not found');
      }
      const user = users[0];

      // Generate new tokens
      const tokens = generateTokens({ id: user.id, email: user.email });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
      };
    },
  },
};

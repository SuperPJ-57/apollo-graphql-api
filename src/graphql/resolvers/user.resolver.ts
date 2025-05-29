import { db } from "../../config/db.js";
import { hashPassword, comparePasswords } from "../../utils/hash.js";
import { generateTokens, hashToken } from "../../utils/jwt.js";
import {
  User,
  UserWithPassword,
  SignupInput,
  LoginInput,
  AuthPayload,
} from "../../types/user.types.js";
import jwt from "jsonwebtoken";
import { MyContext } from "../../types/context.js";

const gracePeriodMs = 10 * 1000;

export const userResolvers = {
  Mutation: {
    signup: async (
      _: unknown,
      { input }: { input: SignupInput }
    ): Promise<User> => {
      const { firstname, lastname, email, password, confirmPassword } = input;

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const [existingRows] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      const existing = existingRows as { id: number }[];

      if (existing.length > 0) {
        throw new Error("Email already exists");
      }

      const hashedPassword = await hashPassword(password);
      await db.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
        [firstname, lastname, email, hashedPassword]
      );

      const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
      const insertedUser = (rows as { id: number }[])[0];

      return {
        id: insertedUser.id,
        firstname,
        lastname,
        email,
      };
    },

    login: async (
      _: unknown,
      { input }: { input: LoginInput }
    ): Promise<AuthPayload> => {
      const { email, password } = input;

      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      const users = rows as UserWithPassword[];

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const user = users[0];
      const isValid = await comparePasswords(password, user.password);

      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      const tokens = generateTokens({ id: user.id, email: user.email });
      const refreshTokenHash = hashToken(tokens.refreshToken);

      await db.query(
        "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
        [tokens.jti, user.id, refreshTokenHash]
      );

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
      { refreshToken }: { refreshToken: string },
      context: MyContext
    ): Promise<Omit<AuthPayload, "refreshToken">> => {
      if (!refreshToken) {
        throw new Error("Refresh token is required");
      }

      const { req, res } = context;
      let payload: any;

      try {
        payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as { id: number; email: string; jti: string };
      } catch {
        throw new Error("Invalid refresh token");
      }

      const refreshTokenHash = hashToken(refreshToken);
      const jti = payload.jti;

      const [rows] = await db.query(
        "SELECT * FROM refresh_tokens WHERE id = ? AND token_hash = ?",
        [jti, refreshTokenHash]
      );
      const stored = rows[0];

      const now = new Date();
      if (!stored) {
        throw new Error("Refresh token not found or invalid");
      }

      const tokenExpiredAt = new Date(stored.expires_at);
      const tokenRevokedAt = stored.revoked_at ? new Date(stored.revoked_at) : null;

      const isExpired = tokenExpiredAt < now;
      const isInGrace = isExpired && now.getTime() - tokenExpiredAt.getTime() <= gracePeriodMs;

      if (tokenRevokedAt || (isExpired && !isInGrace)) {
        await db.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ?", [
          payload.id,
        ]);
        throw new Error("Token reuse or expiry detected. All sessions revoked.");
      }

      await db.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [jti]);

      const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [
        payload.id,
      ]);
      const users = userRows as User[];

      if (users.length === 0) throw new Error("User not found");

      const user = users[0];
      const tokens = generateTokens({ id: user.id, email: user.email });
      const newRefreshTokenHash = hashToken(tokens.refreshToken);

      await db.query(
        "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
        [tokens.jti, user.id, newRefreshTokenHash]
      );

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/refresh-token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
      };
    },
  },
  Query:{
    me: async (_: unknown, __: unknown, context: MyContext): Promise<User> => {
      const { user } = context;

      if (!user) {
        throw new Error("Not authenticated");
      }

      const [rows] = await db.query("SELECT id, firstname, lastname, email FROM users WHERE id = ?", [
        user.id,
      ]);
      const users = rows as User[];

      if (users.length === 0) {
        throw new Error("User not found");
      }

      return users[0];
    },
  },
};

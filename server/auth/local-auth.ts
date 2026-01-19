import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { Response } from "express";
import { COOKIE_NAME } from "@shared/const";

const SALT_ROUNDS = 10;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "mirin-local-secret-key-change-in-production");
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
    userId: number;
    username: string;
    role: "user" | "admin";
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
    });
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res: Response) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

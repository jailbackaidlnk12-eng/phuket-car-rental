import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { verifyToken } from "../auth/local-auth";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  ip: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Get token from cookie
    const token = opts.req.cookies?.[COOKIE_NAME];

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const dbUser = await getUserById(payload.userId);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Extract client IP from x-forwarded-for header (takes first IP if multiple proxies)
  const forwardedFor = opts.req.headers["x-forwarded-for"] as string;
  const ip = forwardedFor?.split(',')[0]?.trim() || opts.req.socket.remoteAddress || "unknown";

  return {
    req: opts.req,
    res: opts.res,
    user,
    ip,
  };
}

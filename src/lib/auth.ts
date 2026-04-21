import { cookies } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

import { hasPermission } from "@/config/permissions";
import { prisma } from "@/lib/prisma";

const SESSION_SECRET = process.env.DEMO_SESSION_SECRET ?? "mofa-demo-session";

export const AUTH_SESSION_COOKIE = process.env.DEMO_SESSION_SECRET
  ? `mofa-session-${process.env.DEMO_SESSION_SECRET.slice(0, 8)}`
  : "mofa-session";

export const DEMO_USER_COOKIE = AUTH_SESSION_COOKIE;

export type CurrentUser = {
  id: string;
  username: string | null;
  email: string;
  fullNameAr: string;
  titleAr: string | null;
  role: {
    id: string;
    nameAr: string;
    code: string;
    permissions: unknown;
  };
  organizationalUnit: {
    id: string;
    nameAr: string;
  } | null;
};

const currentUserInclude = {
  id: true,
  username: true,
  email: true,
  fullNameAr: true,
  titleAr: true,
  status: true,
  role: {
    select: {
      id: true,
      nameAr: true,
      code: true,
      permissions: true
    }
  },
  organizationalUnit: {
    select: {
      id: true,
      nameAr: true
    }
  }
} as const;

function signUserId(userId: string) {
  return createHmac("sha256", SESSION_SECRET).update(userId).digest("hex");
}

function createSessionValue(userId: string) {
  return `${userId}.${signUserId(userId)}`;
}

function parseSessionValue(value: string | undefined) {
  if (!value) return null;

  const [userId, signature] = value.split(".");

  if (!userId || !signature) return null;

  const expected = Buffer.from(signUserId(userId), "hex");
  const actual = Buffer.from(signature, "hex");

  if (expected.length !== actual.length) return null;

  return timingSafeEqual(expected, actual) ? userId : null;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get(AUTH_SESSION_COOKIE)?.value);

    if (!userId) {
      return null;
    }

    return prisma.user.findFirst({
      where: {
        id: userId,
        status: "ACTIVE"
      },
      select: currentUserInclude
    });
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePermission(permission: string, fallbackPath = "/dashboard") {
  const user = await requireCurrentUser();

  if (!hasPermission(user, permission)) {
    redirect(`${fallbackPath}?error=forbidden` as Route);
  }

  return user;
}

export async function setAuthenticatedSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearAuthenticatedSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);
}

export const setDemoSession = setAuthenticatedSession;
export const clearDemoSession = clearAuthenticatedSession;

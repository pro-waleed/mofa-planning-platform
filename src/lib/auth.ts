import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const DEMO_USER_COOKIE = "mofa-demo-user";

export type CurrentUser = {
  id: string;
  email: string;
  fullNameAr: string;
  titleAr: string | null;
  role: {
    id: string;
    nameAr: string;
    code: string;
  };
  organizationalUnit: {
    id: string;
    nameAr: string;
  } | null;
};

const currentUserInclude = {
  role: true,
  organizationalUnit: true
} as const;

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(DEMO_USER_COOKIE)?.value;

    if (userId) {
      return prisma.user.findUnique({
        where: { id: userId },
        include: currentUserInclude
      });
    }

    return prisma.user.findFirst({
      where: { status: "ACTIVE" },
      include: currentUserInclude,
      orderBy: { createdAt: "asc" }
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

export async function setDemoSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_USER_COOKIE);
}

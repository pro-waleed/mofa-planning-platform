"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { clearAuthenticatedSession, setAuthenticatedSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function loginWithCredentials(formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=required");
  }

  const username = normalizeUsername(parsed.data.username);
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      role: true
    }
  });

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: { increment: 1 },
          lastFailedLoginAt: new Date()
        }
      });
    }

    redirect("/login?error=invalid");
  }

  if (user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lastLoginAt: new Date()
    }
  });

  await setAuthenticatedSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearAuthenticatedSession();
  redirect("/login");
}

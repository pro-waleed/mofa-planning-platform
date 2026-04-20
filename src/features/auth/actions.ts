"use server";

import { redirect } from "next/navigation";

import { clearDemoSession, setDemoSession } from "@/lib/auth";

export async function loginAsUser(formData: FormData) {
  const userId = formData.get("userId");

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  await setDemoSession(userId);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearDemoSession();
  redirect("/login");
}


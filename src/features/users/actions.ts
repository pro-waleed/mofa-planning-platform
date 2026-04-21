"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasPermission } from "@/config/permissions";
import { requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const userStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);

const baseUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/),
  email: z.string().trim().email().max(120),
  fullNameAr: z.string().trim().min(3).max(120),
  titleAr: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  roleId: z.string().min(1),
  organizationalUnitId: z.string().optional(),
  status: userStatusSchema
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8).max(128)
});

const updateUserSchema = baseUserSchema.extend({
  userId: z.string().min(1),
  password: z.string().max(128).optional()
});

function optionalValue(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : undefined;
}

function handleUserWriteError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(",")
        : String(error.meta?.target ?? "");

      if (target.includes("username")) {
        redirect("/users?error=username_exists");
      }

      if (target.includes("email")) {
        redirect("/users?error=email_exists");
      }
    }
  }

  redirect("/users?error=save_failed");
}

async function getAssignableRole(roleId: string, currentUser: Awaited<ReturnType<typeof requirePermission>>) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      code: true,
      nameAr: true
    }
  });

  if (!role) {
    redirect("/users?error=role_not_found");
  }

  if (role.code === "SYSTEM_ADMIN" && !hasPermission(currentUser, "*")) {
    redirect("/users?error=admin_role_restricted");
  }

  return role;
}

export async function createUserAction(formData: FormData) {
  const currentUser = await requirePermission("users.manage", "/users");
  const parsed = createUserSchema.safeParse({
    username: formValue(formData, "username"),
    email: formValue(formData, "email"),
    fullNameAr: formValue(formData, "fullNameAr"),
    titleAr: formValue(formData, "titleAr"),
    phone: formValue(formData, "phone"),
    roleId: formValue(formData, "roleId"),
    organizationalUnitId: formValue(formData, "organizationalUnitId"),
    status: formValue(formData, "status"),
    password: formValue(formData, "password")
  });

  if (!parsed.success) {
    redirect("/users?error=validation");
  }

  const data = parsed.data;
  const role = await getAssignableRole(data.roleId, currentUser);
  let createdUserId = "";

  try {
    const user = await prisma.user.create({
      data: {
        username: normalizeUsername(data.username),
        email: data.email.trim().toLowerCase(),
        fullNameAr: data.fullNameAr.trim(),
        titleAr: optionalValue(data.titleAr),
        phone: optionalValue(data.phone),
        roleId: role.id,
        organizationalUnitId: optionalValue(data.organizationalUnitId),
        status: data.status,
        passwordHash: hashPassword(data.password),
        passwordUpdatedAt: new Date()
      },
      select: {
        id: true,
        fullNameAr: true
      }
    });

    createdUserId = user.id;
  } catch (error) {
    handleUserWriteError(error);
  }

  await prisma.auditLog.create({
    data: {
      actorId: currentUser.id,
      action: "CREATE_USER",
      entityType: "User",
      entityId: createdUserId,
      description: `أنشأ ${currentUser.fullNameAr} حساب مستخدم جديد بدور "${role.nameAr}".`
    }
  });

  revalidatePath("/users");
  redirect("/users?success=created");
}

export async function updateUserAction(formData: FormData) {
  const currentUser = await requirePermission("users.manage", "/users");
  const parsed = updateUserSchema.safeParse({
    userId: formValue(formData, "userId"),
    username: formValue(formData, "username"),
    email: formValue(formData, "email"),
    fullNameAr: formValue(formData, "fullNameAr"),
    titleAr: formValue(formData, "titleAr"),
    phone: formValue(formData, "phone"),
    roleId: formValue(formData, "roleId"),
    organizationalUnitId: formValue(formData, "organizationalUnitId"),
    status: formValue(formData, "status"),
    password: formValue(formData, "password")
  });

  if (!parsed.success) {
    redirect("/users?error=validation");
  }

  const data = parsed.data;
  const existingUser = await prisma.user.findUnique({
    where: { id: data.userId },
    select: {
      id: true,
      fullNameAr: true,
      roleId: true
    }
  });

  if (!existingUser) {
    redirect("/users?error=user_not_found");
  }

  const role = await getAssignableRole(data.roleId, currentUser);

  if (currentUser.id === data.userId && data.status !== "ACTIVE") {
    redirect("/users?error=self_status");
  }

  if (currentUser.id === data.userId && data.roleId !== currentUser.role.id) {
    redirect("/users?error=self_role");
  }

  const password = data.password?.trim();

  try {
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        username: normalizeUsername(data.username),
        email: data.email.trim().toLowerCase(),
        fullNameAr: data.fullNameAr.trim(),
        titleAr: optionalValue(data.titleAr),
        phone: optionalValue(data.phone),
        roleId: role.id,
        organizationalUnitId: optionalValue(data.organizationalUnitId),
        status: data.status,
        failedLoginCount: data.status === "ACTIVE" ? 0 : undefined,
        ...(password
          ? {
              passwordHash: hashPassword(password),
              passwordUpdatedAt: new Date()
            }
          : {})
      }
    });
  } catch (error) {
    handleUserWriteError(error);
  }

  await prisma.auditLog.create({
    data: {
      actorId: currentUser.id,
      action: "UPDATE_USER",
      entityType: "User",
      entityId: data.userId,
      description: `حدث ${currentUser.fullNameAr} بيانات المستخدم "${existingUser.fullNameAr}" ودوره "${role.nameAr}".`
    }
  });

  revalidatePath("/users");
  redirect("/users?success=updated");
}

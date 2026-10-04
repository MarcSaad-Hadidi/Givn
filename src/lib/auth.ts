import "server-only";

import { currentUser } from "@clerk/nextjs/server";

export async function isAdmin(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return false;

  const user = await currentUser();
  const email = user?.primaryEmailAddress;

  return Boolean(
    email?.verification?.status === "verified" &&
      email.emailAddress.trim().toLowerCase() === adminEmail,
  );
}

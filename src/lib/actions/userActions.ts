"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "../validationSchemas";

export const handleGoogleLogin = async () => {
  await signIn("google", { redirectTo: "/" });
};

export const handleGithubLogin = async () => {
  await signIn("github", { redirectTo: "/" });
};

export const handleLogout = async () => {
  await signOut({ redirectTo: "/" });
};

export const register = async (
  previousState: { success: boolean; message: string },
  data: RegisterSchema
) => {
  const { username, email, name, password, image } = data;

  try {
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return {
        success: false,
        message: "Username already exists",
      };
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return {
        success: false,
        message: "Username already exists",
      };
    }

    const existingName = await prisma.user.findUnique({
      where: { name },
    });
    if (existingName) {
      return {
        success: false,
        message: "Username already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        image,
      },
    });

    return { success: true, message: "User has been created" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

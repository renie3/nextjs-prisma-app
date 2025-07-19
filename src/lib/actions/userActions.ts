"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { LoginSchema, RegisterSchema, UserSchema } from "../validationSchemas";
import { AuthError } from "next-auth";

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

export const login = async (
  previousState: { success: boolean; message: string },
  data: LoginSchema
) => {
  const { username, password } = data;

  try {
    await signIn("credentials", { username, password, redirectTo: "/" });
    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Invalid Credentials",
          };
        default:
          return { success: false, message: "Something went wrong" };
      }
    }
    throw error;
  }
};

export const updateUser = async (
  previousState: { success: boolean; message: string },
  data: UserSchema
) => {
  const { id, username, email, name, password, image, isAdmin } = data;

  const session = await auth();
  if (!id && !session?.user?.id) {
    return {
      success: false,
      message: "Not Authorized",
    };
  }

  try {
    const updateFields: { [key: string]: string | boolean | undefined } = {
      username,
      email,
      name,
      password,
      image,
      isAdmin: isAdmin === "true",
    };

    // remove empty or undefined values
    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || updateFields[key] === undefined) &&
        delete updateFields[key]
    );

    // hash password if it exist
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id: id || session!.user.id },
      data: updateFields,
    });

    return { success: true, message: "User has been updated" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export const createUser = async (
  previousState: { success: boolean; message: string },
  data: RegisterSchema
) => {
  const { username, email, name, password, image, isAdmin } = data;

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
        message: "Email already exists",
      };
    }

    const existingName = await prisma.user.findUnique({
      where: { name },
    });
    if (existingName) {
      return {
        success: false,
        message: "Name already exists",
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
        isAdmin: isAdmin === "true",
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

export const deleteUser = async (
  previousState: { success: boolean; message: string },
  formData: FormData
) => {
  const id = formData.get("id") as string;

  try {
    await prisma.user.delete({
      where: { id },
    });

    return { success: true, message: "User has been deleted" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

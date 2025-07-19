"use server";

import { prisma } from "../prisma";
import { auth } from "../auth";
import { PostSchema } from "../validationSchemas";

export const createPost = async (
  previousState: { success: boolean; message: string },
  data: PostSchema
) => {
  const { title, desc, img, category, isFeatured } = data;

  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const existingTitle = await prisma.post.findUnique({
      where: { title },
    });
    if (existingTitle) {
      return {
        success: false,
        message: "Title already exists",
      };
    }

    await prisma.post.create({
      data: {
        userId: session.user.id,
        title,
        desc,
        img,
        category,
        isFeatured: isFeatured === "true",
      },
    });

    return { success: true, message: "Post has been created" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export const updatePost = async (
  previousState: { success: boolean; message: string },
  data: PostSchema
) => {
  const { id, title, desc, img, category, isFeatured } = data;

  try {
    await prisma.post.update({
      where: { id },
      data: { title, desc, img, category, isFeatured: isFeatured === "true" },
    });

    return { success: true, message: "Post has been updated" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export const deletePost = async (
  previousState: { success: boolean; message: string },
  formData: FormData
) => {
  const id = formData.get("id") as string;

  try {
    await prisma.post.delete({
      where: { id },
    });

    return { success: true, message: "Post has been deleted" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

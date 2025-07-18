import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./validationSchemas";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // session: { strategy: "database" },
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    Credentials({
      authorize: async (credentials) => {
        try {
          const parsedCredentials = loginSchema.safeParse(credentials);
          if (!parsedCredentials.success) {
            console.log(parsedCredentials.error.flatten().fieldErrors);
            return null;
          }

          const { username, password } = parsedCredentials.data;

          const user = await prisma.user.findUnique({
            where: { username },
          });
          if (!user || !user.password) throw new Error("Wrong credentials!");

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );
          if (!isPasswordCorrect) throw new Error("Wrong credentials!");

          return user;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      //   console.log("token", token);
      //   return token;
      const existingUser = await prisma.user.findUnique({
        where: {
          id: token.sub,
        },
      });

      if (existingUser) {
        token.id = existingUser.id;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.image = existingUser.image;
        token.isAdmin = existingUser.isAdmin;
        if (existingUser.username) {
          token.username = existingUser.username;
        } else {
          delete token.username;
        }
      }
      // console.log("token", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("session", session);
      // console.log("token", token);
      // return session;
      session.user.id = token.id ?? "";
      session.user.name = token.name ?? "";
      session.user.email = token.email ?? "";
      session.user.image = token.image ?? "";
      session.user.isAdmin = token.isAdmin ?? false;
      if (token.username) {
        session.user.username = token.username ?? "";
      }
      // console.log("session", session);
      return session;
    },
  },
});

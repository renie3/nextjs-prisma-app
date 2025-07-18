import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

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

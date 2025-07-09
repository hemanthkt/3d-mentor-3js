import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { signIn } from "next-auth/react";
import connectMongoDB from "../../../../../lib/mongodb";
import { UserModel } from "../../../../../lib/models/user";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("User data:", user, "Account data:", account);

      if (account.provider === "google") {
        const { name, email } = user;
        try {
          await connectMongoDB();
          const existingUser = await UserModel.findOne({ email });
          if (!existingUser) {
            const res = await fetch("http://localhost:3000/api/user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name,
                email,
              }),
            });

            if (res.ok) {
              return user;
            }
          }
        } catch (error) {
          console.log(error);
          return false;
        }
      }

      return user;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // From your user creation logic
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      console.log("This is the session data", session);

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

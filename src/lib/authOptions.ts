import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  // @ts-ignore - Adapter type compatibility
  adapter: PrismaAdapter(db), 
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Email tidak terdaftar");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          // image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        token.name = user.name;
      }
      
      // Handle session update (untuk update nama dari profil)
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Semua role (PELANGGAN dan PENGUSAHA) diarahkan ke direktori UMKM (halaman utama)
      if (url === baseUrl || url.startsWith('/dashboard')) {
        return baseUrl + '/'; // Redirect ke halaman utama
      }
      // Jika sudah di halaman utama atau ada redirect parameter, biarkan
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default ke halaman utama
      return baseUrl + '/';
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
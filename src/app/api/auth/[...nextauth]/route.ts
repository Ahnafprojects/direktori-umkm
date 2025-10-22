// File: src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Kamu bisa menambahkan provider lain seperti Google, GitHub, dll di sini
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Email tidak terdaftar');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Password salah');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role, // <-- Kirim role ke session
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // Callback untuk menyertakan ID dan role pengguna ke dalam token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    // Callback untuk menyertakan ID dan role pengguna ke dalam object session
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Arahkan ke halaman login kustom (opsional)
    // error: '/auth/error', // Halaman untuk menampilkan error (opsional)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
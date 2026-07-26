import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const inputIdentifier = credentials?.email?.trim();
        const inputPassword = credentials?.password?.trim();

        if (!inputIdentifier || !inputPassword) {
          throw new Error('Please enter credentials');
        }

        // 1. Check default admin credentials
        if (
          (inputIdentifier === 'admin' || inputIdentifier === 'admin@attire.com') &&
          inputPassword === 'admin123'
        ) {
          return {
            id: 'admin-super-user',
            name: 'System Admin',
            email: 'admin@attire.com',
            role: 'admin',
          };
        }

        // 2. Regular User Authentication via MongoDB
        await dbConnect();

        const user = await User.findOne({ email: inputIdentifier });
        if (!user || !user.password) {
          throw new Error('No account found with this email');
        }

        const isValid = await bcrypt.compare(inputPassword, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || 'customer',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: 'customer',
          });
        }

        // Attach actual MongoDB _id to the user object
        user.id = dbUser._id.toString();
        user.role = dbUser.role || 'customer';
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user._id;
        token.role = user.role || 'customer';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.role = token.role || 'customer';
        session.user.image = token.picture || session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
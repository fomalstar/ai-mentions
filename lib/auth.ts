import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  // Temporarily disable adapter to resolve OAuthAccountNotLinked error
  // adapter: PrismaAdapter(prisma) as any, // Type assertion to fix compatibility
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !(user as any).password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, (user as any).password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionTier: user.subscriptionTier,
          }
        } catch (error) {
          console.error('Error during credentials auth:', error)
          return null
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user data from JWT token (no database adapter)
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.email = token.email || '';
        session.user.name = token.name || '';
        session.user.image = token.picture || '';
        
        // Try to get subscription tier from database if user exists
        try {
          if (token.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email },
              select: { subscriptionTier: true }
            });
            session.user.subscriptionTier = dbUser?.subscriptionTier || 'free';
          } else {
            session.user.subscriptionTier = 'free';
          }
        } catch (error) {
          console.error('Error fetching user subscription:', error);
          session.user.subscriptionTier = 'free';
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback triggered:', {
        user: { 
          email: user.email, 
          name: user.name,
          id: user.id 
        },
        account: { 
          provider: account?.provider, 
          type: account?.type,
          providerAccountId: account?.providerAccountId 
        },
        profile: profile ? 'present' : 'missing'
      });

      // For OAuth providers, create/update user in database manually
      if (account?.type === 'oauth' && user.email) {
        try {
          console.log('🔗 OAuth sign in - creating/updating user manually');
          console.log('📧 User email:', user.email);
          console.log('👤 User name:', user.name);
          
          const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name,
              image: user.image,
              updatedAt: new Date()
            },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              subscriptionTier: 'free',
              createdAt: new Date(),
              updatedAt: new Date()
            },
          });
          
          console.log('✅ User upserted successfully:', {
            id: upsertedUser.id,
            email: upsertedUser.email,
            name: upsertedUser.name
          });
          return true;
        } catch (error) {
          console.error('❌ Error upserting user:', error);
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code || 'UNKNOWN',
            meta: (error as any)?.meta || 'No metadata'
          });
          // Still allow sign in even if database fails
          return true;
        }
      }

      // For credentials provider, check password
      if (account?.type === 'credentials') {
        console.log('🔑 Credentials sign in');
        return true; // Password already verified in authorize function
      }
      
      console.log('✅ Sign in allowed');
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl });
      
      // Handle different redirect scenarios
      if (url.startsWith("/")) {
        // Relative URL
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        // Same origin
        return url;
      }
      
      // Default redirect to dashboard
      const redirectUrl = `${baseUrl}/dashboard`;
      console.log('🎯 Redirecting to:', redirectUrl);
      return redirectUrl;
    },
  },
  pages: {
    error: '/auth/error', // Custom error page
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        maxAge: 900
      }
    },
    state: {
      name: `__Secure-next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        maxAge: 900
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode for better error logging
}


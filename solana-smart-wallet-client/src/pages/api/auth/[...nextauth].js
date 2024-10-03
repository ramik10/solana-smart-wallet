import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions = {
    async signIn({ account, profile }) {
        return true;
    },
    async redirect({ url, baseUrl }) {
        return url.startsWith(baseUrl) ? url : baseUrl;
    },
    session: {
      strategy: 'jwt'
    },
    callbacks: {
      async jwt({ token, account }) {
        if (account) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.googleId= account.providerAccountId
        }
        return token
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.googleId=token.googleId
        return session
      }
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_OAUTH_ID,
        clientSecret: process.env.GOOGLE_OAUTH_SECRET,
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
        accessTokenUrl: 'https://oauth2.googleapis.com/token',
        authorization: {
          params: {
            access_type: "offline", prompt: "consent",
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file'
          },
        },
      })
    ],
    theme: {
      colorScheme: 'light'
    },
  }

export default NextAuth(authOptions);

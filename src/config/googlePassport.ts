// src/config/passport.ts
import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.config";
import { AuthProvider } from "generated/prisma/enums";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/v1/auth/google/callback",
      //   scope: ["profile"],
    },
    (accessToken) => {
      console.log(accessToken);
    },
    // async (_, __, profile: Profile, done) => {
    //   try {
    //     console.log("🚀 ~ profile:", profile);

    //     const currentUser = await prisma?.user.findUnique({
    //       where: {
    //         provider_id: profile?.id,
    //       },
    //     });

    //     if (currentUser) {
    //       done(null, currentUser);
    //     }

    //     if (profile.photos?.[0]?.value) {
    //       const avatar = profile.photos?.[0]?.value;
    //     }

    //     const newUser = await prisma?.user.create({
    //       data: {
    //         provider: AuthProvider.google,
    //         provider_id: profile.id,
    //         email: profile.emails?.[0]?.value || "",
    //         first_name: profile.displayName || profile.name?.givenName || "",
    //         last_name: profile.name?.familyName,
    //         admin: false,
    //       },
    //     });

    //     if (newUser) {
    //       done(null, newUser);
    //     } else {
    //       throw new Error("Login with google failed!");
    //     }
    //   } catch (err) {
    //     done(err, false);
    //   }
    // },
  ),
);

export default passport;

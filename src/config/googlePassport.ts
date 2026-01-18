// src/config/passport.ts
import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.config";
import { AuthProvider } from "generated/prisma/enums";
import { getImageSize } from "@/tools/image";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/v1/auth/google/callback",
      //   scope: ["profile"],
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        if (profile.id) {
          const currentUser = await prisma?.user.findUnique({
            where: {
              provider_id: profile?.id,
            },
            omit: {
              password: true,
              password_reset_expired: true,
              password_reset_token: true,
            },
          });

          if (currentUser) {
            return done(null, currentUser);
          }

          const emailUser = await prisma?.user.findUnique({
            where: {
              email: profile.emails?.[0]?.value || "",
            },
            omit: {
              password: true,
              password_reset_expired: true,
              password_reset_token: true,
            },
          });

          if (emailUser) {
            return done(null, emailUser);
          }

          let avatar = profile.photos?.[0]?.value || "";
          let width = 0;
          let height = 0;

          if (avatar) {
            const res = await fetch(avatar);
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const metaData = await getImageSize(buffer);
            width = metaData?.width || 0;
            height = metaData?.height || 0;
          }

          const newUser = await prisma?.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                provider: AuthProvider.google,
                provider_id: profile.id,
                email: profile.emails?.[0]?.value || "",
                first_name: profile.name?.givenName || "",
                last_name: profile.name?.familyName || "",
                admin: false,
                images: {
                  create: {
                    ext: "png",
                    width: width || 0,
                    height: height || 0,
                    name: "google-avatar",
                    path: avatar,
                  },
                },
              },
              include: {
                images: true,
              },
              omit: {
                password: true,
                password_reset_expired: true,
                password_reset_token: true,
              },
            });

            await tx.user.update({
              where: {
                id: user?.id,
              },
              data: {
                avatar: {
                  connect: {
                    id: user?.images?.[0]?.id,
                  },
                },
              },
            });

            return user;
          });

          if (newUser) {
            return done(null, newUser);
          } else {
            throw new Error("Login with google failed!");
          }
        }
      } catch (err) {
        done(err, false);
      }
    },
  ),
);

export default passport;

// src/config/passport.ts
import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.config";
import { AuthProvider } from "generated/prisma/enums";
import { avatarDir, getImageSize } from "@/tools/image";
import path from "path";
import fs from "fs";
import crypto from "crypto";

async function downloadGoogleAvatar(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to download avatar");
  }

  const contentType = res.headers.get("content-type"); // image/jpeg, image/png
  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";

  const filename = `avatar_${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(avatarDir, filename);

  const buffer = Buffer.from(await res.arrayBuffer());

  fs.writeFileSync(filePath, buffer);

  return { path: filePath, ext, name: filename };
}

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
          console.log("🚀 ~ profile:", profile);
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

          const avatar = profile.photos?.[0]?.value || "";
          const imageCreate = {
            width: 0,
            height: 0,
            ext: "",
            name: "",
            path: "",
          };

          if (avatar) {
            const localFile = await downloadGoogleAvatar(avatar);
            const metaData = await getImageSize(localFile?.path);

            imageCreate.width = metaData?.width || 0;
            imageCreate.height = metaData?.height || 0;
            imageCreate.ext = localFile?.ext || "";
            imageCreate.name = localFile?.name || "";
            imageCreate.path = localFile?.path || "";
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
                ...(imageCreate?.path && {
                  images: {
                    create: imageCreate,
                  },
                }),
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

            if (imageCreate?.path) {
              const updateResult = await tx.user.update({
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
                omit: {
                  password: true,
                  password_reset_expired: true,
                  password_reset_token: true,
                },
              });

              if (!updateResult) {
                throw new Error("Update avatar failed!");
              }
            }

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

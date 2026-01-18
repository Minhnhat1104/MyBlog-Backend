import multer from "multer";

import dayjs from "dayjs";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import crypto from "crypto";

// const storage = getStorage();
const uploadDir = path.join(process.cwd(), "src", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const cacheDir = path.join(process.cwd(), "src", "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const folderDir = path.join(uploadDir, dayjs()?.format("YYYY_MM_DD"));
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir, { recursive: true });
    }
    callback(null, folderDir);
  },
  filename(req, file, callback) {
    const ext = path.extname(file.originalname);
    //  1704883205123_k8f3zq2.png
    //  1704883205123_ax91j2.jpg
    callback(
      null,
      `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`,
    );
  },
});

export const upload = multer({ storage: storage });

export async function getImageSize(filePath: string | Buffer<ArrayBuffer>) {
  const metadata = await sharp(filePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
  };
}

// compress	Tự động nén ảnh
// format	Tự chọn format tối ưu (webp / avif / jpeg)
// enhance	Tăng nhẹ độ nét / contrast
// strip	Xóa metadata (EXIF, ICC dư thừa)

export enum ImageAuto {
  compress = "compress",
  format = "format",
  enhance = "enhance",
  metaData = "metaData",
}

export enum ImageColorSpave {
  tinysrgb = "tinysrgb",
  srgb = "srgb",
}

export function isInEnum<T extends Record<string, string>>(
  value: unknown,
  enumObject: T,
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

export interface ImageFilter {
  w?: number;
  h?: number;
  quality?: number;
  auto?: ImageAuto[];
  colorSpace?: "tinysrgb" | "srgb";
}

export function getCacheFileName(imageId: number, filter: ImageFilter) {
  const normalized = {
    id: imageId,
    ...filter,
  };

  const rawKey = JSON.stringify(normalized);

  return crypto.createHash("sha1").update(rawKey).digest("hex");
}

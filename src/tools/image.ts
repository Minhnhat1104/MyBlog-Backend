import multer from "multer";

import dayjs from "dayjs";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// const storage = getStorage();
const uploadDir = path.join(process.cwd(), "src", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
      `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`
    );
  },
});

export const upload = multer({ storage: storage });

export async function getImageSize(filePath: string) {
  const metadata = await sharp(filePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
  };
}

import fs from "fs";
import path from "path";
import dayjs from "dayjs";

type LogLevel = "INFO" | "WARN" | "ERROR";

const LOG_DIR = path.resolve(__dirname, "../logs");

function getLogFilePath(): string {
  const fileName = `${dayjs()?.format("YYYY_MM_DD")}.log`;
  return path.join(LOG_DIR, fileName);
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function log(level: LogLevel, message: string, meta?: unknown) {
  ensureLogDir();

  const time = dayjs()?.format("YYYY/MM/DD HH:mm:sss");

  const logEntry =
    [`[${time}]`, `[${level}]`, message, meta ? JSON.stringify(meta) : ""].join(
      " "
    ) + "\n";

  fs.appendFileSync(getLogFilePath(), logEntry, {
    encoding: "utf8",
  });
}

export const logger = {
  info: (message: string, meta?: unknown) => log("INFO", message, meta),
  warn: (message: string, meta?: unknown) => log("WARN", message, meta),
  error: (message: string, meta?: unknown) => log("ERROR", message, meta),
};

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

let prisma: PrismaClient | null = null;

export const prismaConnectDB = () => {
  const adapter = new PrismaMariaDb({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    password: process.env.MYSQL_PASSWORD,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 5,
  });

  prisma = new PrismaClient({ adapter });

  return !!prisma;
};

export { prisma };

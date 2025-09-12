import { PrismaClient, Prisma } from "@prisma/client";

export const prismaClientSingleton = () => {
  const log: Prisma.LogLevel[] = (process.env.NODE_ENV === "production") ? ["query", "info"] : []
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL!,
      },
    },
    log,
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

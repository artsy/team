import { PrismaClient } from "@prisma/client";

interface PrismaClientSingleton {
  _prisma: PrismaClient | null;
}

const prismaClientSingleton: PrismaClientSingleton = { _prisma: null };

export const prisma = (new Proxy(prismaClientSingleton, {
  get(target, prop: keyof PrismaClient) {
    if (!target._prisma) {
      target._prisma = new PrismaClient();
    }
    return target._prisma[prop];
  },
}) as unknown) as PrismaClient;

export const disconnect = async () => {
  if (prismaClientSingleton._prisma) {
    await prismaClientSingleton._prisma.$disconnect();
  }
};

process.on("disconnect", async () => {
  await disconnect();
});

process.on("beforeExit", async () => {
  await disconnect();
});

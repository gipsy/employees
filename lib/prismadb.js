import { PrismaClient } from '@prisma/client';

const client = global.prismadb || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prismadb = client;
console.log('NODE_ENV:',process.env.NODE_ENV)
// global.prismadb = client;

export default client;

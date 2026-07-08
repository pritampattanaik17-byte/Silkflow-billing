import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.invoice.findMany({
    select: { id: true, invoiceNumber: true, customerName: true, status: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('=== INVOICES IN DATABASE ===');
  console.log(JSON.stringify(invoices, null, 2));
  console.log(`Total count: ${invoices.length}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

import { prisma } from '../config/prisma';

export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;

  // Find latest challan for current year
  const latestChallan = await prisma.challan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let nextSequence = 1;
  if (latestChallan) {
    const parts = latestChallan.challanNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSequence}`;
}

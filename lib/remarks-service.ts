import { prisma } from "@/lib/prisma";

export type TicketRemark = {
  remarkId: number;
  ticketId: string;
  remarkType: string;
  statusChangedTo: string | null;
  updatedBy: string;
  createdDate: string;
};

function mapRemark(remark: any): TicketRemark {
  return {
    remarkId: remark.id,
    ticketId: remark.ticketId,
    remarkType: remark.remarkType,
    statusChangedTo: remark.statusChangedTo,
    updatedBy: remark.updatedById,
    createdDate: remark.createdAt.toISOString(),
  };
}

export async function getRemarks(): Promise<TicketRemark[]> {
  const remarks = await prisma.ticketRemark.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return remarks.map(mapRemark);
}

export async function getRemarkById(
  remarkId: number,
): Promise<TicketRemark | undefined> {
  const remark = await prisma.ticketRemark.findUnique({
    where: {
      id: remarkId,
    },
  });

  return remark ? mapRemark(remark) : undefined;
}

export async function getRemarksByTicketId(
  ticketId: string,
): Promise<TicketRemark[]> {
  const remarks = await prisma.ticketRemark.findMany({
    where: {
      ticketId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return remarks.map(mapRemark);
}

export async function getRemarksByUpdatedBy(
  updatedBy: string,
): Promise<TicketRemark[]> {
  const remarks = await prisma.ticketRemark.findMany({
    where: {
      updatedById: updatedBy,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return remarks.map(mapRemark);
}

export async function getRemarksByStatus(
  status: string,
): Promise<TicketRemark[]> {
  const remarks = await prisma.ticketRemark.findMany({
    where: {
      statusChangedTo: {
        equals: status,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return remarks.map(mapRemark);
}

export async function createRemark(data: {
  ticketId: string;
  remarkType: string;
  statusChangedTo?: string | null;
  updatedById: string;
}): Promise<TicketRemark> {
  const remark = await prisma.ticketRemark.create({
    data: {
      ticketId: data.ticketId,
      remarkType: data.remarkType,
      statusChangedTo: data.statusChangedTo ?? null,
      updatedById: data.updatedById,
      createdAt: new Date(),
    },
  });

  return mapRemark(remark);
}

export async function updateRemark(
  remarkId: number,
  updates: Partial<{
    remarkType: string;
    statusChangedTo: string | null;
    updatedById: string;
  }>,
): Promise<TicketRemark | null> {
  try {
    const remark = await prisma.ticketRemark.update({
      where: {
        id: remarkId,
      },
      data: {
        ...(updates.remarkType !== undefined && {
          remarkType: updates.remarkType,
        }),
        ...(updates.statusChangedTo !== undefined && {
          statusChangedTo: updates.statusChangedTo,
        }),
        ...(updates.updatedById !== undefined && {
          updatedById: updates.updatedById,
        }),
      },
    });

    return mapRemark(remark);
  } catch (error: any) {
    if (error.code === "P2025") {
      return null;
    }

    throw error;
  }
}

export async function deleteRemark(remarkId: number): Promise<boolean> {
  try {
    await prisma.ticketRemark.delete({
      where: {
        id: remarkId,
      },
    });

    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      return false;
    }

    throw error;
  }
}

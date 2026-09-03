import "server-only";
import { prisma } from "@/lib/prisma";

export interface ReportScheduler {
  id: string;
  email: string;
  report: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  day: number;
  time: string;
  active: boolean;
  createdDate: string;
}

function mapScheduler(scheduler: any): ReportScheduler {
  return {
    id: scheduler.id,
    email: scheduler.email,
    report: scheduler.report,
    frequency: scheduler.frequency,
    day: scheduler.day ?? 1,
    time: scheduler.time,
    active: scheduler.active,
    createdDate: scheduler.createdAt.toISOString().split("T")[0],
  };
}

async function generateSchedulerId(): Promise<string> {
  const schedulers = await prisma.reportScheduler.findMany({
    select: {
      id: true,
    },
  });

  let highest = 0;

  for (const scheduler of schedulers) {
    const match = scheduler.id.match(/^SCH(\d+)$/);

    if (match) {
      const number = Number(match[1]);

      if (number > highest) {
        highest = number;
      }
    }
  }

  return `SCH${String(highest + 1).padStart(3, "0")}`;
}

export async function getSchedulers(): Promise<ReportScheduler[]> {
  const schedulers = await prisma.reportScheduler.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return schedulers.map(mapScheduler);
}

export async function createScheduler(
  scheduler: Omit<ReportScheduler, "id" | "createdDate">,
): Promise<ReportScheduler> {
  const created = await prisma.reportScheduler.create({
    data: {
      id: await generateSchedulerId(),
      email: scheduler.email,
      report: scheduler.report,
      frequency: scheduler.frequency,
      day: scheduler.day,
      time: scheduler.time,
      active: scheduler.active,
    },
  });

  return mapScheduler(created);
}

export async function updateScheduler(
  updated: ReportScheduler,
): Promise<ReportScheduler> {
  const existing = await prisma.reportScheduler.findUnique({
    where: {
      id: updated.id,
    },
  });

  if (!existing) {
    throw new Error("Scheduler not found");
  }

  const scheduler = await prisma.reportScheduler.update({
    where: {
      id: updated.id,
    },
    data: {
      email: updated.email,
      report: updated.report,
      frequency: updated.frequency,
      day: updated.day,
      time: updated.time,
      active: updated.active,
    },
  });

  return mapScheduler(scheduler);
}

export async function deleteScheduler(id: string) {
  const existing = await prisma.reportScheduler.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Scheduler not found");
  }

  await prisma.reportScheduler.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
  };
}

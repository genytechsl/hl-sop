import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "report-schedulers.json");

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

function readSchedulers(): ReportScheduler[] {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function saveSchedulers(data: ReportScheduler[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateSchedulerId(schedulers: ReportScheduler[]) {
  const next = schedulers.length + 1;
  return `SCH${String(next).padStart(3, "0")}`;
}

export async function getSchedulers() {
  return readSchedulers();
}

export async function createScheduler(
  scheduler: Omit<ReportScheduler, "id" | "createdDate">,
) {
  const schedulers = readSchedulers();
  const newScheduler: ReportScheduler = {
    id: generateSchedulerId(schedulers),
    ...scheduler,
    createdDate: new Date().toISOString().split("T")[0],
  };

  schedulers.push(newScheduler);
  saveSchedulers(schedulers);
  return newScheduler;
}

export async function updateScheduler(updated: ReportScheduler) {
  const schedulers = readSchedulers();
  const index = schedulers.findIndex((s) => s.id === updated.id);
  if (index === -1) {
    throw new Error("Scheduler not found");
  }
  schedulers[index] = updated;
  saveSchedulers(schedulers);

  return updated;
}

export async function deleteScheduler(id: string) {
  const schedulers = readSchedulers();
  const filtered = schedulers.filter((s) => s.id !== id);
  saveSchedulers(filtered);

  return {
    success: true,
  };
}

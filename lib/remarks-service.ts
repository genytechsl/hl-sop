import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "ticket-remarks.json");

export type TicketRemark = {
  remarkId: number;
  ticketId: string;
  remarkType: string;
  statusChangedTo: string;
  updatedBy: string;
  createdDate: string;
};

export async function getRemarks(): Promise<TicketRemark[]> {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");

    const remarks = JSON.parse(fileContents);

    return Array.isArray(remarks) ? remarks : [];
  } catch (error) {
    console.error("Error reading ticket-remarks.json:", error);

    return [];
  }
}

/**
 * Get a single remark by its ID
 */
export async function getRemarkById(
  remarkId: number,
): Promise<TicketRemark | undefined> {
  const remarks = await getRemarks();

  return remarks.find((remark) => remark.remarkId === remarkId);
}

/**
 * Get all remarks belonging to a ticket
 */
export async function getRemarksByTicketId(
  ticketId: string,
): Promise<TicketRemark[]> {
  const remarks = await getRemarks();

  return remarks
    .filter((remark) => remark.ticketId === ticketId)
    .sort(
      (a, b) =>
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    );
}

/**
 * Get all remarks made by an employee
 */
export async function getRemarksByUpdatedBy(
  updatedBy: string,
): Promise<TicketRemark[]> {
  const remarks = await getRemarks();

  return remarks.filter((remark) => remark.updatedBy === updatedBy);
}

/**
 * Get remarks by status
 */
export async function getRemarksByStatus(
  status: string,
): Promise<TicketRemark[]> {
  const remarks = await getRemarks();

  return remarks.filter(
    (remark) => remark.statusChangedTo.toLowerCase() === status.toLowerCase(),
  );
}

/**
 * Create a new remark
 */
export async function createRemark(
  remark: TicketRemark,
): Promise<TicketRemark> {
  const remarks = await getRemarks();

  remarks.push(remark);

  fs.writeFileSync(filePath, JSON.stringify(remarks, null, 2), "utf8");

  return remark;
}

/**
 * Update an existing remark
 */
export async function updateRemark(
  remarkId: number,
  updates: Partial<TicketRemark>,
): Promise<TicketRemark | null> {
  const remarks = await getRemarks();

  const index = remarks.findIndex((r) => r.remarkId === remarkId);

  if (index === -1) {
    return null;
  }

  remarks[index] = {
    ...remarks[index],
    ...updates,
  };

  fs.writeFileSync(filePath, JSON.stringify(remarks, null, 2), "utf8");

  return remarks[index];
}

/**
 * Delete a remark
 */
export async function deleteRemark(remarkId: number): Promise<boolean> {
  const remarks = await getRemarks();

  const filtered = remarks.filter((r) => r.remarkId !== remarkId);

  if (filtered.length === remarks.length) {
    return false;
  }

  fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf8");

  return true;
}

/**
 * Generate the next remark ID
 */
export async function getNextRemarkId(): Promise<number> {
  const remarks = await getRemarks();

  if (remarks.length === 0) {
    return 0;
  }

  return Math.max(...remarks.map((r) => r.remarkId)) + 1;
}

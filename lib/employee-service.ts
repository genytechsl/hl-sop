import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type Employee = {
  id: string;
  name: string;
  designation: string;
  email: string;
  active: boolean;
  role: string;
  username: string;
  passwordHash: string;
  department?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Get all employees
 */
export async function getEmployees(): Promise<Employee[]> {
  return prisma.employee.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(
  id: string,
): Promise<Employee | undefined> {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  return employee ?? undefined;
}

/**
 * Get employee by username
 * Used for login
 */
export async function getEmployeeByUsername(
  username: string,
): Promise<Employee | undefined> {
  const employee = await prisma.employee.findUnique({
    where: {
      username,
    },
  });

  return employee ?? undefined;
}

/**
 * Get employee by email
 */
export async function getEmployeeByEmail(
  email: string,
): Promise<Employee | undefined> {
  const employee = await prisma.employee.findUnique({
    where: {
      email,
    },
  });

  return employee ?? undefined;
}

/**
 * Get employees by role
 */
export async function getEmployeesByRole(role: string): Promise<Employee[]> {
  return prisma.employee.findMany({
    where: {
      role,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Get only active employees
 */
export async function getActiveEmployees(): Promise<Employee[]> {
  return prisma.employee.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Get employees by designation
 */
export async function getEmployeesByDesignation(
  designation: string,
): Promise<Employee[]> {
  return prisma.employee.findMany({
    where: {
      designation,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Create employee
 */
export async function createEmployee(employee: Employee): Promise<Employee> {
  const existingEmployee = await prisma.employee.findUnique({
    where: {
      id: employee.id,
    },
  });

  if (existingEmployee) {
    throw new Error("Employee already exists");
  }

  const existingUsername = await prisma.employee.findUnique({
    where: {
      username: employee.username,
    },
  });

  if (existingUsername) {
    throw new Error("Username already exists");
  }

  return prisma.employee.create({
    data: {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      email: employee.email,
      active: employee.active,
      role: employee.role,
      username: employee.username,
      passwordHash: employee.passwordHash,
      department: employee.department,
    },
  });
}

/**
 * Update employee
 */
export async function updateEmployee(
  id: string,
  data: Partial<Employee>,
): Promise<Employee | null> {
  const existingEmployee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  if (!existingEmployee) {
    return null;
  }

  return prisma.employee.update({
    where: {
      id,
    },
    data,
  });
}

/**
 * Activate / deactivate employee
 */
export async function updateEmployeeStatus(id: string, active: boolean) {
  return updateEmployee(id, {
    active,
  });
}

/**
 * Update employee role
 */
export async function updateEmployeeRole(id: string, role: string) {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return prisma.employee.update({
    where: {
      id,
    },
    data: {
      role,
    },
  });
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  if (!employee) {
    return false;
  }

  await prisma.employee.delete({
    where: {
      id,
    },
  });

  return true;
}

/**
 * Login validation
 *
 * Compares the supplied password against
 * the stored bcrypt password hash.
 */
export async function validateEmployeeLogin(
  username: string,
  password: string,
): Promise<Employee | null> {
  const employee = await getEmployeeByUsername(username);

  if (!employee) {
    return null;
  }

  if (!employee.active) {
    return null;
  }

  const passwordValid = await bcrypt.compare(password, employee.passwordHash);

  if (!passwordValid) {
    return null;
  }

  return employee;
}

/**
 * Check whether a username already exists
 */
export async function usernameExists(username: string): Promise<boolean> {
  const employee = await prisma.employee.findUnique({
    where: {
      username,
    },
  });

  return !!employee;
}

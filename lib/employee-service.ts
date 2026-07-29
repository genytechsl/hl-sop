import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "employees.json");

export type Employee = {
  id: string;
  name: string;
  designation: string;
  email: string;
  active: boolean;
  role: string;
  username: string;
  security: string;
  department: string;
};

/**
 * Get all employees
 */
export async function getEmployees(): Promise<Employee[]> {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");

    const employees = JSON.parse(fileContents);

    return Array.isArray(employees) ? employees : [];
  } catch (error) {
    console.error("Error reading employees.json:", error);

    return [];
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(
  id: string,
): Promise<Employee | undefined> {
  const employees = await getEmployees();

  return employees.find((employee) => employee.id === id);
}

/**
 * Get employee by username
 * Used for login
 */
export async function getEmployeeByUsername(
  username: string,
): Promise<Employee | undefined> {
  const employees = await getEmployees();

  return employees.find((employee) => employee.username === username);
}

/**
 * Get employee by email
 */
export async function getEmployeeByEmail(
  email: string,
): Promise<Employee | undefined> {
  const employees = await getEmployees();

  return employees.find((employee) => employee.email === email);
}

/**
 * Get employees by role
 *
 * Example:
 * actionOwner
 * admin
 * cmuManager
 * dataEntry
 */
export async function getEmployeesByRole(role: string): Promise<Employee[]> {
  const employees = await getEmployees();

  return employees.filter((employee) => employee.role === role);
}

/**
 * Get only active employees
 */
export async function getActiveEmployees(): Promise<Employee[]> {
  const employees = await getEmployees();

  return employees.filter((employee) => employee.active === true);
}

/**
 * Get employees by designation
 *
 * Example:
 * MEP Engineer
 * Supervisor
 */
export async function getEmployeesByDesignation(
  designation: string,
): Promise<Employee[]> {
  const employees = await getEmployees();

  return employees.filter((employee) => employee.designation === designation);
}

/**
 * Create employee
 */
export async function createEmployee(employee: Employee): Promise<Employee> {
  try {
    const employees = await getEmployees();

    const exists_user = employees.some((item) => item.id === employee.id);

    const exists_user_name = employees.some(
      (item) => item.username === employee.username,
    );

    if (exists_user) {
      throw new Error("Employee already exists");
    }
    if (exists_user_name) {
      throw new Error("Username already exists");
    }

    employees.push(employee);

    fs.writeFileSync(filePath, JSON.stringify(employees, null, 2), "utf8");

    return employee;
  } catch (error) {
    console.error("Create employee error:", error);

    throw error;
  }
}

/**
 * Update employee
 */
export async function updateEmployee(
  id: string,
  data: Partial<Employee>,
): Promise<Employee | null> {
  const employees = await getEmployees();

  const index = employees.findIndex((employee) => employee.id === id);

  if (index === -1) {
    return null;
  }

  employees[index] = {
    ...employees[index],
    ...data,
  };

  fs.writeFileSync(filePath, JSON.stringify(employees, null, 2), "utf8");

  return employees[index];
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
 * update Employee Role
 */
export async function updateEmployeeRole(id: string, role: string) {
  const employees = await getEmployees();

  const employeeIndex = employees.findIndex((employee) => employee.id === id);

  if (employeeIndex === -1) {
    throw new Error("Employee not found");
  }

  employees[employeeIndex] = {
    ...employees[employeeIndex],
    role,
  };

  fs.writeFileSync(filePath, JSON.stringify(employees, null, 2), "utf8");

  return employees[employeeIndex];
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await getEmployees();

  const filtered = employees.filter((employee) => employee.id !== id);

  if (filtered.length === employees.length) {
    return false;
  }

  fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf8");

  return true;
}

/**
 * Login validation
 */
export async function validateEmployeeLogin(
  username: string,
  security: string,
): Promise<Employee | null> {
  const employee = await getEmployeeByUsername(username);

  if (!employee) {
    return null;
  }

  if (employee.security !== security) {
    return null;
  }

  if (!employee.active) {
    return null;
  }

  return employee;
}

import fs from "fs";
import path from "path";

import { Customer } from "@/types/customer";

const filePath = path.join(process.cwd(), "data", "customers.json");

export async function getCustomers(): Promise<Customer[]> {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");

    const customers = JSON.parse(fileContents);

    return Array.isArray(customers) ? customers : [];
  } catch (error) {
    console.error("Error reading customers.json:", error);

    return [];
  }
}

export async function getCustomerById(
  id: string,
): Promise<Customer | undefined> {
  const customers = await getCustomers();

  return customers.find((customer) => customer.id === id);
}

export async function searchCustomers(keyword: string): Promise<Customer[]> {
  const customers = await getCustomers();

  const search = keyword.toLowerCase();

  return customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search) ||
      customer.NIC.toLowerCase().includes(search) ||
      customer.email.some((email) => email.toLowerCase().includes(search)) ||
      customer.mobile.some((mobile) => mobile.includes(search)),
  );
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  try {
    const customers = await getCustomers();

    customers.push(customer);

    fs.writeFileSync(filePath, JSON.stringify(customers, null, 2), "utf8");

    return customer;
  } catch (error) {
    console.error("Error writing customer:", error);

    throw error;
  }
}

export async function generateCustomerId(): Promise<string> {
  const customers = await getCustomers();

  const lastCustomerNumber = customers.reduce((max, customer) => {
    const number = Number(customer.id.replace("CUS-", ""));

    return number > max ? number : max;
  }, 0);

  return `CUS-${String(lastCustomerNumber + 1).padStart(6, "0")}`;
}

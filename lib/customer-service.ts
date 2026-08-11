import { prisma } from "@/lib/prisma";
import { Customer } from "@/types/customer";

function mapCustomer(customer: any): Customer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    mobile: customer.mobile,
    NIC: customer.nic,
    active: customer.active,
    createdDate: customer.createdAt.toISOString().split("T")[0],
    properties: customer.properties.map((property: any) => ({
      propertyName: property.propertyName,
      address: property.address,
    })),
    receiveEmail: false,
    receiveSMS: false,
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const customers = await prisma.customer.findMany({
    include: {
      properties: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return customers.map(mapCustomer);
}

export async function getCustomerById(
  id: string,
): Promise<Customer | undefined> {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      properties: true,
    },
  });

  if (!customer) {
    return undefined;
  }

  return mapCustomer(customer);
}

export async function searchCustomers(keyword: string): Promise<Customer[]> {
  const search = keyword.trim();

  if (!search) {
    return getCustomers();
  }

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          nic: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          mobile: {
            contains: search,
          },
        },
      ],
    },
    include: {
      properties: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return customers.map(mapCustomer);
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id: customer.id,
    },
  });

  if (existingCustomer) {
    throw new Error("Customer already exists");
  }

  const existingNic = await prisma.customer.findFirst({
    where: {
      nic: customer.NIC,
    },
  });

  if (existingNic) {
    throw new Error("Existing account found under this NIC");
  }

  const createdCustomer = await prisma.customer.create({
    data: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      nic: customer.NIC,
      active: customer.active,
      properties: {
        create: customer.properties.map((property) => ({
          propertyName: property.propertyName,
          address: property.address,
        })),
      },
    },
    include: {
      properties: true,
    },
  });

  return mapCustomer(createdCustomer);
}

export async function generateCustomerId(): Promise<string> {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  if (!lastCustomer) {
    return "CUS-000001";
  }

  const lastNumber = Number(lastCustomer.id.replace("CUS-", ""));

  return `CUS-${String(lastNumber + 1).padStart(6, "0")}`;
}

export async function updateCustomer(
  updatedCustomer: Customer,
): Promise<Customer> {
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id: updatedCustomer.id,
    },
  });

  if (!existingCustomer) {
    throw new Error("Customer not found");
  }

  const duplicateNic = await prisma.customer.findFirst({
    where: {
      nic: updatedCustomer.NIC,
      NOT: {
        id: updatedCustomer.id,
      },
    },
  });

  if (duplicateNic) {
    throw new Error("Existing account found under this NIC");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.customerProperty.deleteMany({
      where: {
        customerId: updatedCustomer.id,
      },
    });

    return tx.customer.update({
      where: {
        id: updatedCustomer.id,
      },
      data: {
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        mobile: updatedCustomer.mobile,
        nic: updatedCustomer.NIC,
        active: updatedCustomer.active,
        properties: {
          create: updatedCustomer.properties.map((property) => ({
            propertyName: property.propertyName,
            address: property.address,
          })),
        },
      },
      include: {
        properties: true,
      },
    });
  });

  return mapCustomer(updated);
}

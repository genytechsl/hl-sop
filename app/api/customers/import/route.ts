import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { generateCustomerId } from "@/lib/customer-service";

interface ImportResult {
  row: number;
  success: boolean;
  customerId?: string;
  customerName?: string;
  properties?: number;
  error?: string;
}

function normalizeHeader(header: string): string {
  return header.toString().trim().toLowerCase().replace(/\s+/g, " ");
}

function getCellValue(row: Record<string, unknown>, header: string): string {
  const value = row[header];

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "Please upload an Excel file.",
        },
        {
          status: 400,
        },
      );
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        {
          message: "Only .xlsx and .xls files are supported.",
        },
        {
          status: 400,
        },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        {
          message: "The Excel file does not contain a worksheet.",
        },
        {
          status: 400,
        },
      );
    }

    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: "",
      },
    );

    if (rawRows.length === 0) {
      return NextResponse.json(
        {
          message: "The Excel file does not contain any customer records.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Normalize column names.
     *
     * Example:
     * "Customer Name" -> "customer name"
     * "Property 1 Name" -> "property 1 name"
     */
    const rows = rawRows.map((row) => {
      const normalized: Record<string, unknown> = {};

      Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeHeader(key)] = value;
      });

      return normalized;
    });

    const results: ImportResult[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      const excelRowNumber = index + 2;

      try {
        const name = getCellValue(row, "customer name");
        const nic = getCellValue(row, "nic");
        const email = getCellValue(row, "email");
        const mobile = getCellValue(row, "mobile");

        /*
         * Basic validation
         */
        if (!name) {
          throw new Error("Customer name is required.");
        }

        if (!nic) {
          throw new Error("NIC is required.");
        }

        if (!email) {
          throw new Error("Email is required.");
        }

        if (!mobile) {
          throw new Error("Mobile number is required.");
        }

        /*
         * Find all property columns dynamically.
         *
         * This means the API can handle:
         *
         * Property 1 Name
         * Property 1 Address
         * Property 2 Name
         * Property 2 Address
         * ...
         */
        const propertyNumbers = new Set<number>();

        Object.keys(row).forEach((key) => {
          const match = key.match(/^property\s+(\d+)\s+(name|address)$/i);

          if (match) {
            propertyNumbers.add(Number(match[1]));
          }
        });

        const properties: {
          propertyName: string;
          address: string;
        }[] = [];

        for (const propertyNumber of Array.from(propertyNumbers).sort(
          (a, b) => a - b,
        )) {
          const propertyName = getCellValue(
            row,
            `property ${propertyNumber} name`,
          );

          const address = getCellValue(
            row,
            `property ${propertyNumber} address`,
          );

          /*
           * If both are empty, simply ignore the property.
           */
          if (!propertyName && !address) {
            continue;
          }

          /*
           * Don't allow incomplete property records.
           */
          if (!propertyName || !address) {
            throw new Error(
              `Property ${propertyNumber} must have both name and address.`,
            );
          }

          properties.push({
            propertyName,
            address,
          });
        }

        if (properties.length === 0) {
          throw new Error("At least one property is required.");
        }

        /*
         * Check whether NIC already exists.
         */
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            nic,
          },
        });

        if (existingCustomer) {
          throw new Error(`A customer with NIC ${nic} already exists.`);
        }

        /*
         * Generate the customer ID.
         */
        const customerId = await generateCustomerId();

        /*
         * Create customer + properties atomically.
         */
        await prisma.$transaction(async (tx) => {
          await tx.customer.create({
            data: {
              id: customerId,
              name,
              email,
              mobile,
              nic,
              active: true,

              properties: {
                create: properties.map((property) => ({
                  propertyName: property.propertyName,
                  address: property.address,
                })),
              },
            },
          });
        });

        results.push({
          row: excelRowNumber,
          success: true,
          customerId,
          customerName: name,
          properties: properties.length,
        });
      } catch (error: any) {
        results.push({
          row: excelRowNumber,
          success: false,
          error: error.message || "Failed to import customer.",
        });
      }
    }

    const successful = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    return NextResponse.json({
      success: failed.length === 0,
      total: results.length,
      imported: successful.length,
      failed: failed.length,
      results,
    });
  } catch (error: any) {
    console.error("POST /api/customers/import error:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to import customers.",
      },
      {
        status: 500,
      },
    );
  }
}

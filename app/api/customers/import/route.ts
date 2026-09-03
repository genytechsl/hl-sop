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

function parseArrayCell(value: string): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeOtherEmails(
  values: string[],
  primaryEmail: string,
): string[] {
  const primary = primaryEmail.trim().toLowerCase();
  const seen = new Set<string>();

  return values.filter((email) => {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      return false;
    }

    if (normalized === primary) {
      return false;
    }

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}

function normalizeOtherMobiles(
  values: string[],
  primaryMobile: string,
): string[] {
  const primary = primaryMobile.trim();

  return Array.from(
    new Set(
      values
        .map((mobile) => mobile.trim())
        .filter((mobile) => mobile && mobile !== primary),
    ),
  );
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

    /*
     * Ignore Column A completely.
     *
     * Actual customer table:
     *
     * B = Customer Name
     * C = NIC
     * D = email
     * E = other emails
     * F = Mobile
     * G = Other Telephone
     * H onward = Property columns
     */
    const worksheetRange = XLSX.utils.decode_range(
      worksheet["!ref"] || "A1:A1",
    );

    worksheetRange.s.c = 1;

    const importRange = XLSX.utils.encode_range(worksheetRange);

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: "",
        range: importRange,
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
        const otherEmailsRaw = getCellValue(row, "other emails");
        const mobile = getCellValue(row, "mobile");
        const otherTelephoneRaw = getCellValue(row, "other telephone");

        const otherEmails = normalizeOtherEmails(
          parseArrayCell(otherEmailsRaw),
          email,
        );

        const otherMobiles = normalizeOtherMobiles(
          parseArrayCell(otherTelephoneRaw),
          mobile,
        );

        if (!name) {
          throw new Error("Customer name is required.");
        }

        if (!nic) {
          throw new Error("NIC is required.");
        }

        // if (!email) {
        //   throw new Error("Email is required.");
        // }

        // if (!mobile) {
        //   throw new Error("Mobile number is required.");
        // }

        /*
         * Dynamically detect:
         *
         * Property 1 Name / Address
         * Property 2 Name / Address
         * ...
         * Property 7 Name / Address
         *
         * This also means the importer can support
         * more properties later without code changes.
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

          if (!propertyName && !address) {
            continue;
          }

          if (!propertyName) {
            throw new Error(`Property ${propertyNumber} must have a name`);
          }

          properties.push({
            propertyName,
            address,
          });
        }

        if (properties.length === 0) {
          throw new Error("At least one property is required.");
        }

        const existingCustomer = await prisma.customer.findFirst({
          where: {
            nic,
          },
        });

        if (existingCustomer) {
          throw new Error(`A customer with NIC ${nic} already exists.`);
        }

        const customerId = await generateCustomerId();

        await prisma.$transaction(async (tx) => {
          await tx.customer.create({
            data: {
              id: customerId,
              name,
              email,
              otherEmails,
              mobile,
              otherMobiles,
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

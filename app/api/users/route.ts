import { NextRequest, NextResponse } from "next/server";

import {
  getEmployees,
  getEmployeeById,
  getEmployeesByRole,
  getActiveEmployees,
  getEmployeesByDesignation,
  createEmployee,
  updateEmployeeRole,
} from "@/lib/employee-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const active = searchParams.get("active");
    const designation = searchParams.get("designation");

    /*
      GET /api/users?id=EMP04572819
    */
    if (id) {
      const user = await getEmployeeById(id);

      if (!user) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json(user);
    }

    /*
      GET /api/users?role=actionOwner
    */
    if (role) {
      const users = await getEmployeesByRole(role);

      return NextResponse.json(users);
    }

    /*
      GET /api/users?active=true
    */
    if (active === "true") {
      const users = await getActiveEmployees();

      return NextResponse.json(users);
    }

    /*
      GET /api/users?designation=MEP Engineer
    */
    if (designation) {
      const users = await getEmployeesByDesignation(designation);

      return NextResponse.json(users);
    }

    /*
      GET /api/users

      return all users
    */

    const users = await getEmployees();

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET users error:", error);

    return NextResponse.json(
      {
        message: "Failed to load users",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();

    const createdUser = await createEmployee(user);

    return NextResponse.json(createdUser, {
      status: 201,
    });
  } catch (error) {
    console.error("POST users error:", error);

    return NextResponse.json(
      {
        message: "Failed to create user",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json(
        {
          message: "Employee ID and role are required",
        },
        {
          status: 400,
        },
      );
    }

    const updatedUser = await updateEmployeeRole(id, role);

    return NextResponse.json(updatedUser, {
      status: 200,
    });
  } catch (error) {
    console.error("PUT users error:", error);

    return NextResponse.json(
      {
        message: "Failed to update user",
      },
      {
        status: 500,
      },
    );
  }
}

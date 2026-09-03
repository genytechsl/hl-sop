import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import {
  getEmployees,
  getEmployeeById,
  getEmployeesByRole,
  getActiveEmployees,
  getEmployeesByDesignation,
  createEmployee,
  updateEmployeeRole,
  usernameExists,
} from "@/lib/employee-service";

import { userRegistrationEmail } from "@/lib/employee-registration-email";
import { getSession } from "@/lib/auth/session";

/* =========================================================
   GET USERS
========================================================= */

export async function GET(request: NextRequest) {
  try {
    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * =====================================================
     * ADMIN ONLY
     * =====================================================
     *
     * User/employee information is restricted to admins.
     */

    if (sessionUser.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =====================================================
     * QUERY PARAMETERS
     * =====================================================
     */

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const active = searchParams.get("active");
    const designation = searchParams.get("designation");
    const username = searchParams.get("username");

    /*
     * =====================================================
     * GET USER BY ID
     * =====================================================
     *
     * GET /api/users?id=EMP04572819
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
     * =====================================================
     * GET USERS BY ROLE
     * =====================================================
     *
     * GET /api/users?role=actionOwner
     */

    if (role) {
      const users = await getEmployeesByRole(role);

      return NextResponse.json(users);
    }

    /*
     * =====================================================
     * GET ACTIVE USERS
     * =====================================================
     *
     * GET /api/users?active=true
     */

    if (active === "true") {
      const users = await getActiveEmployees();

      return NextResponse.json(users);
    }

    /*
     * =====================================================
     * GET USERS BY DESIGNATION
     * =====================================================
     *
     * GET /api/users?designation=MEP Engineer
     */

    if (designation) {
      const users = await getEmployeesByDesignation(designation);

      return NextResponse.json(users);
    }

    /*
     * =====================================================
     * CHECK USERNAME
     * =====================================================
     *
     * GET /api/users?username=john
     */

    if (username) {
      const exists = await usernameExists(username);

      return NextResponse.json({
        exists,
      });
    }

    /*
     * =====================================================
     * GET ALL USERS
     * =====================================================
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

/* =========================================================
   CREATE USER
========================================================= */

export async function POST(request: NextRequest) {
  try {
    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * =====================================================
     * ADMIN ONLY
     * =====================================================
     */

    if (sessionUser.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */

    const user = await request.json();

    if (
      !user.id ||
      !user.name ||
      !user.designation ||
      !user.email ||
      !user.username ||
      !user.password ||
      !user.role
    ) {
      return NextResponse.json(
        {
          message: "All required fields must be provided",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     */

    const passwordHash = await bcrypt.hash(user.password, 12);

    /*
     * =====================================================
     * CREATE EMPLOYEE
     * =====================================================
     */

    const createdUser = await createEmployee({
      id: user.id,
      name: user.name,
      designation: user.designation,
      email: user.email,
      active: user.active ?? true,
      role: user.role,
      username: user.username,
      passwordHash,
      department: user.department || null,
    });

    /*
     * =====================================================
     * SEND REGISTRATION EMAIL
     * =====================================================
     */

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: [user.email].filter(Boolean),
      subject: "Welcome To SolvY360",
      html: userRegistrationEmail({
        username: createdUser.username,
        role: createdUser.role,
      }),
    });

    /*
     * =====================================================
     * SAFE RESPONSE
     * =====================================================
     */

    const { passwordHash: _, ...safeUser } = createdUser;

    return NextResponse.json(safeUser, {
      status: 201,
    });
  } catch (error: any) {
    console.error("POST users error:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to create user!",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   UPDATE USER ROLE
========================================================= */

export async function PUT(request: NextRequest) {
  try {
    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * =====================================================
     * ADMIN ONLY
     * =====================================================
     */

    if (sessionUser.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */

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

    /*
     * =====================================================
     * UPDATE ROLE
     * =====================================================
     */

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

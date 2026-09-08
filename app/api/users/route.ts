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
   PROTECTED SYSTEM ACCOUNTS
========================================================= */

const PROTECTED_USERNAMES = ["geny_admin", "geny_admin_b"];

function isProtectedUser(username?: string | null) {
  if (!username) {
    return false;
  }

  return PROTECTED_USERNAMES.includes(username.toLowerCase());
}

function filterProtectedUsers<T extends { username?: string | null }>(
  users: T[],
  isSysAdmin: boolean,
) {
  if (isSysAdmin) {
    return users;
  }

  return users.filter((user) => !isProtectedUser(user.username));
}

/* =========================================================
   GET USERS
========================================================= */

export async function GET(request: NextRequest) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // ADMIN / SYS ADMIN ONLY
    // =====================================================

    if (sessionUser.role !== "admin" && sessionUser.role !== "sys_admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    const isSysAdmin = sessionUser.role === "sys_admin";

    // =====================================================
    // QUERY PARAMETERS
    // =====================================================

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const active = searchParams.get("active");
    const designation = searchParams.get("designation");
    const username = searchParams.get("username");

    // =====================================================
    // GET USER BY ID
    // =====================================================

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

      /*
       * Protected system accounts must not be visible
       * to a regular administrator.
       *
       * Return 404 rather than 403 so the API does not
       * disclose that the protected account exists.
       */
      if (!isSysAdmin && isProtectedUser(user.username)) {
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

    // =====================================================
    // GET USERS BY ROLE
    // =====================================================

    if (role) {
      const users = await getEmployeesByRole(role);

      return NextResponse.json(filterProtectedUsers(users, isSysAdmin));
    }

    // =====================================================
    // GET ACTIVE USERS
    // =====================================================

    if (active === "true") {
      const users = await getActiveEmployees();

      return NextResponse.json(filterProtectedUsers(users, isSysAdmin));
    }

    // =====================================================
    // GET USERS BY DESIGNATION
    // =====================================================

    if (designation) {
      const users = await getEmployeesByDesignation(designation);

      return NextResponse.json(filterProtectedUsers(users, isSysAdmin));
    }

    // =====================================================
    // CHECK USERNAME
    // =====================================================

    if (username) {
      /*
       * Do not reveal protected usernames to regular admins.
       */
      if (!isSysAdmin && isProtectedUser(username)) {
        return NextResponse.json({
          exists: false,
        });
      }

      const exists = await usernameExists(username);

      return NextResponse.json({
        exists,
      });
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

    const users = await getEmployees();

    return NextResponse.json(filterProtectedUsers(users, isSysAdmin));
  } catch (error) {
    console.error("GET /api/users error:", error);

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
    // =====================================================
    // AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // ADMIN / SYS ADMIN ONLY
    // =====================================================

    if (sessionUser.role !== "admin" && sessionUser.role !== "sys_admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

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

    // =====================================================
    // PROTECTED USERNAME SECURITY
    // =====================================================

    /*
     * A regular admin cannot create/recreate one of the
     * reserved system usernames.
     */
    if (sessionUser.role !== "sys_admin" && isProtectedUser(user.username)) {
      return NextResponse.json(
        {
          message: "This username is reserved.",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const passwordHash = await bcrypt.hash(user.password, 12);

    // =====================================================
    // CREATE EMPLOYEE
    // =====================================================

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
      mustChangePassword: true,
    });

    // =====================================================
    // SEND REGISTRATION EMAIL
    // =====================================================

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

    // =====================================================
    // SAFE RESPONSE
    // =====================================================

    const { passwordHash: _, ...safeUser } = createdUser;

    return NextResponse.json(safeUser, {
      status: 201,
    });
  } catch (error: unknown) {
    console.error("POST /api/users error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create user!",
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
    // =====================================================
    // AUTHENTICATION
    // =====================================================

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

    // =====================================================
    // ADMIN / SYS ADMIN ONLY
    // =====================================================

    if (sessionUser.role !== "admin" && sessionUser.role !== "sys_admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

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

    // =====================================================
    // FIND TARGET USER
    // =====================================================

    const targetUser = await getEmployeeById(id);

    if (!targetUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // PROTECT SYSTEM ACCOUNTS
    // =====================================================

    if (
      sessionUser.role !== "sys_admin" &&
      isProtectedUser(targetUser.username)
    ) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // UPDATE ROLE
    // =====================================================

    const updatedUser = await updateEmployeeRole(id, role);

    return NextResponse.json(updatedUser, {
      status: 200,
    });
  } catch (error) {
    console.error("PUT /api/users error:", error);

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

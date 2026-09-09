import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

/* =========================================================
   TYPES
========================================================= */

type UserRole = "admin" | "actionOwner" | "dataEntry" | "sys_admin";

type ActiveRole = "admin" | "actionOwner" | "sys_admin";

type RouteMatcher = string | RegExp;

interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  email: string;
  department?: string | null;
  mustChangePassword: boolean;
}

interface SessionPayload extends JWTPayload {
  user: SessionUser;
}

interface ApiRule {
  path: RouteMatcher;
  methods: string[];
  roles?: readonly ActiveRole[];
  public?: boolean;
}

/* =========================================================
   ROLE GROUPS
========================================================= */

const TICKET_ROLES = [
  "actionOwner",
  "admin",
  "sys_admin",
] as const satisfies readonly ActiveRole[];

const ADMIN_ROLES = [
  "admin",
  "sys_admin",
] as const satisfies readonly ActiveRole[];

const SYS_ADMIN_ROLES = [
  "sys_admin",
] as const satisfies readonly ActiveRole[];

/* =========================================================
   JWT
========================================================= */

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured");
}

const encodedSecret = new TextEncoder().encode(secret);

async function getMiddlewareSession(
  request: NextRequest,
): Promise<SessionUser | null> {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(
      token,
      encodedSecret,
      {
        algorithms: ["HS256"],
      },
    );

    return payload.user ?? null;
  } catch {
    return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function normalizePath(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function matchesPath(pathname: string, matcher: RouteMatcher) {
  if (typeof matcher === "string") {
    return pathname === matcher;
  }

  return matcher.test(pathname);
}

function matchesAnyRoute(pathname: string, routes: RouteMatcher[]) {
  return routes.some((route) => matchesPath(pathname, route));
}

function redirectToAccessDenied(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/access-denied", request.url),
  );
}

function apiUnauthorized() {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
    },
  );
}

function apiForbidden() {
  return NextResponse.json(
    {
      error: "Forbidden",
    },
    {
      status: 403,
    },
  );
}

function apiMethodNotAllowed(methods: string[]) {
  return NextResponse.json(
    {
      error: "Method not allowed",
    },
    {
      status: 405,
      headers: {
        Allow: Array.from(new Set(methods)).sort().join(", "),
      },
    },
  );
}

function getDefaultRoute(user: SessionUser) {
  switch (user.role) {
    case "actionOwner":
      return "/assigned";

    case "admin":
    case "sys_admin":
      return "/dashboard";

    /*
     * dataEntry remains a known session role but is not
     * granted privileges in the current authorization model.
     */
    default:
      return "/access-denied";
  }
}

/* =========================================================
   API AUTHORIZATION MATRIX

   This mirrors the method-level rules enforced inside the
   API route handlers. Record-level checks still belong to
   the API itself and are intentionally not duplicated here.
========================================================= */

const API_RULES: ApiRule[] = [
  /* -------------------------------------------------------
     PUBLIC / SESSION
  ------------------------------------------------------- */
  {
    path: "/api/login",
    methods: ["POST"],
    public: true,
  },
  {
    path: "/api/logout",
    methods: ["POST"],
    public: true,
  },
  {
    path: "/api/profile",
    methods: ["GET", "PUT"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/profile/password",
    methods: ["PUT"],
    roles: TICKET_ROLES,
  },

  /* -------------------------------------------------------
     CUSTOMERS
  ------------------------------------------------------- */
  {
    path: "/api/customers",
    methods: ["GET", "POST"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/customers",
    methods: ["PUT"],
    roles: ADMIN_ROLES,
  },
  {
    path: /^\/api\/customers\/[^/]+$/,
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/customers/import",
    methods: ["POST"],
    roles: ADMIN_ROLES,
  },

  /* -------------------------------------------------------
     TICKET LOOKUPS / CREATION DATA
  ------------------------------------------------------- */
  {
    path: "/api/tickets/customer-search",
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/settings/departments",
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/settings/departments",
    methods: ["POST"],
    roles: ADMIN_ROLES,
  },
  {
    path: "/api/settings/ticket-type-categories",
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/settings/ticket-type-categories",
    methods: ["POST"],
    roles: ADMIN_ROLES,
  },
  {
    path: "/api/settings/ticket-type-scopes",
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/settings/ticket-type-scopes",
    methods: ["POST"],
    roles: ADMIN_ROLES,
  },
  {
    path: "/api/users",
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/users",
    methods: ["POST", "PUT"],
    roles: ADMIN_ROLES,
  },

  /* -------------------------------------------------------
     TICKETS
  ------------------------------------------------------- */
  {
    path: "/api/tickets",
    methods: ["GET", "POST"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/tickets/reassign",
    methods: ["POST"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/tickets/send-email",
    methods: ["POST"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/tickets/update-status",
    methods: ["POST"],
    roles: TICKET_ROLES,
  },
  {
    path: /^\/api\/tickets\/[^/]+\/attachments$/,
    methods: ["GET", "POST"],
    roles: TICKET_ROLES,
  },
  {
    path: /^\/api\/tickets\/[^/]+\/attachments\/[^/]+$/,
    methods: ["GET"],
    roles: TICKET_ROLES,
  },
  {
    path: "/api/remarks",
    methods: ["GET", "POST"],
    roles: TICKET_ROLES,
  },

  /* -------------------------------------------------------
     ADMIN SETTINGS
  ------------------------------------------------------- */
  {
    path: /^\/api\/settings\/departments\/[^/]+$/,
    methods: ["GET", "PUT", "DELETE"],
    roles: ADMIN_ROLES,
  },
  {
    path: /^\/api\/settings\/ticket-type-categories\/[^/]+$/,
    methods: ["PUT", "DELETE"],
    roles: ADMIN_ROLES,
  },
  {
    path: /^\/api\/settings\/ticket-type-scopes\/[^/]+$/,
    methods: ["PUT", "DELETE"],
    roles: ADMIN_ROLES,
  },
  {
    path: "/api/settings/report-schedular",
    methods: ["GET", "POST", "PUT", "DELETE"],
    roles: ADMIN_ROLES,
  },
  {
    path: "/api/reports/executive-summary",
    methods: ["GET"],
    roles: ADMIN_ROLES,
  },
  {
    path: "/api/sla/check-breaches",
    methods: ["GET"],
    roles: ADMIN_ROLES,
  },

  /* -------------------------------------------------------
     USER ADMINISTRATION
  ------------------------------------------------------- */
  {
    path: /^\/api\/users\/[^/]+$/,
    methods: ["GET", "PUT", "DELETE"],
    roles: ADMIN_ROLES,
  },
  {
    path: /^\/api\/users\/[^/]+\/password$/,
    methods: ["PUT"],
    roles: ADMIN_ROLES,
  },

  /* -------------------------------------------------------
     SYSTEM ADMIN ONLY
  ------------------------------------------------------- */
  {
    path: "/api/settings/login-logs",
    methods: ["GET"],
    roles: SYS_ADMIN_ROLES,
  },
];

/* =========================================================
   PAGE AUTHORIZATION MATRIX
========================================================= */

const ACTION_OWNER_PAGE_ROUTES: RouteMatcher[] = [
  "/access-denied",
  "/assigned",
  "/change-password",
  "/dashboard",
  "/profile",

  /*
   * Action Owners may create a customer while creating
   * a ticket, but they do not get access to the Settings UI.
   */
  "/settings/customers/new",

  "/tickets",
  "/tickets/new",
  "/tickets/view",
];

const ADMIN_PAGE_ROUTES: RouteMatcher[] = [
  "/access-denied",
  "/assigned",
  "/change-password",
  "/dashboard",
  "/profile",
  "/reports",

  "/settings/customers",
  "/settings/customers/new",
  "/settings/customers/view",

  "/settings/report-schedular",
  "/settings/report-schedular/new",

  "/settings/types-manager",

  "/settings/user",
  "/settings/user/new",
  /^\/settings\/user\/edit\/[^/]+$/,

  "/tickets",
  "/tickets/new",
  "/tickets/view",
];

const SYS_ADMIN_ONLY_PAGE_ROUTES: RouteMatcher[] = [
  "/settings/login-logs",
];

/* =========================================================
   API AUTHORIZATION
========================================================= */

function authorizeApiRequest(
  request: NextRequest,
  pathname: string,
  user: SessionUser | null,
) {
  /*
   * Treat HEAD as GET for endpoints that expose GET.
   * This keeps health checks/browser behavior compatible
   * without weakening any write privileges.
   */
  const method = request.method === "HEAD" ? "GET" : request.method;

  const pathRules = API_RULES.filter((rule) =>
    matchesPath(pathname, rule.path),
  );

  /*
   * Fail closed. If a new API route is added later but is not
   * added to this matrix, the proxy will not expose it by
   * accident.
   */
  if (pathRules.length === 0) {
    return user ? apiForbidden() : apiUnauthorized();
  }

  const methodRules = pathRules.filter((rule) =>
    rule.methods.includes(method),
  );

  if (methodRules.length === 0) {
    return apiMethodNotAllowed(
      pathRules.flatMap((rule) => rule.methods),
    );
  }

  /* -------------------------------------------------------
     PUBLIC ROUTE/METHOD
  ------------------------------------------------------- */

  if (methodRules.some((rule) => rule.public)) {
    return NextResponse.next();
  }

  /* -------------------------------------------------------
     AUTHENTICATION
  ------------------------------------------------------- */

  if (!user) {
    return apiUnauthorized();
  }

  /* -------------------------------------------------------
     FORCED PASSWORD CHANGE

     The self-service password endpoint and logout are the
     only APIs needed while mustChangePassword is true.
     Login/logout public rules have already been handled above.
  ------------------------------------------------------- */

  if (
    user.mustChangePassword &&
    pathname !== "/api/profile/password"
  ) {
    return NextResponse.json(
      {
        error: "Password change required",
        code: "PASSWORD_CHANGE_REQUIRED",
      },
      {
        status: 403,
      },
    );
  }

  /* -------------------------------------------------------
     ROLE AUTHORIZATION
  ------------------------------------------------------- */

  const roleAllowed = methodRules.some((rule) =>
    rule.roles?.includes(user.role as ActiveRole),
  );

  if (!roleAllowed) {
    return apiForbidden();
  }

  /* -------------------------------------------------------
     ACTION OWNER: /api/users LOOKUP RESTRICTION

     Action Owners only need GET /api/users?active=true for
     the New Ticket assignment dropdown. Admin/sys_admin may
     use the full GET query surface.
  ------------------------------------------------------- */

  if (
    user.role === "actionOwner" &&
    pathname === "/api/users" &&
    method === "GET"
  ) {
    const { searchParams } = request.nextUrl;

    const active = searchParams.get("active");
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const designation = searchParams.get("designation");
    const username = searchParams.get("username");

    if (
      active !== "true" ||
      id !== null ||
      role !== null ||
      designation !== null ||
      username !== null
    ) {
      return apiForbidden();
    }
  }

  return NextResponse.next();
}

/* =========================================================
   PROXY
========================================================= */

export async function proxy(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);

  /* -------------------------------------------------------
     NEXT INTERNAL FILES
  ------------------------------------------------------- */

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const user = await getMiddlewareSession(request);

  /* =======================================================
     API ROUTES
  ======================================================= */

  if (pathname.startsWith("/api")) {
    return authorizeApiRequest(request, pathname, user);
  }

  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  if (pathname === "/") {
    if (!user) {
      return NextResponse.next();
    }

    if (user.mustChangePassword) {
      return NextResponse.redirect(
        new URL("/change-password", request.url),
      );
    }

    return NextResponse.redirect(
      new URL(getDefaultRoute(user), request.url),
    );
  }

  /* =======================================================
     AUTHENTICATION REQUIRED FOR APPLICATION PAGES
  ======================================================= */

  if (!user) {
    return NextResponse.redirect(
      new URL("/", request.url),
    );
  }

  /* =======================================================
     CHANGE PASSWORD PAGE
  ======================================================= */

  if (pathname === "/change-password") {
    if (user.mustChangePassword) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(getDefaultRoute(user), request.url),
    );
  }

  /* =======================================================
     FORCE PASSWORD CHANGE
  ======================================================= */

  if (user.mustChangePassword) {
    return NextResponse.redirect(
      new URL("/change-password", request.url),
    );
  }

  /* =======================================================
     ACCESS DENIED

     Always reachable by authenticated users so a denied
     request cannot create a redirect loop.
  ======================================================= */

  if (pathname === "/access-denied") {
    return NextResponse.next();
  }

  /* =======================================================
     SYSTEM ADMIN
  ======================================================= */

  if (user.role === "sys_admin") {
    if (
      matchesAnyRoute(pathname, ADMIN_PAGE_ROUTES) ||
      matchesAnyRoute(pathname, SYS_ADMIN_ONLY_PAGE_ROUTES)
    ) {
      return NextResponse.next();
    }

    return redirectToAccessDenied(request);
  }

  /* =======================================================
     ADMIN
  ======================================================= */

  if (user.role === "admin") {
    if (matchesAnyRoute(pathname, SYS_ADMIN_ONLY_PAGE_ROUTES)) {
      return redirectToAccessDenied(request);
    }

    if (matchesAnyRoute(pathname, ADMIN_PAGE_ROUTES)) {
      return NextResponse.next();
    }

    return redirectToAccessDenied(request);
  }

  /* =======================================================
     ACTION OWNER
  ======================================================= */

  if (user.role === "actionOwner") {
    if (matchesAnyRoute(pathname, ACTION_OWNER_PAGE_ROUTES)) {
      return NextResponse.next();
    }

    return redirectToAccessDenied(request);
  }

  /* =======================================================
     DATA ENTRY / UNKNOWN ROLE
  ======================================================= */

  return redirectToAccessDenied(request);
}

/* =========================================================
   MATCHER
========================================================= */

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};

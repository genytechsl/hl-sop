import { NextRequest, NextResponse } from "next/server";

import {
  getSchedulers,
  createScheduler,
  updateScheduler,
  deleteScheduler,
} from "@/lib/scheduler-service";

export async function GET() {
  try {
    const schedules = await getSchedulers();

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load schedules",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.report || !body.frequency || !body.time) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    const scheduler = await createScheduler({
      email: body.email,
      report: body.report,
      frequency: body.frequency,
      day: body.day ?? 1,
      time: body.time,
      active: body.active ?? true,
    });

    return NextResponse.json(scheduler, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to create scheduler",
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

    const scheduler = await updateScheduler(body);

    return NextResponse.json(scheduler);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update scheduler",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "Scheduler ID required",
        },
        {
          status: 400,
        },
      );
    }

    const result = await deleteScheduler(id);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete scheduler",
      },
      {
        status: 500,
      },
    );
  }
}

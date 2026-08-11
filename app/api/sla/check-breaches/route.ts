import { NextResponse } from "next/server";
import { getEmployeeById } from "@/lib/employee-service";
import { getTickets, updateTicket } from "@/lib/ticket-service";
import { sendEmail } from "@/lib/mailer";
import { slaWarningEmail } from "@/lib/sla-warning-email";

function getHoursFromSla(sla: string) {
  const value = parseInt(sla);

  if (sla.includes("wd")) return value * 24 * 5;

  if (sla.includes("d")) return value * 24;

  return value;
}

export async function GET() {
  try {
    const tickets = await getTickets();

    const now = new Date();

    let checked = 0;
    let emailsSent = 0;

    for (const ticket of tickets) {
      checked++;

      //----------------------------------------
      // Ignore completed tickets
      //----------------------------------------

      if (ticket.status === "CLOSED") continue;

      //----------------------------------------
      // Already notified?
      //----------------------------------------

      // if (ticket.warning80Sent) continue;

      //----------------------------------------
      // Calculate age
      //----------------------------------------

      const created = new Date(ticket.createdAt.replace(" ", "T"));

      const elapsedHours =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60);

      //----------------------------------------
      // SLA
      //----------------------------------------

      const slaHours = getHoursFromSla(ticket.slaTarget);

      const threshold = slaHours * 0.8;

      //----------------------------------------
      // Reached 80%?
      //----------------------------------------

      if (elapsedHours < threshold) continue;

      //----------------------------------------
      // Send Email
      //----------------------------------------
      const employee = await getEmployeeById(ticket.assignedToId);

      if (!employee) {
        console.log(`Employee ${ticket.assignedToId} not found.`);

        continue;
      }
      const html = slaWarningEmail({
        ticketNumber: ticket.id,
        // customerName: ticket.customerName,
        // property: ticket.property.propertyName,
        // priority: ticket.priority,
        // sla: ticket.slaTarget,
        // actionOwner: ticket.actionOwnerName,
        employeeName: employee.name,
      });

      await sendEmail({
        to: employee.email,
        subject: `SLA Warning - ${ticket.id}`,
        html,
      });

      //----------------------------------------
      // Update ticket
      //----------------------------------------

      // ticket.warning80Sent = true;
      // ticket.warning80SentAt = new Date().toISOString();

      await updateTicket(ticket);

      emailsSent++;
    }

    return NextResponse.json({
      success: true,
      checked,
      emailsSent,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check SLA breaches",
      },
      {
        status: 500,
      },
    );
  }
}

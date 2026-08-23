import { NextResponse } from "next/server";
import { getEmployeeById } from "@/lib/employee-service";
import { getTickets, updateTicket } from "@/lib/ticket-service";
import { sendEmail } from "@/lib/mailer";
import { slaWarningEmail } from "@/lib/sla-warning-email";
import { getSlaDueDate, getSlaPercent } from "@/lib/sla";

export async function GET() {
  try {
    const tickets = await getTickets();

    let checked = 0;
    let emailsSent = 0;

    for (const ticket of tickets) {
      checked++;

      //----------------------------------------
      // Ignore completed tickets
      //----------------------------------------

      if (ticket.status === "CLOSED") continue;

      //----------------------------------------
      // Calculate SLA progress
      //----------------------------------------

      const progressPercentage = getSlaPercent(
        ticket.createdAt,
        ticket.slaTarget,
      );

      //----------------------------------------
      // Reached 80%?
      //----------------------------------------

      if (progressPercentage < 80) continue;

      //----------------------------------------
      // Calculate actual SLA due date
      //----------------------------------------

      const dueDate = getSlaDueDate(ticket.createdAt, ticket.slaTarget);

      console.log(
        `SLA warning: ${ticket.id} - ${progressPercentage}% - Due: ${dueDate.toISOString()}`,
      );

      //----------------------------------------
      // Get assigned employee
      //----------------------------------------

      const employee = await getEmployeeById(ticket.assignedToId);

      if (!employee) {
        console.log(`Employee ${ticket.assignedToId} not found.`);
        continue;
      }

      //----------------------------------------
      // Send Email
      //----------------------------------------

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

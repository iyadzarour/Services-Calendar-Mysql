import cron from "node-cron";
import { getService } from "./clients";

export default function reminderJob() {
  cron.schedule("0 0 * * *", async () => {
    try {
      const appointments =
        await getService().appointmentService.getDueReminderAppointments();
      appointments.forEach((appointment) => {
        sendReminderEmail(appointment);
      });
    } catch (error) {}
  });
}

function sendReminderEmail(appointment: any) {
  const formattedStartDate = (
    appointment.start_date || new Date(appointment.imported_service_duration)
  ).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedStartTime = (
    appointment.start_date || new Date(appointment.imported_service_duration)
  ).toLocaleTimeString("de-DE", { 
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedEndTime = (
    appointment.end_date || new Date(appointment.imported_service_duration)
  ).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const emailSubject = `<p>Liebe Kund*innen,</p> wir möchten Sie freundlich an Ihren Termin erinnern:<br>Service: ${appointment.service?.name || appointment?.imported_service_name || ""}<br>Gerät: ${appointment?.brand_of_device || ""} ${appointment.model}<br>Datum: ${formattedStartDate}<br>Uhrzeit: Von ${formattedStartTime} bis ${formattedEndTime}<br><p>Bitte denken Sie daran, rechtzeitig zu erscheinen. Bei Fragen oder Änderungswünschen kontaktieren Sie uns bitte umgehend.</p><br><p>Mit freundlichen Grüßen,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>`;

  getService().emailService.sendMail({
    to: appointment?.contact?.[0]?.email,
    subject: "Terminerinnerung",
    text: emailSubject,
  });
}

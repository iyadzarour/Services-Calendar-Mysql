import {
  AppointmentDao,
  Appointment,
  CategoryDao,
  AddAppointmentRequest,
  ScheduleDao,
  ExtendedSchedule,
  ExtendedAppointment,
  AppointmentStatus,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class AppointmentsService {
  constructor(
    private appointmentDao: AppointmentDao,
    private categoryDao: CategoryDao,
    private scheduleDao: ScheduleDao
  ) { }

  async addAppointment(appointment: AddAppointmentRequest) {
    return this.appointmentDao
      .addAppointment(appointment)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getAppointmentById(id: string) {
    return this.appointmentDao
      .getAppointmentById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateAppointment(id: string, newAppointment: AddAppointmentRequest) {
    return this.appointmentDao
      .updateAppointment(id, newAppointment)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getAppointments(start: string, end: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log('AppointmentsService.getAppointments - Input:', { start, end });
    }
    
    const appointments = await this.appointmentDao
      .getAppointments(start, end)
      .then((data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('AppointmentsService.getAppointments - DAO returned:', data.length, 'appointments');
        }
        return data;
      })
      .catch((err) => {
        console.error('AppointmentsService.getAppointments - DAO error:', err);
        throw new ClientError(err, 500);
      });

    const result = await this.getAppointmentsWithService(appointments)
      .then((data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('AppointmentsService.getAppointments - WithService returned:', data.length, 'appointments');
        }
        return data;
      })
      .catch((err) => {
        console.error('AppointmentsService.getAppointments - WithService error:', err);
        throw new ClientError(err, 500);
      });
    
    return result;
  }

  async getAppointmentsByDateAndCalendarIdId(
    calendarId: string,
    start: string,
    end: string
  ) {
    try {
      const appointments: Appointment[] =
        await this.appointmentDao.getAppointmentsByDateCalendarIdId(
          calendarId,
          start,
          end
        );

      const appointmentDetails = await Promise.all(
        appointments.map(async (appointment) => {
          const service =
            await this.categoryDao.getServiceByCategoryIdAndServiceId(
              appointment.category_id,
              appointment.service_id
            );

          if (service) {
            const category = await this.categoryDao.getCategoryById(
              appointment.category_id
            );
            return {
              appointment,
              service,
              category,
            };
          } else {
            return {
              appointment,
              service: null,
              category: null,
            };
          }
        })
      );

      return appointmentDetails;
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  }

  async getAppointmentsWithService(appointments: Appointment[], isReminder = false) {
    const dataWithService: ExtendedAppointment[] = [];

    for (const appointment of appointments) {
      let service = null;
      const res = await this.categoryDao.getServiceByCategoryIdAndServiceId(
        appointment.category_id,
        appointment.service_id
      );

      if (res) {
        service = res as any;
      }

      if (isReminder) {
        dataWithService.push({ ...appointment, service });
      } else {
        dataWithService.push({ ...appointment, service });
      }
    }

    return dataWithService;
  }

  async getAppointmentsByContactId(contactId: string) {
    const appointments = await this.appointmentDao
      .getAppointmentsByContactId(contactId)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });

    return this.getAppointmentsWithService(appointments)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getAppointmentsByCalendarId(calendarId: string) {
    const appointments = await this.appointmentDao
      .getAppointmentsByCalendarIdId(calendarId)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });

    return this.getAppointmentsWithService(appointments)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async deleteAppointment(id: string) {
    return this.appointmentDao
      .deleteAppointment(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getTimeSlots(date: string, category_id?: string, service_id?: string) {
    let serviseDuration = 60;
    if (category_id && service_id) {
      const servise = await this.categoryDao.getServiceByCategoryIdAndServiceId(
        category_id,
        service_id
      );

      if (servise && servise.duration) {
        serviseDuration = servise.duration;
      }
    }

    const schedules = await this.scheduleDao.getScheduleByDate(new Date(date));
    if (schedules && schedules.length) {
      const timeSlots = await this.calculateTimeSlots(
        category_id && service_id ? schedules.filter(
          (schedule) =>
            !schedule.assignments_services?.length ||
            schedule.assignments_services?.includes(service_id!)
        ) : schedules,
        new Date(date),
        serviseDuration
      );

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      const bookedAppointments = await this.appointmentDao.getAppointments(
        startDate.toISOString(),
        endDate.toISOString()
      );

      const availableTimeSlots = await this.filterBookedAppointments(
        timeSlots,
        bookedAppointments
      );

      // Filter out time slots in the past (allow 5 minutes tolerance for clock drift)
      const now = new Date();
      const minAllowedTime = new Date(now.getTime() - 5 * 60000); // 5 minutes ago
      const futureTimeSlots = availableTimeSlots.filter((slot) => {
        const slotStart = new Date(slot.start);
        return slotStart >= minAllowedTime;
      });

      return futureTimeSlots;
    } else {
      return [];
    }
  }

  async calculateTimeSlots(
    schedules: ExtendedSchedule[],
    selectedDate: Date,
    serviceDuration: number
  ) {
    const timeSlots = [];
    const selectedDay = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Filter weekly schedules matching the selected day
    const weeklySchedules = schedules.filter((schedule) => {
      return (
        schedule.working_hours_type === "weekly" &&
        schedule.weekday === selectedDay
      );
    });

    // Filter certain date schedules that encompass the selected date
    const certainDateSchedules = schedules.filter((schedule) => {
      return (
        schedule.working_hours_type === "certain" &&
        schedule.date_from &&
        schedule.date_to &&
        new Date(selectedDate) >= new Date(schedule.date_from) &&
        new Date(selectedDate) <= new Date(schedule.date_to)
      );
    });

    // Calculate available time slots from weekly schedules
    for (const weeklySchedule of weeklySchedules) {
      const startTime = await this.parseTime(weeklySchedule.time_from);
      const endTime = await this.parseTime(weeklySchedule.time_to);

      // Generate time slots based on time range and service duration
      const currentSlot = new Date(selectedDate);
      currentSlot.setUTCHours(startTime.hours, startTime.minutes, 0, 0);

      while (
        currentSlot.getUTCHours() < endTime.hours ||
        (currentSlot.getUTCHours() === endTime.hours &&
          currentSlot.getUTCMinutes() < endTime.minutes)
      ) {
        const slotEndTime = new Date(currentSlot);
        slotEndTime.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );

        if (
          slotEndTime.getUTCHours() < endTime.hours ||
          (slotEndTime.getUTCHours() === endTime.hours &&
            slotEndTime.getUTCMinutes() <= endTime.minutes)
        ) {
          timeSlots.push({
            start: currentSlot.toISOString(),
            end: slotEndTime.toISOString(),
            calendar_id: weeklySchedule.calendar_id,
            employee_name: weeklySchedule.employee_name,
          });
        }

        currentSlot.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );
      }
    }

    // Calculate available time slots from certain date schedules
    for (const certainSchedule of certainDateSchedules) {
      const startTime = await this.parseTime(certainSchedule.time_from);
      const endTime = await this.parseTime(certainSchedule.time_to);

      // Generate time slots based on time range and service duration
      const currentSlot = new Date(selectedDate);
      currentSlot.setUTCHours(startTime.hours, startTime.minutes, 0, 0);

      while (
        currentSlot.getUTCHours() < endTime.hours ||
        (currentSlot.getUTCHours() === endTime.hours &&
          currentSlot.getUTCMinutes() < endTime.minutes)
      ) {
        const slotEndTime = new Date(currentSlot);
        slotEndTime.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );

        if (
          slotEndTime.getUTCHours() < endTime.hours ||
          (slotEndTime.getUTCHours() === endTime.hours &&
            slotEndTime.getUTCMinutes() <= endTime.minutes)
        ) {
          timeSlots.push({
            start: currentSlot.toISOString(),
            end: slotEndTime.toISOString(),
            calendar_id: certainSchedule.calendar_id,
            employee_name: certainSchedule.employee_name,
          });
        }

        currentSlot.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );
      }
    }

    return timeSlots;
  }

  async parseTime(time: string) {
    // Split the time string into hours, minutes, and AM/PM
    const parts = time.split(" ");
    let [hours, minutes] = parts[0].split(":").map(Number);
    const isPM = parts[1] && parts[1].toLowerCase() === "pm";

    if (isPM && hours !== 12) {
      hours += 12; // Convert to 24-hour format
    } else if (!isPM && hours === 12) {
      hours = 0; // Midnight in 24-hour format
    }

    return { hours, minutes };
  }

  async filterBookedAppointments(
    timeSlots: {
      start: string;
      end: string;
      calendar_id: string;
      employee_name: string;
    }[],
    bookedAppointments: Appointment[]
  ) {
    const availableTimeSlots = [];

    for (const timeSlot of timeSlots) {
      let isBooked = false;

      for (const appointment of bookedAppointments) {
        const appointmentStart = new Date(appointment.start_date);
        const appointmentEnd = new Date(appointment.end_date);
        const timeSlotStart = new Date(timeSlot.start);
        const timeSlotEnd = new Date(timeSlot.end);

        if (appointment.appointment_status === AppointmentStatus.Confirmed && timeSlotStart < appointmentEnd && timeSlotEnd > appointmentStart) {
          isBooked = true;
          break;
        }
      }

      if (!isBooked) {
        availableTimeSlots.push(timeSlot);
      }
    }

    return availableTimeSlots;
  }

  async getDueReminderAppointments() {
    const appointments = await this.appointmentDao
      .getDueReminderAppointments()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });

    return this.getAppointmentsWithService(appointments, true)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getServiceNameByCategory(categoryId: string, serviceId: string) {
    return this.categoryDao
      .getServiceByCategoryIdAndServiceId(categoryId, serviceId)
      .then((data) => {
        // @ts-ignore
        return data?.services?.[0]?.name;
      })
      .catch((err) => {
        return '';
      });
  }
}

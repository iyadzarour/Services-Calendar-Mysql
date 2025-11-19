import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer } from "../clients";
import {
  AppointmentCluster,
  AppointmentDuration,
  AppointmentScheduling,
  AssignmentOfServices,
  Calendar,
  CalendarType,
  DescriptionDisplayType,
  InsertAppointmentOption,
  PaginatedForm,
} from "../../../database-client/src/Schema";
import { PaginatedResponse } from "./dto";

class CalendarsControllers {
  @tryCatchErrorDecorator
  static async getCalendars(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Calendar'];

    /*
        #swagger.description = 'Endpoint to get all calendars';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const {
      page = 1,
      limit = 10,
      search,
    } = request.query as unknown as PaginatedForm;
    const service = (request as any).service as ServiceContainer;
    const { data, count } = await service.calendarService.getCalendars(
      page,
      limit,
      search
    );

    const paginatedResult = new PaginatedResponse<Calendar>(
      data,
      Number(page),
      Number(limit),
      count
    );

    res.status(200).json(paginatedResult);
  }

  @tryCatchErrorDecorator
  static async getCalendarById(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Calendar'];

    /*
        #swagger.description = 'Endpoint to get calendar by id';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const { calendarId } = request.params;
    const service = (request as any).service as ServiceContainer;
    const data = await service.calendarService.getCalendarById(calendarId);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async addCalendar(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Calendar'];

    /*
        #swagger.description = 'Endpoint to add calendar';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Calendar;
    const service = (request as any).service as ServiceContainer;
    const newCalendar: Calendar = {
      ...form,
      show_description: form.show_description
        ? form.show_description
        : DescriptionDisplayType.None,
      appointment_scheduling: form.appointment_scheduling
        ? form.appointment_scheduling
        : AppointmentScheduling.APPOINTMENT_LENGTH,
      online_booked: form.online_booked ? form.online_booked : true,
      advanced_settings: form.advanced_settings
        ? {
            ...form.advanced_settings,
            within_availability_times: form?.advanced_settings
              ?.within_availability_times
              ? form?.advanced_settings.within_availability_times
              : true,
            calendar_type: form?.advanced_settings.calendar_type
              ? form?.advanced_settings.calendar_type
              : CalendarType.Main,
            appointment_cluster: form?.advanced_settings.appointment_cluster
              ? form?.advanced_settings.appointment_cluster
              : AppointmentCluster.GLOBAL,
            appointment_duration: form?.advanced_settings.appointment_duration
              ? form?.advanced_settings.appointment_duration
              : AppointmentDuration.Auto,
            calendar_order: form?.advanced_settings.calendar_order
              ? form?.advanced_settings.calendar_order
              : 1,
            duration_factor: form?.advanced_settings.duration_factor
              ? form?.advanced_settings.duration_factor
              : 100,
          }
        : {
            within_availability_times: true,
            calendar_type: CalendarType.Main,
            appointment_cluster: AppointmentCluster.GLOBAL,
            appointment_duration: AppointmentDuration.Auto,
            calendar_order: 1,
            duration_factor: 100,
          },
      assignment_of_services: form.assignment_of_services
        ? form.assignment_of_services
        : AssignmentOfServices.ALL,
      insert_appointments: form.insert_appointments
        ? form.insert_appointments
        : InsertAppointmentOption.FIRST,
    };

    const data = await service.calendarService.addCalendar(newCalendar);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateCalendar(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Calendar'];

    /*
        #swagger.description = 'Endpoint to update calendar';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Calendar;
    const service = (request as any).service as ServiceContainer;
    const { calendarId } = request.params;
    
    // Convert appointment_scheduling to string if it's not already, then validate
    let appointmentScheduling: AppointmentScheduling | undefined = form.appointment_scheduling;
    if (appointmentScheduling !== undefined && appointmentScheduling !== null) {
      const schedulingStr = String(appointmentScheduling);
      if (schedulingStr && schedulingStr !== "" && Object.values(AppointmentScheduling).includes(schedulingStr as AppointmentScheduling)) {
        appointmentScheduling = schedulingStr as AppointmentScheduling;
      } else {
        appointmentScheduling = undefined;
      }
    }
    
    const newCalendar: Calendar = {
      ...form,
      show_description: form.show_description
        ? form.show_description
        : DescriptionDisplayType.None,
      appointment_scheduling: appointmentScheduling || AppointmentScheduling.APPOINTMENT_LENGTH,
      online_booked: form.online_booked ? form.online_booked : true,
      advanced_settings: form.advanced_settings
        ? {
            ...form.advanced_settings,
            within_availability_times: form?.advanced_settings
              ?.within_availability_times
              ? form?.advanced_settings.within_availability_times
              : true,
            calendar_type: form?.advanced_settings.calendar_type
              ? form?.advanced_settings.calendar_type
              : CalendarType.Main,
            appointment_cluster: form?.advanced_settings.appointment_cluster
              ? form?.advanced_settings.appointment_cluster
              : AppointmentCluster.GLOBAL,
            appointment_duration: form?.advanced_settings.appointment_duration
              ? form?.advanced_settings.appointment_duration
              : AppointmentDuration.Auto,
            calendar_order: form?.advanced_settings.calendar_order
              ? form?.advanced_settings.calendar_order
              : 1,
            duration_factor: form?.advanced_settings.duration_factor
              ? form?.advanced_settings.duration_factor
              : 100,
          }
        : {
            within_availability_times: true,
            calendar_type: CalendarType.Main,
            appointment_cluster: AppointmentCluster.GLOBAL,
            appointment_duration: AppointmentDuration.Auto,
            calendar_order: 1,
            duration_factor: 100,
          },
      assignment_of_services: form.assignment_of_services
        ? form.assignment_of_services
        : AssignmentOfServices.ALL,
      insert_appointments: form.insert_appointments
        ? form.insert_appointments
        : InsertAppointmentOption.FIRST,
    };
    const data = await service.calendarService.updateCalendar(
      calendarId,
      newCalendar
    );

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteCalendar(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Calendar'];

    /*
        #swagger.description = 'Endpoint to delete all calendar';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.calendarService.deleteCalendar(
      request.params.calendarId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }
}

export default CalendarsControllers;

import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer } from "../clients";
import {
  AddScheduleRequest,
  Schedule,
  PaginatedForm,
  ScheduleType,
} from "../../../database-client/src/Schema";
import { PaginatedResponse } from "../category/dto";

class SchedulesControllers {
  @tryCatchErrorDecorator
  static async addSchedule(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to add schedule';
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
    const form = request.body as unknown as AddScheduleRequest;
    const service = (request as any).service as ServiceContainer;
    const { data } = await service.scheduleService.getSchedules(1, 1000);
    if (SchedulesControllers.checkForScheduleConflicts(form, data)) {
      res
        .status(409)
        .json({
          message: "The new schedule conflicts with an existing schedule",
        });
    } else {
      const result = await service.scheduleService.addSchedule(form);

      res.status(200).json(result);
    }
  }

  @tryCatchErrorDecorator
  static async getSchedules(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to get all schedules';
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
    const { page = 1, limit = 10 } = request.query as PaginatedForm;
    const service = (request as any).service as ServiceContainer;
    const { data, count } = await service.scheduleService.getSchedules(
      page,
      limit
    );

    const paginatedResult = new PaginatedResponse<Schedule>(
      data,
      Number(page),
      Number(limit),
      count
    );
    res.status(200).json(paginatedResult);
  }

  @tryCatchErrorDecorator
  static async updateSchedule(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to update schedule';
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
    const form = request.body as unknown as Schedule;
    const service = (request as any).service as ServiceContainer;
    const { scheduleId } = request.params;

    const data = await service.scheduleService.updateSchedule(scheduleId, form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteSchedule(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to delete schedule';
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
    const data = await service.scheduleService.deleteSchedule(
      request.params.scheduleId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  // Function to check for schedule conflicts
  static checkForScheduleConflicts(
    newSchedule: AddScheduleRequest,
    existingSchedules: Schedule[],
    _id?: string
  ) {
    const newStartTime = newSchedule.date_from
      ? new Date(newSchedule.date_from)
      : new Date();
    const newEndTime = newSchedule.date_to
      ? new Date(newSchedule.date_to)
      : new Date();
  
    // Convert time_from and time_to to 24-hour format
    const convertTo24HourFormat = (time: string) => {
      let [hour, minute] = time
        .replace(/(am|pm)/i, '')
        .split(':')
        .map((part) => parseInt(part, 10));
  
      if (time.toLowerCase().includes('pm') && hour < 12) {
        hour += 12;
      } else if (time.toLowerCase().includes('am') && hour === 12) {
        hour = 0;
      }
  
      return [hour, minute];
    };
  
    const [newStartHour, newStartMinute] = convertTo24HourFormat(newSchedule.time_from);
    const [newEndHour, newEndMinute] = convertTo24HourFormat(newSchedule.time_to);
  
    newStartTime.setHours(newStartHour, newStartMinute, 0, 0);
    newEndTime.setHours(newEndHour, newEndMinute, 0, 0);
  
    for (const existingSchedule of existingSchedules) {
      if (
        existingSchedule._id === _id ||
        existingSchedule.calendar_id !== newSchedule.calendar_id
      ) {
        continue; // Skip comparing with itself if editing an existing schedule or adding to a different calendar
      }
  
      // Determine if the schedules overlap
      if (
        existingSchedule.working_hours_type === 'weekly' &&
        existingSchedule.weekday === newSchedule.weekday
      ) {
        const [existingStartHour, existingStartMinute] = convertTo24HourFormat(existingSchedule.time_from);
        const [existingEndHour, existingEndMinute] = convertTo24HourFormat(existingSchedule.time_to);
  
        const existingStartTime = new Date();
        existingStartTime.setHours(existingStartHour, existingStartMinute, 0, 0);
        const existingEndTime = new Date();
        existingEndTime.setHours(existingEndHour, existingEndMinute, 0, 0);
  
        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
          return true;
        }
      } else if (
        existingSchedule.working_hours_type === ScheduleType.Certain &&
        existingSchedule.date_to &&
        newStartTime < new Date(existingSchedule.date_to) &&
        existingSchedule.date_from &&
        newEndTime > new Date(existingSchedule.date_from)
      ) {
        return true;
      }
    }
  
    return false;
  }


  @tryCatchErrorDecorator
  static async getSchedulesByCalendarId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to get all schedules by calendar ID';
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
   
    const { calendarId } = request.params;
    const service = (request as any).service as ServiceContainer;
    const data = await service.scheduleService.getSchedulesByCalendarId(calendarId);

    res.status(200).json(data);
  }
}


export default SchedulesControllers;

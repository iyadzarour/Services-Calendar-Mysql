import { CalendarDao, Calendar } from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class CalendarsService {
  constructor(private calendarDao: CalendarDao) {}
  
  async addCalendar(calendar: Calendar) {
    return this.calendarDao
      .addCalendar(calendar)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          err,
          500
        );
      });
  }

  async getCalendarById(id: string) {
    return this.calendarDao
      .getCalendarById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateCalendar(id: string, newCalendar: Calendar) {
    return this.calendarDao
      .updateCalendar(id, newCalendar)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          err,
          500
        );
      });
  }

  async getCalendars(page: number, limit: number, search?: string) {
    const [data, count] = await Promise.all([
      this.calendarDao.getCalendars(page, limit, search).then((data) => {
        return data;
      }),
      this.calendarDao.getCalendarsCount(search).then((data) => {
        return data;
      }),
    ]);

    return { data, count };
  }

  async deleteCalendar(id: string) {
    return this.calendarDao
      .deleteCalendar(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          err,
          500
        );
      });
  }
}

import {
  ScheduleDao,
  Schedule,
  AddScheduleRequest,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class SchedulesService {
  constructor(private scheduleDao: ScheduleDao) {}

  async addSchedule(schedule: AddScheduleRequest) {
    return this.scheduleDao
      .addSchedule(schedule)
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

  async getScheduleById(id: string) {
    return this.scheduleDao
      .getScheduleById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateSchedule(id: string, newSchedule: Schedule) {
    return this.scheduleDao
      .updateSchedule(id, newSchedule)
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

  async getSchedules(page: number, limit: number) {
    const [data, count] = await Promise.all([
      this.scheduleDao.getSchedules(page, limit).then((data) => {
        return data;
      }),
      this.scheduleDao.getSchedulesCount().then((data: number) => {
        return data;
      }),
    ]);

    return { data, count };
  }

  async deleteSchedule(id: string) {
    return this.scheduleDao
      .deleteSchedule(id)
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

  async getSchedulesByCalendarId(id: string) {
    return this.scheduleDao
    .getSchedulesByCalendarId(id)
    .then((data) => {
      return data;
    })
    .catch((err) => [] as unknown as Schedule[]);
  }
}

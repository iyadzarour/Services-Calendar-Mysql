import { RootState } from '../store';

export const selectSchedules = (state: RootState) => state.schedules.schedules;
export const selectSchedulesLoading = (state: RootState) => state.schedules.loading;

export const selectUpdateScheduleLoading = (state: RootState) => state.schedules.updateScheduleLoading;
export const selectDeleteScheduleLoading = (state: RootState) => state.schedules.deleteScheduleLoading;
import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  createScheduleRequest,
  deleteScheduleRequest,
  updateScheduleRequest,
} from "../../../redux/actions";
import {
  selectDeleteScheduleLoading,
  selectSchedulesLoading,
  selectUpdateScheduleLoading,
} from "../../../redux/selectors";
import { Schedule, ScheduleType, WeekDay } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import {
  Row,
  Tabs,
  Button,
  message,
  Popconfirm,
  Modal,
  Table,
  Tag,
  Divider,
  Col,
  DatePicker,
  Switch,
  Input,
  Dropdown,
  Menu,
} from "antd";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";
import WeekdaySelector from "./components/WeekdaySelector";
import { withTranslation } from 'react-i18next';
import i18n from "../../../locales/i18n";
import { EllipsisOutlined } from '@ant-design/icons';

const { Column } = Table;


function calculateHoursDifference(numOfDays: number, hoursPerDay: number) {
  return Math.floor(numOfDays * hoursPerDay);
}

interface IScheduleState {
  weeklySchedules: Schedule[];
  certainSchedules: Schedule[];
  selectedDays: WeekDay[];
  visible: boolean;
  timeFrom: string;
  timeTo: string;
  dateFrom?: Date;
  dateTo?: Date;
  reason: string;
  active: boolean;
  internally: boolean;
  editId: string;
  activeKey: string;
}

interface IScheduleProps {
  loading: boolean;
  weeklySchedules: Schedule[];
  certainSchedules: Schedule[];
  updateScheduleLoading: boolean;
  deleteScheduleLoading: boolean;
  calendarId: string;
  updateScheduleRequest: (id: string, schedule: Schedule) => Promise<any>;
  deleteScheduleRequest: (id: string) => Promise<any>;
  createScheduleRequest: (schedule: Schedule) => Promise<any>;
  onDeleteSchedule: () => void;
}

class SchedulePage extends React.Component<IScheduleProps, IScheduleState> {
  constructor(props: IScheduleProps) {
    super(props);
    this.state = {
      weeklySchedules: props.weeklySchedules,
      certainSchedules: props.certainSchedules,
      selectedDays: [],
      visible: false,
      timeFrom: "",
      timeTo: "",
      dateFrom: new Date(),
      dateTo: new Date(),
      reason: "",
      active: true,
      internally: false,
      editId: "",
      activeKey: "1",
    };
  }
  componentDidUpdate(prevProps: Readonly<IScheduleProps>): void {
    if (
      prevProps.weeklySchedules !== this.props.weeklySchedules ||
      prevProps.certainSchedules !== this.props.certainSchedules
    ) {
      this.setState({
        weeklySchedules: this.props.weeklySchedules,
        certainSchedules: this.props.certainSchedules,
      });
    }
  }

  renderWorkingHours = (schedules: Schedule[], type: ScheduleType) => {
    const {
      selectedDays,
      visible,
      timeFrom,
      timeTo,
      dateFrom,
      dateTo,
      reason,
      internally,
      active,
      editId,
    } = this.state;

    const resetState = () => {
      this.setState({
        selectedDays: [],
        timeFrom: "",
        timeTo: "",
        dateFrom: new Date(),
        dateTo: new Date(),
        internally: false,
        active: true,
        reason: "",
        editId: "",
      });
    };
    const onOpen = () => {
      this.setState({ visible: true });
    };

    const onClose = () => {
      this.setState({ visible: false });
      resetState();
    };

    const onSave = async () => {
      this.setState({ visible: false });

      if (type === ScheduleType.Certain) {
        if (editId) {
          const schedule = this.props.certainSchedules.filter(
            (el) => el._id === editId
          )[0];
          const newSchedule = Object.assign({}, schedule);
          delete newSchedule._id;
          delete newSchedule.createdAt;
          delete newSchedule.updatedAt;

          this.props
            .updateScheduleRequest(editId, {
              ...newSchedule,
              date_from: dateFrom,
              date_to: dateTo,
              time_from: timeFrom,
              time_to: timeTo,
              reason: reason,
              only_internally: internally,
              active,
            })
            .then((data) => {
              if (data._id) {
                message.success(i18n.t('successfully_updated_the_schedule'));
              } else {
                message.error(i18n.t('something_went_wrong_please_try_again'));
              }
            });
        } else {
          this.props.createScheduleRequest({
            calendar_id: this.props.calendarId,
            working_hours_type: ScheduleType.Certain,
            date_from: dateFrom,
            date_to: dateTo,
            time_from: timeFrom,
            time_to: timeTo,
            reason: reason,
            only_internally: internally,
            active: active,
          });
        }
        resetState();
        return;
      } else {
        if (editId) {
          const schedule = this.props.weeklySchedules.filter(
            (el) => el._id === editId
          )[0];
          const newSchedule = Object.assign({}, schedule);
          delete newSchedule._id;
          delete newSchedule.createdAt;
          delete newSchedule.updatedAt;

          this.props
            .updateScheduleRequest(editId, {
              ...newSchedule,
              weekday: selectedDays[0],
              time_from: timeFrom,
              time_to: timeTo,
              only_internally: internally,
              active,
            })
            .then((data) => {
              if (data._id) {
                message.success(i18n.t('successfully_updated_the_schedule'));
              } else {
                message.error(i18n.t('something_went_wrong_please_try_again'));
              }
            });
        } else {
          const schedules = selectedDays.map((weekday) => ({
            calendar_id: this.props.calendarId,
            working_hours_type: ScheduleType.Weekly,
            weekday: weekday,
            time_from: timeFrom,
            time_to: timeTo,
            only_internally: internally,
            active: active,
          }));

          await Promise.all(schedules.map(this.props.createScheduleRequest));
        }
        resetState();
      }
    };

    const onDeleteSchedule = (id: string) => {
      this.props.deleteScheduleRequest(id).then((data) => {
        if (data.status && data.status === "success") {
          message.success(i18n.t('successfully_deleted_the_schedule'));
        } else {
          message.error(i18n.t('something_went_wrong_please_try_again'));
        }
      });
    };

    const onEditSchedule = (schedule: Schedule) => {
      this.setState({
        visible: true,
        editId: schedule._id!,
        active: Boolean(schedule.active),
        internally: Boolean(schedule.only_internally),
        timeFrom: schedule.time_from,
        timeTo: schedule.time_to,
        dateFrom: schedule.date_from,
        dateTo: schedule.date_to,
        selectedDays: [schedule.weekday!],
      });
    };

    const handleSelectedDaysChange = (selectedDays: WeekDay[]) => {
      this.setState({ selectedDays });
    };

    return (
      <div>
        {visible ? (
          <Modal
            title={i18n.t('new_schedule')}
            open={visible}
            centered
            closable={false}
            onCancel={onClose}
            onOk={onSave}
            width={850}
          >
            <Divider />
            {type === ScheduleType.Weekly ? (
              <Row className="mb-6">
                <p>{i18n.t('select_weekdays')}</p>
                <WeekdaySelector
                  selectedDays={this.state.selectedDays}
                  setSelectedDays={handleSelectedDaysChange}
                  disabled={Boolean(editId)}
                />
              </Row>
            ) : (
              <>
                <Row className="mb-6">
                  <Col span={8} className="w-full">
                    <span>{i18n.t('date_from')}</span>
                  </Col>
                  <Col span={16}>
                    <DatePicker
                      onChange={(value) => {
                        this.setState({ dateFrom: dayjs(value).toDate() });
                      }}
                      disabledDate={(current) =>
                        current && current.isBefore(dayjs(), "day")
                      }
                      value={dateFrom ? dayjs(dateFrom) : null}
                    />
                  </Col>
                </Row>
                <Row className="mb-6">
                  <Col span={8} className="w-full">
                    <span>{i18n.t('date_to')}</span>
                  </Col>
                  <Col span={16}>
                    <DatePicker
                      onChange={(value) => {
                        this.setState({ dateTo: dayjs(value).toDate() });
                      }}
                      disabledDate={(current) =>
                        current && current.isBefore(dayjs(), "day")
                      }
                      value={dateTo ? dayjs(dateTo) : null}
                    />
                  </Col>
                </Row>
              </>
            )}
            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>{i18n.t('time_from')}</span>
              </Col>
              <Col span={16}>
                <DatePicker.TimePicker
                  onChange={(value) => {
                    this.setState({ timeFrom: dayjs(value).format("hh:mm A") });
                  }}
                  format={"hh:mm A"}
                  value={timeFrom ? dayjs(timeFrom, "hh:mm A") : null}
                />
              </Col>
            </Row>
            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>{i18n.t('time_to')}</span>
              </Col>
              <Col span={16}>
                <DatePicker.TimePicker
                  onChange={(value) => {
                    this.setState({ timeTo: dayjs(value).format("hh:mm A") });
                  }}
                  format={"hh:mm A"}
                  value={timeTo ? dayjs(timeTo, "hh:mm A") : null}
                />
              </Col>
            </Row>
            {type === ScheduleType.Certain && (
              <Row className="mb-6">
                <Col span={8} className="w-full">
                  <span>{i18n.t('reason')}</span>
                </Col>
                <Col span={16}>
                  <Input
                    onChange={(value) => {
                      this.setState({ reason: value.target.value });
                    }}
                    value={reason}
                  />
                </Col>
              </Row>
            )}
            <Row className="mb-6" gutter={[16, 16]}>
              <Col span={8} className="w-full">
                <span>{i18n.t('working_hours_are_active_and_bookable')}</span>
              </Col>
              <Col span={16}>
                <Switch
                  value={active}
                  onChange={(value) => {
                    this.setState({ active: value });
                  }}
                />
              </Col>
            </Row>
            <Row className="mb-6" gutter={[16, 16]}>
              <Col span={8} className="w-full">
                <span>{i18n.t('only_bookable_internally')}</span>
              </Col>
              <Col span={16}>
                <Switch
                  value={internally}
                  onChange={(value) => {
                    this.setState({ internally: value });
                  }}
                />
              </Col>
            </Row>
          </Modal>
        ) : null}

        <Table
          dataSource={schedules}
          style={{ marginTop: 20 }}
          rowKey="_id"
          bordered
          footer={() => {
            return <Button onClick={onOpen}>{i18n.t('new_schedule')}</Button>;
          }}
        >
          <Column
            title={i18n.t('active')}
            dataIndex={"active"}
            render={(value) =>
              value ? (
                <Tag color="green">{i18n.t('active')}</Tag>
              ) : (
                <Tag color="red">{i18n.t('not_active')}</Tag>
              )
            }
          />
          {type === ScheduleType.Weekly && (
            <Column title={i18n.t('day')} dataIndex={"weekday"} />
          )}
          {type === ScheduleType.Certain && (
            <>
              <Column
                title={i18n.t('date_from')}
                dataIndex={"date_from"}
                render={(text) => text ? dayjs(text).format("DD/MM/YYYY") : '--'}
              />
              <Column
                title={i18n.t('date_to')}
                dataIndex={"date_to"}
                render={(text) => text ? dayjs(text).format("DD/MM/YYYY") : '--'}
              />
            </>
          )}
          <Column title={i18n.t('time_from')} dataIndex={"time_from"} />
          <Column title={i18n.t('time_to')} dataIndex={"time_to"} />
          {type === ScheduleType.Certain && (
            <>
              <Column
                title={i18n.t('duration')}
                dataIndex={""}
                render={(_: any, record: Schedule) => {
                  if (!record.date_to || !record.date_from || !record.time_to || !record.time_from) {
                    return <span>--</span>;
                  }
                  return (
                    <span>
                      {calculateHoursDifference(
                        dayjs(record.date_to).diff(
                          dayjs(record.date_from),
                          "day"
                        ) + 1,
                        dayjs(record.time_to, "hh:mm A").diff(
                          dayjs(record.time_from, "hh:mm A"),
                          "hours"
                        )
                      )}{" "}
                      {i18n.t('hours')}
                    </span>
                  );
                }}
              />
              <Column title={i18n.t('reason')} dataIndex={"reason"} />
            </>
          )}
          <Column
            title={i18n.t('services')}
            dataIndex={"restricted_to_services"}
            render={(value) =>
              value && Array.isArray(value) && value.length ? (
                <Tag>{i18n.t('for_some_services')}</Tag>
              ) : (
                <Tag>{i18n.t('for_all_services')}</Tag>
              )
            }
          />
          <Column
            title={i18n.t('action')}
            key="action"
            render={(_: any, record: Schedule) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "delete",
                      label: (
                        <Popconfirm
                          title={i18n.t('delete_this_schedule')}
                          description={i18n.t('are_you_sure_you_want_to_delete_this_schedule')}
                          okText={i18n.t('delete_it')}
                          cancelText={i18n.t('no')}
                          okButtonProps={{
                            danger: true,
                          }}
                          onConfirm={() => onDeleteSchedule(record._id!)}
                        >
                          <span>{i18n.t('delete')}</span>
                        </Popconfirm>
                      ),
                    },
                    {
                      key: "edit",
                      label: i18n.t('edit'),
                      onClick: () => onEditSchedule(record),
                    },
                  ],
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button>
                  <EllipsisOutlined />
                </Button>
              </Dropdown>
            )}
          />
        </Table>
      </div>
    );
  };

  render() {
    const { weeklySchedules, certainSchedules } = this.state;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Content>
            <Tabs
              defaultActiveKey="1"
              onChange={(key) => {
                this.setState({ activeKey: key });
              }}
              items={[
                {
                  key: "1",
                  label: i18n.t('working_hours'),
                },
                {
                  key: "2",
                  label: i18n.t('working_hours_certain_days_One_time_appointment'),
                },
              ]}
            />
            {this.state.activeKey === "1"
              ? this.renderWorkingHours(weeklySchedules, ScheduleType.Weekly)
              : this.renderWorkingHours(certainSchedules, ScheduleType.Certain)}
          </Content>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  loading: selectSchedulesLoading(state),
  updateScheduleLoading: selectUpdateScheduleLoading(state),
  deleteScheduleLoading: selectDeleteScheduleLoading(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  updateScheduleRequest: (id: string, schedule: Schedule) =>
    dispatch(updateScheduleRequest(id, schedule)),
  deleteScheduleRequest: (id: string) => dispatch(deleteScheduleRequest(id)),
  createScheduleRequest: (schedule: Schedule) =>
    dispatch(createScheduleRequest(schedule)),
});


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SchedulePage));

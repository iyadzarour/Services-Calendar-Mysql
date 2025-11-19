import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateCalendarRequest, deleteCalendarRequest, fetchServices } from "../../../redux/actions";
import {
    selectCalendars,
    selectCalendarsLoading,
    selectDeleteCalendarLoading,
    selectServices,
    selectServicesLoading,
    selectUpdateCalendarLoading,
} from "../../../redux/selectors";
import { AppointmentCluster, AppointmentDuration, AppointmentScheduling, AssignmentOfServices, Calendar, CalendarType, DescriptionDisplayType, ExtendedService, Service } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import {
    Row,
    Col,
    Tabs,
    Switch,
    Input,
    Select,
    Button,
    message,
    Popconfirm,
    Empty,
} from "antd";
import { Content } from "antd/es/layout/layout";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";
import { withTranslation } from 'react-i18next';
import i18n from "../../../locales/i18n";

const { TextArea } = Input;
const { Option } = Select;


interface ICalendarState {
    editingTitle: number | null;
    localCalendar: Calendar;
    visible: boolean;
    newService: Service;
}

interface ICalendarProps {
    loading: boolean;
    calendar: Calendar;
    updateCalendarLoading: boolean;
    deleteCalendarLoading: boolean;
    services: ExtendedService[];
    servicesLoading: boolean;
    updateCalendarRequest: (id: string, calendar: Calendar) => Promise<any>;
    deleteCalendarRequest: (id: string) => Promise<any>;
    onDeleteCalendar: () => void;
    fetchServices: () => Promise<void>;
}

class CalendarPage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            editingTitle: null,
            localCalendar: props.calendar,
            visible: false,
            newService: {
                name: '',
                description: '',
                duration: 60,
                price: 0,
                abbreviation_id: Math.floor(1000 + Math.random() * 9000)
            },
        };
    }
    componentDidUpdate(prevProps: Readonly<ICalendarProps>): void {
        if (prevProps.calendar !== this.props.calendar) {
            this.setState({
                localCalendar: this.props.calendar,
            });
        }
    }

    componentDidMount(): void {
        this.props.fetchServices();
    }


    onUpdateCalendar = () => {
        const { localCalendar } = this.state;
        const updateCalendar = Object.assign({}, {...localCalendar, assignment_of_services: localCalendar?.assignments_services?.length ? AssignmentOfServices.CERTAIN : AssignmentOfServices.ALL});

        delete updateCalendar._id;
        delete updateCalendar.createdAt;
        delete updateCalendar.updatedAt;

        this.props.updateCalendarRequest(localCalendar._id!, updateCalendar).then(data => {
            if (data._id) {
                message.success(i18n.t('successfully_updated_the_calendar'))
            } else {
                if (data && data.errorValidation && data.errorValidation.fields && data.errorValidation.fields.email) {
                    message.error(data.errorValidation.fields.email)
                }
                else if (data && data.errorValidation && data.errorValidation.fields && data.errorValidation.fields.password) {
                    message.error(data.errorValidation.fields.password)
                } else {
                    message.error(i18n.t('something_went_wrong_please_try_again'))
                }
            }
        })
    };

    onDeleteCalendar = () => {
        const { localCalendar } = this.state;

        this.props.deleteCalendarRequest(localCalendar._id!).then(data => {
            if (data.status && data.status === "success") {
                message.success(i18n.t('successfully_deleted_the_calendar'))
                this.props.onDeleteCalendar();
            } else {
                message.error(i18n.t('something_went_wrong_please_try_again'))
            }
        })
    };

    renderAuth = () => {
        const { localCalendar } = this.state;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    [key]: value
                }
            })
        };

        return (
            <div>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('email')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onChange('email', e.target.value)
                            }}
                            value={localCalendar.email} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('password')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            type="password"
                            onChange={(e) => {
                                onChange('password', e.target.value)
                            }}
                            value={localCalendar.password} />
                    </Col>
                </Row>
            </div>
        )
    }

    renderServices = () => {
        const { localCalendar } = this.state;
        const { services, servicesLoading } = this.props;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    [key]: value
                }
            })
        };

        const handleChange = (value: string[]) => {
            this.setState({ localCalendar: { ...this.state.localCalendar, assignments_services: value } })
        };

        return (
            <div>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t("show_description_on_booking_page")}</span>
                    </Col>
                    <Col span={16}>
                        <Select
                            onChange={(value) => {
                                onChange("assignment_of_services", value);
                            }}
                            value={localCalendar.assignment_of_services}
                            className="w-full"
                        >
                            {[
                                {
                                    lable: i18n.t("all_services_are_bookable"),
                                    value: AssignmentOfServices.ALL,
                                },
                                {
                                    lable: i18n.t("certain_services_can_be_booked"),
                                    value: AssignmentOfServices.CERTAIN,
                                },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    {localCalendar.assignment_of_services ===
                        AssignmentOfServices.CERTAIN && (
                            <>
                                <Col span={8} className="w-full"></Col>
                                <Col span={16}>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        loading={servicesLoading}
                                        defaultValue={localCalendar.assignments_services}
                                        className="w-full"
                                        onChange={handleChange}
                                    >
                                        {services.map((service) => (
                                            <Option key={service._id} value={service._id}>
                                                {service.name + " (" + service.abbreviation_id + ")"}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            </>
                        )}
                </Row>
            </div>
        );
    };

    renderAdvancedSettings = () => {
        const { localCalendar } = this.state;

        const onAdvancedSettingsChange = (key: string, value: boolean | string) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    advanced_settings: {
                        ...localCalendar.advanced_settings,
                        [key]: value
                    }
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('multiple_occupancy_calendar')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.multiple_occupanc} onChange={(value) => {
                            onAdvancedSettingsChange('multiple_occupanc', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('email_notification_to_employees')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('notification_email', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.notification_email} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('also_use_email_notification_address_as_sender_address')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.notification_email_as_sender} onChange={(value) => {
                            onAdvancedSettingsChange('notification_email_as_sender', value)
                        }} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('sms_notification_to_employees')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.sms_notification} onChange={(value) => {
                            onAdvancedSettingsChange('sms_notification', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('email_manual_appointment_confirmation')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('manual_email_confirmation', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.manual_email_confirmation} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('manual_appointment_confirmation_for_manually_booked_appointments')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.manually_confirmation_for_manually_booked_appointments} onChange={(value) => {
                            onAdvancedSettingsChange('manually_confirmation_for_manually_booked_appointments', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('limitation_to_a_maximum_appointment_duration')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.limit_maximum_appointment_duration} onChange={(value) => {
                            onAdvancedSettingsChange('limit_maximum_appointment_duration', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('calculate_call_waiting_number')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.call_waiting_number} onChange={(value) => {
                            onAdvancedSettingsChange('call_waiting_number', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('free_standing_times_are_within_availability_times')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.within_availability_times} onChange={(value) => {
                            onAdvancedSettingsChange('within_availability_times', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('calendar_group_booking_page')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('calendar_group', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.calendar_group} />
                    </Col>
                </Row>


                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('calendar_type')}</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('calendar_type', value)
                        }} value={localCalendar.advanced_settings?.calendar_type}>
                            {[
                                { lable: i18n.t('main'), value: CalendarType.Main },
                                { lable: i18n.t('side'), value: CalendarType.Side },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('appointment_cluster')}</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('appointment_cluster', value)
                        }} value={localCalendar.advanced_settings?.appointment_cluster}>
                            {[
                                { lable: i18n.t('global_attitude'), value: AppointmentCluster.GLOBAL },
                                { lable: i18n.t('active'), value: AppointmentCluster.ACTIVE },
                                { lable: i18n.t('not_active'), value: AppointmentCluster.NOT_ACTIVE },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('appointment_timing')}</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('appointment_duration', value)
                        }} value={localCalendar.advanced_settings?.appointment_duration}>
                            {[
                                { lable: i18n.t('auto'), value: AppointmentDuration.Auto },
                                { lable: "5 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_5 },
                                { lable: "10 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_10 },
                                { lable: "15 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_15 },
                                { lable: "20 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_20 },
                                { lable: "30 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_30 },
                                { lable: "40 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_40 },
                                { lable: "45 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_45 },
                                { lable: "50 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_50 },
                                { lable: "60 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_60 },
                                { lable: "75 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_75 },
                                { lable: "90 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_90 },
                                { lable: "120 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_120 },
                                { lable: "180 " + i18n.t('minutes'), value: AppointmentDuration.MINUTES_180 },
                                { lable: "4 " + i18n.t('hours'), value: AppointmentDuration.HOURS_4 },
                                { lable: "5 " + i18n.t('hours'), value: AppointmentDuration.HOURS_5 },
                                { lable: "8 " + i18n.t('hours'), value: AppointmentDuration.HOURS_8 },
                                { lable: "10 " + i18n.t('hours'), value: AppointmentDuration.HOURS_10 },
                                { lable: "12 " + i18n.t('hours'), value: AppointmentDuration.HOURS_12 },
                                { lable: "24 " + i18n.t('hours'), value: AppointmentDuration.HOURS_24 },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('order_calendar')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('calendar_order', e.target.value)
                            }}
                            type="number"
                            value={localCalendar.advanced_settings?.calendar_order} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('appointment_duration_factor')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('duration_factor', e.target.value)
                            }}
                            type="number"
                            value={localCalendar.advanced_settings?.duration_factor} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('reference_to_third_party_system')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('reference_system', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.reference_system} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('calendar_id')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('calendar_id', e.target.value)
                            }}
                            type="number"
                            value={localCalendar.advanced_settings?.calendar_id} />
                    </Col>
                </Row>
            </div>
        );
    };


    renderGernal = () => {
        const { localCalendar } = this.state;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    [key]: value
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('name_of_employee_or_resource')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onChange('employee_name', e.target.value)
                            }}
                            value={localCalendar.employee_name} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('description')}</span>
                    </Col>
                    <Col span={16}>
                        <TextArea
                            onChange={(e) => {
                                onChange('description', e.target.value)
                            }}
                            value={localCalendar.description} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('show_description_on_booking_page')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('show_description', value)
                        }}
                            value={localCalendar.show_description} className="w-full">
                            {[
                                { lable: i18n.t('dont_show'), value: DescriptionDisplayType.None },
                                { lable: i18n.t('show_as_text'), value: DescriptionDisplayType.Text },
                                { lable: i18n.t('show_as_a_tooltip'), value: DescriptionDisplayType.Tooltip },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('appointment_allocation_clocking')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('appointment_scheduling', value)
                        }}
                            value={localCalendar.appointment_scheduling} className="w-full">
                            {[
                                { lable: i18n.t('appointment_length'), value: AppointmentScheduling.APPOINTMENT_LENGTH },
                                { lable: "5 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_5 },
                                { lable: "10 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_10 },
                                { lable: "15 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_15 },
                                { lable: "20 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_20 },
                                { lable: "30 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_30 },
                                { lable: "40 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_40 },
                                { lable: "45 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_45 },
                                { lable: "50 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_50 },
                                { lable: "60 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_60 },
                                { lable: "75 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_75 },
                                { lable: "90 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_90 },
                                { lable: "120 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_120 },
                                { lable: "180 " + i18n.t('minutes'), value: AppointmentScheduling.MINUTES_180 },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                {/* employee_image,  */}
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('employee_resource_can_be_booked_online_and_via_appointment_finder')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('online_booked', value)
                        }}
                            checked={localCalendar.online_booked} />
                    </Col>
                </Row>
            </div>
        );
    };

    render() {
        const { updateCalendarLoading, deleteCalendarLoading } = this.props;
        const { localCalendar } = this.state;

        if (!localCalendar) {
            return (
                <Empty description={i18n.t('empty')} />
            )
        }

        return (
            <div>
                <Row gutter={[16, 16]}>
                    <Content>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: i18n.t('general'),
                                    children: this.renderGernal(),
                                },
                                {
                                    key: "2",
                                    label: i18n.t('advanced_settings'),
                                    children: this.renderAdvancedSettings(),
                                },
                                {
                                    key: "3",
                                    label: i18n.t('assignment_of_services'),
                                    children: this.renderServices(),
                                },
                                {
                                    key: "4",
                                    label: i18n.t('email') + " / " + i18n.t('password'),
                                    children: this.renderAuth(),
                                },

                            ]}
                        />
                    </Content>
                </Row>
                <Row justify={'end'}>
                    <Popconfirm
                        title={i18n.t('delete_this_calendar')}
                        description={i18n.t('are_you_sure_you_want_to_delete_this_calendar')}
                        okText={i18n.t('delete_it')}
                        cancelText={i18n.t('no')}
                        okButtonProps={{
                            danger: true,
                        }}
                        onConfirm={this.onDeleteCalendar}
                    >
                        <Button loading={deleteCalendarLoading} className="self-end mr-3" type="primary" danger>{i18n.t('delete_calendar')}</Button>

                    </Popconfirm>
                    <Button onClick={this.onUpdateCalendar} loading={updateCalendarLoading} className="self-end" type="primary">{i18n.t('save_changes')}</Button>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    calendars: selectCalendars(state),
    loading: selectCalendarsLoading(state),
    updateCalendarLoading: selectUpdateCalendarLoading(state),
    deleteCalendarLoading: selectDeleteCalendarLoading(state),
    services: selectServices(state),
    servicesLoading: selectServicesLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateCalendarRequest: (id: string, calendar: Calendar) => dispatch(updateCalendarRequest(id, calendar)),
    deleteCalendarRequest: (id: string) => dispatch(deleteCalendarRequest(id)),
    fetchServices: () => dispatch(fetchServices()),
});


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CalendarPage));

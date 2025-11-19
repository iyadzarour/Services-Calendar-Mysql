import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, List, Modal, Popconfirm, Row, Select, Space, Spin, Tabs, Tag, Upload, message } from 'antd';
import React from 'react';
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { Appointment, AppointmentStatus, Attachment, Calendar, Contact, ControlPoints, ControlPointsValues, ExtendedAppointment, TimeSlotsForm } from '../Schema';
import { RootState } from '../redux/store';
import { selectProfile, selectSelectorTimeslots, selectSelectorTimeslotsLoading, selectUpdateAppointmentLoading } from '../redux/selectors';
import { fetchContactById, updateAppointmentRequest, deleteAppointmentRequest, fetchTimeSlots } from '../redux/actions';
import { FILES_STORE } from '../redux/network/api';
import { download, upload } from '../utils';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { withTranslation } from 'react-i18next';
import i18n from "../locales/i18n";

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

const { Option } = Select;

interface CalendarEvent extends ExtendedAppointment {
    title: string;
    start: Date;
    end: Date;
}

interface IModalProps {
    visible: boolean;
    updateLoading: boolean;
    selectedEvent: CalendarEvent | null;
    onClose: () => void;
    onSave: () => void;
    updateAppointmentRequest: (
        id: string,
        appointment: Appointment
    ) => Promise<any>;
    deleteAppointmentRequest: (
        id: string,
    ) => Promise<any>;
    fetchTimeSlots: (form: TimeSlotsForm, selector: boolean) => Promise<any>;
    calendars?: Calendar[];
    isContact?: boolean;
    disabled?: boolean;
    profile?: any;
    timeslots: {
        start: string;
        end: string;
        calendar_id: string;
        employee_name: string;
    }[];
    timeslotsLoading: boolean;
}

interface IModalState {
    employee_remarks?: string;
    ended_at?: Date;
    updated_date?: Dayjs | null;
    new_time_slot?: string;
    savedFileList: Attachment[],
    calendarId: string;
    uploading: boolean,
    contact: Contact | null,
    contactLoading: boolean,
    controlPoints: ControlPoints[]
}

class AppointmentDetailsModal extends React.Component<IModalProps, IModalState> {
    constructor(props: IModalProps) {
        super(props);
        this.state = {
            savedFileList: [],
            uploading: false,
            contact: null,
            contactLoading: true,
            calendarId: props.selectedEvent?.calendar_id || "",
            controlPoints: props.selectedEvent?.control_points || []
        };
    }


    fetchContactData = async () => {
        this.setState({ contactLoading: true });
        const { selectedEvent } = this.props;
        // @ts-ignore
        const contact_id = selectedEvent.contact_id;

        const contact = await fetchContactById(contact_id!);

        if (selectedEvent)
            this.setState({
                employee_remarks: selectedEvent.employee_remarks || '',
                ended_at: selectedEvent.ended_at ? dayjs(selectedEvent.ended_at).toDate() : undefined,
                savedFileList: selectedEvent.employee_attachments?.length ? selectedEvent.employee_attachments : [],
                contact,
                contactLoading: false
            })
    }

    componentDidMount(): void {
        this.fetchContactData();
    }

    componentDidUpdate(prevProps: IModalProps, prevState: IModalState) {
        const { updated_date } = this.state;
        if (prevState.updated_date !== updated_date) {
            this.fetchTimeslots();
        }
    }


    fetchTimeslots = async () => {
        const { updated_date } = this.state;
        try {
            if (updated_date)
                this.props.fetchTimeSlots({ date: updated_date.toISOString() }, true)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    formatTime = (time: string) => {
        const date = new Date(time);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    renderEventModal = () => {
        const { contact } = this.state;
        const { selectedEvent } = this.props

        const onClose = () => {
            this.props.onClose();
        }

        const onDelete = () => {
            this.props.deleteAppointmentRequest(selectedEvent?._id!).then((data) => {
                if (data.status && data.status === "success") {
                    message.success(i18n.t('successfully_deleted_the_appointment'));
                    onClose();
                } else {
                    message.error(i18n.t('something_went_wrong_please_try_again'));
                }
            });
        }

        const onSave = () => {
            // @ts-ignore
            const { _id, createdAt, updatedAt, service, title, start, end, sourceResource, resourceId, ...propsToUpdate } = selectedEvent!
            const { savedFileList, employee_remarks, ended_at, calendarId, new_time_slot, updated_date } = this.state;

            let startDate = null;
            let endDate = null;
            if (new_time_slot) {
                const [startTime, endTime] = (new_time_slot || "").split(" - ");

                const valueISOString = updated_date!.toISOString();
                const offsetMinutes = updated_date!.utcOffset();
                const adjustedISOString = dayjs(valueISOString).add(offsetMinutes, 'minutes').toISOString();
                const startDateTimeString = `${adjustedISOString.slice(0, 10)}T${startTime}:00.000Z`;
                const endDateTimeString = `${adjustedISOString.slice(0, 10)}T${endTime}:00.000Z`;

                startDate = new Date(startDateTimeString);
                endDate = new Date(endDateTimeString);
            }

            this.props
                .updateAppointmentRequest(selectedEvent?._id!, {
                    ...propsToUpdate,
                    ...{
                        employee_remarks: employee_remarks ?? undefined,
                        ended_at: ended_at ? ended_at?.toISOString() : undefined,
                        employee_attachments: savedFileList,
                        calendar_id: calendarId,
                        control_points: this.state.controlPoints,
                    },
                    ...{
                        ...(startDate && endDate ? {
                            start_date: startDate!.toISOString(),
                            end_date: endDate!.toISOString(),
                        } : {})
                    }
                })
                .then((data) => {
                    if (data._id) {
                        message.success(i18n.t('successfully_updated_the_appointment'));
                        this.props.onSave();
                    } else {
                        message.error(i18n.t('something_went_wrong_please_try_again'));
                    }
                });
        };



        const requestAttachments = () => {
            return (
                <>
                    <List
                        dataSource={selectedEvent?.attachments || []}
                        renderItem={(item) => (
                            <List.Item>
                                <Row>
                                    <Col span={24}>
                                        <div className="flex flex-col">
                                            <img src={FILES_STORE + item.url} width={'100%'} alt='download-icon' className="object-contain" height={250} />
                                            <Button
                                                className="self-start"
                                                type="link"
                                                onClick={() => download(item.title)}
                                            >
                                                {i18n.t('download')}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                    />
                </>
            )
        }

        const renderEmployeeActions = () => {
            const { savedFileList, uploading } = this.state;

            const setSavedFileList = (files: Attachment[]) => {
                this.setState({
                    savedFileList: files
                })
            }

            const setUploading = (uploading: boolean) => {
                this.setState({
                    uploading: uploading
                })
            }

            const removeAttachment = (file: string) => {
                let filteredFiles = this.state.savedFileList.filter((fileUrl) => fileUrl.title !== file);
                setSavedFileList(filteredFiles);
            }

            return (
                <>
                    <Row className="mb-6">
                        <Col md={8} xs={24} className="w-full">
                            <span>{i18n.t('employee_remarks')}</span>
                        </Col>
                        <Col md={16} xs={24}>
                            <TextArea
                                disabled={this.props.isContact}
                                onChange={(e) => {
                                    this.setState({ employee_remarks: e.target.value });
                                }}
                                value={this.state.employee_remarks}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-6">
                        <Col md={8} xs={24} className="w-full">
                            <span>{i18n.t('ended_at')}</span>
                        </Col>
                        <Col md={16} xs={24}>
                            <DatePicker
                                onChange={(value) => {
                                    this.setState({ ended_at: dayjs(value).toDate() });
                                }}
                                format={"YYYY-MM-DD HH:mm"}
                                showTime
                                disabledDate={(current) =>
                                    current && current.isAfter(dayjs(), "day")
                                }
                                disabled={this.props.isContact}
                                value={this.state.ended_at ? dayjs(this.state.ended_at) : null}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16} wrap={false}>
                        <Col md={24} xs={24}>
                            <Form.Item>
                                <Upload.Dragger
                                    accept=".jpeg,.jpg,.png"
                                    name="attachments"
                                    listType="picture"
                                    disabled={this.props.isContact}
                                    fileList={[
                                        ...savedFileList.map((a, i) => ({
                                            uid: i + "",
                                            name: a.title,
                                            status: "done",
                                            url: FILES_STORE + a.url,
                                        })),
                                        ...(uploading
                                            ? [
                                                {
                                                    uid: savedFileList.length + "",
                                                    name: "",
                                                    status: "uploading",
                                                    url: "",
                                                },
                                            ]
                                            : []),
                                    ] as any}
                                    onRemove={(file) => removeAttachment(file.name)}
                                    customRequest={async (data: any) => {
                                        setUploading(true);
                                        const res = await upload(data.file);
                                        const url = res.uri;
                                        setUploading(false);
                                        data.onSuccess(url);
                                        setSavedFileList([...savedFileList, { url, title: data.file.name }]);
                                    }}>
                                    <Space size={14} align="center" className="m-0 items-center">
                                        <p className="upload-hint-label">
                                            {i18n.t('upload_a_photo_of_the_result_if_any')}
                                        </p>
                                    </Space>
                                </Upload.Dragger>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            )
        }

        const renderControlPoint = () => {
            const { controlPoints } = this.state;

            const handleChange = (value: ControlPointsValues, key: string) => {
                if (!controlPoints.find(item => item.title === key)) {
                    this.setState({
                        controlPoints: [
                            ...controlPoints,
                            {
                                title: key,
                                value
                            }
                        ]
                    });
                } else {
                    this.setState({
                        controlPoints: controlPoints.map((item) => {
                            if (item.title === key) {
                                return {
                                    ...item,
                                    value,
                                };
                            }
                            return item;
                        }),
                    });
                }
            };

            const checkListKeys = [
                "functional_check_of_the_gas_appliance",
                "burner_cleaned",
                "lamella_block_washed",
                "electrodes_renewed",
                "exhaust_gas_monitoring",
                "combustion_chamber_insulation",
                "inlet_pressure_of_the_expansion_vessel",
                "safety_valve",
                "quick_air_vent",
                "leaks",
                "exhaust_flap",
                "exhaust_pipes_condition_connection_direction",
                "heating_water_pressure",
                "gas_setting",
                "date_of_the_next_exhaust_gas_measurement",
                "flow_assurance",
                "condensing_boilers_condensation_water_siphon",
                "radiator_vented",
                "required_repairs_discussed_with_customer"
            ]

            const mapping = {
                1: i18n.t('in_order'),
                2: i18n.t('error'),
                3: i18n.t('does_not_apply')
            }

            return (
                <div>
                    {checkListKeys.map((key, index) => {
                        const existingItem = controlPoints.find(item => item.title === key);
                        const title = i18n.t(`${key}`);

                        return (
                            <div key={index} style={{ marginBottom: '10px' }}>
                                <Row>
                                    <Col md={16} xs={19}>
                                        <span>{title}</span>
                                    </Col>
                                    <Col md={8} xs={5} >
                                        {this.props.isContact ? <Input value={existingItem ? mapping[existingItem.value!] : ''} /> : <Select
                                            defaultValue={existingItem ? existingItem.value : undefined}
                                            onChange={(value) => handleChange(value, key!)}
                                            className='w-full'
                                        >
                                            <Option value={ControlPointsValues.IN_ORDER}>
                                                <Space>
                                                    <CheckCircleOutlined />
                                                    {i18n.t('in_order')}
                                                </Space>
                                            </Option>
                                            <Option value={ControlPointsValues.ERROR}>
                                                <Space>
                                                    <CloseCircleOutlined />
                                                    {i18n.t('error')}
                                                </Space>
                                            </Option>
                                            <Option value={ControlPointsValues.DOES_NOT_APPLY}>
                                                <Space>
                                                    <MinusCircleOutlined />
                                                    {i18n.t('does_not_apply')}
                                                </Space>
                                            </Option>
                                        </Select>}
                                    </Col>
                                </Row>
                            </div>
                        );
                    })}
                </div>
            )
        }

        const appointmentOverview = () => {
            const { contactLoading } = this.state;
            const startDateTime = dayjs(selectedEvent?.start_date);
            const endDateTime = dayjs(selectedEvent?.end_date);

            const offsetMinutes = startDateTime.utcOffset();

            const formattedTime =
                startDateTime.subtract(offsetMinutes, 'minute').format("HH:mm A") +
                " - " +
                endDateTime.subtract(offsetMinutes, 'minute').format("HH:mm A");

            const onCancelAppointment = () => {
                // @ts-ignore
                const { _id, createdAt, updatedAt, service, title, start, end, sourceResource, resourceId, ...propsToUpdate } = selectedEvent!
                this.props
                    .updateAppointmentRequest(selectedEvent?._id!, {
                        ...propsToUpdate,
                        appointment_status: AppointmentStatus.Cancelled,
                        updated_by: this.props.profile?.role
                    })
                    .then((data) => {
                        if (data._id) {
                            message.success(i18n.t('successfully_cancelled_the_appointment'));
                            this.props.onSave();
                        } else {
                            message.error(i18n.t('something_went_wrong_please_try_again'));
                        }
                    });
            };


            return (
                <Spin spinning={contactLoading}>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col md={12} xs={24} className="w-full">
                            <label>{i18n.t('performance')}</label>
                            <Input value={selectedEvent?.title} />
                        </Col>
                        <Col md={12} xs={24}>
                            <label>{i18n.t('time')}</label>
                            <Input value={formattedTime} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col md={8} xs={24} className="w-full">
                            <label>{i18n.t('salutation')}</label>
                            <Input value={contact?.salutation} />
                        </Col>
                        <Col md={8} xs={24}>
                            <label>{i18n.t('name')}</label>
                            <Input value={contact?.first_name + " " + contact?.last_name} />
                        </Col>
                        <Col md={8} xs={24}>
                            <label>{i18n.t('telephone')}</label>
                            <Input value={contact?.telephone} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col md={8} xs={24} className="w-full">
                            <label>{i18n.t('address')}</label>
                            <Input value={contact?.address} />
                        </Col>
                        <Col md={8} xs={24}>
                            <label>{i18n.t('zip_code')}</label>
                            <Input value={contact?.zip_code} />
                        </Col>
                        <Col md={8} xs={24}>
                            <label>{i18n.t('location')}</label>
                            <Input value={contact?.location} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col md={12} xs={24} className="w-full">
                            <label>{i18n.t('email')}</label>
                            <Input value={contact?.email} />
                        </Col>
                        <Col md={12} xs={24}>
                            <label>{i18n.t('brand_of_device')}</label>
                            <Input value={selectedEvent?.brand_of_device} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col md={12} xs={24} className="w-full">
                            <label>{i18n.t('device_model')}</label>
                            <Input value={selectedEvent?.model} />
                        </Col>
                        <Col md={12} xs={24}>
                            <label>{i18n.t('year')}</label>
                            <Input value={selectedEvent?.year} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={24} className="w-full">
                            <label>{i18n.t('customer_remarks')}</label>
                            <TextArea value={selectedEvent?.remarks} />
                        </Col>
                    </Row>
                    {!this.props.isContact ? <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={24} className="w-full">
                            <label>{i18n.t('company_remarks')}</label>
                            <TextArea value={selectedEvent?.company_remarks} />
                        </Col>
                    </Row> : null}
                    {!this.props.isContact ? <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={24} className="w-full">
                            <label>{i18n.t('employee')}</label>
                            <Input value={selectedEvent?.created_by} />
                        </Col>
                    </Row> : null}
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.exhaust_gas_measurement} >
                            {i18n.t('exhaust_gas_measurement')}
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.has_bgas_before} >
                            {i18n.t('has_bgas_before')}
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.has_maintenance_agreement} >
                            {i18n.t('has_maintenance_agreement')}
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        {selectedEvent?.appointment_status === AppointmentStatus.Cancelled ?
                            <Tag color='red' >{i18n.t('this_appointment_has_been_canceled')}</Tag> : this.props.disabled ? null : (
                                <>
                                    <Popconfirm
                                        title={i18n.t('cancel_this_appointment')}
                                        description={i18n.t('are_you_sure_you_want_to_cancel_this_appointment')}
                                        okText={i18n.t('cancel_it')}
                                        cancelText={i18n.t('no')}
                                        okButtonProps={{
                                            danger: true,
                                        }}
                                        onConfirm={() => onCancelAppointment()}
                                    >
                                        <Button type="default" danger>{i18n.t('cancel_appointment')}</Button>
                                    </Popconfirm>
                                </>
                            )}
                    </Row>
                    <Row>
                        {contact?.contract_link ? (
                            <a href={FILES_STORE + contact?.contract_link} target='_blank' download="downloaded_file.pdf" rel="noreferrer">
                                {i18n.t('view_contract')}
                            </a>
                        ) : (
                            null
                        )}
                    </Row>
                </Spin>
            )
        }

        const renderAssignedCalendar = () => {
            const { calendarId, new_time_slot } = this.state;

            const onSelectCalendar = (value: any) => {
                this.setState({ calendarId: value })
            }

            const onSelectNewTimeSlot = (value: any) => {
                this.setState({ new_time_slot: value })
            }

            const formattedSlots: { slot: string, calendar_id: string, employee_name: string }[] = [...this.props.timeslots]
                .filter((slot) => slot.calendar_id === calendarId)
                .sort((a, b) => a.start.localeCompare(b.start))
                .reduce((result: { slot: string, calendar_id: string, employee_name: string }[], slot) => {
                    const formattedStart = this.formatTime(slot.start);
                    const formattedEnd = this.formatTime(slot.end);
                    const formattedSlot = `${formattedStart} - ${formattedEnd}`;
                    const slots: string[] = []

                    // Add to result if not already present
                    if (!slots.includes(formattedSlot)) {
                        slots.push(formattedSlot);
                        result.push({ slot: formattedSlot, calendar_id: slot.calendar_id, employee_name: slot.employee_name })
                    }

                    return result;
                }, []);


            return (
                <Row>
                    <Col span={24}>
                        <label>{i18n.t('calendar')}</label>
                        <Select className="w-full mt-3 mb-6" value={calendarId} onChange={(value) => {
                            onSelectCalendar(value)
                        }}>
                            {this.props.calendars?.map((calendar) => {
                                return (
                                    <Option key={calendar._id} value={calendar._id}>{calendar.employee_name}</Option>
                                )
                            })}
                        </Select>
                    </Col>
                    <Col span={24}>
                        <label>{i18n.t('change_date')}</label>
                        <DatePicker
                            className="w-full mt-3 mb-6"
                            onChange={(value) => {
                                this.setState({ updated_date: dayjs(value) });
                            }}
                            format={"YYYY-MM-DD"}
                            disabledDate={(current) =>
                                current && current.isBefore(dayjs(), "day")
                            }
                            value={this.state.updated_date ? dayjs(this.state.updated_date) : null}
                        />
                    </Col>
                    <Col span={24}>
                        <label>{i18n.t('calendar')}</label>
                        <Select className="w-full mt-3 mb-6" loading={this.props.timeslotsLoading} value={new_time_slot} onChange={(value) => {
                            onSelectNewTimeSlot(value)
                        }}>
                            {formattedSlots?.map((calendar) => {
                                return (
                                    <Option key={calendar.slot} value={calendar.slot}>{calendar.slot}</Option>
                                )
                            })}
                        </Select>
                    </Col>
                </Row>
            )
        }

        return (
            <Modal
                title={i18n.t('appointment_details')}
                open={this.props.visible}
                centered
                footer={() => {
                    return this.props.disabled || selectedEvent?.appointment_status === AppointmentStatus.Cancelled ? null : (
                        <>
                            <Button onClick={onClose}>{i18n.t('cancel')}</Button>
                            <Button type="primary" onClick={onSave}>{i18n.t('save')}</Button>
                            {this.props.profile && ["user", "admin"].includes(this.props.profile?.role) ? (
                                <>
                                    <Button type="primary" danger onClick={onDelete}>{i18n.t('delete')}</Button>
                                </>
                            ) : null}
                        </>
                    )
                }}
                closable={true}
                onCancel={() => onClose()}
                confirmLoading={this.props.updateLoading}
                width={800}
            >
                <Divider />
                <Tabs
                    defaultActiveKey="1"
                    // @ts-ignore
                    items={[
                        {
                            key: "1",
                            label: i18n.t('appointment_overview'),
                            children: appointmentOverview(),
                        },
                        {
                            key: "2",
                            label: i18n.t('request_attachments'),
                            children: requestAttachments(),
                        },
                        {
                            key: "3",
                            label: i18n.t('notes_files'),
                            children: renderEmployeeActions(),
                        },
                        {
                            key: "4",
                            label: i18n.t('control_point'),
                            children: renderControlPoint(),
                        },
                        this.props.calendars ? {
                            key: "5",
                            label: i18n.t('calendar'),
                            children: renderAssignedCalendar(),
                        } : null
                    ].filter(Boolean)}
                />
            </Modal>
        )
    }

    render() {
        const { visible } = this.props;
        return (
            <>
                {visible && this.renderEventModal()}
            </>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    updateLoading: selectUpdateAppointmentLoading(state),
    profile: selectProfile(state),
    timeslots: selectSelectorTimeslots(state),
    timeslotsLoading: selectSelectorTimeslotsLoading(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateAppointmentRequest: (id: string, appointment: Appointment) =>
        dispatch(updateAppointmentRequest(id, appointment)),
    deleteAppointmentRequest: (id: string) => dispatch(deleteAppointmentRequest(id)),
    fetchTimeSlots: (form: TimeSlotsForm, selector: boolean) => dispatch(fetchTimeSlots(form.date, form.category_id, form.service_id, selector)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AppointmentDetailsModal))

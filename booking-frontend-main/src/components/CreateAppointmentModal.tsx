import { Button, Card, Checkbox, Col, Divider, Form, Input, Modal, Row, Select, Space, Tabs, Upload, message } from 'antd';
import React from 'react';
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { Appointment, AppointmentStatus, Attachment, Calendar, Contact, ExtendedService, PaginatedForm } from '../Schema';
import { RootState } from '../redux/store';
import { selectAddAppointmentLoading, selectServices, selectServicesLoading } from '../redux/selectors';
import { addAppointmentRequest, fetchServices, fetchContacts, fetchLocationAwareTimeSlots } from '../redux/actions';
import { FILES_STORE } from '../redux/network/api';
import { generatePassword, upload } from '../utils';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { withTranslation } from 'react-i18next';
import i18n from "../locales/i18n";
import _ from 'lodash';

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

const { Option } = Select;


interface IModalProps {
    visible: boolean;
    loading: boolean;
    selectedSlot: any;
    onClose: () => void;
    onSave: () => void;
    addAppointmentRequest: (
        appointment: Appointment
    ) => Promise<any>;
    fetchServices: () => Promise<void>;
    fetchContacts: (form: PaginatedForm) => Promise<any>;
    fetchLocationAwareTimeSlots: (date: string, calendarId: string, customerDistrict: number) => Promise<any>;
    calendars: Calendar[];
    services: ExtendedService[];
    servicesLoading: boolean;
}

interface IModalState {
    savedFileList: Attachment[],
    calendarId: string;
    uploading: boolean,
    contact: Contact | null,
    serviceId: string | null;
    categoryId: string | null;
    options: any[];
    contacts: Contact[];
}

class CreateAppointmentModal extends React.Component<IModalProps, IModalState> {
    constructor(props: IModalProps) {
        super(props);
        this.state = {
            savedFileList: [],
            uploading: false,
            contact: null,
            calendarId: props.selectedSlot?.resourceId || "",
            serviceId: null,
            categoryId: null,
            options: [],
            contacts: [],
        };
    }

    formRef = React.createRef<any>();

    fetchData = () => {
        this.props.fetchServices();
    };

    componentDidMount() {
        this.fetchData();
    }

    fetchContact = async (search: string) => {
        if (!search) {
            return [];
        }
        return this.props.fetchContacts({ page: 1, limit: 1000000, search }).then((res) => {
            return res.data;
        });
    };

    onFinishFrom = () => {
        if (this.formRef.current) {
            this.formRef.current.submit();
        }
    };

    renderEventModal = () => {
        const { selectedSlot } = this.props

        const onFinish = (values: any) => {
            const { categoryId, serviceId, savedFileList, calendarId } = this.state;

            const startDate = new Date(selectedSlot.start.getTime() - (selectedSlot.start.getTimezoneOffset() * 60000)).toISOString();
            const endDate = new Date(selectedSlot.end.getTime() - (selectedSlot.end.getTimezoneOffset() * 60000)).toISOString();

            const contact: Contact = {
                salutation: values.salutation,
                first_name: values.first_name,
                last_name: values.last_name,
                address: values.address,
                zip_code: values.zip_code,
                location: values.location,
                telephone: values.telephone,
                email: values.email,
                password: generatePassword()
            };

            const appointment: Appointment = {
                category_id: categoryId!,
                service_id: serviceId!,
                calendar_id: calendarId!,
                start_date: startDate,
                end_date: endDate,
                contact: contact,
                brand_of_device: values.brand_of_device,
                model: values.model,
                exhaust_gas_measurement: Boolean(values.exhaust_gas_measurement),
                has_maintenance_agreement: Boolean(values.has_maintenance_agreement),
                has_bgas_before: Boolean(values.has_bgas_before),
                year: values.year,
                appointment_status: AppointmentStatus.Confirmed,
                attachments: savedFileList.length ? savedFileList : undefined,
                remarks: values.remarks || undefined,
                company_remarks: values.company_remarks || undefined,
                created_by: values.created_by || undefined
            }


            this.props.addAppointmentRequest(appointment)
                .then(data => {
                    if (data && data._id) {
                        message.success(i18n.t('successfully_booked_the_appointment'));
                        this.setState({
                            categoryId: null,
                            serviceId: null
                        });
                        this.props.onSave();
                    } else {
                        message.error(i18n.t('something_went_wrong_while_booking_the_appointment'))
                    }
                })
                .catch(() => {
                    message.error(i18n.t('something_went_wrong_while_booking_the_appointment'))
                });
        };

        const appointmentOverview = () => {
            const { savedFileList, uploading } = this.state;
            const currentYear = new Date().getFullYear();
            const years = Array.from(
                { length: currentYear - 2003 },
                (_, index) => currentYear - index
            ).map(String);
            const { services, servicesLoading } = this.props;


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
                <Card bordered={false}>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={12} className="w-full">
                            <label>{i18n.t('performance')}</label>
                            <Select loading={servicesLoading} className="w-full" onChange={(value: string, option: any) => {
                                this.setState({ serviceId: value, categoryId: option.key.split("/")[0] })
                            }}>
                                {services.map((service) => (
                                    <Option key={service.category_id + "/" + service._id} value={service._id}>
                                        {service.name + " (" + service.abbreviation_id + ")"}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={12}>
                            <label>{i18n.t('time')}</label>
                            <Input value={dayjs(selectedSlot?.start).format("HH:mm A") + " - " + dayjs(selectedSlot?.end).format("HH:mm A")} />
                        </Col>
                    </Row>

                    <Form
                        ref={this.formRef}
                        name="contactForm"
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={i18n.t('email')} name="email" rules={[{ required: true, type: 'email' }]}>
                                    <Select
                                        showSearch
                                        placeholder={i18n.t('select_or_input')}
                                        optionFilterProp="children"
                                        onSearch={_.debounce((searchValue) => {
                                            this.fetchContact(searchValue).then((contacts: Contact[]) => {
                                                const options = (contacts.length > 0 ? contacts : [{
                                                    email: searchValue,
                                                    first_name: '',
                                                    last_name: '',
                                                    address: '',
                                                    zip_code: '',
                                                    location: '',
                                                    telephone: '',
                                                    salutation: '',
                                                }]).map((contact: Contact) => ({
                                                    value: contact.email,
                                                    text: contact.first_name || contact.last_name ? `${contact.first_name} ${contact.last_name} (${contact.email})` : contact.email,
                                                    ...contact,
                                                }));
                                                console.log(options);
                                                this.setState({ options, contacts });
                                            });
                                        }, 300)}
                                        onSelect={(value, opt) => {
                                            const contact = this.state.contacts.find((contact) => contact.email === value);
                                            if (contact) {
                                                this.formRef.current.setFieldsValue({
                                                    email: value,
                                                    first_name: contact.first_name,
                                                    last_name: contact.last_name,
                                                    address: contact.address,
                                                    zip_code: contact.zip_code,
                                                    location: contact.location,
                                                    telephone: contact.telephone,
                                                    salutation: contact.salutation,
                                                });
                                                this.setState({ contact });

                                                // Fetch location-aware time slots when a contact is selected
                                                if (this.props.selectedSlot && contact.district) {
                                                    this.props.fetchLocationAwareTimeSlots(
                                                        this.props.selectedSlot.start.toISOString(),
                                                        this.props.selectedSlot.resourceId,
                                                        contact.district
                                                    );
                                                }
                                            } else {
                                                this.formRef.current.setFieldsValue({
                                                    email: value,
                                                    first_name: '',
                                                    last_name: '',
                                                    address: '',
                                                    zip_code: '',
                                                    location: '',
                                                    telephone: '',
                                                });
                                            }
                                        }}
                                        getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement as HTMLElement}
                                    >
                                        {this.state.options.map((option) => (
                                            <Option key={option.value} value={option.value}>
                                                {option.text}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label={i18n.t('salutation')} name="salutation" rules={[{ required: true }]}>
                                    <Select>
                                        {[
                                            { lable: i18n.t('mr'), value: i18n.t('mr') },
                                            { lable: i18n.t('mrs'), value: i18n.t('mrs') },
                                            { lable: i18n.t('company'), value: i18n.t('company') },
                                        ].map((el) => (
                                            <Option key={el.lable} value={el.value}>
                                                {el.lable}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={i18n.t('first_name')} name="first_name" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={i18n.t('last_name')} name="last_name" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label={i18n.t('address')} name="address" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={i18n.t('zip_code')} name="zip_code" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={i18n.t('location')} name="location" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={i18n.t('telephone')} name="telephone" rules={[{ required: true }]}>
                                    <Input type="tel" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={i18n.t('brand_of_device')} name="brand_of_device">
                                    <Select>
                                        {[i18n.t('baxi'), i18n.t('buderus'), i18n.t('de_dietrich'), i18n.t('to_give'), i18n.t('junkers'),
                                        i18n.t('praiseworthy'), i18n.t('nordgas'), i18n.t('orange'), i18n.t('rapido'),
                                        i18n.t('saunier_duval'), i18n.t('vaillant'), i18n.t('viessmann'), i18n.t('wolf'), i18n.t('other')].map((salutation) => (
                                            <Option key={salutation} value={salutation}>
                                                {salutation}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={i18n.t('device_model')} name="model">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={i18n.t('year')}
                                    name="year"
                                    rules={[
                                        {
                                            required: true,
                                            message: i18n.t('please_select_a_year'),
                                        },
                                    ]}
                                >
                                    <Select placeholder={i18n.t('select_a_year')}>
                                        {[i18n.t('last_year'), i18n.t('i_dont_know_anymore')].concat(years).map((year) => (
                                            <Option key={year} value={year}>
                                                {year}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={i18n.t('notes')} name="remarks">
                                    <Input.TextArea />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={i18n.t('company_remarks')} name="company_remarks">
                                    <Input.TextArea />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label={i18n.t('employee')} name="created_by" rules={[{ required: true }]}>
                            <Select>
                                {[{ lable: 'Daniela', value: 'Daniela' }, { lable: 'Sabina', value: 'Sabina' }, { lable: 'Sonia', value: 'Sonia' }].map((el) => (
                                    <Option key={el.lable} value={el.value}>
                                        {el.lable}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label={i18n.t('has_maintenance_agreement')} name="has_maintenance_agreement" rules={[{ required: true }]}>
                            <Select>
                                {[{ lable: i18n.t('no'), value: false }, { lable: i18n.t('Yes_the_prices_according_to_the_maintenance_agreement_apply'), value: true }].map((el) => (
                                    <Option key={el.lable} value={el.value}>
                                        {el.lable}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="exhaust_gas_measurement" valuePropName="checked">
                            <Checkbox>{i18n.t('exhaust_gas_measurement')}</Checkbox>
                        </Form.Item>
                        <Form.Item name="has_bgas_before" valuePropName="checked">
                            <Checkbox>{i18n.t('has_bgas_before')}</Checkbox>
                        </Form.Item>

                        <Row gutter={16} wrap={false}>
                            <Col span={24}>
                                <Form.Item>
                                    <Upload.Dragger
                                        accept=".jpeg,.jpg,.png"
                                        name="attachments"
                                        listType="picture"
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
                                        }}
                                    >
                                        <p className="upload-hint-label" style={{ margin: 0, textAlign: 'center' }}>
                                            {i18n.t('Take_upload_a_photo_of_the_device_name_plate_if_the_type_is_not_known')}
                                        </p>
                                    </Upload.Dragger>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16} justify={'end'}>
                            <Col>
                                <Button onClick={() => this.props.onClose()}>
                                    {i18n.t('cancel')}
                                </Button>
                            </Col>
                            <Col>
                                <Button type="primary" className='ml-2' htmlType="submit" loading={this.props.loading}>
                                    {i18n.t('submit')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            )
        }

        const renderAssignedCalendar = () => {
            const { calendarId } = this.state;

            const onSelectCalendar = (value: any) => {
                this.setState({ calendarId: value })
            }

            return (
                <Card bordered={false}>
                    <Row>
                        <Col span={24}>
                            <label>{i18n.t('calendar')}</label>
                            <Select className="w-full mt-3 mb-6" value={calendarId} onChange={(value) => {
                                onSelectCalendar(value)
                            }}>
                                {this.props.calendars.map((calendar) => {
                                    return (
                                        <Option key={calendar._id} value={calendar._id}>{calendar.employee_name}</Option>
                                    )
                                })}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={16} justify={'end'}>
                        <Col>
                            <Button onClick={() => this.props.onClose()} loading={this.props.loading}>
                                {i18n.t('cancel')}
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" className='ml-2' onClick={() => {
                                if (this.formRef.current) {
                                    this.formRef.current.submit();
                                }
                            }} loading={this.props.loading}>
                                {i18n.t('submit')}
                            </Button>
                        </Col>
                    </Row>
                </Card>

            )
        }

        return (
            <Modal
                title={i18n.t('appointment_details')}
                open={this.props.visible}
                centered
                closable={false}
                footer={() => null}
                confirmLoading={this.props.loading}
                width={800}
            >
                <Divider />
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: "1",
                            label: i18n.t('appointment_overview'),
                            children: appointmentOverview(),
                        },
                        {
                            key: "2",
                            label: i18n.t('calendar'),
                            children: renderAssignedCalendar(),
                        }
                    ]}
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
    loading: selectAddAppointmentLoading(state),
    services: selectServices(state),
    servicesLoading: selectServicesLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    addAppointmentRequest: (appointment: Appointment) =>
        dispatch(addAppointmentRequest(appointment)),
    fetchServices: () => dispatch(fetchServices()),
    fetchContacts: (form: PaginatedForm) => dispatch(fetchContacts(form)),
    fetchLocationAwareTimeSlots: (date: string, calendarId: string, customerDistrict: number) => dispatch(fetchLocationAwareTimeSlots(date, calendarId, customerDistrict)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CreateAppointmentModal))

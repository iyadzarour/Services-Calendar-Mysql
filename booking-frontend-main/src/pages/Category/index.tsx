import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchCategories, fetchTimeSlots, addAppointmentRequest, updateProfileRequest, fetchLocationAwareTimeSlots } from "../../redux/actions";
import { selectCategories, selectCategoriesLoading, selectLoggedIn, selectProfile, selectTimeslots, selectTimeslotsLoading } from "../../redux/selectors";
import { Appointment, AppointmentStatus, Attachment, Category, Contact, Service } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Content } from "antd/es/layout/layout";
import { Row, Col, Card, Collapse, Steps, Calendar, Button, Spin, Form, Input, Select, Checkbox, message, Upload, Space } from "antd";

import SignaturePad from 'react-signature-canvas'
import ServiceLogo from '../../assets/services/service.png'
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import Header from "../../components/Header";
import { FILES_STORE } from "../../redux/network/api";
import { generatePassword, upload } from "../../utils";
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import './index.css';

const { Option } = Select;

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

interface ICategoryState {
    selectedCategory: string | null;
    selectedService: Service | null;
    selectedSlot: { slot: string, calendar_id: string, start?: string, end?: string } | null;
    currentDate: Dayjs | null;
    is_new_user: boolean;
    sign: any;
    selectedDevices: string[],
    url: any;
    current: number;
    savedFileList: Attachment[],
    uploading: boolean,
}

interface ICategoryProps {
    categories: Category[];
    loading: boolean;
    timeslots: {
        start: string;
        end: string;
        calendar_id: string;
        is_optimal?: boolean;
        distanceKm?: number;
    }[];
    timeslotsLoading: boolean;
    fetchCategories: () => Promise<any>;
    fetchTimeSlots: (date: string, categoryId: string, serviceId: string) => Promise<any>;
    fetchLocationAwareTimeSlots: (date: string, calendarId: string, customerDistrict: number | Contact) => Promise<any>;
    onSubmit: (appointment: Appointment) => Promise<any>;
    updateProfileRequest: (profile: any) => Promise<any>;
    loggedIn: boolean;
    profile: any;
}

class CategoryPage extends React.Component<ICategoryProps, ICategoryState> {
    sigPad: React.RefObject<SignaturePad>;
    formRef = React.createRef<any>();

    constructor(props: ICategoryProps) {
        super(props);
        this.state = {
            selectedCategory: null,
            selectedService: null,
            selectedSlot: null,
            currentDate: null,
            selectedDevices: [],
            sign: '',
            url: null,
            is_new_user: false,
            current: 0,
            savedFileList: [],
            uploading: false,
        };
        this.sigPad = React.createRef<SignaturePad>();
    }

    devicesMap = [
        `Heizwert-Gerät € 197`,
        `Brennwert-Gerät* € 262`,
        `Durchlauferhitzer.€ 173`,
        `Gaskonvektor € 153`,
        `BW-wärmepumpe € 350`,
        `Luft-Wärmepumpe € 350`,
      ];
    
      clear = () => {
        if (this.sigPad.current) {
          this.sigPad.current.clear();
        }
      };
    
      handleSelectChange = (event: any) => {
        this.setState({
          is_new_user: event === "new_user" ? true : false,
        });
      };
    
      handleDeviceClick = (e: any) => {
        const checked =
          this.state.selectedDevices.some((device) => {
            return device === e.target.value;
          });
        if (checked) {
          const filterdArray = this.state.selectedDevices.filter((device) => {
            return device !== e.target.value;
          });
          this.setState({
            selectedDevices: filterdArray,
          });
        } else {
          this.setState({
            selectedDevices: [...this.state.selectedDevices, e.target.value],
          });
        }
      };
      setUrl = (url: string) => {
        this.setState({
          sign: url,
        });
      };
      handleClear = () => {
        if (this.state.sign) {
          this.setState({
            sign: null,
          });
        }
      };
      handleGenerate = async () => {
        console.log(this.state.sign);
      };

    onFinish = async (values: any) => {
        const { selectedCategory, selectedService, selectedSlot, currentDate, savedFileList } = this.state;
        
        // Use the actual start and end from timeslots if available, otherwise build from slot string
        let startDate: Date;
        let endDate: Date;
        
        if (selectedSlot?.start && selectedSlot?.end) {
            // Use the actual ISO strings from backend timeslots
            startDate = new Date(selectedSlot.start);
            endDate = new Date(selectedSlot.end);
            
            // Ensure start_date is not in the past (add small buffer for clock drift)
            const now = new Date();
            const minStartDate = new Date(now.getTime() - 5 * 60000); // 5 minutes tolerance
            if (startDate < minStartDate) {
                console.error('Selected start_date is in the past:', {
                    startDate: startDate.toISOString(),
                    now: now.toISOString(),
                    minStartDate: minStartDate.toISOString(),
                    selectedSlot
                });
                message.error(i18n.t('selected_time_slot_is_in_the_past') || 'The selected time slot is in the past. Please select a future time slot.');
                return;
            }
        } else {
            // Log warning if start/end are missing
            console.warn('selectedSlot missing start/end, using fallback:', {
                selectedSlot,
                hasStart: !!selectedSlot?.start,
                hasEnd: !!selectedSlot?.end
            });
            
            // Fallback: build from slot string (should not happen if timeslots are properly stored)
            const [startTime, endTime] = (selectedSlot?.slot || "").split(" - ");
            const [startHours, startMinutes] = startTime.split(':').map(Number);
            const [endHours, endMinutes] = endTime.split(':').map(Number);
            const selectedDate = dayjs(currentDate).startOf('day');
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const startDateTimeString = `${dateStr}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00.000Z`;
            const endDateTimeString = `${dateStr}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00.000Z`;
            startDate = new Date(startDateTimeString);
            endDate = new Date(endDateTimeString);
            
            // Ensure start_date is not in the past (add small buffer for clock drift)
            const now = new Date();
            const minStartDate = new Date(now.getTime() - 5 * 60000); // 5 minutes tolerance
            if (startDate < minStartDate) {
                console.error('Calculated start_date is in the past:', startDate.toISOString(), 'Current:', now.toISOString());
                message.error(i18n.t('selected_time_slot_is_in_the_past') || 'The selected time slot is in the past. Please select a future time slot.');
                return;
            }
        }

        const contact: Contact = {
            sign_url: this.sigPad!.current?.getTrimmedCanvas().toDataURL("image/png"),
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
            category_id: selectedCategory!,
            service_id: selectedService?._id!,
            calendar_id: selectedSlot?.calendar_id!,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
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
            selected_devices: this.state.selectedDevices.join(" - ").toString() || undefined,
        }

        this.props.onSubmit(appointment)
            .then(data => {
                if (data && data._id) {
                    message.success(i18n.t('successfully_booked_the_appointment'));
                    this.setState({
                        selectedCategory: null,
                        selectedService: null,
                        selectedSlot: null,
                        is_new_user: false,
                        currentDate:
                            dayjs().day() === 0
                                ? dayjs().add(1, "day").startOf("day")
                                : dayjs().day() === 6
                                    ? dayjs().add(2, "day").startOf("day")
                                    : dayjs(),
                        current: 0
                    });
                    this.props.updateProfileRequest(data.contact);
                } else {
                    message.error(i18n.t('something_went_wrong_while_booking_the_appointment'))
                }
            })
            .catch(() => {
                message.error(i18n.t('something_went_wrong_while_booking_the_appointment'))
            });
    };

    componentDidMount() {
        this.props.fetchCategories();
    }

    onChange = (value: number) => {
        if (value === 0) {
            this.setState({ current: value, selectedService: null, selectedCategory: null, currentDate: null });
        } else if (this.state.selectedService && value === 1) {
            this.setState({
                current: value, selectedSlot: null,
                currentDate: dayjs().day() === 0
                    ? dayjs().add(1, "day").startOf("day")
                    : dayjs().day() === 6
                        ? dayjs().add(2, "day").startOf("day")
                        : dayjs(),
            });
        }
    };



    fetchData = async () => {
        const { currentDate, selectedCategory, selectedService } = this.state;
        const contactDistrict = this.props.profile?.district; // Assuming profile has the district field

        try {
            if (currentDate && selectedCategory && selectedService?._id) {
                if (contactDistrict) {
                    // Fetch location-aware time slots if district is available
                    const profile = this.props.profile as Contact;
                    const district = profile?.district;
                    if (district) {
                        this.props.fetchLocationAwareTimeSlots(
                            currentDate.toISOString(),
                            selectedService?._id || '', // Assuming service ID is used as calendar ID for public booking
                            district
                        );
                    } else {
                        // Fallback to regular time slots
                        this.props.fetchTimeSlots(currentDate.toISOString(), selectedCategory, selectedService?._id);
                    }
                } else {
                    // Fallback to regular time slots
                    this.props.fetchTimeSlots(currentDate.toISOString(), selectedCategory, selectedService?._id);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    onSelectDate = (value: Dayjs, selectInfo: SelectInfo) => {
        const midnightValue = value.endOf('day');

        if (selectInfo.source === 'date') {
            this.setState({ currentDate: midnightValue })
        }
    };

    formatTime = (time: string) => {
        const date = new Date(time);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    disabledDate = (current: Dayjs) => {
        // Disable previous days and weekends (Saturday and Sunday)
        return current && (current.isBefore(dayjs(), 'day') || current.day() === 0 || current.day() === 6);
    };

    setSavedFileList = (files: Attachment[]) => {
        this.setState({
            savedFileList: files
        })
    }

    setUploading = (uploading: boolean) => {
        this.setState({
            uploading: uploading
        })
    }

    removeAttachment = (file: string) => {
        let filteredFiles = this.state.savedFileList.filter((fileUrl) => fileUrl.title !== file);
        this.setSavedFileList(filteredFiles);
    }

    componentDidUpdate(prevProps: ICategoryProps, prevState: ICategoryState) {
        const { currentDate, selectedCategory, selectedService } = this.state;

        if (prevState.currentDate !== currentDate
            || prevState.selectedCategory !== selectedCategory
            || prevState.selectedService !== selectedService) {
            this.fetchData();
        }
    }

    render() {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2003 }, (_, index) => currentYear - index).map(String);
        const initialValues = this.props.profile || undefined;

        const { categories, loading, timeslots, timeslotsLoading } = this.props;
        const { selectedService, selectedSlot, current, currentDate, savedFileList, uploading, is_new_user } = this.state;

        const formattedSlots: { slot: string, calendar_id: string, start?: string, end?: string, is_optimal?: boolean, distanceKm?: number }[] = timeslots.reduce((result: { slot: string, calendar_id: string, start?: string, end?: string, is_optimal?: boolean, distanceKm?: number }[], slot) => {
            const formattedStart = this.formatTime(slot.start);
            const formattedEnd = this.formatTime(slot.end);
            const formattedSlot = `${formattedStart} - ${formattedEnd}`;

            // Check if this exact slot (time + calendar) already exists
            const exists = result.some(r => r.slot === formattedSlot && r.calendar_id === slot.calendar_id);
            
            if (!exists) {
                result.push({ 
                    slot: formattedSlot,
                    start: slot.start,
                    end: slot.end,
                    calendar_id: slot.calendar_id,
                    is_optimal: slot.is_optimal,
                    distanceKm: slot.distanceKm
                });
            }

            return result;
        }, []);

        if (loading) {
            return <div>{i18n.t('loading')}...</div>;
        }

        return (
            <div className="category">
                <Content>
                    <Header />
                    <Row gutter={16}>
                        <Col xl={18} lg={16} xs={24}>
                            {current === 0 ? <Collapse 
                                defaultActiveKey={["0"]}
                                items={categories.map((el, index) => ({
                                    key: `${index}`,
                                    label: <span className="font-bold text-lg">{el.name}</span>,
                                    children: (
                                        <Row gutter={[16, 16]}>
                                            {el.services.map((service) => (
                                                <Col key={service._id} xs={24} sm={16} md={12} lg={12} xl={6}>
                                                    <Card
                                                        title={service.name}
                                                        onClick={() => {
                                                            this.setState({
                                                                selectedCategory: el._id!,
                                                                selectedService: service,
                                                                current: 1,
                                                                currentDate:
                                                                    dayjs().day() === 0
                                                                        ? dayjs().add(1, "day").startOf("day")
                                                                        : dayjs().day() === 6
                                                                            ? dayjs().add(2, "day").startOf("day")
                                                                            : dayjs(),
                                                            });
                                                        }}
                                                        className="border border-gray-400 hover:border-primary transition duration-300 transform hover:scale-105"
                                                    >
                                                        <div className="flex justify-center items-center">
                                                            <img src={service.attachment?.url ? FILES_STORE + service.attachment?.url : ServiceLogo} alt={service.name} className="mb-3" width={200} height={165} />
                                                        </div>
                                                        <p className="text-gray-600">{i18n.t('duration')}: {service.duration} {i18n.t('mins')}</p>
                                                        <p className="text-lg text-primary font-bold">{service.price} {i18n.t('eur')}</p>
                                                        <p className="text-sm">{service.description}</p>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )
                                }))}
                            /> : current === 1 ?
                                <Row gutter={16} justify={'space-around'}>
                                    <Col md={16} xs={24}>
                                        <Card className="border border-gray-300 w-full h-96 rounded-md">
                                            <Calendar
                                                className="hide-year-navigation"
                                                fullscreen={false}
                                                value={currentDate ? currentDate : dayjs()}
                                                onSelect={this.onSelectDate}
                                                disabledDate={this.disabledDate}
                                                onChange={(date) => this.setState({ currentDate: dayjs(date) })}
                                            />
                                        </Card>
                                    </Col>
                                    <Col md={8} xs={24}>
                                        <Spin spinning={timeslotsLoading}>
                                            <Card title={currentDate ? dayjs(currentDate).format('dddd DD-MM-YYYY') : ""} className="slots border border-gray-300 w-full h-96 rounded-md overflow-y-auto">
                                          {formattedSlots.map((el, index) => (
                                    <div
                                        key={`${el.slot}-${el.calendar_id}-${index}`}
                                        onClick={() => this.setState({ 
                                            selectedSlot: {
                                                slot: el.slot,
                                                calendar_id: el.calendar_id,
                                                start: el.start,
                                                end: el.end
                                            }, 
                                            current: 2 
                                        })}
                                        className={`p-4 m-3 flex items-center justify-around border rounded-md cursor-pointer ${el.is_optimal ? 'border-green-500 bg-green-100 hover:bg-green-200' : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        <span>{el.slot}</span>
                                        {el.is_optimal && <span className="text-green-600 font-bold">{i18n.t('optimal')}</span>}
                                        {el.distanceKm !== undefined && <span className="text-xs text-gray-500">{el.distanceKm} km</span>}
                                    </div>
                                ))}                       </Card>
                                        </Spin>
                                    </Col>
                                </Row>
                                :
                                <Card className="border border-gray-300" >
                                    <Form
                                        ref={this.formRef}
                                        name="contactForm"
                                        layout="vertical"
                                        onFinish={this.onFinish}
                                        initialValues={initialValues}
                                    >
                                        <Row gutter={16}>
                                            <Col md={8} xs={24}>
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
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('first_name')} name="first_name" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('last_name')} name="last_name" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('address')} name="address" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('zip_code')} name="zip_code" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('location')} name="location" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('telephone')} name="telephone" rules={[{ required: true }]}>
                                                    <Input type="tel" />
                                                </Form.Item>
                                            </Col>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('email')} name="email" rules={[{ required: true, type: 'email' }]}>
                                                    <Input disabled={initialValues && initialValues.email} />
                                                </Form.Item>
                                            </Col>
                                            <Col md={8} xs={24}>
                                                <Form.Item label={i18n.t('brand_of_device')} name="brand_of_device">
                                                    <Select>
                                                        {[i18n.t('baxi'), i18n.t('buderus'), i18n.t('de_dietrich'), i18n.t('to_give'), i18n.t('junkers'),
                                                        i18n.t('praiseworthy'), i18n.t('nordgas'), i18n.t('orange'), i18n.t('rapido'),
                                                        i18n.t('saunier_duval'), i18n.t('vaillant'), i18n.t('viessmann'), i18n.t('wolf'), i18n.t('other')].map((brand) => (
                                                            <Option key={brand} value={brand}>
                                                                {brand}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col md={12} xs={24}>
                                                <Form.Item label={i18n.t('device_model')} name="model">
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col md={12} xs={24}>
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
                                            <Col md={24} xs={24}>
                                                <Form.Item label={i18n.t('notes')} name="remarks">
                                                    <Input.TextArea />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item label={i18n.t('has_maintenance_agreement')} name="has_maintenance_agreement" rules={[{ required: true }]}>
                                            <Select onChange={this.handleSelectChange} >
                                                {[{ lable: i18n.t('no'), value: false }, { lable: i18n.t('Yes_the_prices_according_to_the_maintenance_agreement_apply'), value: true }
                                                    , ...(initialValues?.contract_link ? [] : [{ lable: i18n.t('new_user'), value: 'new_user' }])
                                                ].map((el) => (
                                                    <Option key={el.lable} value={el.value}>
                                                        {el.lable}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <div className='col-span-2 grid grid-cols-2 gap-y-0 gap-5'>
                                            {
                                                is_new_user && (this.devicesMap.map((c, index) => (
                                                    <Form.Item key={`device-${index}`}>
                                                        <Checkbox onClick={this.handleDeviceClick} value={c} checked={this.state.selectedDevices.includes(c)}>{c}</Checkbox>
                                                    </Form.Item>
                                                )))
                                            }
                                        </div>
                                        {is_new_user && (<Row gutter={16}>
                                            <Col md={24} xs={24}>
                                                <p>sign here </p>
                                                <SignaturePad
                                                    ref={this.sigPad}
                                                    canvasProps={{ className: 'w-full md:w-1/2 h-[200px] border-[.5px] border-solid border-[#0001]' }}
                                                />
                                            </Col></Row>
                                        )}
                                        <Form.Item name="exhaust_gas_measurement" valuePropName="checked">
                                            <Checkbox>{i18n.t('exhaust_gas_measurement')}</Checkbox>
                                        </Form.Item>
                                        <Form.Item name="has_bgas_before" valuePropName="checked">
                                            <Checkbox>{i18n.t('has_bgas_before')}</Checkbox>
                                        </Form.Item>

                                        <Row gutter={16} wrap={false}>
                                            <Col md={24}>
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
                                                        onRemove={(file) => this.removeAttachment(file.name)}
                                                        customRequest={async (data: any) => {
                                                            this.setUploading(true);
                                                            const res = await upload(data.file);
                                                            const url = res.uri;
                                                            this.setUploading(false);
                                                            data.onSuccess(url);
                                                            this.setSavedFileList([...savedFileList, { url, title: data.file.name }]);
                                                        }}>
                                                        <Space size={14} align="center" className="m-0">
                                                            <p className="upload-hint-label">
                                                                {i18n.t('Take_upload_a_photo_of_the_device_name_plate_if_the_type_is_not_known')}
                                                            </p>
                                                        </Space>
                                                    </Upload.Dragger>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16} justify={'start'}>
                                            <Col md={8} xs={24}>
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit">
                                                        {i18n.t('submit')}
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card>

                            }
                        </Col>
                        <Col xl={6} lg={8} xs={24}>
                            <Card className="steps border border-gray-300 h-96">
                                <Steps
                                    current={current}
                                    onChange={this.onChange}
                                    direction="vertical"
                                    className="h-350"
                                    items={[
                                        {
                                            title: selectedService ? selectedService.name : i18n.t('select_service'),
                                            description: selectedService ? selectedService.description : '',
                                        },
                                        {
                                            title: i18n.t('choose_an_appointment'),
                                            description: !selectedService ? i18n.t('please_select_service_to_continue') : !selectedSlot?.slot ? i18n.t('please_select_the_appointment_time') : selectedSlot.slot,
                                        },
                                        {
                                            title: i18n.t('enter_data'),
                                            description: !selectedSlot ? i18n.t('please_select_appointment_to_continue') : i18n.t('please_enter_your_data'),
                                        },
                                    ]}
                                />
                                <Button className="w-full mt-5" type="primary">{i18n.t('book_appointment')}</Button>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    categories: selectCategories(state),
    loading: selectCategoriesLoading(state),
    timeslots: selectTimeslots(state),
    timeslotsLoading: selectTimeslotsLoading(state),
    loggedIn: selectLoggedIn(state),
    profile: selectProfile(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCategories: () => dispatch(fetchCategories()),
    fetchTimeSlots: (date: string, categoryId: string, serviceId: string) => dispatch(fetchTimeSlots(date, categoryId, serviceId)),
    fetchLocationAwareTimeSlots: (date: string, calendarId: string, customerDistrict: number | Contact) => {
        const district = typeof customerDistrict === 'number' ? customerDistrict : (customerDistrict as Contact)?.district;
        if (district) {
            return dispatch(fetchLocationAwareTimeSlots(date, calendarId, district));
        }
        return Promise.resolve([]);
    },
    onSubmit: (appointment: Appointment): Promise<any> =>
        dispatch(addAppointmentRequest(appointment)),
    updateProfileRequest: (profile: any) =>
        dispatch(updateProfileRequest(profile)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CategoryPage));

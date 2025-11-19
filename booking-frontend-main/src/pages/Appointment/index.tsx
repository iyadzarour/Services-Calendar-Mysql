import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchAppointments, fetchTimeSlots, fetchEmployees, fetchLocationAwareTimeSlots } from "../../redux/actions";
import { selectAppointments, selectAppointmentsLoading, selectEmployees, selectEmployeesLoading, selectProfile, selectTimeslots, selectTimeslotsLoading } from "../../redux/selectors";
import { AppointmentForm, TimeSlotsForm, Calendar as CalendarType, PaginatedForm, ExtendedAppointment } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Row, Col, Card, Calendar, Spin, message } from "antd";
import { Calendar as BigCalendar, Views, momentLocalizer } from 'react-big-calendar';
import * as moment from 'moment';
import 'moment/locale/de'

import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../HOC/withAuthorization";
import './index.css'
import AppointmentDetailsModal from "../../components/AppointmentDetailsModal";
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import CreateAppointmentModal from "../../components/CreateAppointmentModal";

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

interface CalendarEvent extends ExtendedAppointment {
    title: string;
    start: Date;
    end: Date;
}
interface IAppointmentState {
    currentDate: Dayjs | null;
    views: ['day', 'work_week'];
    selectedEvent: CalendarEvent | null;
    modalState: boolean;
    newAppointmentModal: boolean;
    selectedSlot: any
}

interface IAppointmentProps {
    loading: boolean;
    timeslots: {
        start: string;
        end: string;
        calendar_id: string;
        employee_name: string;
    }[];
    timeslotsLoading: boolean;
    fetchAppointments: (form: AppointmentForm) => Promise<any>;
    fetchTimeSlots: (form: TimeSlotsForm) => Promise<any>;
    fetchLocationAwareTimeSlots: (date: string, calendarId: string, customerDistrict: number) => Promise<any>;
    appointments: ExtendedAppointment[];
    employees: CalendarType[];
    employeesLoading: boolean;
    fetchEmployees: (form: PaginatedForm) => Promise<any>;
    profile: any;
}

class AppointmentPage extends React.Component<IAppointmentProps, IAppointmentState> {
    constructor(props: IAppointmentProps) {
        super(props);
        this.state = {
            currentDate: dayjs(),
            views: ['day', 'work_week'],
            selectedEvent: null,
            modalState: false,
            newAppointmentModal: false,
            selectedSlot: null
        };
    }

    fetchAppointments = async () => {
        const { currentDate } = this.state;
    
        const firstDateOfMonth = dayjs(currentDate).startOf('month');
        const lastDateOfMonth = dayjs(currentDate).endOf('month');
        try {
            this.props.fetchAppointments({ start: firstDateOfMonth.toISOString(), end: lastDateOfMonth.toISOString() });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    componentDidMount() {
        this.fetchAppointments();
        this.props.fetchEmployees({ page: 1, limit: 100 });
        this.fetchTimeslots();
    }

    fetchTimeslots = async () => {
        const { currentDate } = this.state;
        try {
            if (currentDate)
                this.props.fetchTimeSlots({ date: currentDate.toISOString() })
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

    componentDidUpdate(prevProps: IAppointmentProps, prevState: IAppointmentState) {
        const { currentDate } = this.state;
        if (prevState.currentDate !== currentDate) {
            this.fetchTimeslots();
        }

        if (dayjs(currentDate).month() !== dayjs(prevState.currentDate).month() ||
              dayjs(currentDate).year() !== dayjs(prevState.currentDate).year()
          ) {
            this.fetchAppointments();
          }
    }

    renderEventModal = () => {
        const { selectedEvent, modalState, currentDate } = this.state;
        const firstDateOfMonth = currentDate ? dayjs(currentDate).startOf('month') : dayjs().startOf('month');
        const lastDateOfMonth = currentDate ? dayjs(currentDate).endOf('month') : dayjs().endOf('month');
        
        const onClose = () => {
            this.setState({ modalState: false, selectedEvent: null })
        }

        const onSave = () => {
            this.fetchAppointments();
            this.setState({ modalState: false, selectedEvent: null });
        };

        return <AppointmentDetailsModal selectedEvent={selectedEvent} visible={modalState} onClose={onClose} onSave={onSave} calendars={this.props.employees} />
    }

    renderNewAppointmentModal = () => {
        const { selectedSlot, newAppointmentModal, currentDate } = this.state;
        const onClose = () => {
            this.setState({ newAppointmentModal: false, selectedSlot: null })
        }

        const onSave = () => {
            this.fetchAppointments();
            this.setState({ newAppointmentModal: false, selectedSlot: null });
        };

        return <CreateAppointmentModal selectedSlot={selectedSlot} visible={newAppointmentModal} onClose={onClose} onSave={onSave} calendars={this.props.employees} />
    }


    render() {
        const { loading, timeslots, timeslotsLoading, appointments, employees } = this.props;
        const { currentDate, views, modalState, newAppointmentModal } = this.state;
        const localizer = momentLocalizer(moment);

        // Debug: Log appointments data
        console.log('Appointments from Redux:', appointments);
        console.log('Appointments count:', appointments?.length || 0);
        console.log('Appointments type:', Array.isArray(appointments) ? 'Array' : typeof appointments);

        const resourceMap = (employees || []).concat([{
            _id: '--',
            employee_name: i18n.t('other')
        }] as CalendarType[] ).map(el => ({
            resourceId: String(el._id || ''),
            resourceTitle: el.employee_name
        }))

        // Debug: Log raw appointments before mapping
        console.log('Raw appointments before mapping:', appointments);
        console.log('Appointments array check:', Array.isArray(appointments) ? 'Is Array' : 'Not Array');
        
        const events = (appointments || []).map((el, index) => {
            if (!el || !el.start_date || !el.end_date) {
                console.warn('Invalid appointment data:', el);
                return null;
            }

            const startUTC = new Date(el.start_date);
            const endUTC = new Date(el.end_date);

            // Fix timezone conversion: getTimezoneOffset returns negative value for positive offsets
            // So we subtract instead of add to convert UTC to local time
            const start = new Date(startUTC.getTime() - startUTC.getTimezoneOffset() * 60000);
            const end = new Date(endUTC.getTime() - endUTC.getTimezoneOffset() * 60000);

            // Ensure calendar_id is a string to match resourceId in resourceMap
            const resourceId = String(el.calendar_id || '');

            // Debug logging for first few appointments
            if (index < 3) {
                console.log(`Appointment ${index}:`, {
                    _id: el._id,
                    calendar_id: el.calendar_id,
                    resourceId,
                    start_date: el.start_date,
                    end_date: el.end_date,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    startLocal: start.toLocaleString(),
                    endLocal: end.toLocaleString(),
                    title: el.service?.name || el?.imported_service_name || '',
                    service: el.service
                });
            }

            return {
                title: el.service?.name || el?.imported_service_name || '',
                start,
                end,
                resourceId,
                service: undefined,
                ...el
            };
        }).filter((e): e is NonNullable<typeof e> => e !== null); // Remove null entries with type guard

        // Debug logging for resourceMap
        console.log('Resource map:', resourceMap.map(r => ({ resourceId: r.resourceId, title: r.resourceTitle })));

        // Debug logging for events
        console.log('Events count:', events.length);
        if (events.length > 0) {
            console.log('Events resourceIds:', events.map(e => e.resourceId));
            console.log('Events dates:', events.map(e => ({ 
                start: e.start.toISOString(), 
                end: e.end.toISOString(),
                resourceId: e.resourceId 
            })));
        } else {
            console.warn('No events generated from appointments!');
        }

        const handleNavigate = (newDate: Date) => {
            const newCurrentDate = dayjs(newDate);
            this.setState({ currentDate: newCurrentDate });
        };

        const handleSelectedEvent = async (event: CalendarEvent) => {
            this.setState({
                selectedEvent: event,
                modalState: true,
            })
        }

                const formattedSlots: { slot: string, calendar_id: string, employee_name: string, isOptimal?: boolean, distanceKm?: number }[] = [...timeslots]
            .sort((a, b) => a.start.localeCompare(b.start))
            .reduce((result: { slot: string, calendar_id: string, employee_name: string, isOptimal?: boolean, distanceKm?: number }[], slot) => {
                const formattedStart = this.formatTime(slot.start);
                const formattedEnd = this.formatTime(slot.end);
                const formattedSlot = `${formattedStart} - ${formattedEnd}`;

                // Check if a slot with the same time already exists
                if (!result.some(r => r.slot === formattedSlot)) {
                    result.push({
                        slot: formattedSlot,
                        calendar_id: slot.calendar_id,
                        employee_name: slot.employee_name,
                        isOptimal: (slot as any).isOptimal,
                        distanceKm: (slot as any).distanceKm,
                    });
                }

                return result;
            }, []);

        if (loading) {
            return <div>{i18n.t('loading')}...</div>;
        }

        return (
            <>
                {modalState ? this.renderEventModal() : null}
                {newAppointmentModal ? this.renderNewAppointmentModal() : null}
                <Row gutter={16} justify={'space-around'} className="calendar-container">
                    <Col span={6} xs={24} md={6}>
                        <Card className="calendar-card">
                            <Calendar
                                className="hide-year-navigation"
                                mode="month"
                                fullscreen={false}
                                value={currentDate ? currentDate : dayjs()}
                                onSelect={this.onSelectDate}
                                onChange={(date) => this.setState({ currentDate: dayjs(date) })}
                            />
                        </Card>
                        <Spin spinning={timeslotsLoading}>
                            <Card title={currentDate ? dayjs(currentDate).format('dddd DD-MM-YYYY') : ""} className="w-full h-96 mt-4 rounded-md overflow-y-auto">
                                {formattedSlots.map((el) => (
                                    <div
                                        key={el.slot + el.calendar_id}
                                        className={`p-4 m-3 flex items-center justify-between border rounded-md cursor-pointer ${el.isOptimal ? 'border-green-500 bg-green-100 hover:bg-green-200' : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
                                        onClick={() => {
                                            const slotInfo = {
                                                start: new Date(`${dayjs(currentDate).format('YYYY-MM-DD')}T${el.slot.split(' - ')[0]}`),
                                                end: new Date(`${dayjs(currentDate).format('YYYY-MM-DD')}T${el.slot.split(' - ')[1]}`),
                                                resourceId: el.calendar_id,
                                            };
                                            this.setState({ selectedSlot: slotInfo, newAppointmentModal: true });
                                        }}
                                    >
                                        <div>
                                            <span>{el.slot}</span>
                                            <br />
                                            <span className="text-xs text-gray-500">{el.employee_name}</span>
                                        </div>
                                        {el.isOptimal && <span className="text-green-600 font-bold">{i18n.t('optimal')}</span>}
                                        {el.distanceKm !== undefined && <span className="text-xs text-gray-500">{el.distanceKm} km</span>}
                                    </div>
                                ))}
                            </Card>
                        </Spin>
                    </Col>
                    <Col span={18} xs={24} md={18}>
                        <div style={{ height: 600 }}>
                            <BigCalendar
                                defaultView={Views.DAY}
                                date={currentDate ? dayjs(currentDate).toDate() : new Date()}
                                events={events}
                                culture={i18n.language}
                                localizer={localizer}
                                resourceIdAccessor="resourceId"
                                resources={resourceMap}
                                resourceTitleAccessor="resourceTitle"
                                step={60}
                                selectable
                                onNavigate={handleNavigate}
                                onSelectSlot={(slot) => {
                                    const now = new Date();
                                    if (slot.start < now) {
                                        message.error(i18n.t('book_appointment_in_past_error'))
                                    } else {
                                        this.setState({
                                            selectedSlot: slot,
                                            newAppointmentModal: true
                                        })
                                    }
                                }}
                                views={views}
                                popup={true}
                                onSelectEvent={(e) => handleSelectedEvent(e as CalendarEvent)}
                                messages={{
                                    next: i18n.t('next'),
                                    previous: i18n.t('previous'),
                                    today: i18n.t('today'),
                                    month: i18n.t('month'),
                                    week: i18n.t('week'),
                                    day: i18n.t('day'),
                                    work_week: i18n.t('work_week'),
                                    allDay: i18n.t('all_day'),
                                    yesterday: i18n.t('yesterday'),
                                    tomorrow: i18n.t('tomorrow'),
                                    noEventsInRange: i18n.t('no_events_in_range'),
                                    showMore: function showMore(total) {
                                        return '+' + total + i18n.t('events');
                                    }
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    appointments: selectAppointments(state),
    loading: selectAppointmentsLoading(state),
    timeslots: selectTimeslots(state),
    timeslotsLoading: selectTimeslotsLoading(state),
    employees: selectEmployees(state),
    employeesLoading: selectEmployeesLoading(state),
    profile: selectProfile(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchAppointments: (form: AppointmentForm) => dispatch(fetchAppointments(form)),
    fetchTimeSlots: (form: TimeSlotsForm) => dispatch(fetchTimeSlots(form.date, form.category_id, form.service_id)),
    fetchLocationAwareTimeSlots: (date: string, calendarId: string, customerDistrict: number) => dispatch(fetchLocationAwareTimeSlots(date, calendarId, customerDistrict)),
    fetchEmployees: (form: PaginatedForm) => dispatch(fetchEmployees(form)),
});


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(AppointmentPage)))

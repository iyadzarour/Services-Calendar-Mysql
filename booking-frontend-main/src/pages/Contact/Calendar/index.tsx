import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchContactAppointments } from "../../../redux/actions";
import { selectContactAppointments, selectContactAppointmentsLoading, selectLanguage, selectProfile } from "../../../redux/selectors";
import { ExtendedAppointment } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Spin } from "antd";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import * as moment from 'moment';

import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css';
import Header from "../../../components/Header";
import { Content } from "antd/es/layout/layout";
import AppointmentDetailsModal from "../../../components/AppointmentDetailsModal";
import "./CalendarMobile.scss";
import i18n from "../../../locales/i18n";

interface CalendarEvent extends ExtendedAppointment {
    title: string;
    start: Date;
    end: Date;
}

interface IContactCalendarState {
    selectedEvent: CalendarEvent | null;
    modalState: boolean;
}

interface IContactCalendarProps {
    loading: boolean;
    fetchContactAppointments: (id: string) => Promise<any>;
    appointments: ExtendedAppointment[];
    profile: any
}

class ContactCalendarPage extends React.Component<IContactCalendarProps, IContactCalendarState> {
    constructor(props: IContactCalendarProps) {
        super(props);
        this.state = {
            selectedEvent: null,
            modalState: false,
        };
    }


    componentDidMount() {
        if (this.props.profile?._id)
            this.props.fetchContactAppointments(this.props.profile?._id);
    }

    renderEventModal = () => {
        const { selectedEvent, modalState } = this.state;
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead
        const eventStartDate = selectedEvent ? new Date(selectedEvent.start_date) : null;
        const isDisabled = eventStartDate ? eventStartDate < futureDate : false;

        const onClose = () => {
            this.setState({ modalState: false, selectedEvent: null })
        }

        const onSave = () => {
            if (this.props.profile?._id)
                this.props.fetchContactAppointments(this.props.profile?._id);
            this.setState({ modalState: false, selectedEvent: null });
        };

        return <AppointmentDetailsModal isContact={true} disabled={isDisabled} selectedEvent={selectedEvent} visible={modalState} onClose={onClose} onSave={onSave} />
    }

    render() {
        const { loading, appointments } = this.props;
        const { modalState } = this.state;
        const localizer = momentLocalizer(moment);


        const events = (appointments || []).map((el) => {
            const startUTC = new Date(el.start_date);
            const endUTC = new Date(el.end_date);

            const start = new Date(startUTC.getTime() + startUTC.getTimezoneOffset() * 60000);
            const end = new Date(endUTC.getTime() + endUTC.getTimezoneOffset() * 60000);

            return {
                title: el.service?.name || el?.imported_service_name || '',
                start,
                end,
                ...el
            }
        })

        const handleSelectedEvent = async (event: CalendarEvent) => {
            this.setState({
                selectedEvent: event,
                modalState: true,
            })
        }

        return (
            <div className="contact-calendar">
                <Content>
                    {modalState ? this.renderEventModal() : null}
                    <Header />
                    <Spin spinning={loading}>
                        <BigCalendar
                            key={i18n.language}
                            localizer={localizer}
                            events={events}
                            culture={i18n.language}
                            startAccessor="start"
                            endAccessor="end"
                            popup={true}
                            onSelectEvent={(e) => handleSelectedEvent(e)}
                            style={{ minHeight: 800 }}
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
                    </Spin>
                </Content>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    appointments: selectContactAppointments(state),
    loading: selectContactAppointmentsLoading(state),
    profile: selectProfile(state),
    language: selectLanguage(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchContactAppointments: (id: string) => dispatch(fetchContactAppointments(id)),
});


export default connect(mapStateToProps, mapDispatchToProps)(withAuthorization(ContactCalendarPage))

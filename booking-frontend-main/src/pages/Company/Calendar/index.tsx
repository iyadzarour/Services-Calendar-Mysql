import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchCalendars, createCalendarRequest } from "../../../redux/actions";
import { selectCalendars, selectCalendarsLoading, selectProfile } from "../../../redux/selectors";
import { Calendar as CalendarType } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Button, Col, Empty, Popconfirm, Row, Select, message, DatePicker } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css'
import Calendar from './calendar'
import { withTranslation } from 'react-i18next';
import i18n from "../../../locales/i18n";
import { API_URL } from "../../../redux/network/api";

const { Option } = Select;


interface ICalendarState {
    selectedCalendar: string;
    calenderId: string,
    activeIndex: number;
    start_date: any;
    end_date: any
}

interface ICalendarProps {
    loading: boolean;
    fetchCalendars: () => Promise<any>;
    createCalendarRequest: (calendar: CalendarType) => Promise<any>;
    calendars: CalendarType[];
    profile: any;
}

class CalendarsPage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            start_date: '',
            end_date: '',
            calenderId: '-1',
            selectedCalendar: '',
            activeIndex: 0,
        };
    }

    componentDidMount() {
        this.props.fetchCalendars().then((res) => {
            if (res?.data && res.data.length) {
                const value = `${res.data[0].employee_name} ${res.data[0].active ? '' : `(${i18n.t('not_activated')})`}`
                this.setState({ selectedCalendar: value })
            }
        });
    }

    onSelectCalendar = (value: any, record: any) => {
        this.setState({
            selectedCalendar: value,
            activeIndex: record.key,
            start_date: null,
            end_date: null,
        });
    }

    onDeleteCalendar = () => {
        const { calendars } = this.props;

        if (this.props.calendars.length) {
            const value = `${calendars[0].employee_name} ${calendars[0].active ? '' : `(${i18n.t('not_activated')})`}`
            this.setState({ selectedCalendar: value, activeIndex: 0 })
        }
    }

    getHeader = (calendar: CalendarType, index: number) => (
        <span className="font-bold text-lg">{calendar.employee_name}</span>
    );

    onCreateCalendar = () => {
        const newCalendar: CalendarType = {
            employee_name: i18n.t('new_calendar'),
            active: true,
        };
        this.props.createCalendarRequest(newCalendar).then(data => {
            if (data._id) {
                message.success(i18n.t('successfully_created_the_calendar'));
                this.setState({ activeIndex: this.props.calendars.length - 1, selectedCalendar: data.employee_name })
            } else {
                message.error(i18n.t('something_went_wrong_please_try_again'));
            }
        })
    }
    extractData = async () => {
        if (this.state.calenderId === '-1') {
            this.setState({
                calenderId: this.props.calendars[0]._id!
            })
        }
        fetch(`${API_URL}/appointments/get_by_date_and_id`,
            {
                method: 'POST',
                body: JSON.stringify({
                    calendar_id: this.state.calenderId === '-1' ? this.props.calendars[0]._id : this.state.calenderId,
                    start_date: this.state.start_date,
                    end_date: this.state.end_date,

                }),
                headers: { "Content-Type": "application/json", "x-user-role": this.props.profile?.role },
            }
        ).then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'appointments.xlsx';
                link.click();

            });
    }
    render() {
        const { loading, calendars, profile } = this.props;
        const { selectedCalendar, activeIndex } = this.state;

        if (loading) {
            return <div>{i18n.t('loading')}...</div>;
        }

        return (
            <div className="w-full">
                <Row className="w-full" gutter={[16, 16]}>
                    <Col span={4}>
                        <Select className="w-full" value={selectedCalendar} onChange={(value, record) => {
                            this.onSelectCalendar(value, record)
                            let id = '';
                            calendars.forEach(c => {
                                ;
                                if (selectedCalendar.split(' ')[0] === c.employee_name.split(' ')[0]) {
                                    if (c._id) {
                                        id = c._id
                                    }
                                }
                            })
                            this.setState({
                                calenderId: id
                            })
                        }}>
                            {calendars.map((calendar, index) => {
                                const value = `${calendar.employee_name} ${calendar.active ? '' : `(${i18n.t('not_activated')})`}`
                                return (
                                    <Option key={index} value={value}>{value}</Option>
                                )
                            })}
                        </Select>
                    </Col>
                    <Col span={12}>
                        <Popconfirm
                            title={i18n.t('create_new_calendar')}
                            description={i18n.t('are_you_sure_you_want_to_create_new_calendar')}
                            okText={i18n.t('create_it')}
                            cancelText={i18n.t('no')}
                            onConfirm={this.onCreateCalendar}
                        >
                            <Button loading={false} className="mb-3" type="primary">{i18n.t('new_calendar')}</Button>
                        </Popconfirm>
                        <DatePicker
                            className="mx-2"
                            value={this.state.start_date}
                            onChange={(date) => this.setState({ start_date: date })}
                        />
                        <DatePicker
                            className="mx-2"
                            value={this.state.end_date}
                            onChange={(date) => this.setState({ end_date: date })}
                        />
                        <Button onClick={this.extractData} loading={false} className="mb-3" type="primary">{i18n.t('export_data')}</Button>
                    </Col>
                </Row>

                {calendars.length ? <Calendar calendar={calendars[activeIndex]} onDeleteCalendar={this.onDeleteCalendar} /> : <Empty className="mt-16" description={i18n.t('empty')} />}
            </div>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    calendars: selectCalendars(state),
    loading: selectCalendarsLoading(state),
    profile: selectProfile(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCalendars: () => dispatch(fetchCalendars()),
    createCalendarRequest: (calendar: CalendarType) => dispatch(createCalendarRequest(calendar)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(CalendarsPage)))

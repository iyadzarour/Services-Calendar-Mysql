import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { updateContactRequest, updateProfileRequest, resetPasswordRequest } from "../../redux/actions";
import { selectProfile, selectResetPasswordLoading, selectUpdateContactLoading } from "../../redux/selectors";
import { Contact, ResetPasswordForm } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Button, Card, Col, Divider, Empty, Form, Input, Row, Select, Tabs, message } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../HOC/withAuthorization";
import './index.css'
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import Header from "../../components/Header";

const { Option } = Select;


interface ICalendarState {
    selectedCalendar: string;
    activeIndex: number;
}

interface ICalendarProps {
    loading: boolean;
    resetPasswordLoading: boolean;
    profile: any;
    updateContactRequest: (id: string, contact: Contact) => Promise<any>;
    updateProfileRequest: (profile: any) => Promise<any>;
    resetPasswordRequest: (form: ResetPasswordForm) => Promise<any>;
}

class ProfilePage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            selectedCalendar: '',
            activeIndex: 0,
        };
    }
    formRef = React.createRef<any>();
    resetFormRef = React.createRef<any>();

    renderProfile = () => {
        const { loading, profile } = this.props;
        const initialValues = profile;

        if (!profile) return <Empty description={i18n.t('empty')} />


        const onFinish = (contact: Contact) => {
            const profileId = this.props.profile._id;

            if (profileId) {
                this.props
                    .updateContactRequest(profileId, contact)
                    .then((data) => {
                        if (data._id) {
                            message.success(i18n.t('successfully_updated_the_data'));
                            this.props.updateProfileRequest(data);
                        } else {
                            message.error(i18n.t('something_went_wrong_please_try_again'))
                        }
                    });
            }
        };

        return (
            <div>
                <Form
                    ref={this.formRef}
                    name="contactForm"
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={initialValues}
                >
                    <Row gutter={16}>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('salutation')}
                                name="salutation"
                                rules={[{ required: true }]}
                            >
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
                            <Form.Item
                                label={i18n.t('first_name')}
                                name="first_name"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('last_name')}
                                name="last_name"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('address')}
                                name="address"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('zip_code')}
                                name="zip_code"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('location')}
                                name="location"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('telephone')}
                                name="telephone"
                                rules={[{ required: true }]}
                            >
                                <Input type="tel" />
                            </Form.Item>
                        </Col>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('phone_2')}
                                name="phone_numbber_2"
                                rules={[{ required: false }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col md={8} xs={24}>
                            <Form.Item
                                label={i18n.t('phone_3')}
                                name="phone_numbber_3"
                                rules={[{ required: false }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col md={24} xs={24}>
                            <Form.Item
                                label={i18n.t('email')}
                                name="email"
                                rules={[{ required: true, type: "email" }]}
                            >
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider className="mb-6 mt-2" />
                    <Row gutter={16} justify={"end"}>
                        <Form.Item>
                            <Button type="primary" loading={loading} htmlType="submit">
                                {i18n.t('save')}
                            </Button>
                        </Form.Item>
                    </Row>
                </Form>
            </div>
        )
    }

    renderAuth = () => {
        const { profile, resetPasswordLoading } = this.props;
        if (!profile) return <Empty description={i18n.t('empty')} />

        const onFinish = (form: ResetPasswordForm) => {
            const profileId = this.props.profile._id;

            if (profileId) {
                this.props
                    .resetPasswordRequest(form)
                    .then((data) => {
                        if (data._id) {
                            message.success(i18n.t('successfully_updated_the_data'));
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
                    });
            }
        };


        return (
            <div>
                <Form
                    ref={this.resetFormRef}
                    name="resetPasswordForm"
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ email: profile.email }}
                >

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={i18n.t('email')}
                                name="email"
                                rules={[{ required: true, type: "email" }]}
                            >
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={i18n.t('old_password')}
                                name="oldPassword"
                                rules={[{ required: true }]}
                            >
                                <Input type="password" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={i18n.t('new_password')}
                                name="password"
                                rules={[{ required: true }]}
                            >
                                <Input type="password" />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Divider className="mb-6 mt-2" />
                    <Row gutter={16} justify={"end"}>
                        <Form.Item>
                            <Button type="primary" loading={resetPasswordLoading} htmlType="submit">
                                {i18n.t('save')}
                            </Button>
                        </Form.Item>
                    </Row>
                </Form>
            </div>
        )
    }

    render() {


        return (
            <div className="profile">
                <Header />
                <div className="m-2">
                    <Card>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: i18n.t('profile'),
                                    children: this.renderProfile(),
                                },
                                {
                                    key: "2",
                                    label: i18n.t('reset_password'),
                                    children: this.renderAuth(),
                                }
                            ]}
                        />
                    </Card>
                </div>
            </div>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    loading: selectUpdateContactLoading(state),
    profile: selectProfile(state),
    resetPasswordLoading: selectResetPasswordLoading(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateContactRequest: (id: string, contact: Contact) =>
        dispatch(updateContactRequest(id, contact)),
    updateProfileRequest: (profile: any) =>
        dispatch(updateProfileRequest(profile)),
    resetPasswordRequest: (form: ResetPasswordForm) =>
        dispatch(resetPasswordRequest(form)),


});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(ProfilePage)))

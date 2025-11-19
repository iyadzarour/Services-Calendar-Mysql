import React, { ChangeEvent } from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { forgotPasswordRequest } from "../../redux/actions";
import { selectForgotLoading } from "../../redux/selectors";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Input, Button, Form, Tag } from "antd";
import withRouter from "../../HOC/withRouter";
import { compose } from "redux";
import i18n from "../../locales/i18n";
import { withTranslation } from "react-i18next";
import "./index.css";

interface IState {
    email: string;
    message: string;
    error: boolean;
}

interface IProps {
    loading: boolean;
    forgotPasswordRequest: (email: string) => Promise<any>;
    navigate?: (route: string) => void;
}

class ForgotPassword extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            email: "",
            message: "",
            error: false,
        };
    }

    handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ [e.target.name]: e.target.value } as any);
    };

    handleForgotPassword = () => {
        this.setState({ error: false, message: "" });

        const { email } = this.state;

        this.props
            .forgotPasswordRequest(email)
            .then((data) => {
                this.setState({ message: data?.message || i18n.t("something_went_wrong_please_try_again"), error: data?.code !== 200 });
            })
            .catch((err) => {
                if (err && err.message) {
                    this.setState({ error: true, message: err.message });
                } else {
                    this.setState({
                        error: true,
                        message: i18n.t("something_went_wrong_please_try_again"),
                    });
                }
            });
    };

    render() {
        const { email } = this.state;
        const { loading } = this.props;

        return (
            <div className="login-container">
                <div className="login-content">
                    <h2 className="login-title">{i18n.t("please_enter_your_email")}</h2>
                    <Form
                        layout="vertical"
                        onFinish={this.handleForgotPassword}
                        className="forgot-password-form"
                    >
                        <Form.Item
                            label={i18n.t("email")}
                            rules={[
                                { required: true, message: i18n.t("Please_input_your_email") },
                            ]}
                        >
                            <Input
                                type="email"
                                value={email}
                                name="email"
                                onChange={this.handleInputChange}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="login-button"
                            >
                                {i18n.t("send_reset_link")}
                            </Button>
                        </Form.Item>
                        <div className="flex justify-end">
                            <Button
                                type="link"
                                onClick={() => this.props.navigate && this.props.navigate("/login")}
                            >
                                {i18n.t("back_to_login")}
                            </Button>
                        </div>
                    </Form>
                </div>
                {this.state.message && (
                    <div className="flex justify-center mt-10">
                        <Tag color={this.state.error ? "error" : "success"}>
                            {this.state.message}
                        </Tag>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    loading: selectForgotLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    forgotPasswordRequest: (email: string) =>
        dispatch(forgotPasswordRequest(email)),
});

export default compose(withRouter)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withTranslation()(ForgotPassword))
);

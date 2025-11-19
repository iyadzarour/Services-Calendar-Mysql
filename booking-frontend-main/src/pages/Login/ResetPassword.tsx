import React, { ChangeEvent } from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { resetContactPasswordRequest } from "../../redux/actions";
import { selectResetPasswordLoading } from "../../redux/selectors";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Input, Button, Form, Tag, message } from "antd";
import withRouter, { RouteParams } from "../../HOC/withRouter";
import { compose } from "redux";
import i18n from "../../locales/i18n";
import { withTranslation } from "react-i18next";
import "./index.css";

interface IState {
    password: string;
    message: string;
    error: boolean;
}

interface IProps {
    loading: boolean;
    resetContactPasswordRequest: (password: string, token: string) => Promise<any>;
    navigate?: (route: string) => void;
    params?: RouteParams;
}

class ResetPassword extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            password: "",
            message: "",
            error: false,
        };
    }

    handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ [e.target.name]: e.target.value } as any);
    };

    handleResetPassword = () => {
        this.setState({ error: false, message: "" });

        const { password } = this.state;
        let token = this.props.params?.token || "";

        this.props
            .resetContactPasswordRequest(password, token)
            .then((data) => {
                if (data && data._id) {
                    message.success(i18n.t("password_reset_successfully"));
                    if (this.props.navigate)
                        this.props.navigate("/login");
                } else if (data && data.message) {
                    this.setState({ message: data.message, error: data.code !== 200 });
                } else {
                    this.setState({
                        error: true,
                        message: i18n.t("something_went_wrong_please_try_again"),
                    });
                }
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
        const { password } = this.state;
        const { loading } = this.props;

        return (
            <div className="login-container">
                <div className="login-content">
                    <h2 className="login-title">{i18n.t("please_enter_your_email")}</h2>
                    <Form
                        layout="vertical"
                        onFinish={this.handleResetPassword}
                        className="forgot-password-form"
                    >
                        <Form.Item
                            label={i18n.t("password")}
                            rules={[
                                { required: true, message: i18n.t("Please_input_your_email") },
                            ]}
                        >
                            <Input
                                type="password"
                                value={password}
                                name="password"
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
                                {i18n.t("save")}
                            </Button>
                        </Form.Item>
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
    loading: selectResetPasswordLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    resetContactPasswordRequest: (password: string, token: string) =>
        dispatch(resetContactPasswordRequest(password, token)),
});

export default compose(withRouter)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withTranslation()(ResetPassword))
);

import React, { ChangeEvent } from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { loginRequest } from "../../redux/actions";
import { selectLoginLoading } from "../../redux/selectors";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Input, Button, Form, message } from 'antd';
import withRouter from "../../HOC/withRouter";
import { compose } from 'redux'
import i18n from "../../locales/i18n";
import { withTranslation } from 'react-i18next';
import "./index.css";

interface ILoginState {
    email: string;
    password: string;
}

interface ILoginProps {
    loading: boolean;
    login: (form: { email: string, password: string }) => Promise<any>;
    navigate?: (route: string) => void;
}

class LoginPage extends React.Component<ILoginProps, ILoginState> {
    constructor(props: ILoginProps) {
        super(props);
        this.state = {
            email: '',
            password: '',
        };
    }

    handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ [e.target.name]: e.target.value } as any);
    };

    handleLogin = () => {
        const { email, password } = this.state;

        this.props.login({ email, password }).then(data => {
          if(data && data._id){
            if (this.props.navigate)
            this.props.navigate(["user", "admin"].includes(data?.role) ? '/appointment' : data?.role === 'calendar' ? '/employee' : '/category')
          } else if(data && data.message){
            message.error(data.message)
          }
        });
    };

    render() {
        const { email, password } = this.state;
        const { loading } = this.props;

        return (
            <div className="login-container">
                <div className="login-content">
                    <h2 className="login-title">{i18n.t('Login')}</h2>
                    <Form
                      layout="vertical"
                      onFinish={this.handleLogin}
                      className="login-form"
                    >
                      <Form.Item label={i18n.t('email')} rules={[{ required: true, message: i18n.t('Please_input_your_email') }]}>
                        <Input type="email" value={email} name="email" onChange={this.handleInputChange} />
                      </Form.Item>
                      <Form.Item label={i18n.t('password')}  rules={[{ required: true, message: i18n.t('Please_input_your_password') }]}>
                        <Input.Password name="password" value={password} onChange={this.handleInputChange} />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="login-button">
                        {i18n.t('login')}
                        </Button>
                      </Form.Item>
                      <Form.Item className="flex justify-end">
                        <Button type="link" onClick={() => this.props.navigate && this.props.navigate('/forgot-password')}>
                        {i18n.t('forgot_password')}
                        </Button>
                      </Form.Item>
                    </Form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    loading: selectLoginLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    login: (form: { email: string; password: string }) => dispatch(loginRequest(form)),
});

export default compose(
  withRouter,
)(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LoginPage)))

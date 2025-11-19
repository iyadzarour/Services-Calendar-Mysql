import { Col, Divider, Row, Select, Tooltip } from "antd";
import { Content } from "antd/es/layout/layout";
import { LogoutOutlined, LoginOutlined, UserOutlined, HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import React from "react";
import Logo from "../assets/bgas-logo.png";
import { selectLoggedIn, selectProfile } from "../redux/selectors";
import { RootState } from "../redux/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { logoutRequest, setLanguageRequest } from "../redux/actions";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import i18n from "../locales/i18n";
import './index.css';

const { Option } = Select;
interface IHeaderProps {
  loggedIn: boolean;
  logout: () => void;
  setLanguage: (lang: string) => void;
  profile: any;
}
class Header extends React.Component<IHeaderProps> {
  constructor(props: IHeaderProps) {
    super(props);
  }

  render() {
    const { logout, loggedIn, profile } = this.props;
    const onSelectLang = (lang: string) => {
      i18n.changeLanguage(lang);
      this.props.setLanguage(lang);
    }

    return (
      <div className="header">
        <Content>
          <Row justify={"space-between"} className="flex items-center">
            <Col xl={17} lg={15} md={13} sm={11} xs={10}>
              <img src={Logo} className="logo" />
            </Col>
            <Col xl={4} lg={6} md={8} sm={13} xs={14} className="icons-container">
              {loggedIn ? (
                <Tooltip title={i18n.t("logout")}>
                  <LogoutOutlined style={{ color: "#08c" }} className="text-lg" onClick={() => logout()} />
                </Tooltip>
              ) : (
                <Link to="/login">
                  <Tooltip title={i18n.t("login")}>
                    <LoginOutlined style={{ color: "#08c" }} className="text-lg" />
                  </Tooltip>
                </Link>
              )}
              {profile && profile.role === "contact" ? (
                <>
                  <Link to="/profile">
                    <Tooltip title={i18n.t("profile")}>
                      <UserOutlined style={{ color: "#08c" }} className="text-lg ml-4" />
                    </Tooltip>
                  </Link>
                  <Link to="/contact-calendar">
                    <Tooltip title={i18n.t("appointments")}>
                      <CalendarOutlined style={{ color: "#08c" }} className="text-lg ml-4" />
                    </Tooltip>
                  </Link>
                  <Link to="/category">
                    <Tooltip title={i18n.t("category")}>
                      <HomeOutlined style={{ color: "#08c" }} className="text-lg ml-4" />
                    </Tooltip>
                  </Link>
                </>
              ) : null}
              <Select defaultValue={'de'} className="ml-2" onChange={(value) => onSelectLang(value)}>
                <Option key={'en'} value='en'>En</Option>
                <Option key={'de'} value='de'>De</Option>
              </Select>
            </Col>
            <Col xl={3} lg={3} md={3} sm={24} className="w-full">
              <p className="w-52">B-GAS GmbH | 01 / 202 85 56</p>
            </Col>
          </Row>
          <Divider className="m-0 mt-5" />
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  loggedIn: selectLoggedIn(state),
  profile: selectProfile(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  logout: () => dispatch(logoutRequest()),
  setLanguage: (lang: string) => dispatch(setLanguageRequest(lang)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(Header));

import React from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DesktopOutlined,
  CalendarOutlined,
  ContactsOutlined,
  SettingOutlined,
  MessageOutlined 
} from "@ant-design/icons";
import { Layout, Menu, Button, Row, Select } from "antd";

import { ThunkDispatch } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import "./index.css";
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../assets/bgas-logo.png'
import i18n from "../../locales/i18n";
import { withTranslation } from 'react-i18next';
import { RootState } from "../../redux/store";
import { selectLoggedIn } from "../../redux/selectors";
import { logoutRequest, setLanguageRequest } from "../../redux/actions";

const { Header, Sider, Content } = Layout;
const {Option} = Select;

const NavLink: React.FunctionComponent<{
  to: string;
  children: any;
  style?: React.CSSProperties;
  onClick?: () => any;
}> = ({ to, children, onClick, style }) => {
  const navigate = useNavigate();

  return (
    <div
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </div>
  );
};

interface ISideBarProps {
  loggedIn: boolean;
  logout: () => void;
  setLanguage: (lang: string) => void;
}

interface ISideBarState {
  collapsed: boolean;
}
class SideBar extends React.Component<ISideBarProps, ISideBarState> {
  constructor(props: ISideBarProps) {
      super(props);
      this.state = {
        collapsed: false,
    };
  }



  render(){
    const {collapsed} = this.state;
    const setCollapsed = (value: boolean) => {
      this.setState({collapsed: value})
    }

    const onSelectLang = (lang: string) => {
      i18n.changeLanguage(lang);
      this.props.setLanguage(lang);
    }

  return (
    <Layout className="">
      <Sider
        className={"sidebar"}
        trigger={null}
        collapsible
        collapsed={collapsed}
        color="#00203b"
      >
        <div className="demo-logo-vertical">
          <img src={Logo} alt="etermin-logo" width={collapsed ? 60 : 120} height={collapsed ? 25 : 50} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <CalendarOutlined />,
              label: (
                <NavLink to={`/appointment`}>
                  <span className="title">
                    {i18n.t('appointments')}
                  </span>
                </NavLink>
              ),
            },
            {
              key: "2",
              icon: <DesktopOutlined />,
              label: <span>{i18n.t('company')}</span>,
              children: [
                {
                  key: `sub1`,
                  label: <NavLink to={`/services`}>
                    <span className="title">
                      {i18n.t('services')}
                    </span>
                  </NavLink>,
                },
                {
                  key: `sub2`,
                  label: <NavLink to={`/calendar`}>
                    <span className="title">
                      {i18n.t('calendar')}
                    </span>
                  </NavLink>,
                },
                {
                  key: `sub3`,
                  label: <NavLink to={`/working-hours`}>
                    <span className="title">
                      {i18n.t('working_hours')}
                    </span>
                  </NavLink>,
                }
              ]
            },
            {
              key: "3",
              icon: <ContactsOutlined />,
              label: <NavLink to={`/contact`}>
                <span className="title">
                  {i18n.t('contacts')}
                </span>
              </NavLink>,
            },
            {
              key: "4",
              icon: <MessageOutlined  />,
              label: <NavLink to={`/contras`}>
                <span className="title">
                  {i18n.t('Contras')}
                </span>
              </NavLink>,
            },
            {
              key: "5",
              icon: <SettingOutlined />,
              label: <NavLink to={`/settings`}>
                <span className="title">
                  {i18n.t('settings')}
                </span>
              </NavLink>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, display: 'flex', paddingRight: 125, justifyContent: 'space-between', background: "#fff" }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Row align={'middle'}>
            <Select defaultValue={'de'} className="mr-2" onChange={(value) => onSelectLang(value)}>
              <Option key={'en'} value='en'>En</Option>
              <Option key={'de'} value='de'>De</Option>
            </Select>
            {this.props.loggedIn ? <Button onClick={() => this.props.logout()}>{i18n.t('logout')}</Button> : <Link to="/login">{i18n.t('login')}</Link>}
          <Button
            type="link"
            onClick={() => window.open('category', '_blank')}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          >{i18n.t('booking_page_b_gas')}</Button>
          </Row>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );}
};

const mapStateToProps = (state: RootState) => ({
  loggedIn: selectLoggedIn(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  logout: () => dispatch(logoutRequest()),
  setLanguage: (lang: string) => dispatch(setLanguageRequest(lang)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SideBar))

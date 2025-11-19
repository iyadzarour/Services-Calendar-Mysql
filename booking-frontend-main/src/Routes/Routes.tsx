import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CategoryPage from '../pages/Category';
import AppointmentPage from '../pages/Appointment';
import ServicesPage from '../pages/Company/Services';
import CalendarPage from '../pages/Company/Calendar';
import WorkingHoursPage from '../pages/Company/Schedules';
import LoginPage from '../pages/Login';
import ForgotPassword from '../pages/Login/ForgotPassword';
import ResetPassword from '../pages/Login/ResetPassword';
import SideBar from '../pages/SideBar';
import ContactPageComponent from '../pages/Contact';
import ContactProfile from '../pages/Contact/Profile';
import ContactCalendar from '../pages/Contact/Calendar';
import ContactAppointments from '../pages/Contact/Appointments';
import Settings from '../pages/Settings';
import EmployeePage from '../pages/Employee';
import SignContra from '../pages/sign_contra';
import Contras from '../pages/Contras';

const ContactPage = ContactPageComponent as React.ComponentType<any>;

class Router extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/appointment" replace />} />
        <Route path="/"
          element={<SideBar />}
        >
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/contras" element={<Contras />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/contact/appointments/:contactId" element={<ContactAppointments />} />
          <Route path="/working-hours" element={<WorkingHoursPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/sign_contra" element={<SignContra />} />
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<ContactProfile />} />
        <Route path="/contact-calendar" element={<ContactCalendar />} />
      </Routes>
    );
  }
}

export default Router;

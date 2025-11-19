/**
 * Service Container with MySQL DAOs
 * 
 * This service container uses MySQL DAOs for all database operations.
 * All DAO interfaces remain the same, only the implementation changes.
 * 
 * MySQL Configuration:
 * - Ensure MySQL environment variables are set
 * - Run the mysql_schema.sql to create tables
 */

import {
  UserDaoMySql,
  CategoryDaoMySql,
  AppointmentDaoMySql,
  ContactDaoMySql,
  CalendarDaoMySql,
  ScheduleDaoMySql,
  EmailConfigDaoMySql,
  EmailTemplateDaoMySql
} from "../../../database-client";

import { getMySQL } from "./mysql/mysql";
import { AuthService } from "../user/UserService";
import { CategoryService } from "../category/CategoriesService";
import { AppointmentsService } from "../appointment/AppointmentsService";
import { ContactsService } from "../contact/ContactsService";
import { CalendarsService } from "../calendar/CalendarsService";
import { SchedulesService } from "../schedule/SchedulesService";
import { LocationAwareService } from "../schedule/LocationAwareService";
import { EmailService } from "../email/EmailService";

export interface ServiceContainer {
  authService: AuthService;
  categoryService: CategoryService;
  appointmentService: AppointmentsService;
  contactService: ContactsService;
  calendarService: CalendarsService;
  scheduleService: SchedulesService;
  locationAwareService: LocationAwareService;
  emailService: EmailService;
}

/**
 * Create service container with MySQL DAOs
 * 
 * Note: The 'kalender' parameter is maintained for compatibility but both
 * instances now use the same MySQL database. If you need separate databases,
 * modify the getMySQL() function to accept a parameter.
 */
const createContainer = (kalender?: boolean) => {
  // Get MySQL connection pool
  const mysqlPool = getMySQL();
  
  // Initialize all MySQL DAOs
  const userDao = new UserDaoMySql(mysqlPool);
  const categoryDao = new CategoryDaoMySql(mysqlPool);
  const appointmentDao = new AppointmentDaoMySql(mysqlPool);
  const contactDao = new ContactDaoMySql(mysqlPool);
  const calendarDao = new CalendarDaoMySql(mysqlPool);
  const scheduleDao = new ScheduleDaoMySql(mysqlPool);
  const emailConfigDao = new EmailConfigDaoMySql(mysqlPool);
  const emailTemplateDao = new EmailTemplateDaoMySql(mysqlPool);

  // Initialize services with MySQL DAOs
  // Services remain unchanged - they work with DAO interfaces
  const authService = new AuthService(userDao, contactDao, calendarDao);
  const categoryService = new CategoryService(categoryDao);
  const calendarService = new CalendarsService(calendarDao);
  const scheduleService = new SchedulesService(scheduleDao);
  const locationAwareService = new LocationAwareService(
    scheduleDao,
    appointmentDao
  );
  const emailService = new EmailService(emailConfigDao, emailTemplateDao);
  
  const appointmentService = new AppointmentsService(
    appointmentDao,
    categoryDao,
    scheduleDao
  );
  const contactService = new ContactsService(contactDao);

  const container: ServiceContainer = {
    authService,
    categoryService,
    appointmentService,
    contactService,
    calendarService,
    scheduleService,
    locationAwareService,
    emailService
  };
  
  return container;
};

// Create service containers
// Note: Both use the same MySQL database now
const service = createContainer();
const serviceKalender = createContainer(true);

export const getService = () => {
  return service;
};

export const getServiceKalender = () => {
  return serviceKalender;
};

import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer, getService } from "../clients";
import {
  AddAppointmentRequest,
  Appointment,
  AppointmentForm,
  AppointmentStatus,
  EmailTemplateType,
  TimeSlotsForm,
} from "../../../database-client/src/Schema";
import { hashPassword } from "../middlewares/authMiddleware";
import { uploadCotract } from "./utils";

class AppointmentsControllers {
  @tryCatchErrorDecorator
  static async addAppointment(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to add appointment';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Appointment;
    const service = (request as any).service as ServiceContainer;
    const contact = form.contact;
    let conatctId = "";
    let contactObg = null;
    let contractLink = undefined;

    if (contact.sign_url) {
      try {
        contractLink = await uploadCotract(contact, form);
        if (!contractLink) {
          console.error("uploadCotract returned null/undefined");
          return res.status(409).json({
            message: "Something went wrong while saving the contract file",
          });
        }
      } catch (error: any) {
        console.error("Error in uploadCotract:", error);
        // Don't fail the entire appointment creation if contract upload fails
        // Just log the error and continue without contract link
        console.warn("Continuing without contract link due to upload error");
      }
    }

    const existingContact = await service.contactService.getContactByEmail(
      contact?.email
    );
    
    // Track if this is a new contact (for sending login credentials email)
    const isNewContact = !existingContact;
    const originalPassword = contact?.password; // Store original password for new contacts

    if (existingContact) {
      // MySQL returns plain objects
      conatctId = existingContact._id || (existingContact as any).id;
      const existingPassword = existingContact.password || (existingContact as any).password;
      const updatedContact = {
        ...existingContact,
        ...contact,
        password: existingPassword,
        contract_link: contractLink || undefined
      };
      contactObg = await service.contactService.updateContact(conatctId, updatedContact);
    } else {
      const encryptedPassword = contact.password ? await hashPassword(contact.password) : undefined;

      const updatedContact = {
        ...contact,
        password: encryptedPassword,
        contract_link: contractLink || undefined
      };

      const newContact = await service.contactService.addContact(updatedContact);
      if (newContact && (newContact._id || (newContact as any).id)) {
        conatctId = newContact._id || (newContact as any).id;
        contactObg = newContact;
      }
    }
    const formatTime = (time: string) => {
      const date = new Date(time);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
  };

    if (conatctId && conatctId !== "") {
      // Ensure all required fields are present and valid
      if (!form.category_id || !form.service_id || !form.calendar_id || !form.start_date || !form.end_date) {
        return res.status(400).json({
          message: "Missing required fields: category_id, service_id, calendar_id, start_date, or end_date"
        });
      }

      const newAppointment: AddAppointmentRequest = {
        category_id: String(form.category_id),
        service_id: String(form.service_id),
        calendar_id: String(form.calendar_id),
        start_date: form.start_date,
        end_date: form.end_date,
        contact_id: String(conatctId),
        new_user: false, // Explicitly set default value
        brand_of_device: form.brand_of_device || undefined,
        model: form.model || undefined,
        selected_devices: form.selected_devices || undefined,
        exhaust_gas_measurement: Boolean(form.exhaust_gas_measurement),
        has_maintenance_agreement: Boolean(form.has_maintenance_agreement),
        has_bgas_before: Boolean(form.has_bgas_before),
        year: form.year || undefined,
        invoice_number: form.invoice_number ? Number(form.invoice_number) : undefined,
        contract_number: form.contract_number ? Number(form.contract_number) : undefined,
        imported_service_name: form.imported_service_name || undefined,
        imported_service_duration: form.imported_service_duration || undefined,
        imported_service_price: form.imported_service_price || undefined,
        attachments: form.attachments || undefined,
        remarks: form.remarks || undefined,
        employee_attachments: form.employee_attachments || undefined,
        appointment_status: form.appointment_status || AppointmentStatus.Confirmed,
        archived: form.archived || false,
        updated_by: form.updated_by || undefined,
        employee_remarks: form.employee_remarks || undefined,
        company_remarks: form.company_remarks || undefined,
        created_by: form.created_by || undefined,
        ended_at: form.ended_at || undefined,
        control_points: form.control_points || undefined,
      };
      const data = await service.appointmentService.addAppointment(
        newAppointment
      );

      if (!data) {
        throw new Error("Failed to create appointment");
      }

      // MySQL returns plain objects
      const dataObject = (data as any)._doc ? { ...(data as any)._doc } : { ...data };
      const contactObject = contactObg && (contactObg as any)._doc 
        ? { ...(contactObg as any)._doc } 
        : contactObg 
        ? { ...contactObg } 
        : null;

      if (!contactObject) {
        throw new Error("Contact object is null");
      }

      const dataWithContact = {
        ...dataObject,
        contact: contactObject,
      };

      // Prepare appointment confirmation email for customer
      let customerEmail =
        "Sehr geehrter Kunde, wir haben Ihre Bewerbung erhalten und werden uns bald mit Ihnen in Verbindung setzen!<p>beste grüße,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>";
      let customerSubject = "B-Gas Dienstleistungen - Terminbestätigung";
      const emailTemplate =
        await service.emailService.getEmailTemplatesByServiceId(
          form.service_id
        );

      if (emailTemplate && emailTemplate.template && contactObject) {
        const serviceName = await service.appointmentService.getServiceNameByCategory(form.category_id, form.service_id);
        const startDateObj = typeof dataObject.start_date === 'string' ? new Date(dataObject.start_date) : dataObject.start_date;
        const endDateObj = typeof dataObject.end_date === 'string' ? new Date(dataObject.end_date) : dataObject.end_date;
        const formattedStartDate = startDateObj.toLocaleDateString("de-DE", { 
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedStartTime = formatTime(startDateObj.toISOString());
        const formattedEndTime = formatTime(endDateObj.toISOString());
        customerEmail = emailTemplate.template
          .replace('B_Performance', serviceName || '')
          .replace('B_Salutation', contactObject.salutation || '')
          .replace('B_First_Name', contactObject.first_name || '')
          .replace('B_Last_Name', contactObject.last_name || '')
          .replace('B_Date', formattedStartDate)
          .replace('B_Start_Time', formattedStartTime)
          .replace('B_End_Time', formattedEndTime)
          .replace('B_Address', contactObject.address || '')
          .replace('B_ZIP', contactObject.zip_code || '')
          .replace('B_Location', contactObject.location || '')
          .replace('B_Telephone', contactObject.telephone || '')
          .replace('B_Email', contactObject.email || '')
          .replace('B_Brand', dataObject.brand_of_device || '')
          .replace('B_Model', dataObject.model || '')
          .replace('B_Year', dataObject.year || '')
          .replace('B_Notes', dataObject.remarks || '');
        customerSubject = emailTemplate.subject || customerSubject;
      }

      // 1. Send appointment confirmation email to customer (always)
      if (contactObject && contactObject.email) {
        try {
          await getService().emailService.sendMail({
            to: contactObject.email,
            subject: customerSubject,
            text: customerEmail,
          });
          console.log('Appointment confirmation email sent to customer:', contactObject.email);
        } catch (emailError) {
          console.warn('Failed to send appointment confirmation email to customer, but continuing:', emailError);
        }
      }

      // 2. Send login credentials email to new customers only (after appointment creation)
      if (isNewContact && contactObject && contactObject.email && originalPassword) {
        try {
          // Get frontend URL from environment or use default
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const loginUrl = `${frontendUrl}/login`;
          
          const loginCredentialsEmail = `
            <p>Liebe Kund*innen,</p>
            <br>
            <p>Ihr Konto wurde erfolgreich erstellt. Wir empfehlen Ihnen, sich auf unserer <a href='${loginUrl}'>Website</a> mit den folgenden Anmeldeinformationen anzumelden und aus Sicherheitsgründen Ihr Passwort zu ändern:</p>
            <br>
            <p><strong>E-Mail:</strong> ${contactObject.email}</p>
            <p><strong>Passwort:</strong> ${originalPassword}</p>
            <br>
            <p><a href='${loginUrl}'>Zur Anmeldung</a></p>
            <br>
            <p>Vielen Dank, dass Sie unsere Dienste gewählt haben.</p>
            <p>Mit freundlichen Grüßen,</p>
            <img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>
          `;
          
          await getService().emailService.sendMail({
            to: contactObject.email,
            subject: "B-Gas Kontoerstellung - Ihre Anmeldeinformationen",
            text: loginCredentialsEmail,
          });
          console.log('Login credentials email sent to new customer:', contactObject.email);
        } catch (emailError) {
          console.warn('Failed to send login credentials email to new customer, but continuing:', emailError);
        }
      }

      // 3. Send detailed appointment notification email to company
      const emailConfig = await getService().emailService.getEmailConfig();
      if (emailConfig && emailConfig.length) {
        try {
          // Create detailed email for company with all appointment information
          const companyEmail = `
            <h2>Neue Terminbuchung</h2>
            <p>Es wurde ein neuer Termin gebucht:</p>
            <br>
            <h3>Kundeninformationen:</h3>
            <p><strong>Anrede:</strong> ${contactObject.salutation || 'N/A'}</p>
            <p><strong>Vorname:</strong> ${contactObject.first_name || 'N/A'}</p>
            <p><strong>Nachname:</strong> ${contactObject.last_name || 'N/A'}</p>
            <p><strong>Adresse:</strong> ${contactObject.address || 'N/A'}</p>
            <p><strong>PLZ:</strong> ${contactObject.zip_code || 'N/A'}</p>
            <p><strong>Ort:</strong> ${contactObject.location || 'N/A'}</p>
            <p><strong>Telefon:</strong> ${contactObject.telephone || 'N/A'}</p>
            <p><strong>E-Mail:</strong> ${contactObject.email || 'N/A'}</p>
            <br>
            <h3>Termindetails:</h3>
            <p><strong>Startdatum:</strong> ${typeof dataObject.start_date === 'string' ? new Date(dataObject.start_date).toLocaleString("de-DE") : dataObject.start_date}</p>
            <p><strong>Enddatum:</strong> ${typeof dataObject.end_date === 'string' ? new Date(dataObject.end_date).toLocaleString("de-DE") : dataObject.end_date}</p>
            <p><strong>Status:</strong> ${dataObject.appointment_status || 'N/A'}</p>
            <br>
            <h3>Geräteinformationen:</h3>
            <p><strong>Marke:</strong> ${dataObject.brand_of_device || 'N/A'}</p>
            <p><strong>Modell:</strong> ${dataObject.model || 'N/A'}</p>
            <p><strong>Jahr:</strong> ${dataObject.year || 'N/A'}</p>
            <p><strong>Ausgewählte Geräte:</strong> ${dataObject.selected_devices || 'N/A'}</p>
            <br>
            <h3>Weitere Informationen:</h3>
            <p><strong>Abgasuntersuchung:</strong> ${dataObject.exhaust_gas_measurement ? 'Ja' : 'Nein'}</p>
            <p><strong>Wartungsvertrag:</strong> ${dataObject.has_maintenance_agreement ? 'Ja' : 'Nein'}</p>
            <p><strong>B-Gas vorher:</strong> ${dataObject.has_bgas_before ? 'Ja' : 'Nein'}</p>
            <p><strong>Rechnungsnummer:</strong> ${dataObject.invoice_number || 'N/A'}</p>
            <p><strong>Kundennummer:</strong> ${dataObject.contract_number || 'N/A'}</p>
            <p><strong>Bemerkungen:</strong> ${dataObject.remarks || 'Keine'}</p>
            <p><strong>Mitarbeiterbemerkungen:</strong> ${dataObject.employee_remarks || 'Keine'}</p>
            <p><strong>Firmenbemerkungen:</strong> ${dataObject.company_remarks || 'Keine'}</p>
            <br>
            <p>Mit freundlichen Grüßen,</p>
            <p>B-Gas System</p>
            <img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>
          `;
          
          await getService().emailService.sendMail({
            to: emailConfig[0].sender,
            subject: `Neue Terminbuchung - ${contactObject.first_name} ${contactObject.last_name}`,
            text: companyEmail,
          });
          console.log('Appointment notification email sent to company:', emailConfig[0].sender);
        } catch (emailError) {
          console.warn('Failed to send notification email to company, but continuing:', emailError);
        }
      }
      return res.status(200).json(dataWithContact);
    } else {
      return res.status(409).json({
        message: "Something went wrong while adding the conatct details",
      });
    }
  }

  @tryCatchErrorDecorator
  static async getAppointments(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to get all appointments';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const { start, end } = request.query as unknown as AppointmentForm;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('GET /appointments - Raw query:', request.query);
      console.log('GET /appointments - Parsed start:', start);
      console.log('GET /appointments - Parsed end:', end);
      console.log('GET /appointments - Start type:', typeof start);
      console.log('GET /appointments - End type:', typeof end);
    }
    
    if (!start || !end) {
      console.error('GET /appointments - Missing start or end parameter!');
      return res.status(400).json({ error: 'Missing start or end parameter' });
    }
    
    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.getAppointments(start, end);

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('GET /appointments - Query params:', { start, end });
      console.log('GET /appointments - Data count:', Array.isArray(data) ? data.length : 'Not Array');
      console.log('GET /appointments - Data type:', typeof data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('GET /appointments - First appointment:', {
          _id: data[0]._id,
          calendar_id: data[0].calendar_id,
          start_date: data[0].start_date,
          end_date: data[0].end_date
        });
      }
    }

    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getAppointmentsByDateAndCalenderId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    const XLSX = require("xlsx");
    const serviceContainer = (request as any).service as ServiceContainer;
    const body = request.body;
    const { calendar_id, start_date, end_date } = body;

    const data =
      await serviceContainer.appointmentService.getAppointmentsByDateAndCalendarIdId(
        calendar_id,
        start_date,
        end_date
      );

      const transformedData: any[] = [];

      await Promise.all(
        data.map(async (item: any) => {
          const { service, appointment } = item;

          const contact = await serviceContainer.contactService.getContactById(
            appointment.contact_id
          );

          const serviceInfo = service.services[0];

          transformedData.push({
            "Service ID": serviceInfo?._id,
            "Service Name": serviceInfo?.name,
            "Service Description": serviceInfo?.description,
            "Service Duration (minutes)": serviceInfo?.duration,
            "Service Price": serviceInfo?.price,
            "Service Abbreviation ID": serviceInfo?.abbreviation_id,
            "Contact First Name": contact?.first_name,
            "Contact Last Name": contact?.last_name,
            "Contact Address": contact?.address,
            "Contact Zip Code": contact?.zip_code,
            "Contact Location": contact?.location,
            "Contact Telephone": contact?.telephone,
            "Contact Email": contact?.email,
          });
        })
      );

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(transformedData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="exported_data.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  }

  @tryCatchErrorDecorator
  static async getAppointmentsByContactId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to get all appointments by contactId';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.getAppointmentsByContactId(
      request.params.contactId
    );

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getAppointmentsByCalendarId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to get all appointments by contactId';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.getAppointmentsByCalendarId(
      request.params.calendarId
    );

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateAppointment(
    request: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to update appointment';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddAppointmentRequest;
    const service = (request as any).service as ServiceContainer;
    const { categoryId } = request.params;
    
    // Convert numeric/string boolean values to actual booleans
    const normalizedForm = {
      ...form,
      exhaust_gas_measurement: form.exhaust_gas_measurement !== undefined 
        ? (typeof form.exhaust_gas_measurement === 'boolean' 
            ? form.exhaust_gas_measurement 
            : form.exhaust_gas_measurement === 1 || form.exhaust_gas_measurement === '1' || form.exhaust_gas_measurement === 'true')
        : undefined,
      has_maintenance_agreement: form.has_maintenance_agreement !== undefined
        ? (typeof form.has_maintenance_agreement === 'boolean'
            ? form.has_maintenance_agreement
            : form.has_maintenance_agreement === 1 || form.has_maintenance_agreement === '1' || form.has_maintenance_agreement === 'true')
        : undefined,
      has_bgas_before: form.has_bgas_before !== undefined
        ? (typeof form.has_bgas_before === 'boolean'
            ? form.has_bgas_before
            : form.has_bgas_before === 1 || form.has_bgas_before === '1' || form.has_bgas_before === 'true')
        : undefined,
      archived: form.archived !== undefined
        ? (typeof form.archived === 'boolean'
            ? form.archived
            : form.archived === 1 || form.archived === '1' || form.archived === 'true')
        : undefined,
    };
    
    const contact = await service.contactService.getContactById(
      normalizedForm.contact_id
    );
    const { updated_by, ...rest } = normalizedForm;
    const data = await service.appointmentService.updateAppointment(
      categoryId,
      rest
    );
    const emailConfig = await getService().emailService.getEmailConfig();

    // MySQL returns plain objects, not MongoDB documents
    const contactEmail = contact && (contact as any)._doc 
      ? (contact as any)._doc.email 
      : contact 
      ? (contact as any).email 
      : '';
    
    if (rest.appointment_status === AppointmentStatus.Cancelled) {
      if (updated_by === 'contact') {
        if (emailConfig && emailConfig.length) {
          try {
            await getService().emailService.sendMail({
              to: emailConfig[0].sender,
              subject: "Absage eines B-Gas-Termins",
              text: "Termin (" + rest.start_date + " - " + rest.end_date + ") wurde vom Kunden storniert: " + contactEmail,
            });
          } catch (emailError) {
            console.warn('Failed to send cancellation notification email to company, but continuing:', emailError);
          }
        }
      } else {
        let email =
        "Sehr geehrter Kunde, Ihr Termin wurde abgesagt";
        let subject = "Absage eines B-Gas-Termins";
        const emailTemplate =
          await service.emailService.getEmailTemplates(
            EmailTemplateType.Cancellation
          );

        if (emailTemplate && emailTemplate[0] && emailTemplate[0].template) {
          email = emailTemplate[0].template;
          subject = emailTemplate[0].subject;
        }

        if (contactEmail) {
          try {
            await getService().emailService.sendMail({
              to: contactEmail,
              subject: subject,
              text: email,
            });
          } catch (emailError) {
            console.warn('Failed to send cancellation email to contact, but continuing:', emailError);
          }
        }

        if (emailConfig && emailConfig.length) {
          try {
            await getService().emailService.sendMail({
              to: emailConfig[0].sender,
              subject: subject,
              text: email,
            });
          } catch (emailError) {
            console.warn('Failed to send cancellation notification email to company, but continuing:', emailError);
          }
        }
      }
    }

    // MySQL returns plain objects
    const dataObject = (data as any)._doc ? { ...(data as any)._doc } : { ...data };
    const contactObject = contact && (contact as any)._doc 
      ? { ...(contact as any)._doc } 
      : contact 
      ? { ...contact } 
      : null;

    if (!contactObject) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const dataWithContact = {
      ...dataObject,
      contact: contactObject,
    };

    res.status(200).json(dataWithContact);
  }

  @tryCatchErrorDecorator
  static async deleteAppointment(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to delete appointment';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.deleteAppointment(
      request.params.categoryId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  @tryCatchErrorDecorator
  static async getTimeSlots(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to delete timeslots';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const { date, category_id, service_id } =
      request.query as unknown as TimeSlotsForm;
    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.getTimeSlots(
      date,
      category_id,
      service_id
    );

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(200).json([]);
    }
  }
}

export default AppointmentsControllers;

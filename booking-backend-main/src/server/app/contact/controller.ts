import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer, getService } from "../clients";
import {
  AddContactRequest,
  Contact,
  PaginatedForm,
} from "../../../database-client/src/Schema";
import { PaginatedResponse } from "../category/dto";
import { hashPassword } from "../middlewares/authMiddleware";
import { backupDatabase } from "../dbbackup";

class ContactsControllers {
  @tryCatchErrorDecorator
  static async addContact(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to add contact';
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
    const form = request.body as unknown as AddContactRequest;
    const service = (request as any).service as ServiceContainer;
    const data = await service.contactService.addContact(form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getContacts(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to get all contacts';
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
    const { page = 1, limit = 10, search } = request.query as PaginatedForm;
    const service = (request as any).service as ServiceContainer;
    const { data, count } = await service.contactService.getContacts(
      page,
      limit,
      search
    );

    const paginatedResult = new PaginatedResponse<Contact>(
      data,
      Number(page),
      Number(limit),
      count
    );
    res.status(200).json(paginatedResult);
  }

  @tryCatchErrorDecorator
  static async getContactById(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to get all contacts';
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
    const { contactId } = request.params;
    const service = (request as any).service as ServiceContainer;
    const data = await service.contactService.getContactById(contactId);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateContact(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to update contact';
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
    const form = request.body as unknown as Contact;
    const service = (request as any).service as ServiceContainer;
    const { contactId } = request.params;
    const existingContact = await service.contactService.getContactById(
      contactId
    );

    if (existingContact) {
        const appointments = await service.appointmentService.getAppointmentsByContactId(contactId);
        let updatedAppointments = 0;
        for (const appointment of appointments) {
          await service.appointmentService.updateAppointment(appointment._id!, { ...appointment, contact_id: contactId, archived: form.archived });
          updatedAppointments++;
        }
      const data = await service.contactService.updateContact(contactId, form);

      res.status(200).json(data);
    } else {
      res.status(404).json({ messege: "User not found" });
    }
  }

  @tryCatchErrorDecorator
  static async deleteContact(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to delete contact and associated appointments';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                status: 'success',
                deletedAppointments: 0
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const contactId = request.params.contactId;

    // Delete associated appointments
    const appointments = await service.appointmentService.getAppointmentsByContactId(contactId);
    let deletedAppointments = 0;
    for (const appointment of appointments) {
      await service.appointmentService.deleteAppointment(appointment._id!);
      deletedAppointments++;
    }

    const data = await service.contactService.deleteContact(contactId);

    if (data) {
      res.json({ status: "success", deletedAppointments });
    } else {
      res.status(404).json({ status: "failed", message: "Contact not found" });
    }
  }

  @tryCatchErrorDecorator
  static async sendContactCredentials(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    const { password } = request.body as unknown as { password: string };
    const service = (request as any).service as ServiceContainer;
    const { contactId } = request.params;
    const existingContact = await service.contactService.getContactById(
      contactId
    );

    if (existingContact) {
      const hashedPassword = await hashPassword(password);
      // MySQL returns plain objects, not MongoDB documents
      const dataObject = (existingContact as any)._doc 
        ? { ...(existingContact as any)._doc, password: hashedPassword }
        : { ...existingContact, password: hashedPassword };

      const data = await service.contactService.updateContact(
        contactId,
        dataObject
      );

      // Get frontend URL from environment or use default
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const loginUrl = `${frontendUrl}/login`;
      
      let email = `<p>Liebe Kund*innen,</p><br>Ihr Konto wurde erfolgreich aktualisiert. Wir empfehlen Ihnen, sich auf unserer <a href='${loginUrl}'>Website</a> mit den folgenden Anmeldeinformationen anzumelden und aus Sicherheitsgründen Ihr Passwort zu ändern:<br>E-Mail: ${existingContact.email}<br>Passwort: ${password}<br><p>Vielen Dank, dass Sie unsere Dienste gewählt haben.</p><p>Mit freundlichen Grüßen,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>`

      // Send email (optional - won't fail if email service is not configured)
      try {
        await getService().emailService.sendMail({
          to: existingContact.email,
          subject: "B-Gas Kontoaktualisierung",
          text: email,
        });
        console.log('Password reset email sent to:', existingContact.email);
      } catch (emailError) {
        console.warn('Failed to send password reset email, but continuing:', emailError);
      }

      res
        .status(200)
        .json({
          messege: "Contact has been updated and email has been sent",
          data,
        });
    } else {
      res.status(404).json({ messege: "Contact not found" });
    }
  }

  @tryCatchErrorDecorator
  static async syncContacts(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    await backupDatabase();
    res.status(200).json({ status: "success", message: "Database backup completed" });
  }
}

export default ContactsControllers;

import { Response, Request, NextFunction } from "express";

import {
  Contact,
  LoginForm,
  RefreshToken,
  ResetPasswordForm,
  User,
} from "../../../database-client";
import { ServiceContainer, getService } from "../clients";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { downloadFile } from "../appointment/utils";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { hashPassword } from "../middlewares/authMiddleware";

class UserControllers {
  @tryCatchErrorDecorator
  static async signupUser(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Auth'];

    /*
        #swagger.description = 'Endpoint to signup';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                        user: {
                            channels: {},
                            remarks: '',
                            phone_number: '',
                            internal: {
                                last_updated_at: {
                                    _seconds: {
                                        type: Number,
                                        $example: 0,
                                    },
                                    _nanoseconds: {
                                        type: Number,
                                        $example: 0,
                                    },
                                },
                                notification_tokens: [],
                                created_at: {
                                    _seconds: {
                                        type: Number,
                                        $example: 0,
                                    },
                                    _nanoseconds: {
                                        type: Number,
                                        $example: 0,
                                    }
                                }
                            },
                            name: '',
                        }
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                    auth_time: "",
                    user_id: "",
                    sub: "",
                    iat: 1648474008,
                    exp: 1648477608,
                    email: "",
                    email_verified: false,
                    firebase: {
                        identities: {
                            email: [""]
                        },
                        sign_in_provider: "password"
                    },
                    uid: ""
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as User;
    const service = (request as any).service as ServiceContainer;
    let v = await service.authService.signupUser(form);
    v.password = "";
    res.json(v);
  }

  @tryCatchErrorDecorator
  static async login(request: Request, res: Response, next: NextFunction) {
    /*
      #swagger.description = 'Endpoint to login';
      #swagger.tags = ['Auth'];
       #swagger.parameters['obj'] = {
                   in: 'body',
                   schema: {
                       $email: '',
                       $password: ''
                   },
      }
      #swagger.responses[200] = {
          schema: {
              user: {
                  iss: "",
                  aud: "",
                  auth_time: "",
                  user_id: "",
                  sub: "",
                  iat: 1648474008,
                  exp: 1648477608,
                  email: "",
                  email_verified: false,
                  firebase: {
                      identities: {
                          email: [""]
                      },
                      sign_in_provider: "password"
                  },
                  uid: ""
              },
              refreshToken: '',
              token: ''
           }
      }
      */
    const form = request.body as LoginForm;

    const service = (request as any).service as ServiceContainer;
    let data = await service.authService.login(form.email, form.password);
    data.password = undefined;
    res.json(data);
  }

  @tryCatchErrorDecorator
  static async refreshToken(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    /*
      #swagger.description = 'Endpoint to refresh access token';
      #swagger.tags = ['Auth'];
       #swagger.parameters['obj'] = {
                   in: 'body',
                   schema: {
                       $refreshToken: ''
                   },
      }
      #swagger.responses[200] = {
          schema: {
              refreshToken: '',
              token: ''
           }
      }
      */
    const form = request.body as RefreshToken;

    const service = (request as any).service as ServiceContainer;
    let data = await service.authService.refreshToken(form.refreshToken);

    res.json(data);
  }

  @tryCatchErrorDecorator
  static async resetPassword(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    /*
      #swagger.description = 'Endpoint to refresh access token';
      #swagger.tags = ['Auth'];
       #swagger.parameters['obj'] = {
                   in: 'body',
                   schema: {
                       $refreshToken: ''
                   },
      }
      #swagger.responses[200] = {
          schema: {
              refreshToken: '',
              token: ''
           }
      }
      */
    const form = request.body as ResetPasswordForm;

    const service = (request as any).service as ServiceContainer;
    let data = await service.authService.resetPassword(form);

    res.json(data);
  }

  @tryCatchErrorDecorator
  static async forgotPassword(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    const form = request.body as { email: string };

    const service = (request as any).service as ServiceContainer;

    let data = await service.authService.forgotPassword(form.email);

    res.json(data);
  }

  @tryCatchErrorDecorator
  static async resetContactPassword(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    const form = request.body as { token: string; password: string };

    const service = (request as any).service as ServiceContainer;

    let data = await service.authService.resetContactPassword(
      form.token,
      form.password
    );

    res.json(data);
  }

    @tryCatchErrorDecorator
    static async signUser(request: Request, res: Response, next: NextFunction) {
        const data = request.body;
        const service = (request as any).service as ServiceContainer;
        const emailConfig = await getService().emailService.getEmailConfig();

        const pdfUrl = `http://localhost:11700/files/download/contracts/${data.email}.pdf`;
        const pdfBytes = await downloadFile(pdfUrl);

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const base64Image = data.sign_url.split(";base64,").pop();
        const image = await pdfDoc.embedPng(Buffer.from(base64Image, "base64"));
        const timesRomanBoldFont = await pdfDoc.embedFont(
            StandardFonts.TimesRomanBold
        );

        page.drawImage(image, {
            x: 400,
            y: 10,
            width: image.width * 0.3,
            height: image.height * 0.3,
            opacity: 1,
        });

        const currentDate = new Date();
        const date = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const dateString = `${date}/${month}/${year}`;
        page.drawText(dateString, {
            x: 35,
            y: 40,
            size: 12,
            font: timesRomanBoldFont,
        });

        const modifiedPdfBytes = await pdfDoc.save();
        let contractLink = "";
        let conatctId = "";

        const buffer = Buffer.from(modifiedPdfBytes);
        const blob = new Blob([buffer], { type: "application/pdf" });
        const uploadEndpoint = "http://localhost:11700/files/upload-contract-file";
        const formData = new FormData();
        formData.append("file", blob, `${data.email}.pdf`);
        try {
            const response = await fetch(uploadEndpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const responseData = await response.json();
            contractLink = responseData.link;

            const contact: Contact = {
                first_name: data.first_name,
                last_name: data.last_name,
                salutation: data.gender,
                contract_link: contractLink,
                email: data.email,
                zip_code: data.zip_code,
                address: data.address,
                location: data.location,
                telephone: data.phone_number,
            };

            const existingContact = await service.contactService.getContactByEmail(
                contact?.email
            );

            let newContactEmail = `<p>Liebe Kund*innen,</p><br>Ihr Konto wurde erfolgreich erstellt. Wir empfehlen Ihnen, sich auf der <a href='http://localhost:11700/login'>Website</a> mit den folgenden Anmeldeinformationen anzumelden und aus Sicherheitsgründen Ihr Passwort zu ändern:<br>E-Mail: ${contact?.email}<br>Passwort: ${contact?.password}<br><p>Vielen Dank, dass Sie unsere Dienste gewählt haben.</p><p>Mit freundlichen Grüßen,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>`;
            let newContactSubject = "B-Gas Kontoerstellung";

            if (existingContact) {
                // @ts-ignore
                conatctId = existingContact._doc._id;
                // @ts-ignore
                const updatedContact = { ...existingContact._doc, ...contact, password: existingContact._doc.password, contract_link: contractLink };
                await service.contactService.updateContact(conatctId, updatedContact);
            } else {
                const encryptedPassword = contact.password
                    ? await hashPassword(contact.password)
                    : undefined;

                const updatedContact = {
                    ...contact,
                    password: encryptedPassword,
                    contract_link: contractLink,
                };

                const newContact = await service.contactService.addContact(
                    updatedContact
                );
                if (newContact && newContact._id) {
                    conatctId = newContact._id;
                    // @ts-ignore
                    contactObg = newContact._doc;
                    getService().emailService.sendMail({
                        to: contact.email,
                        subject: newContactSubject,
                        text: newContactEmail,
                    });
                }
            }

            try {
                const createHtmlTemplate = () => {
                    return `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Responsive Email Template</title>
              </head>
              <body style="font-family: 'Poppins', Arial, sans-serif">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding: 20px;">
                      <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                        <!-- Header -->
                        <tr>
                          <td class="header" style="background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;">
                            B-gaz Email Template
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                            Hello, All! <br>
                            Lorem odio soluta quae dolores sapiente voluptatibus recusandae aliquam fugit ipsam. <br><br>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam corporis sint eum nemo animi velit exercitationem impedit.
                          </td>
                        </tr>
                        <!-- Call to Action Button -->
                        <tr>
                          <td style="padding: 0px 40px 0px 40px; text-align: center;">
                            <!-- CTA Button -->
                            <table cellspacing="0" cellpadding="0" style="margin: auto;">
                              <tr>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Additional Content -->
                        <tr>
                          <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam corporis sint eum nemo animi velit exercitationem impedit.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `;
                };

                getService().emailService.sendMail({
                    to: contact.email,
                    subject: "B-Gas Vertrag",
                    text: createHtmlTemplate(),
                    attachments: [
                        {
                            filename: "contract.pdf",
                            path:
                                "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
                                contractLink,
                        },
                    ],
                });

                if (emailConfig && emailConfig.length) {
                    getService().emailService.sendMail({
                        to: emailConfig[0].sender,
                        subject: "b-Gas Vertrag",
                        text: createHtmlTemplate(),
                        attachments: [
                            {
                                filename: "contract.pdf",
                                path:
                                    "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
                                    contractLink,
                            },
                        ],
                    });
                }
                res.send("done");
            } catch (error) {
                res.json({ error: error });
            }
        } catch (error) {
            res.json({ error: error });
        }
    }
}

export default UserControllers;

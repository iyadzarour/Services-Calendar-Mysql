import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import FormData from "form-data";
// Node.js 22+ has native fetch support
import { Appointment, Contact } from "../../../database-client";
import { getService } from "../clients";

export async function uploadCotract(contact: Contact, form: Appointment) {
  const pdfBytes = fs.readFileSync("./template/Wartungsvereinbarung.pdf");
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  let base64Image = undefined;
  let image = undefined;
  let contractLink = undefined;
  if (contact.sign_url) {
    base64Image = contact.sign_url!.split(";base64,").pop();
    image = await pdfDoc.embedPng(Buffer.from(base64Image!, "base64"));
  }

  const emailConfig = await getService().emailService.getEmailConfig();
  const page2 = pdfDoc.getPages()[1];
  const timesRomanBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold
  );

  page2.drawText(
    `Wartungsvereinbarung
   `,
    {
      x: 190,
      y: 690,
      size: 22,
      font: timesRomanBoldFont,
    }
  );
  page2.drawText(`Anleitung`, {
    x: 265,
    y: 715,
    size: 16,
    font: timesRomanBoldFont,
  });
  page2.drawText(`Ausfüllen`, {
    x: 40,
    y: 650,
    size: 14,
    font: timesRomanBoldFont,
  });
  page2.drawText(
    `
    •   Die Wartungsvereinbarung ist am PC, Tablet oder Smartphone ausfüllbar, mit der Original Adobe Acrobat
        Reader App lässt sich auch eine Unterschrift mit dem Finger, Stift oder Maus oder eine 
        digitale Signatur hinzufügen.
        Acrobat Reader Download:
        PC: https://get.adobe.com/de/reader/otherversions/
        Google Playstore: https://play.google.com/store/apps/details?id=com.adobe.reader&hl=de Apple
        Iphone/Ipad: https://apps.apple.com/de/app/adobe-fill-sign/id950099951
    •   Die Typen-Bezeichnung Ihrer Geräte finden Sie am oder im Gerät meist auf einem silbernen Aufkleber.
        Beispiele: VCW AT 194/4-5, HG15 WK19, Luna 3 Blue 180i, CGB-2-24, Logamax plus GB192i`,
    {
      x: 40,
      y: 640,
      size: 10,
    }
  );
  page2.drawText(`Möglichkeiten zur Unterschrift`, {
    x: 40,
    y: 405,
    size: 14,
    font: timesRomanBoldFont,
  });
  page2.drawText(
    `
    •	Auf einem Touch-Monitor, Tablet oder Smartphone kann mit zugehörigem Stift oder Finger direkt unterschrieben
        werden, scrollen Sie zu und vergrößern Sie das Unterschriftenfeld, Stift oder Finger 2 Sekun-
        den gedrückt halten und „Unterschift hinzufügen“ auswählen. Am PC auf „Ausfüllen und Unterschrei- 
        ben“ klicken und dann auf „Selbst signieren“, wenn Sie keine digitale Signatur haben.
    •	Oder dem PDF eine elektronische Signatur extern hinzufügen, z.B. Handysignatur
    •	Oder ausgefüllte Wartungsvereinbarung speichern, 2 mal Seite 1 ausdrucken und auf Papier unter- schreiben
   `,
    {
      x: 40,
      y: 390,
      size: 10,
    }
  );
  page2.drawText(`So können Sie uns die Wartungsvereinbarung zukommen lassen`, {
    x: 40,
    y: 220.5,
    size: 14,
    font: timesRomanBoldFont,
  });
  page2.drawText(
    `•	Gespeichertes und elektronisch signiertes PDF an office@b-gas.at senden`,
    {
      x: 40,
      y: 195.5,
      size: 10,
    }
  );
  page2.drawText(`In Papierform`, {
    x: 40,
    y: 168.5,
    size: 14,
    font: timesRomanBoldFont,
  });
  page2.drawText(
    `
    •	Einen unterschriebenen Ausdruck einem B-GAS Mitarbeiter mitgeben, den anderen Ausdruck behalten
    •	Oder Wartungsvereinbarung im 90° Winkel von oben mit dem Smartphone fotografieren, Foto und ge-
        speichertes PDF (zwecks Lesbarkeit) per E-Mail an office@b-gas.at senden oder per Whatsapp an
        +43 660 947 28 60
    •	Oder unterschriebene Wartungsvereinbarung einscannen und per E-Mail an office@b-gas.at senden
    •	Oder einen unterschriebenen Ausdruck per Post an B-GAS GmbH, Wagramer Straße 133, 1220 Wien
        schicken.`,
    {
      x: 40,
      y: 155,
      size: 10,
    }
  );
  if (image) {
    page.drawImage(image, {
      x: 400,
      y: 10,
      width: image.width * 0.3,
      height: image.height * 0.3,
      opacity: 1,
    });
  }
  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const dateString = `${date}/${month}/${year}`;
  if (image) {
    page.drawText(dateString, {
      x: 35,
      y: 40,
      size: 12,
      font: timesRomanBoldFont,
    });
  }
  if (contact.title) {
    page.drawText(contact.title, {
      x: 165,
      y: 677.5,
      size: 8,
    });
  }
  page.drawText(contact.first_name + " " + contact.last_name, {
    x: 40,
    y: 650,
    size: 8,
  });
  page.drawText(contact.address, {
    x: 40,
    y: 620,
    size: 8,
  });
  page.drawText(form.model || "", {
    x: 320,
    y: 620,
    size: 8,
  });
  page.drawText(form.year || "", {
    x: 523,
    y: 620,
    size: 8,
  });
  page.drawText(contact.zip_code, {
    x: 40,
    y: 593,
    size: 8,
  });
  page.drawText(contact.location, {
    x: 165,
    y: 593,
    size: 8,
  });
  page.drawText(contact.telephone, {
    x: 40,
    y: 564,
    size: 8,
  });
  page.drawText(contact.email, {
    x: 165,
    y: 564,
    size: 7,
  });
  page.drawText("Zu folgenden Preisen pro Gerät in Wien", {
    x: 195,
    y: 535,
    size: 12,
    font: timesRomanBoldFont,
  });
  page.drawText(form.selected_devices || "", {
    x: 35,
    y: 520,
    size: 9,
  });
  page.drawText(
    "*Brennerdichtung (€ 60 - € 90) im Preis bereits enthalten, andere Geräte benötigen diese nicht.",
    {
      x: 100,
      y: 500,
      size: 9,
    }
  );

  page.drawText("Aufpreis für Wegzeit Niederösterreich", {
    x: 195,
    y: 470,
    size: 12,
    font: timesRomanBoldFont,
  });

  page.drawText(`Bis ca. 30 min Fahrt € 20`, {
    x: 35,
    y: 450,
    size: 9,
  });
  page.drawText(`Bis ca. 60 min Fahrt	€ 55`, {
    x: 420,
    y: 450,
    size: 9,
  });
  page.drawText("Im Preis enthalten", {
    x: 35,
    y: 430,
    size: 10,
    font: timesRomanBoldFont,
  });
  page.drawText("Nicht im Preis enthalten", {
    x: 420,
    y: 430,
    size: 10,
    font: timesRomanBoldFont,
  });
  page.drawText(`•	Komplette Wartung während Öffnungszeiten`, {
    x: 30,
    y: 410,
    size: 9,
  });
  page.drawText(`•	Etwaige Materialkosten`, {
    x: 420,
    y: 410,
    size: 9,
  });
  page.drawText(`•	Arbeitszeit pauschal, egal wie lange es dauert`, {
    x: 30,
    y: 390,
    size: 9,
  });
  page.drawText(`•	Reparaturen`, {
    x: 420,
    y: 390,
    size: 9,
  });
  page.drawText(`•	Anfahrt Wien`, {
    x: 30,
    y: 370,
    size: 9,
  });
  page.drawText(
    "Alle Preise verstehen sich inkl. 20% USt. Preisänderungen vorbehalten.",
    {
      x: 150,
      y: 340,
      size: 9,
    }
  );
  page.drawText("Bonus", {
    x: 265,
    y: 315,
    size: 12,
    font: timesRomanBoldFont,
  });
  page.drawText(`•	12 Monate Garantie auf Abgaswerte`, {
    x: 35,
    y: 295,
    size: 10,
  });
  page.drawText(`sätze abends, Sa/So/Feiertags, Heizungstörung, Ab-`, {
    x: 350,
    y: 295,
    size: 10,
  });
  page.drawText(`•	Protokollführung Ihrer Geräte`, {
    x: 35,
    y: 275,
    size: 10,
  });
  page.drawText(`flussverstopfung, Rohrbruch, Sanitär...`, {
    x: 350,
    y: 275,
    size: 10,
  });
  page.drawText(`•	Reparaturen innerhalb 24h`, {
    x: 35,
    y: 255,
    size: 10,
  });
  page.drawText(`Jedoch werden unsere Weg- und Arbeitszeit zu Prei`, {
    x: 350,
    y: 255,
    size: 10,
  });
  page.drawText(`•	Keinen Überstundenaufschlag für Notdienstein-`, {
    x: 35,
    y: 235,
    size: 10,
  });
  page.drawText(`sen von normalen Öffnungszeiten verrechnet.`, {
    x: 350,
    y: 235,
    size: 10,
  });
  page.drawText(
    `Die Vereinbarung ist jederzeit kündbar und verliert bei Umzug die Gültigkeit. Eine Meldung an uns ist trotz-
dem notwendig, da wir Sie sonst jährlich kontaktieren. Sie sind nicht verpflichtet die jährliche Wartung durch uns in Anspruch zu nehmen,
müssen uns aber Bescheid geben. Mit Ihrer Unterschrift erhalten wir die Erlaubnis, Sie jährlich bezüglich der
anstehenden Wartung zwecks eines Termines zu erinnern (z.B. per E-Mail, Telefon, SMS oder Brief). Gewährleistung auf
unsere Arbeit und Garantie auf Ersatzteile. Mit Ihrer Unterschrift akzeptieren Sie die elektronische Speicherung Ihrer
Daten gemäß DSGVO. Informationen zum Datenschutz finden Sie auf www.installateur-bgas.at/impressum.`,
    {
      x: 30,
      y: 180,
      size: 9,
    }
  );
  page.drawText(contact.salutation, {
    x: 60,
    y: 680,
    size: 8,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(modifiedPdfBytes);
  const uploadEndpoint = "http://localhost:11700/api/files/upload-contract-file";
  const formData = new FormData();
  formData.append("file", buffer, {
    filename: `${contact.email}.pdf`,
    contentType: "application/pdf",
  });
  try {
    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json() as { link?: string };
    contractLink = responseData.link;
    
    if (!contractLink) {
      throw new Error("No link returned from upload endpoint");
    }

    const createHtmlTemplateForSign = () => {
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
                                 <td align="center" style="background-color: #345C72; padding: 10px 20px; border-radius: 5px;">
                                     <a  href="http://localhost:11700/sign_contra/?first_name=${
                                       contact.first_name
                                     }&last_name=${contact.last_name}&email=${
        contact.email
      }&phone_number=${contact.telephone}&location=${contact.location}&address=${contact.address}&gender=${
        contact.salutation
      }&zip_code=${
        contact.zip_code ?? ""
      }" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold;">Make a Signiture</a>
                                 </td>
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
      text: contact.sign_url
        ? createHtmlTemplate()
        : createHtmlTemplateForSign(),
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
  } catch (error) {
    console.log("error", error);
    return null;
  }

  return contractLink;
}

export async function downloadFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
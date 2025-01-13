import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(formData);
const key = "b3299d540e2f861cc5f1931c9139fadd-0920befd-dc3a4192"
const mg = mailgun.client({
  username: "api",
  key: key,
  url: "https://api.eu.mailgun.net",
});

const sendEmail = async (recipient, subject, htmlContent) => {
  try {
    const response = await mg.messages.create("preemly.eu", {
      from: "info@preemly.eu", // Must match the verified Mailgun domain
      to: [recipient],
      subject: subject,
      html: htmlContent,
    });

    return response;
  } catch (error) {
    console.error("Error sending email with Mailgun:", error);
    throw error;
  }
};
export default sendEmail;

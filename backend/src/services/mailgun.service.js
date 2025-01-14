import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(formData);

// Используем ключ из примера
const key = "b57fced339f8b56bda91042862a71e6a-191fb7b6-1a0e98af";
const domain = "sandbox962334c8dbd348f8b4a8584175564a7b.mailgun.org";

const mg = mailgun.client({
  username: "api",
  key: key,
  url: "https://api.mailgun.net",
});

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const sendEmail = async (recipient, subject, htmlContent) => {
  if (Array.isArray(recipient)) {
    for (let email of recipient) {
      if (!validateEmail(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  } else if (!validateEmail(recipient)) {
    throw new Error(`Invalid email address: ${recipient}`);
  }

  try {
    const response = await mg.messages.create(domain, {
      from: "Excited User <mailgun@sandbox962334c8dbd348f8b4a8584175564a7b.mailgun.org>",
      to: recipient,
      subject: subject,
      html: htmlContent,
    });

    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
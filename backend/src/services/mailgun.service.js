import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(formData);
const key = "b57fced339f8b56bda91042862a71e6a-191fb7b6-1a0e98af";
const mg = mailgun.client({
  username: "mudkip",
  key: key,
  url: "https://api.eu.mailgun.net",
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
    const response = await mg.messages.create("preemly.eu", {
      from: "info@preemly.eu",
      to: recipient,
      subject: subject,
      html: htmlContent,
    });

    return response;
  } catch (error) {
    console.error("Error in Create Event:", error);
    throw error;
  }
};

export default sendEmail;

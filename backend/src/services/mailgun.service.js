import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(formData);
const key = process.env.MAILGUN_KEY;
const mg = mailgun.client({
  username: "api",
  key: key,
  url: "https://api.eu.mailgun.net",
});
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;

  return re.test(email);
};
// const sendEmail = async (recipient, subject, htmlContent) => {
//   try {
//     const response = await mg.messages.create("preemly.eu", {
//       from: "info@preemly.eu", // Must match the verified Mailgun domain
//       to: [recipient],
//       subject: subject,
//       html: htmlContent,
//     });
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
    const response = await mg.messages.create("mail.preemly.eu", {
      from: "Preemly <mailgun@mail.preemly.eu>",
      to: recipient,
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

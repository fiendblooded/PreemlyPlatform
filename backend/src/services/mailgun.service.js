export default sendEmail;
import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

// Настройки Mailgun
const mailgun = new Mailgun(formData);
const key = "b57fced339f8b56bda91042862a71e6a-191fb7b6-1a0e98af";
const domain = "sandbox962334c8dbd348f8b4a8584175564a7b.mailgun.org";
const mg = mailgun.client({ username: "api", key: key });

// Функция проверки валидности email адреса
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// Функция отправки письма
const sendEmail = async (recipient, subject, body) => {
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
      from: `postmaster@${domain}`,
      to: recipient,
      subject: subject,
      text: body,
    });

    return response;
  } catch (error) {
    console.error("Error in sending email:", error);
    throw error;
  }
};

// // Использование функции
// sendEmail(
//   "bar@example.com",
//   "Hello",
//   "Testing some Mailgun awesomeness!"
// ).then((response) => {
//   console.log(response);
// }).catch((error) => {
//   console.error(error);
// });
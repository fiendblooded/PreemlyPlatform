import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(formData);

// Secure keys
const apiKey = "ea04e51b45d3215526666c21131cba69-191fb7b6-e6c58c54"; // Use keyid key
const domain = "sandbox-123.mailgun.org";

// Initialize Mailgun client
const mg = mailgun.client({
  username: "api",
  key: apiKey,
  url: "https://api.mailgun.net", // Change to "https://api.eu.mailgun.net" if required
});

/**
 * Validates an email address format.
 */
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

/**
 * Sends an email.
 */
const sendEmail = async (recipient, subject, htmlContent) => {
  // Validate recipients
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

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

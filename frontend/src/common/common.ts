export function getDateRangeDetails(date1: string, date2: string): string {
  const startDate = new Date(date1);
  const endDate = new Date(date2);

  // Validate the dates
  if (isNaN(startDate.getTime()) && isNaN(endDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  // if (startDate > endDate) {
  //   throw new Error("Start date must be earlier than end date.");
  // }

  // Check if the dates are on the same day
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  // Get human-readable range
  let range: string;
  const options = { year: "numeric", month: "long", day: "numeric" } as const;

  if (isSameDay) {
    const date = startDate.toLocaleDateString(undefined, options);
    const startTime = startDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (startTime === endTime) {
      range = `${date}, ${startTime}`;
    } else {
      range = `${date}, ${startTime} - ${endTime}`;
    }
  } else {
    range = `${startDate.toLocaleDateString(
      undefined,
      options
    )} - ${endDate.toLocaleDateString(undefined, options)}`;
  }

  // Get timezone in GMT+x (City) format
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneOffset = startDate.getTimezoneOffset(); // Offset in minutes
  const gmtOffset = -timeZoneOffset / 60; // Convert to hours
  const gmtString = `GMT${
    gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset
  } (${timeZone})`;

  // Calculate the duration
  const durationMs = endDate.getTime() - startDate.getTime();
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  // Build the duration string, excluding 0 values
  const durationParts = [];
  if (days > 0) durationParts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) durationParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0)
    durationParts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  const duration = durationParts.length
    ? durationParts.join(", ") + " left"
    : "";

  // Return the formatted result
  return `${range} ${duration != "" ? `/ ${duration}` : ""}`;
}
export function getDateTimeStatus(
  startDateTime?: string | Date | null,
  endDateTime?: string | Date | null
): { type: string; color: string } {
  if (!startDateTime || !endDateTime) {
    return { type: "Error", color: "#FF0000" }; // Red
  }

  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (now < start) {
    return { type: "Incoming", color: "#00aef0" }; // Blue
  } else if (now > end) {
    return { type: "Past", color: "#6b6b6b" }; // Grey
  } else {
    return { type: "Ongoing", color: "#2a9134" }; // Green
  }
}
export function isTablet(): boolean {
  // Define a typical tablet screen size range
  const width = window.innerWidth;

  // Check if the width falls in the common tablet range (between mobile and desktop)
  return width >= 600 && width <= 1200;
}

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== "undefined") {
      resolve(); // Google Maps already loaded
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);
  });
};

export const getMailHtml = (
  guestName: string,
  qrContent: string,
  eventTitle: string,
  eventDescription: string,
  eventDate: string
) => {
  const htmlContentNew = `
  <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Your Event Ticket</title>
          <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333;
              margin: 0;
              padding: 0;
          }
          a {
              text-decoration: none;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              overflow: hidden;
          }
          .header {
              background-color: #9370db;
              color: #fff;
              text-align: center;
              padding: 20px;
              font-size: 1.5rem;
          }
          /* Event Details */
          .content {
              padding: 20px;
              text-align: center;
          }
          .content p {
              font-size: 1rem;
              line-height: 1.6;
              margin: 10px 0;
          }
          .details {
              margin: 20px 0;
          }
          .details strong {
              color: #9370db;
          }
          /* QR Code */
          .qr-code {
              margin: 20px auto;
              text-align: center;
          }
          .qr-code img {
              width: 200px;
              height: 200px;
              border: 5px solid #f4c430;
              border-radius: 8px;
          }
          /* Footer */
          .footer {
              background-color: #f4c430;
              color: #333;
              text-align: center;
              padding: 10px;
              font-size: 0.9rem;
          }
          </style>
      </head>
      <body>
          <div class="container">
          <div class="header">
              🎉 ${guestName}, here is your Preem Ticket for <strong>${eventTitle}</strong>
          </div>
          <div class="content">
              <p>${eventDescription}</p>
              <div class="details">
              <p><strong>Date:</strong> ${new Date(
                eventDate
              ).toLocaleString()}</p>
              </div>
              <div class="qr-code">
              <img src="${qrContent}" alt="Your QR Code" />
              </div>
              <p>Please show this QR code at the event for entry.</p>
          </div>
          <div class="footer">
              See you there! 🎟 <br />
              Preemly Team
          </div>
          </div>
      </body>
      </html>
  
  `;
  return htmlContentNew;
};

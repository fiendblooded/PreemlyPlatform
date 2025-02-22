import { css, styled } from "styled-components";
import LogoSmall from "../assets/logosmall.svg";
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
  // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // const timeZoneOffset = startDate.getTimezoneOffset(); // Offset in minutes
  // const gmtOffset = -timeZoneOffset / 60; // Convert to hours
  // const gmtString = `GMT${
  //   gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset
  // } (${timeZone})`;

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

type EmailExtraModule = {
  enabled: boolean;
  content: string;
};

export function getMailHtml(
  guestName: string,
  qrCodeImageSrc: string,
  eventTitle: string,
  eventLogoImageSrc: string,
  eventDescription: string,
  eventDate: string,
  eventEndDate: string,
  parkingOptions: EmailExtraModule,
  scheduleImageSrc: EmailExtraModule,
  diningOptions: EmailExtraModule,
  eventLocation: string,
  bodyOnly?: boolean
): string {
  console.log(eventLogoImageSrc);
  const imageLink = "https://platform.preemly.eu/logosmall.png";
  const bodyContent = `
  <table width='100%' height="100%" border='0' cellspacing='0' cellpadding='0' style='background-color: #EEEDF2; min-height: 100vh;'>
        <tr>
            <td align='center'>
                <table width='700' border='0' cellspacing='0'  style='background-color: #ffffff; border-radius: 10px; margin:20px auto;'>
                    <tr>
                        <td align='center' style='background-color: black; padding: 20px; color: #ffffff; font-size: 14px;'>
                           <img src='${imageLink}' alt="Icon description" />
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 28px; font-weight: bold; color: #333; padding-top:20px;'>You're invited, ${guestName}!</td>
                    </tr>
                    <tr  >
                        <td align='center' style='padding: 20px;'>
                            <img src='${eventLogoImageSrc}' alt='Event Logo' style='width: 100%; max-height: 400px; border-radius: 8px; object-fit: cover; object-position: center;'>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 24px; font-weight: bold; color: #333;'>${eventTitle}</td>
                    </tr>
                    
                    <tr>
                        <td style='font-size: 18px; text-align: left; padding: 20px;'>
                            <p style='font-weight: bold; color: #333;'>📅 Date & Time</p>
                            <p style='color: #666;'>${getDateRangeDetails(
                              eventDate,
                              eventEndDate
                            )}</p>
                            <p style='font-weight: bold; color: #333;'>📍 Location</p>
                            <p style='color: #666;'>${eventLocation}</p>
                            ${
                              parkingOptions.enabled
                                ? `
                            <p style='font-weight: bold; color: #333;'>🚗 Parking Information</p>
                            <p style='color: #666;'>${parkingOptions.content}</p>
                            `
                                : ""
                            }
                            ${
                              scheduleImageSrc.enabled
                                ? `
                            <p style='font-weight: bold; color: #333;'>📅 Event Schedule</p>
                            <p style='color: #666;'>${scheduleImageSrc.content}</p>
                            `
                                : ""
                            }
                            ${
                              diningOptions.enabled
                                ? `
                            <p style='font-weight: bold; color: #333;'>🍽 Dining Options</p>
                            <p style='color: #666;'>${diningOptions.content}</p>
                            `
                                : ""
                            }
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 14px; color: #666;'>
                            ${eventDescription}
                        </td>
                    </tr>
                   
                    <tr>
                        <td align='center' style='font-size: 24px; font-weight: bold; color: #333;'>🎟 Your Invitation QR Code</td>
                    </tr>
                    <tr>
                        <td align='center'>
                            <img src='${qrCodeImageSrc}' alt='QR Code' style='max-width: 250px;'>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 16px; color: #666;'>Please present this QR code at the entrance for a smooth check-in process.</td>
                    </tr>
                    
                    
                    
                    <tr>
                        <td align='center' style='background-color: black; padding: 20px; color: #ffffff; font-size: 14px;'>
                            Follow us on: 
                            <a href='https://x.com/trypreemly' style='color: #ffffff; text-decoration: none; margin: 0 10px;'>Twitter</a> |
                            <a href='https://www.linkedin.com/company/106173934' style='color: #ffffff; text-decoration: none; margin: 0 10px;'>LinkedIn</a>
                            <br>
                            Visit our website: <a href='https://preemly.eu' style='color: #FFCC32; text-decoration: none;'><b>preemly.eu</b></a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;
  if (bodyOnly) {
    return bodyContent;
  } else {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>${eventTitle} - Preemly</title>
    </head>
    <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #EEEDF2;'>
        ${bodyContent}
    </body>
    </html>`;
  }
}

export const SvgSC = styled.svg<{
  size?: number;
  verticalAlign?: boolean;
  paddingRight?: number;
  paddingTop?: number;
}>`
  ${(props) =>
    props.size
      ? css`
          height: ${props.size}px;
          width: ${props.size}px;
        `
      : ""}
  vertical-align : ${(props) => (props.verticalAlign ? "sub" : "baseline")};
  padding-right: ${(props) =>
    props.paddingRight ? props.paddingRight + "px" : "auto"};
  padding-top: ${(props) =>
    props.paddingTop ? props.paddingTop + "px" : "auto"};
`;
export type IconProps = {
  color?: string;
  size?: number;
  active?: boolean;
  paddingRight?: number;
  paddingTop?: number;
};

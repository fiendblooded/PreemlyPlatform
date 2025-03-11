import { css, styled } from "styled-components";
export function getDateRangeDetails(date1: string, date2: string): string {
  const startDate = new Date(date1);
  const endDate = new Date(date2);

  // Validate the dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  // if (startDate > endDate) {
  //   throw new Error("Start date must be earlier than end date.");
  // }

  // Check if the dates are on the same day
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  // Get human-readable range
  let range: string;
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;

  if (isSameDay) {
    const date = startDate.toLocaleDateString(undefined, dateOptions);
    const startTime = startDate.toLocaleTimeString(undefined, timeOptions);
    const endTime = endDate.toLocaleTimeString(undefined, timeOptions);

    range = `${date}, ${startTime} - ${endTime}`;
  } else {
    const startDateTime = `${startDate.toLocaleDateString(
      undefined,
      dateOptions
    )} ${startDate.toLocaleTimeString(undefined, timeOptions)}`;
    const endDateTime = `${endDate.toLocaleDateString(
      undefined,
      dateOptions
    )} ${endDate.toLocaleTimeString(undefined, timeOptions)}`;

    range = `${startDateTime} - ${endDateTime}`;
  }

  // Return the formatted result without any "days left" information
  return range;
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
    return { type: "Upcoming", color: "#00aef0" }; // Blue
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
  items?: ScheduleItem[]; // Use ScheduleItem type instead of any
};

// Define ScheduleItem type
export type ScheduleItem = {
  id: number;
  title: string;
  startDateTime: string; // ISO string format
  endDateTime: string; // ISO string format
  location: string;
  icon: string;
  description?: string;
  // Keep time field for backward compatibility, but it will be deprecated
  time?: string;
};

function generateGoogleCalendarUrl(
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  location: string
): string {
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedLocation = encodeURIComponent(location);
  const formattedStartDate = new Date(startDate)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");
  const formattedEndDate = new Date(endDate)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${formattedStartDate}%2F${formattedEndDate}&details=${encodedDescription}&location=${encodedLocation}&text=${encodedTitle}`;
}

function generateOutlookCalendarUrl(
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  location: string
): string {
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedLocation = encodeURIComponent(location);
  const formattedStartDate = new Date(startDate).toISOString().slice(0, 19);
  const formattedEndDate = new Date(endDate).toISOString().slice(0, 19);

  return `https://outlook.live.com/calendar/0/action/compose?allday=false&body=${encodedDescription}&enddt=${formattedEndDate}&location=${encodedLocation}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${formattedStartDate}&subject=${encodedTitle}`;
}

export function getMailHtml(
  guestName: string,
  qrCodeImageSrc: string,
  eventTitle: string,
  eventLogoImageSrc: string,
  eventDescription: string,
  eventDate: string,
  eventEndDate: string,
  parkingOptions: EmailExtraModule,
  scheduleOptions: EmailExtraModule,
  diningOptions: EmailExtraModule,
  eventLocation: string,
  bodyOnly?: boolean,
  customHtmlContent?: string
): string {
  // If a custom HTML template is provided, use it with placeholders
  if (customHtmlContent) {
    // Replace placeholders with actual content
    let customHtml = customHtmlContent;

    // Replace guest name placeholder
    if (customHtml.includes('id="guest-name"')) {
      customHtml = customHtml.replace(
        /<div id="guest-name"[^>]*>.*?<\/div>/g,
        `<div id="guest-name">${guestName}</div>`
      );
    }

    // Replace QR code placeholder
    if (customHtml.includes('id="qr-code"')) {
      customHtml = customHtml.replace(
        /<div id="qr-code"[^>]*>.*?<\/div>/g,
        `<div id="qr-code"><img src="${qrCodeImageSrc}" alt="QR Code" style="display:block; max-width: 250px; width:100%; height:auto; margin:0 auto;"></div>`
      );
    }

    // If bodyOnly is true, return just the custom HTML
    if (bodyOnly) {
      return customHtml;
    }

    // Otherwise, wrap it in a proper HTML document
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>${eventTitle} - Preemly</title>
    </head>
    <body style='margin: 0; padding: 0; font-family: Axiforma, Arial, sans-serif; background-color: #EEEDF2;'>
        ${customHtml}
    </body>
    </html>`;
  }

  // If no custom template, use the default template
  const lightModeLogoLink = "https://platform.preemly.eu/logosmall.png";

  const bodyContent = `
  <table width='100%' height="100%" border='0' cellspacing='0' cellpadding='0' style='background-color: #EEEDF2; min-height: 100vh;'>
        <tr>
            <td align='center' style='padding:0;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 10px; margin:0 auto; width:100%; max-width:700px;'>
                    <tr>
                        <td align='center' style='padding:0; margin:0; background-color:#ffffff; border-radius:10px 10px 0 0; line-height:0; font-size:0;'>
                           <img src='${lightModeLogoLink}' alt="Preemly Logo" style='display:block; width:100%; height:auto; border-radius:10px 10px 0 0; margin:0; padding:0;'/>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 24px; font-weight: bold; color: #333; padding-top:20px; padding-left: 20px; padding-right: 20px;'>You're invited, ${guestName}!</td>
                    </tr>
                    <tr>
                        <td align='center' style='padding: 20px;'>
                            <img src='${eventLogoImageSrc}' alt='Event Logo' style='display:block; width:100%; height:auto; max-height:400px; border-radius:8px; object-fit:cover; object-position:center;'>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 22px; font-weight: bold; color: #333; padding-left: 20px; padding-right: 20px;'>${eventTitle}</td>
                    </tr>
                     <tr>
                        <td align='center' style='font-size: 16px; color: #666; padding: 10px 20px 20px 20px;'>
                            ${eventDescription}
                        </td>
                    </tr>

                    <tr>
                        <td style='text-align: center; padding: 20px;'>
                            <p style='font-weight: bold; color: #333; margin-bottom: 5px; font-size: 18px;'>📅 Date & Time</p>
                            <p style='color: #666; margin-top: 0; font-size: 16px;'>${getDateRangeDetails(
                              eventDate,
                              eventEndDate
                            )}</p>
                            <p style='font-weight: bold; color: #333; margin-bottom: 5px; font-size: 18px;'>📍 Location</p>
                            <p style='color: #666; margin-top: 0; font-size: 16px;'>${eventLocation}</p>
                            ${
                              parkingOptions.enabled
                                ? `
                            <p style='font-weight: bold; color: #333; margin-bottom: 5px; font-size: 18px;'>🚗 Parking Information</p>
                            <p style='color: #666; margin-top: 0; font-size: 16px;'>${parkingOptions.content}</p>
                            `
                                : ""
                            }
                            ${
                              scheduleOptions.enabled
                                ? `
                            <p style='font-weight: bold; color: #333; margin-bottom: 5px; font-size: 18px;'>📅 Event Schedule</p>
                            <p style='color: #666; margin-top: 0; font-size: 16px;'>${generateScheduleHtml(
                              scheduleOptions
                            )}</p>
                            `
                                : ""
                            }
                            ${
                              diningOptions.enabled
                                ? `
                            <p style='font-weight: bold; color: #333; margin-bottom: 5px; font-size: 18px;'>🍽 Dining Options</p>
                            <p style='color: #666; margin-top: 0; font-size: 16px;'>${diningOptions.content}</p>
                            `
                                : ""
                            }
                        </td>
                    </tr>

                    <tr>
                        <td align='center' style='font-size: 22px; font-weight: bold; color: #333; padding-top: 10px;'>Your Invitation QR Code</td>
                    </tr>
                    <tr>
                        <td align='center' style='padding: 15px 0;'>
                            <img src='${qrCodeImageSrc}' alt='QR Code' style='display:block; max-width: 250px; width:100%; height:auto; margin:0 auto;'>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='font-size: 16px; color: #666; padding: 0 20px 20px 20px;'>Please present this QR code at the entrance for a smooth check-in process.</td>
                    </tr>
                   <tr>
                      <td align='center' style='padding: 20px; padding-bottom: 40px;'>
                        <table border='0' cellspacing='0' cellpadding='0' width='100%'>
                          <tr>
                            <td align='center' style='padding: 0 10px 10px 10px;'>
                              <a href="${generateGoogleCalendarUrl(
                                eventTitle,
                                eventDescription,
                                eventDate,
                                eventEndDate,
                                eventLocation
                              )}" target="_blank" rel="noopener noreferrer" style="border: 2px solid #4285F4; color: #4285F4; padding: 12px 16px; text-decoration: none; font-size: 15px; border-radius: 5px; font-weight: bold; display: inline-block; width:100%; max-width:300px; text-align: center; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" alt="Google Calendar" style="vertical-align: middle; margin-right: 8px; width: 20px; height: 20px;">
                                Add to Google Calendar
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align='center' style='padding: 0 10px;'>
                              <a href="${generateOutlookCalendarUrl(
                                eventTitle,
                                eventDescription,
                                eventDate,
                                eventEndDate,
                                eventLocation
                              )}" target="_blank" rel="noopener noreferrer" style="border: 2px solid #0078D4; color: #0078D4; padding: 12px 16px; text-decoration: none; font-size: 15px; border-radius: 5px; font-weight: bold; display: inline-block; width:100%; max-width:300px; text-align: center; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/1101px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png" alt="Outlook Calendar" style="vertical-align: middle; margin-right: 8px; width: 20px; height: 20px;">
                                Add to Outlook Calendar
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                        <td align='center' style='background-color: black; padding: 20px; color: #ffffff; font-size: 14px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;'>
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
        <style type="text/css">
            @media screen and (max-width: 620px) {
                .main-table {
                    width: 100% !important;
                }
                .content {
                    padding: 10px !important;
                }
                .header-text {
                    font-size: 22px !important;
                }
                .event-title {
                    font-size: 20px !important;
                }
                .description {
                    font-size: 15px !important;
                }
                .section-title {
                    font-size: 17px !important;
                }
                .section-content {
                    font-size: 15px !important;
                }
                .button-text {
                    font-size: 14px !important;
                }
            }
        </style>
    </head>
    <body style='margin: 0; padding: 0; font-family: Axiforma, Arial, sans-serif; background-color: #EEEDF2;'>
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

export function formatDateTime(date: string): string {
  const dateObj = new Date(date);

  // Validate the date
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date format.");
  }

  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;

  const formattedDate = dateObj.toLocaleDateString(undefined, dateOptions);
  const formattedTime = dateObj.toLocaleTimeString(undefined, timeOptions);

  return `${formattedDate}, ${formattedTime}`;
}

// Generate schedule HTML from items array if available
const generateScheduleHtml = (scheduleOptions: EmailExtraModule): string => {
  if (!scheduleOptions.enabled) return "";

  // Helper function to format date and time
  const formatTimeRange = (item: ScheduleItem) => {
    // If we have startDateTime and endDateTime, use them
    if (item.startDateTime && item.endDateTime) {
      const start = new Date(item.startDateTime);
      const end = new Date(item.endDateTime);

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      };

      // If same day, just show time range
      if (start.toDateString() === end.toDateString()) {
        return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(
          end
        )}`;
      }

      // If different days, show full date and time for both
      return `${formatDate(start)}, ${formatTime(start)} - ${formatDate(
        end
      )}, ${formatTime(end)}`;
    }

    // Fallback to time field for backward compatibility
    return item.time || "";
  };

  // If there are schedule items, render them
  if (scheduleOptions.items && scheduleOptions.items.length > 0) {
    return `
      <tr>
        <td style='padding: 20px 30px; background-color: #ffffff;'>
          <table width='100%' border='0' cellspacing='0' cellpadding='0'>
            <tr>
              <td style='padding-bottom: 15px; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #333333;'>
                Event Schedule
              </td>
            </tr>
            <tr>
              <td style='padding: 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #666666;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                  ${scheduleOptions.items
                    .map(
                      (item) => `
                    <tr>
                      <td style='padding: 10px 0; border-bottom: 1px solid #eeeeee;'>
                        <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                          <tr>
                            <td width='40' style='font-size: 24px; vertical-align: top; padding-right: 10px;'>${
                              item.icon
                            }</td>
                            <td>
                              <div style='font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333333;'>${
                                item.title
                              }</div>
                              ${
                                item.description
                                  ? `<div style='font-family: Arial, sans-serif; font-size: 14px; color: #666666; margin: 4px 0;'>${item.description}</div>`
                                  : ""
                              }
                              <div style='font-family: Arial, sans-serif; font-size: 14px; color: #666666;'>${formatTimeRange(
                                item
                              )}</div>
                              <div style='font-family: Arial, sans-serif; font-size: 14px; color: #999999;'>${
                                item.location
                              }</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  // If no items but content is provided, use the content
  if (scheduleOptions.content) {
    return `
      <tr>
        <td style='padding: 20px 30px; background-color: #ffffff;'>
          <table width='100%' border='0' cellspacing='0' cellpadding='0'>
            <tr>
              <td style='padding-bottom: 15px; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #333333;'>
                Event Schedule
              </td>
            </tr>
            <tr>
              <td style='padding: 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #666666;'>
                ${scheduleOptions.content}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  return "";
};

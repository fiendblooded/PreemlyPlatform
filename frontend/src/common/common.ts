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
    range = `${date}, ${startTime} - ${endTime}`;
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
  const duration = durationParts.join(", ");

  // Return the formatted result
  return `${range} / ${gmtString} / ${duration} left`;
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
  console.log("DATES" + now, start);
  if (now < start) {
    return { type: "Incoming", color: "#00aef0" }; // Blue
  } else if (now > end) {
    return { type: "Past", color: "grey" }; // Grey
  } else {
    return { type: "Ongoing", color: "#2a9134" }; // Green
  }
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

export const getMailHtml = (guestName: string, qrContent: string) => {
  const htmlContentNew = `
  <!DOCTYPE html>

<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<title></title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Cabin" rel="stylesheet" type="text/css"/><!--<![endif]-->
<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		sup,
		sub {
			font-size: 75%;
			line-height: 0;
		}

		@media (max-width:710px) {
			.image_block div.fullWidth {
				max-width: 100% !important;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}

			.row-13 .column-1 .block-2.paragraph_block td.pad>div,
			.row-13 .column-2 .block-2.paragraph_block td.pad>div {
				text-align: left !important;
				font-size: 16px !important;
			}

			.row-13 .column-1 .block-1.heading_block h3,
			.row-13 .column-2 .block-1.heading_block h3 {
				text-align: left !important;
				font-size: 24px !important;
			}

			.row-13 .column-1 .block-1.heading_block td.pad,
			.row-13 .column-2 .block-1.heading_block td.pad {
				padding: 10px 0 !important;
			}

			.row-13 .column-1,
			.row-13 .column-2 {
				padding: 20px !important;
			}
		}
	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>
<body class="body" style="background-color: #fbfbfb; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
<table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 10px; padding-left: 8px; padding-right: 10px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-left:15px;width:100%;padding-right:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div style="max-width: 235.2px;"><img alt="Logo" height="auto" src="https://drive.google.com/uc?id=1-4kx45bNcfTkLK8i2Iv8yMCs__wQj0te" style="display: block; height: auto; border: 0; width: 100%;" title="Logo" width="235.2"/></div>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f2f2f2; border-radius: 0; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"></div>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; background-color: #fbfbfb; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 25px; padding-left: 25px; padding-right: 25px; padding-top: 25px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="width:100%;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 640px;"><img alt="Campus" height="auto" src="https://drive.google.com/uc?id=1FX62JP5V9WP1sF65FgSBrPf3A2XQni5i
" style="display: block; height: auto; border: 0; width: 100%;" title="Campus" width="640"/></div>
</div>
</td>
</tr>
</table>
<div class="spacer_block block-2" style="height:10px;line-height:10px;font-size:1px;"> </div>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td class="pad" style="padding-left:5px;padding-right:5px;padding-top:10px;">
<div style="color:#393d47;direction:ltr;font-family:Cabin, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:15px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:22.5px;">
<p style="margin: 0; margin-bottom: 16px;">Dear ${guestName},</p>
<p style="margin: 0;">We’re thrilled to welcome you to the <strong>Digital Fair Portal of Revuca City Hackathon</strong>, where your ideas will shape smarter cities. Join us on <strong>January 31st - February 1st, 2025</strong>, for two days of innovation, collaboration, and excitement.</p>
</div>
</td>
</tr>
</table>
<div class="spacer_block block-4" style="height:10px;line-height:10px;font-size:1px;"> </div>
<table border="0" cellpadding="0" cellspacing="0" class="button_block block-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:15px;padding-left:5px;padding-right:5px;padding-top:15px;text-align:left;">
<div align="left" class="alignment"><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.hacknime.to/en/hackathon/digital-fair-portal-of-the-city" style="height:38px;width:147px;v-text-anchor:middle;" arcsize="0%" stroke="false" fillcolor="#00afef">
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center dir="false" style="color:#ffffff;font-family:Arial, sans-serif;font-size:14px">
<![endif]--><a class="button" href="https://www.hacknime.to/en/hackathon/digital-fair-portal-of-the-city" style="background-color:#00afef;border-bottom:0px solid #8a3b8f;border-left:0px solid #8a3b8f;border-radius:0px;border-right:0px solid #8a3b8f;border-top:0px solid #8a3b8f;color:#ffffff;display:inline-block;font-family:Cabin, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;" target="_blank"><span style="word-break: break-word; padding-left: 35px; padding-right: 35px; font-size: 14px; display: inline-block; letter-spacing: 1px;"><span style="word-break: break-word;"><span data-mce-style="" style="word-break: break-word; line-height: 28px;"><strong>Learn More</strong></span></span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef; background-size: auto; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 10px; padding-left: 25px; padding-right: 25px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="5" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad">
<h1 style="margin: 0; color: #fbfbfb; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 25px; font-weight: 400; letter-spacing: 1px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 30px;"><strong><span class="tinyMce-placeholder" style="word-break: break-word;">Check-in process</span></strong></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-radius: 0; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td class="pad" style="padding-left:5px;padding-right:5px;padding-top:10px;">
<div style="color:#393d47;direction:ltr;font-family:Cabin, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:15px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:22.5px;">
<p style="margin: 0; margin-bottom: 16px;">The check-in process is quick and effortless, designed to save you time and get you straight into the event. </p>
<p style="margin: 0;"><strong>Check-In instructions:</strong><br/><strong>1. Arrive at Hackathon:</strong> Head to the check-in area.<br/><strong>2. Open your email:</strong> Locate the email with your unique QR code.<br/><strong>3. Scan your QR code:</strong> Follow the instructions on the tablet to complete your check-in.<br/><strong>4. Follow further instructions:</strong> Follow the guidance provided by the organization team</p>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-radius: 0; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="width:100%;">
<div align="center" class="alignment" style="line-height:10px">
<div style="max-width: 400px;"><img alt="" height="auto" src=${qrContent} style="display: block; height: auto; border: 0; width: 100%;" title="" width="400"/></div>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-7" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef; background-size: auto; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 10px; padding-left: 25px; padding-right: 25px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="5" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad">
<h1 style="margin: 0; color: #fbfbfb; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 24px; font-weight: 400; letter-spacing: 1px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 28.799999999999997px;"><strong>Get started: YOUR ESSENTIAL PACK</strong></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-8" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-bottom: 15px solid transparent; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 15px solid transparent; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-bottom: 7px solid transparent; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid transparent; padding-bottom: 5px; vertical-align: top;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;width:100%;padding-right:0px;padding-left:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 316px;"><img alt="Library" height="auto" src="https://drive.google.com/uc?id=1fTZZ23LLVmrmM5QakFR2urPxU3mp0hqX" style="display: block; height: auto; border: 0; width: 100%;" title="Library" width="316"/></div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #00afef; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1px; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 20.4px;"><span class="tinyMce-placeholder" style="word-break: break-word;">Location</span></h1>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #444444; direction: ltr; font-family: Cabin, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 14px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 16.8px;">365.labb, Banská Bystrica</h1>
</td>
</tr>
</table>
<table border="0" cellpadding="10" cellspacing="0" class="button_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad">
<div align="left" class="alignment"><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://maps.app.goo.gl/qWndi4V1FGWMUb4v8" style="height:29px;width:117px;v-text-anchor:middle;" arcsize="14%" stroke="false" fillcolor="#00afef">
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center dir="false" style="color:#ffffff;font-family:Arial, sans-serif;font-size:16px">
<![endif]--><a class="button" href="https://maps.app.goo.gl/qWndi4V1FGWMUb4v8" style="background-color:#00afef;border-bottom:0px solid transparent;border-left:0px solid transparent;border-radius:4px;border-right:0px solid transparent;border-top:0px solid transparent;color:#ffffff;display:inline-block;font-family:Cabin, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:16px;font-weight:400;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;" target="_blank"><span style="word-break: break-word; padding-left: 20px; padding-right: 20px; font-size: 16px; display: inline-block; letter-spacing: normal;"><span style="word-break: break-word; line-height: 19.2px;">How to get </span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
</td>
</tr>
</table>
</td>
<td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-bottom: 7px solid transparent; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid transparent; padding-bottom: 5px; vertical-align: top;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;width:100%;padding-right:0px;padding-left:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 316px;"><img alt="Library" height="auto" src="https://drive.google.com/uc?id=1xuOTtEhN_XDS_cOd2eSmrwNLr60JOXDT" style="display: block; height: auto; border: 0; width: 100%;" title="Library" width="316"/></div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #00afef; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1px; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 20.4px;"><span class="tinyMce-placeholder" style="word-break: break-word;">Wi-Fi access</span></h1>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #444444; direction: ltr; font-family: Cabin, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 14px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 16.8px;"><span class="tinyMce-placeholder" style="word-break: break-word;">Network: <strong>365.labb</strong> <br/>Password: <strong>pAssWord!</strong></span></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-9" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-bottom: 15px solid transparent; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 15px solid transparent; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-bottom: 7px solid transparent; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid transparent; padding-bottom: 5px; vertical-align: top;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;width:100%;padding-right:0px;padding-left:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 316px;"><img alt="Library" height="auto" src="https://drive.google.com/uc?id=1UAGAu6r5O62SqnJtxelXgL0LGYYGwzDX" style="display: block; height: auto; border: 0; width: 100%;" title="Library" width="316"/></div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #00afef; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1px; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 20.4px;"><strong>Dining options </strong></h1>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #444444; direction: ltr; font-family: Cabin, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 14px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 16.8px;"><strong>Breakfast, lunch, and dinner</strong> can be found <strong>next to the main room</strong>. <br/><br/>Have dietary preferences? Just give us a heads-up!<br/><br/>If you <strong>can’t make it to lunch</strong>, let us know so we can arrange something for you.</h1>
</td>
</tr>
</table>
</td>
<td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-bottom: 7px solid transparent; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid transparent; padding-bottom: 5px; vertical-align: top;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;width:100%;padding-right:0px;padding-left:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 316px;"><img alt="Friends" height="auto" src="https://drive.google.com/uc?id=1OIt_jaLgKXTlUtdJeVYRpJ2-OvADeioS" style="display: block; height: auto; border: 0; width: 100%;" title="Friends" width="316"/></div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #00afef; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1px; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 20.4px;"><strong>Snacks & drinks</strong></h1>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #444444; direction: ltr; font-family: Cabin, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 14px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 16.8px;"><strong>Snacks and drinks?</strong> All chillin’ in the main room.<br/><br/><strong>Want some tea?</strong> Just ask the team – we've got you.</h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-10" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-bottom: 15px solid transparent; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 15px solid transparent; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-bottom: 7px solid transparent; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid transparent; padding-bottom: 5px; vertical-align: top;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;width:100%;padding-right:0px;padding-left:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 316px;"><img alt="Library" height="auto" src="https://drive.google.com/uc?id=1w-GK9UVZPpxqf3XUcVNAsD1i-c66dtfh" style="display: block; height: auto; border: 0; width: 100%;" title="Library" width="316"/></div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #00afef; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1px; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 20.4px;"><strong>Parking situation</strong></h1>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #444444; direction: ltr; font-family: Cabin, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 14px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 16.8px;">There are some <strong>parking spots</strong> nearby. <br/><br/>You can park at <strong>Strieborné námestie</strong> or <strong>Lazovná 27</strong> (it’s right under the church).<br/><br/>Heads up – <strong>both spots are paid parking </strong>so keep that in mind!</h1>
</td>
</tr>
</table>
</td>
<td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-bottom: 7px solid transparent; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid transparent; padding-bottom: 5px; vertical-align: top;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;width:100%;padding-right:0px;padding-left:0px;">
<div align="center" class="alignment" style="line-height:10px">
<div class="fullWidth" style="max-width: 316px;"><img alt="Friends" height="auto" src="https://drive.google.com/uc?id=1wGIcBQWzgW7czDKGEjxh6wSHdY9zP9kI" style="display: block; height: auto; border: 0; width: 100%;" title="Friends" width="316"/></div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:5px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #00afef; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1px; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 20.4px;"><span class="tinyMce-placeholder" style="word-break: break-word;">Overnight stay</span></h1>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #444444; direction: ltr; font-family: Cabin, Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 14px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 16.8px;">Need to <strong>crash for the night</strong>? Cool, you can totally stay over.<br/><br/><strong>Important:</strong> Please bring your own <strong>mats and sleeping bags</strong> – no Airbnb luxuries, sorry, but it’s all part of the hacker adventure.<br/><br/>Shower will not be available.</h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-11" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #00afef; background-size: auto; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 10px; padding-left: 25px; padding-right: 25px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="5" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad">
<h1 style="margin: 0; color: #fbfbfb; direction: ltr; font-family: 'Cabin', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 24px; font-weight: 400; letter-spacing: 1px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 28.799999999999997px;"><strong>Got any questions or suggestions?</strong></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-12" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-radius: 0; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="10" cellspacing="0" class="paragraph_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td class="pad">
<div style="color:#101112;direction:ltr;font-family:Cabin, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:center;mso-line-height-alt:19.2px;">
<p style="margin: 0;"><strong>With any queries feel free to contact our Team via Whatsapp or email!</strong></p>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-13" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbfbfb; border-radius: 0; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #fbfbfb; padding-bottom: 20px; padding-left: 20px; padding-right: 20px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-top:10px;text-align:center;width:100%;">
<h3 style="margin: 0; color: #26045d; direction: ltr; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 24px;"><a href="mailto:Viktor@campus-cowork.com" style="text-decoration: underline; color: #26045d;">Viktor@campus-cowork.com</a></h3>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td class="pad">
<div style="color:#444a5b;direction:ltr;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:20px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:center;mso-line-height-alt:30px;">
<p style="margin: 0;"><strong>0902 377 463</strong></p>
</div>
</td>
</tr>
</table>
</td>
<td class="column gap" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top;">
<table height="45" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 45px; height: 45px;" width="45"></table>
</td>
<td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 15px; padding-right: 20px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="50%">
<table border="0" cellpadding="0" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-top:10px;text-align:center;width:100%;">
<h3 style="margin: 0; color: #26045d; direction: ltr; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 24px;"><a href="mailto:Bianka@campus-cowork.com" style="text-decoration: underline; color: #26045d;">Bianka@campus-cowork.com</a></h3>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td class="pad">
<div style="color:#444a5b;direction:ltr;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:20px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:center;mso-line-height-alt:30px;">
<p style="margin: 0;"><strong>0917 525 457</strong></p>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-14" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 25px; padding-top: 7px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="button_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad" style="padding-bottom:15px;padding-left:5px;padding-right:5px;padding-top:15px;text-align:center;">
<div align="center" class="alignment"><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.hacknime.to/en/hackathon/digital-fair-portal-of-the-city" style="height:38px;width:148px;v-text-anchor:middle;" arcsize="0%" stroke="false" fillcolor="#00afef">
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center dir="false" style="color:#ffffff;font-family:Arial, sans-serif;font-size:14px">
<![endif]--><a class="button" href="https://www.hacknime.to/en/hackathon/digital-fair-portal-of-the-city" style="background-color:#00afef;border-bottom:0px solid #8a3b8f;border-left:0px solid #8a3b8f;border-radius:0px;border-right:0px solid #8a3b8f;border-top:0px solid #8a3b8f;color:#ffffff;display:inline-block;font-family:Cabin, Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;" target="_blank"><span style="word-break: break-word; padding-left: 35px; padding-right: 35px; font-size: 14px; display: inline-block; letter-spacing: 1px;"><span style="word-break: break-word;"><span data-mce-style="" style="word-break: break-word; line-height: 28px;"><strong>Learn more<br/></strong></span></span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
</td>
</tr>
</table>
<div class="spacer_block block-2" style="height:30px;line-height:30px;font-size:1px;"> </div>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-15" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 690px; margin: 0 auto;" width="690">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="5" cellspacing="0" class="divider_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad">
<div align="center" class="alignment">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #7B7B7B;"><span style="word-break: break-word;"> </span></td>
</tr>
</table>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table><!-- End -->
</body>
</html>
  `;
  return htmlContentNew;
};

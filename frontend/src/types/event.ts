export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  poster?: string | null;
  location: {
    address?: string;
  };
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
    videoUrl: string;
    inactivityTimeout?: number;
    checkinSuccessTimeout?: number;
  };
  emailParams: {
    parking: {
      enabled: boolean;
      content: string;
    };
    scheduleSrc: {
      enabled: boolean;
      content: string;
    };
    dining: {
      enabled: boolean;
      content: string;
    };
    customHtmlTemplate?: {
      enabled: boolean;
      content: string;
    };
    virtualSpace?: {
      enabled: boolean;
    };
  };
  guests: {
    _id: string;
    fullName: string;
    email: string;
    email_sent: boolean;
    reminder_email_date?: string;
    phoneNumber?: string;
    attendance_status: boolean;
    gdpr_consent: boolean;
  }[];
}

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
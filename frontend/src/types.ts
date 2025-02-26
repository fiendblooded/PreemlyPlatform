export type Guest = {
  _id: string;
  fullName: string;
  age: number;
  phoneNumber: string;
  email: string;
  attendance_status?: boolean;
  email_sent?: boolean;
  reminder_email_date?: string; // Add this field
};
export type Task = {
  title: string;
  isCompleted: boolean;
  dueDate: string;
};

export type Event = {
  date: string;
  _id: string;
  title: string;
  ownerId: string;
  description: string;
  guests: Guest[];
  poster: string | null;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
  };
  endDate: string;
  eventType: string;
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
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
  tasks: Task[];
};

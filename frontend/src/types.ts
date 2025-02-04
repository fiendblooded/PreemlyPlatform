export type Guest = {
  _id: string;
  fullName: string;
  age: number;
  email: string;
  attendance_status?: boolean;
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
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
  };
  tasks: Task[];
};

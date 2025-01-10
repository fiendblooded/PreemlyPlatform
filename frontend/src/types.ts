export type Guest = {
  _id: string;
  fullName: string;
  age: number;
  email: string;
  attendance_status?: boolean;
};

export type Event = {
  date: string;
  _id: string;
  title: string;
  description: string;
  guests: Guest[];
  poster: string | null;
};

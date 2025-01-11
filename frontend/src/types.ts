export type Guest = {
  _id: string;
  fullName: string;
  age: number;
  email: string;
  attendance_status?: boolean;
};

export type Event = {
  date: string | number | Date;
  _id: string;
  title: string;
  description: string;
  guests: Guest[];
  poster: string | null;
};

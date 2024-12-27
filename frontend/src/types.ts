export type Guest = {
  id: string;
  fullName: string;
  age: number;
  email: string;
  attendance_status?: boolean;
};

export type Event = {
  time: string | number | Date;
  _id: string;
  title: string;
  description: string;
  guests: Guest[];
  poster: string | null;
};

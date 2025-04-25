export interface IEventData {
  title: string;
  date?: string;
  location?: string;
  type?: string;
  description?: string;
  [key: string]: string | undefined;
} 
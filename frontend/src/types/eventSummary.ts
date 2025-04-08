export interface EventSummary {
  _id: string;
  title: string;
  date: string;
  endDate: string;
  poster?: string | null;
  eventType: string;
  location: {
    address?: string;
  };
  guests: {
    _id: string;
  }[];
}

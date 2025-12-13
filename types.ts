export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category?: string;
  image?: string;
  price?: string;
  url?: string;
  sessions?: Array<{ id: string; start: string; end: string }>;
};

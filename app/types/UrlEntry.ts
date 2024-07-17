export interface UrlEntry {
    _id: string;
    originalUrl: string;
    shortCode: string;
    domain: string;
    title?: string;
    note?: string;
    createdAt: string;
    shortenedUrl: string;
    statistics: {
      totalClicks: number;
      uniqueClicks: number;
      clicksByCountry: { [country: string]: number };
      clicksByDevice: { [device: string]: number };
    };
  }
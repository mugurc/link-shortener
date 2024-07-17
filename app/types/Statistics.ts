
import { ObjectId } from 'mongodb'
export interface ClickEvent {
  _id?: ObjectId;
  shortCode: string;
  timestamp: Date;
  country: string;
  device: string;
  ip: string;
  userAgent: string;
}

export interface UrlEntry {
  _id: ObjectId;
  originalUrl: string;
  shortCode: string;
  domain: string;
  shortenedUrl: string;
  title?: string;
  note?: string;
  createdAt: Date;
}

export interface Statistics {
  totalClicks: number;
  uniqueClicks: number;
  clicksByCountry: { [country: string]: number };
  clicksByDevice: { [device: string]: number };
}

export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { UAParser } from 'ua-parser-js';
import { geolocation } from '@vercel/edge';
import { UrlEntry, ClickEvent } from '../../types/Statistics';

export async function GET(request: Request, { params }: { params: { shortCode: string } }) {
  const { shortCode } = params;
  console.log(`Processing API request for shortCode: ${shortCode}`);

  try {
    const { db } = await connectToDatabase();
    console.log(`Database connected for shortCode: ${shortCode}`);

    const urlEntry = await db.collection<UrlEntry>('urls').findOne({ shortCode });
    if (!urlEntry) {
      console.log(`Short URL not found for shortCode: ${shortCode}`);
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const device = parser.getDevice().type || 'unknown';
    const geo = geolocation(request);
    const country = geo.country || 'unknown';
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

    const clickEvent: ClickEvent = {
      shortCode,
      timestamp: new Date(),
      country,
      device,
      userAgent,
      ip: clientIp
    };

    await db.collection<ClickEvent>('clickEvents').insertOne(clickEvent);
    console.log(`Click event recorded for ${shortCode}`);

    return NextResponse.json({ redirectUrl: urlEntry.originalUrl });
  } catch (error) {
    console.error(`Error processing shortCode ${shortCode}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
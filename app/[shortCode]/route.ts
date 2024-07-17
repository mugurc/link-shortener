export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';
import { UrlEntry, ClickEvent } from '../types/Statistics';

export async function GET(request: Request, { params }: { params: { shortCode: string } }) {
  const { shortCode } = params;
  console.log(`Processing request for shortCode: ${shortCode}`);

  try {
    const { db } = await connectToDatabase();
    console.log(`Database connected for shortCode: ${shortCode}`);

    const urlEntry = await db.collection<UrlEntry>('urls').findOne({ shortCode });
    if (!urlEntry) {
      console.log(`Short URL not found for shortCode: ${shortCode}`);
      return new Response('Short URL not found', { status: 404 });
    }

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    const device = deviceInfo.device.type || 'desktop';
    const clientIp = (headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1').split(',')[0].trim();

    let country = 'unknown';
    if (clientIp === '127.0.0.1' || clientIp === '::1') {
      country = 'localhost';
    } else {
      console.log(`Real IP detected: ${clientIp}. Would perform country lookup here.`);
    }

    const clickEvent: ClickEvent = {
      shortCode,
      timestamp: new Date(),
      country,
      device,
      ip: clientIp,
      userAgent: userAgent
    };

    await db.collection<ClickEvent>('clickEvents').insertOne(clickEvent);
    console.log(`Click event recorded for ${shortCode}:`, clickEvent);

    console.log(`Redirecting to: ${urlEntry.originalUrl}`);
    return NextResponse.redirect(urlEntry.originalUrl, { status: 302 });
  } catch (error) {
    console.error(`Error processing shortCode ${shortCode}:`, error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import shortid from 'shortid'
import { UrlEntry } from '../../types/Statistics'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  const { url, title, note, customCode, domain } = await request.json()
  const { db } = await connectToDatabase()

  try {
    new URL(url)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const validDomains = process.env.VALID_DOMAINS?.split(',') || []
  if (!validDomains.includes(domain)) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
  }

  let shortCode = customCode || shortid.generate()

  const existingUrl = await db.collection<UrlEntry>('urls').findOne({ shortCode, domain })
  if (existingUrl) {
    return NextResponse.json({ error: 'Short code already in use for this domain' }, { status: 400 })
  }

  const shortenedUrl = `https://${domain}/${shortCode}`
  
  const newUrlEntry: Omit<UrlEntry, '_id'> = {
    originalUrl: url,
    shortCode,
    domain,
    shortenedUrl,
    title,
    note,
    createdAt: new Date()
  }

  const result = await db.collection<UrlEntry>('urls').insertOne(newUrlEntry as UrlEntry)

  if (!result.insertedId) {
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 })
  }

  return NextResponse.json({ 
    shortCode, 
    domain, 
    shortenedUrl,
    _id: result.insertedId
  })
}

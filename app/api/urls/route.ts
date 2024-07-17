export const fetchCache = "force-no-store";

import { connectToDatabase } from '../../../lib/mongodb'
import { NextResponse } from 'next/server'
import { UrlEntry } from '../../types/UrlEntry'

export async function GET() {
  const { db } = await connectToDatabase()
  const urlEntries = await db.collection<Omit<UrlEntry, '_id'>>('urls')
    .find()
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()

  const serializedEntries: UrlEntry[] = urlEntries.map(entry => ({
    ...entry,
    _id: entry._id.toString()
  }))

  const response = NextResponse.json(serializedEntries)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')

  return response
}

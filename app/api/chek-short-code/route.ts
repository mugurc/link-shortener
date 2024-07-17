export const fetchCache = "force-no-store";

import { connectToDatabase } from '../../../lib/mongodb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { shortCode, domain } = await request.json()
  const { db } = await connectToDatabase()

  const existingUrl = await db.collection('urls').findOne({ shortCode, domain })
  
  return NextResponse.json({ available: !existingUrl })
}

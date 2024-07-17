
export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { url } = await request.json()
  
  try {
    new URL(url)
    return NextResponse.json({ valid: true })
  } catch (error) {
    return NextResponse.json({ valid: false })
  }
}
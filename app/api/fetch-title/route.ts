export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server'
import axios from 'axios'
import cheerio from 'cheerio'

export async function POST(request: Request) {
  const { url } = await request.json()
  
  try {
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)
    const title = $('title').text().trim()
    
    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error fetching title:', error)
    return NextResponse.json({ error: 'Failed to fetch title' }, { status: 500 })
  }
}
export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import { ClickEvent } from '../../../types/Statistics'

export async function GET(request: Request, { params }: { params: { shortCode: string } }) {
  const { shortCode } = params


  try {
    const { db } = await connectToDatabase()

    const totalClicks = await db.collection<ClickEvent>('clickEvents').countDocuments({ shortCode })
    const uniqueClicks = await db.collection<ClickEvent>('clickEvents').distinct('ip', { shortCode }).then(ips => ips.length)
    
    const clicksByCountry = await db.collection<ClickEvent>('clickEvents').aggregate([
      { $match: { shortCode } },
      { $group: { _id: '$country', count: { $sum: 1 } } }
    ]).toArray()

    const clicksByDevice = await db.collection<ClickEvent>('clickEvents').aggregate([
      { $match: { shortCode } },
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]).toArray()

    const stats = {
      totalClicks,
      uniqueClicks,
      clicksByCountry: Object.fromEntries(clicksByCountry.map(item => [item._id, item.count])),
      clicksByDevice: Object.fromEntries(clicksByDevice.map(item => [item._id, item.count]))
    }



    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
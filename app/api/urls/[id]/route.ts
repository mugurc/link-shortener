export const fetchCache = "force-no-store";

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { db } = await connectToDatabase();

  try {
    const urlEntry = await db.collection('urls').findOne({ _id: new ObjectId(id) });
    if (!urlEntry) {
      return NextResponse.json({ error: 'URL entry not found' }, { status: 404 });
    }

    await db.collection('urls').deleteOne({ _id: new ObjectId(id) });

    await db.collection('clickEvents').deleteMany({ shortCode: urlEntry.shortCode });

    return NextResponse.json({ message: 'URL entry and associated statistics deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL entry and statistics:', error);
    return NextResponse.json({ error: 'Failed to delete URL entry and statistics' }, { status: 500 });
  }
}
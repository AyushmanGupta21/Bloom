import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { generationsTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { desc, eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!projectId && !userEmail) {
      return NextResponse.json({ generations: [] });
    }

    let query;
    if (projectId && userEmail) {
      query = db
        .select()
        .from(generationsTable)
        .where(and(eq(generationsTable.projectId, projectId), eq(generationsTable.userId, userEmail)))
        .orderBy(desc(generationsTable.createdOn))
        .limit(30);
    } else if (projectId) {
      query = db
        .select()
        .from(generationsTable)
        .where(eq(generationsTable.projectId, projectId))
        .orderBy(desc(generationsTable.createdOn))
        .limit(30);
    } else {
      query = db
        .select()
        .from(generationsTable)
        .where(eq(generationsTable.userId, userEmail!))
        .orderBy(desc(generationsTable.createdOn))
        .limit(30);
    }

    const generations = await query;
    return NextResponse.json({ generations });
  } catch (error: any) {
    console.error('[API /api/ai/generations] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve generations', details: error?.message }, { status: 500 });
  }
}

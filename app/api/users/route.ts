import { db } from '@/config/db';
import { usersTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: 'No email' }, { status: 400 });
        }
        const userResult = await db.select().from(usersTable)
            .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress))

        if (userResult?.length == 0) {
            const data = {
                name: user?.fullName ?? 'NA',
                email: user.primaryEmailAddress.emailAddress,
                credits: 2,
                maxCredits: 2
            }
            const result = await db.insert(usersTable).values({
                ...data
            })
            return NextResponse.json({ user: data })
        }
        return NextResponse.json({ user: userResult[0] })
    } catch (err: any) {
        console.error('[API /api/users] Error:', err?.message || err);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}


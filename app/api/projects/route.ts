import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, usersTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req:NextRequest) {
    const {projectId,frameId, messages, credits}=await req.json();
    const user=await currentUser();
    const {has}=await auth();
    const hasUnlimitedAccess = has&&has({ plan: 'unlimited' })
    //create project
    const projectResult=await db.insert(projectTable).values({
        projectId:projectId,
        createdBy:user?.primaryEmailAddress?.emailAddress
    })
    // create frame
    const frameResult=await db.insert(frameTable).values({
        frameId:frameId,
        projectId:projectId
    })
    // save user msg
    const chatResult=await db.insert(chatTable).values({
        chatMessage:messages,
        createdBy:user?.primaryEmailAddress?.emailAddress,
        frameId:frameId
    })

    //update user credits 
    if(!hasUnlimitedAccess && credits && !isNaN(credits)){
        //update user credits 
        const userResult=await db.update(usersTable).set({
            credits:credits-1
            // @ts-ignore
        }).where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress))
    }
    return NextResponse.json({
        projectId,frameId, messages
    })
}
import { db } from "@/config/db";
import { chatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req:NextRequest) {
    const {messages, frameId}=await req.json();

    const result=await db.update(chatTable).set({
        chatMessage:messages
    }).where(eq(chatTable.frameId,frameId));
    return NextResponse.json({ result: 'updated'});
}
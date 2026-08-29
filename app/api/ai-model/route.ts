import { NextRequest, NextResponse } from 'next/server';
import { AIRouter } from '@/lib/ai/router';
import { db } from '@/config/db';
import { generationsTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const generationId = `gen_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  try {
    const body = await req.json();
    const { messages, model, projectId, frameId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const modelDetails = await AIRouter.getModelDetails(model);

    const userPrompt = messages[messages.length - 1]?.content || '';
    const promptText = typeof userPrompt === 'string' ? userPrompt : JSON.stringify(userPrompt);

    // Create an initial generation log record in DB
    try {
      await db.insert(generationsTable).values({
        generationId,
        projectId: projectId || null,
        frameId: frameId ? String(frameId) : null,
        userId: userEmail || null,
        provider: modelDetails.provider,
        modelId: modelDetails.id,
        canonicalModelId: modelDetails.canonicalModelId,
        displayName: modelDetails.displayName,
        prompt: promptText,
        status: 'started',
      });
    } catch (dbErr) {
      console.warn('[Generations Log] Failed to insert initial log (non-fatal):', dbErr);
    }

    const encoder = new TextEncoder();
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let finishReason = 'stop';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Cap output tokens: enough for a complete, polished single page without
          // cutting off mid-HTML (which produces broken output), but not so high it
          // runs unnecessarily long. 6000 covers a rich page in ~20-30s.
          const cappedMaxTokens = Math.min(modelDetails.maxOutputTokens || 6000, 6000);

          const generator = AIRouter.executeStream({
            model: model || modelDetails.id,
            messages,
            stream: true,
            temperature: 0.6,
            top_p: 0.9,
            max_tokens: cappedMaxTokens,
          });

          for await (const chunk of generator) {
            if (chunk.delta.content) {
              accumulatedContent += chunk.delta.content;
              controller.enqueue(encoder.encode(chunk.delta.content));
            }
            if (chunk.delta.reasoning) {
              accumulatedReasoning += chunk.delta.reasoning;
            }
            if (chunk.finishReason) {
              finishReason = chunk.finishReason;
            }
            if (chunk.usage) {
              totalPromptTokens = chunk.usage.promptTokens;
              totalCompletionTokens = chunk.usage.completionTokens;
            }
          }

          controller.close();

          // Persist completed generation record in DB
          const durationMs = Date.now() - startTime;
          try {
            const { eq } = await import('drizzle-orm');
            await db
              .update(generationsTable)
              .set({
                output: accumulatedContent,
                reasoning: accumulatedReasoning || null,
                status: 'completed',
                durationMs,
                promptTokens: totalPromptTokens || Math.ceil(promptText.length / 4),
                completionTokens: totalCompletionTokens || Math.ceil(accumulatedContent.length / 4),
                totalTokens: (totalPromptTokens || Math.ceil(promptText.length / 4)) + (totalCompletionTokens || Math.ceil(accumulatedContent.length / 4)),
                finishReason,
              })
              .where(eq(generationsTable.generationId, generationId));
          } catch (dbUpdateErr) {
            console.warn('[Generations Log] Failed to finalize log (non-fatal):', dbUpdateErr);
          }
        } catch (streamErr: any) {
          console.error('[AIRouter Stream Error]:', streamErr);

          // Update DB with failed status
          try {
            const { eq } = await import('drizzle-orm');
            await db
              .update(generationsTable)
              .set({
                status: 'failed',
                error: streamErr?.message || 'Stream generation failed',
                durationMs: Date.now() - startTime,
              })
              .where(eq(generationsTable.generationId, generationId));
          } catch (e) {
            // Ignore DB error
          }

          controller.error(streamErr);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Bloom-Generation-Id': generationId,
        'X-Bloom-Model': modelDetails.id,
        'X-Bloom-Display-Name': modelDetails.displayName,
        'X-Bloom-Provider': modelDetails.provider,
      },
    });
  } catch (error: any) {
    console.error('[API /api/ai-model] Handler error:', error);
    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      {
        error: error?.message || 'AI Generation request failed',
        code: error?.code || 'UNKNOWN_ERROR',
        durationMs,
      },
      { status: error?.status || 500 }
    );
  }
}
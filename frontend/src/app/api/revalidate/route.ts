import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * On-demand revalidation endpoint called by the Laravel backend.
 * Invalidates Next.js cache by tag, so the public blog pages
 * immediately reflect updated data.
 *
 * Body:
 *   { tag: string, secret: string }
 *
 * Security: `secret` must match REVALIDATION_SECRET env variable.
 * This prevents unauthorized cache purging.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, secret } = body;

    // Validate secret
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    // Validate tag
    if (!tag || typeof tag !== "string") {
      return NextResponse.json({ message: "Tag is required and must be a string" }, { status: 400 });
    }

    // Revalidate all fetches with this tag
    // @ts-expect-error
    revalidateTag(tag);

    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  } catch (error) {
    console.error("Revalidation API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

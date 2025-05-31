import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  const token = await getToken({ req: request });
  if (token?.role !== "admin") {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }
    const body = await request.json();
    const update = {};
    if (body.status) update.status = body.status;
    if (body.trackingId) update.trackingId = body.trackingId;

    const conn = await connectToDatabase();
    const db = conn.connection.db;
    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: update }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

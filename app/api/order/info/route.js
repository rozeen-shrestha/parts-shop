import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      // No id provided, return empty array
      return NextResponse.json([]);
    }
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Only send required fields
    return NextResponse.json({
      billing: order.billing,
      cartItems: order.cartItems,
      shippingMethod: order.shippingMethod,
      status: order.status,
      trackingId: order.trackingId,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

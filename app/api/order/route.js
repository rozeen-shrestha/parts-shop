import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const data = await request.json();
    // Add delivery method and status to the order data
    const orderData = {
      ...data,
      deliveryMethod: data.shippingMethod || data.deliveryMethod || null,
      createdAt: new Date(),
      status: "unverified", // default status
    };

    const conn = await connectToDatabase();
    const db = conn.connection.db;
    const result = await db.collection("orders").insertOne(orderData);

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}

export async function GET(request) {
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
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH: /api/order?orderId=xxx
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

// DELETE: /api/order?orderId=xxx
export async function DELETE(request) {
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
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    // Only allow deletion if status is unverified
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "unverified") {
      return NextResponse.json({ error: "Only unverified orders can be deleted" }, { status: 403 });
    }

    // Only delete the order itself
    await db.collection("orders").deleteOne({ _id: new ObjectId(orderId) });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

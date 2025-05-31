import { connectToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const token = await getToken({ req });
  if (token?.role !== "admin") {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  try {
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    const contacts = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray();
    return Response.json(contacts);
  } catch (e) {
    return Response.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    await db.collection("contacts").insertOne({
      ...data,
      createdAt: new Date(),
    });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: "Failed to save contact" }, { status: 500 });
  }
}

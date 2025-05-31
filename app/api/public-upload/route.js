import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    const orderData = formData.get("orderData");
    const category = formData.get("category") || "general";
    if (!files || files.length === 0 || !orderData) {
      return NextResponse.json({ error: "Missing files or order data" }, { status: 400 });
    }
    // Save to public/payment not public/media
    const uploadDir = join(process.cwd(), "public", "payment", category);
    await mkdir(uploadDir, { recursive: true });

    const conn = await connectToDatabase();
    const db = conn.connection.db;

    const savedEntries = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueId = uuidv4();
      const ext = file.name.split(".").pop();
      const filename = `${uniqueId}.${ext}`;
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      const entry = {
        originalFilename: file.name,
        filename,
        path: `/payment/${category}/${filename}`,
        uploadDate: new Date().toISOString(),
      };
      const result = await db.collection("paymentProofs").insertOne(entry);
      entry._id = result.insertedId;
      savedEntries.push(entry);
    }

    return NextResponse.json({
      success: true,
      files: savedEntries.map(f => f.path),
      ids: savedEntries.map(f => f._id), // Return the Mongo IDs
      entries: savedEntries,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}

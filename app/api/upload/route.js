import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink, access } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MongoClient, ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// Database connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

const isValidImageFile = (file) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return validTypes.includes(file.type);
};

export async function POST(request) {
  try {
    // Connect to the database directly
    const client = await clientPromise;
    const db = client.db(dbName);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();

    // Handle both single file and multiple files
    const files = formData.getAll("files");
    const singleFile = formData.get("file");

    if ((!files || files.length === 0) && !singleFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const category = formData.get("category") || "general";
    const uploadDir = join(process.cwd(), "public", "media", "photo", category);
    await mkdir(uploadDir, { recursive: true });

    // Process all files (either the array or the single file)
    const filesToProcess = files.length > 0 ? files : [singleFile];
    const results = [];

    for (const file of filesToProcess) {
      if (!file || !isValidImageFile(file)) {
        results.push({
          error: `Invalid file type for ${file?.name || 'unknown file'}`,
          filename: file?.name || 'unknown'
        });
        continue;
      }

      // Process valid file
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueId = uuidv4();
      const ext = file.name.split(".").pop();
      const filename = `${uniqueId}.${ext}`;
      const filePath = join(uploadDir, filename);

      await writeFile(filePath, buffer);

      const uploadDate = new Date().toISOString();
      const result = await db.collection("uploads").insertOne({
        originalFilename: file.name,
        filename,
        path: `/media/photo/${category}/${filename}`,
        category,
        uploader: session.user.email || "admin",
        uploadDate,
      });

      results.push({
        _id: result.insertedId,
        originalFilename: file.name,
        filename,
        path: `/media/photo/${category}/${filename}`,
        category,
        fileId: result.insertedId.toString(),
        uploader: session.user.email || "admin",
        uploadDate,
      });
    }

    // Return single result or array based on input
    if (singleFile && !files.length) {
      return NextResponse.json(results[0], { status: 201 });
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Connect to the database
    const client = await clientPromise;
    const db = client.db(dbName);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get fileId from request URL
    const url = new URL(request.url);
    const fileId = url.searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "No file ID provided" }, { status: 400 });
    }

    // Find the file in the database
    let objectId;
    try {
      objectId = new ObjectId(fileId);
    } catch (error) {
      return NextResponse.json({ error: "Invalid file ID format" }, { status: 400 });
    }

    const fileRecord = await db.collection("uploads").findOne({ _id: objectId });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the actual file from the filesystem
    const filePath = join(process.cwd(), "public", fileRecord.path);

    try {
      // Check if file exists before attempting to delete
      await access(filePath);
      // If it exists, delete it
      await unlink(filePath);
    } catch (error) {
      console.warn(`File does not exist on disk: ${filePath}`);
      // Continue execution to remove the database entry even if the file doesn't exist
    }

    // Delete the file record from the database
    const result = await db.collection("uploads").deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete file record from database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "File deleted successfully",
        fileId: fileId,
        originalFilename: fileRecord.originalFilename,
        path: fileRecord.path
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

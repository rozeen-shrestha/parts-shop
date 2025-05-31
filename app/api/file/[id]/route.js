import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// MongoDB configuration
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function GET(req, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return new NextResponse('Missing file ID', { status: 400 });
    }

    const dbClient = await clientPromise;
    const db = dbClient.db(dbName);

    // Try uploads collection first
    let record =
      (await db.collection('uploads').findOne({ _id: id })) ||
      (await db.collection('uploads').findOne({ _id: new ObjectId(id) }).catch(() => null));

    // If not found, try paymentProofs collection (each file is a document)
    if (!record) {
      record =
        (await db.collection('paymentProofs').findOne({ _id: id })) ||
        (await db.collection('paymentProofs').findOne({ _id: new ObjectId(id) }).catch(() => null)) ||
        (await db.collection('paymentProofs').findOne({ filename: id })) ||
        (await db.collection('paymentProofs').findOne({ path: id }));
    }

    if (!record || !record.path && !record.url) {
      return new NextResponse('File not found in database', { status: 404 });
    }

    // Prefer .path, fallback to .url (strip leading slash if needed)
    const filePathRel = record.path || record.url?.replace(/^\//, "");
    const fullFilePath = filePathRel
      ? path.join(process.cwd(), 'public', filePathRel.replace(/^public[\\/]/, ""))
      : null;

    if (!fullFilePath || !fs.existsSync(fullFilePath)) {
      return new NextResponse('File not found on disk', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullFilePath);
    const ext = path.extname(fullFilePath).toLowerCase();

    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(fullFilePath)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

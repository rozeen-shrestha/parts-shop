import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models';
import { getToken } from "next-auth/jwt";

// Force dynamic behavior for the route
export const dynamic = 'force-dynamic';

// Helper function to delete an image using the upload API
async function deleteImageFromUpload(fileId) {
  try {
    // Construct the URL using the origin from the request or a default value
    // When running on server-side, we need to construct an absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = new URL(`/api/upload`, baseUrl);
    url.searchParams.append('fileId', fileId);

    console.log(`Attempting to delete image with ID ${fileId} at URL: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass the current session cookie to maintain authentication
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn(`Failed to delete image with ID ${fileId}. Status: ${response.status}`);
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn("Error details:", errorData);
      return false;
    }

    console.log(`Successfully deleted image with ID ${fileId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting image with ID ${fileId}:`, error);
    return false;
  }
}

// Helper function to extract file ID from image path or object
function extractFileId(image) {
  if (!image) return null;

  // Handle different image formats
  if (typeof image === 'string') {
    // If it's a plain fileId string
    if (image.match(/^[0-9a-fA-F]{24}$/)) {
      return image;
    }

    // Try to extract ID from path that might include fileId parameter
    const match = image.match(/fileId=([^&]+)/);
    if (match) return match[1];

    return null;
  } else if (typeof image === 'object' && image._id) {
    // If it's an object with _id field
    return image._id.toString();
  } else if (typeof image === 'object' && image.fileId) {
    // If it's an object with fileId field
    return image.fileId.toString();
  }

  return null;
}

// GET all products or a single product by ID
export async function GET(request) {
  try {
    // Connect to the database before each request
    const conn = await connectToDatabase();
    // Use mongoose models for queries
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await Product.findById(id).lean();
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product, { status: 200 });
    }

    const products = await Product.find().lean();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST a new product
export async function POST(request) {
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
    // Connect to the database before each request
    const conn = await connectToDatabase();

    const body = await request.json();
    const { name, category, price, stock, description, specifications, inStock, image, additionalImages } = body;

    if (!name || !category || !price || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = new Product({
      name,
      category,
      price: parseFloat(price),
      stock: stock !== undefined ? parseInt(stock, 10) : 0,
      description,
      specifications: specifications ?
        (Array.isArray(specifications) ? specifications : specifications.split(',').map(spec => spec.trim())) :
        [],
      inStock: inStock === true || inStock === 'true',
      image,
      additionalImages: additionalImages || []
    });

    const savedProduct = await newProduct.save();
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT (Update an existing product)
export async function PUT(request) {
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
    // Connect to the database before each request
    const conn = await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = {};

    // Only include fields that are present in the request
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock, 10);
    if (body.description !== undefined) updateData.description = body.description;

    if (body.specifications !== undefined) {
      updateData.specifications = Array.isArray(body.specifications) ?
        body.specifications :
        body.specifications.split(',').map(spec => spec.trim());
    }

    if (body.inStock !== undefined) {
      updateData.inStock = body.inStock === true || body.inStock === 'true';
    }

    if (body.image !== undefined) updateData.image = body.image;
    if (body.additionalImages !== undefined) updateData.additionalImages = body.additionalImages;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a product by ID
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
    // Connect to the database before each request
    const conn = await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Find the product first to get the image references
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Track image deletion results
    const imageResults = {
      main: null,
      additional: [],
      deletedCount: 0,
      failedCount: 0
    };

    // Delete the main image if it exists
    const mainImageId = extractFileId(product.image);
    if (mainImageId) {
      const result = await deleteImageFromUpload(mainImageId);
      imageResults.main = {
        fileId: mainImageId,
        deleted: result
      };
      if (result) {
        imageResults.deletedCount++;
      } else {
        imageResults.failedCount++;
      }
    }

    // Delete additional images if they exist
    if (Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
      const promises = product.additionalImages.map(async (additionalImage) => {
        const fileId = extractFileId(additionalImage);
        if (fileId) {
          const result = await deleteImageFromUpload(fileId);
          const resultInfo = {
            fileId,
            deleted: result
          };

          if (result) {
            imageResults.deletedCount++;
          } else {
            imageResults.failedCount++;
          }

          return resultInfo;
        }
        return null;
      });

      // Wait for all image deletion operations to complete
      const results = await Promise.all(promises);
      imageResults.additional = results.filter(result => result !== null);
    }

    // Delete the product from the database
    const deletedProduct = await Product.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Product deleted successfully',
      productId: id,
      images: imageResults
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

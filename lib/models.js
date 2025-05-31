import mongoose, { Schema, model, models } from 'mongoose';

// Product Schema
const ProductSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: { type: String },
  specifications: { type: [String] },
  inStock: { type: Boolean, default: true },
  image: { type: String },
  additionalImages: { type: [String] },
}, { timestamps: true });

export const Product = models.Product || model('Product', ProductSchema);

// Customer Schema
const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
}, { timestamps: true });

export const Customer = models.Customer || model('Customer', CustomerSchema);

// Contact Schema
const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export const Contact = models.Contact || model('Contact', ContactSchema);

import { z } from "zod";

// Auth validation
export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

// Artwork validation
export const artworkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be less than 200 characters" }),
  artist: z
    .string()
    .trim()
    .min(1, { message: "Artist/Object is required" })
    .max(200, { message: "Artist must be less than 200 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1000, { message: "Year must be at least 1000" })
    .max(9999, { message: "Year must be at most 9999" })
    .optional()
    .nullable(),
  medium: z
    .string()
    .max(200, { message: "Medium must be less than 200 characters" })
    .optional()
    .or(z.literal("")),
  dimensions: z
    .string()
    .max(100, { message: "Dimensions must be less than 100 characters" })
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .positive({ message: "Price must be positive" })
    .optional()
    .nullable(),
  location: z
    .string()
    .max(200, { message: "Location must be less than 200 characters" })
    .optional()
    .or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

// CSV import row validation
export const csvRowSchema = z.object({
  title: z.string().trim().min(1).max(200),
  artist: z.string().trim().min(1).max(200),
  year: z.number().int().min(1000).max(9999).optional().nullable(),
  medium: z.string().max(200).optional().nullable(),
  dimensions: z.string().max(100).optional().nullable(),
  price: z.number().positive().optional().nullable(),
  purchase_price: z.number().positive().optional().nullable(),
  seller_name: z.string().max(200).optional().nullable(),
  seller_contact: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['available', 'sold', 'reserved']).optional().nullable(),
});

// Sanitize CSV cell to prevent formula injection
export function sanitizeCsvCell(value: any): any {
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
    return "'" + value; // Prefix dangerous characters
  }
  return value;
}

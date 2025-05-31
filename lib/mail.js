import nodemailer from "nodemailer"
import { generateOrderConfirmationHTML } from "./email-template"

// Use explicit SMTP config for Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function sendMail({ to, subject, text, html }) {
  console.log(process.env.GMAIL_USER, process.env.GMAIL_PASS)
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html, // Add HTML support
    })
  } catch (err) {
    console.error("Nodemailer error:", err)
    throw err
  }
}

export async function sendOrderConfirmationEmail(orderData) {
  const { billing, orderId, trackingId } = orderData

  const subject = "Your Order Has Been Confirmed - US Gears"
  const text = `Dear ${billing.firstName} ${billing.lastName},\n\nYour order (#${orderId}) has been confirmed.\nTracking ID: ${trackingId}\n\nThank you for shopping with US Gears!`
  const html = generateOrderConfirmationHTML(orderData)

  await sendMail({
    to: billing.email,
    subject,
    text,
    html,
  })
}

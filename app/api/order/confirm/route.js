import { NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/mail"
import { getToken } from "next-auth/jwt"

export const dynamic = "force-dynamic"

export async function POST(request) {
  const token = await getToken({ req: request })
  if (token?.role !== "admin") {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  try {
    const { email, name, trackingId, orderId } = await request.json()
    if (!email || !trackingId || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch the full order data from the info endpoint with query parameter
    const orderResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/order/info?id=${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!orderResponse.ok) {
      throw new Error("Failed to fetch order data")
    }

    const orderData = await orderResponse.json()
    console.log("Fetched order data:", orderData)

    // Make sure orderId is included
    orderData.orderId = orderId

    // Send the HTML email
    await sendOrderConfirmationEmail(orderData)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Email send error:", e)
    return NextResponse.json({ error: "Failed to send email", details: e?.message || e }, { status: 500 })
  }
}

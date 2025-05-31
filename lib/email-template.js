export function generateOrderConfirmationHTML(orderData) {
  const { orderId, trackingId, billing, cartItems, shippingMethod, status } = orderData

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Calculate shipping cost based on method
  const shippingCost = shippingMethod.toLowerCase() === "inside" ? 119.99 : 249.99
  const shippingLabel = shippingMethod.toLowerCase() === "inside" ? "Inside Valley" : "Outside Valley"

  // Calculate total including shipping
  const total = subtotal + shippingCost

  // Format current date properly
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  // Generate product rows as table rows for email compatibility
  const productRows = cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0 10px 0;vertical-align:middle;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/file/${item.image}" alt="${item.name}" width="60" height="60" style="border-radius:8px;border:2px solid #f0f0f0;object-fit:cover;display:block;">
        </td>
        <td style="padding:10px 0 10px 10px;vertical-align:middle;">
          <div style="font-weight:bold;color:#000;font-size:16px;">${item.name}</div>
          <div style="font-size:12px;color:#666;">${item.category}</div>
          <div style="font-size:14px;color:#dc2626;font-weight:500;">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding:10px 0 10px 0;text-align:right;vertical-align:middle;font-weight:bold;color:#000;font-size:16px;">
          Rs ${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .main-content {
            padding: 40px 30px;
            text-align: center;
        }
        .checkmark-gif {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid #dc2626;
            margin-bottom: 30px;
        }
        .track-button {
            display: inline-block;
            background-color: #dc2626;
            color: #ffffff;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .thank-you-message {
            font-size: 24px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 10px;
        }
        .confirmation-text {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .footer {
            background-color: #000000;
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .copyright {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
        }
        /* Responsive for mobile */
        @media only screen and (max-width:600px) {
            .email-container, .main-content { padding: 10px !important; }
            table { width: 100% !important; }
        }
    </style>
</head>
<body>
    <div class="email-container" style="max-width:600px;margin:0 auto;background:#fff;">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;color:#fff;border-bottom:3px solid #dc2626;">
          <tr>
            <td style="padding:20px 30px;font-size:24px;font-weight:bold;letter-spacing:1px;text-align:left;">US GEARS</td>
            <td style="padding:20px 30px;font-size:14px;color:#dc2626;font-weight:500;text-align:right;">${currentDate}</td>
          </tr>
        </table>

        <!-- Main Content -->
        <div class="main-content" style="padding:40px 30px;text-align:center;">
            <div class="checkmark-container">
                <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXJlYmw3d2hqd3cxenlvYzJtZ2p5OGYzMmp2bjBpcmwxeTQ5bWpwNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/OFAN6dSPGiCWLvh57p/giphy.gif" alt="Order Confirmed" class="checkmark-gif" style="background:#fff;">
            </div>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success/${orderId}" class="track-button" style="display:inline-block;background-color:#dc2626;color:#fff;padding:12px 30px;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;margin-bottom:25px;">Track Your Order</a>
            <h1 class="thank-you-message" style="font-size:24px;font-weight:bold;color:#000;margin-bottom:10px;">Thank You for Ordering.</h1>
            <p class="confirmation-text" style="font-size:16px;color:#666;margin-bottom:30px;">This email is to inform you about dispatch.</p>

            <!-- Order Details -->
            <div class="order-details" style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:20px;margin-bottom:30px;text-align:left;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;font-weight:bold;color:#000;padding:4px 8px 4px 0;">Order ID</td>
                    <td style="font-size:14px;color:#666;padding:4px 0;">#${orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;font-weight:bold;color:#000;padding:4px 8px 4px 0;">Tracking ID</td>
                    <td style="font-size:14px;color:#666;padding:4px 0;">${trackingId}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;font-weight:bold;color:#000;padding:4px 8px 4px 0;">Customer</td>
                    <td style="font-size:14px;color:#666;padding:4px 0;">${billing.firstName} ${billing.lastName}</td>
                  </tr>
                </table>
            </div>

            <!-- Products Section -->
            <div class="products-section" style="margin-top:30px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr style="background:#000;color:#fff;font-weight:bold;font-size:16px;">
                    <td style="padding:15px 10px;text-align:left;">PRODUCTS</td>
                    <td></td>
                    <td style="padding:15px 10px;text-align:right;">PRICE</td>
                  </tr>
                  ${productRows}
                  <tr>
                    <td colspan="2" style="padding:12px 10px;font-weight:500;color:#333;text-align:left;background:#f8f9fa;border-bottom:1px solid #e9ecef;">Sub Total:</td>
                    <td style="padding:12px 10px;font-weight:500;color:#333;text-align:right;background:#f8f9fa;border-bottom:1px solid #e9ecef;">Rs ${subtotal}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:12px 10px;font-weight:500;color:#333;text-align:left;background:#f8f9fa;border-bottom:1px solid #e9ecef;">Shipping (${shippingLabel}):</td>
                    <td style="padding:12px 10px;font-weight:500;color:#333;text-align:right;background:#f8f9fa;border-bottom:1px solid #e9ecef;">Rs ${shippingCost}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:20px 10px;font-weight:bold;font-size:18px;color:#fff;text-align:left;background:#dc2626;">TOTAL</td>
                    <td style="padding:20px 10px;font-weight:bold;font-size:18px;color:#fff;text-align:right;background:#dc2626;">Rs ${total}</td>
                  </tr>
                </table>
            </div>

            <!-- Shipping Information -->
            <div class="shipping-info" style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:20px;margin-top:30px;text-align:left;">
                <div class="shipping-title" style="font-weight:bold;color:#000;margin-bottom:15px;font-size:16px;">Shipping Information</div>
                <div class="address-details" style="color:#666;line-height:1.8;">
                    <strong>${billing.firstName} ${billing.lastName}</strong><br>
                    ${billing.address}<br>
                    Phone: ${billing.phone}<br>
                    Email: ${billing.email}<br>
                    ${billing.note ? `<br><strong>Note:</strong> ${billing.note}<br>` : ""}
                    <strong>Shipping Method:</strong> ${shippingMethod.charAt(0).toUpperCase() + shippingMethod.slice(1)}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer" style="background:#000;color:#fff;padding:30px;text-align:center;">
            <div class="social-links" style="margin-bottom:20px;">
                <a href="#" aria-label="Facebook" style="color:#fff;text-decoration:none;margin:0 10px;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" style="color:#fff;text-decoration:none;margin:0 10px;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
            </div>
            <div class="copyright" style="font-size:12px;color:#999;margin-bottom:10px;">
                Copyright © 2024 US Gears. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
  `
}

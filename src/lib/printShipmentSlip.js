"use client";

/**
 * Printable customer + courier slip for seller shipments.
 * Call printShipmentSlip(data) to open a print window.
 */
export function printShipmentSlip({
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
  courierName,
  trackingId,
  shipmentRef,
  shippingCharges,
  items = [],
  formatPrice = (n) => `Rs ${Number(n || 0).toLocaleString()}`,
}) {
  const rows = (items || [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(i.product_name || i.name || "Item")}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${Number(i.quantity || 0)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatPrice((i.price || 0) * (i.quantity || 1)))}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shipment Slip — ${escapeHtml(orderNumber || "")}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 24px; font-size: 13px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 18px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    .muted { color: #666; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; color: #666; padding: 6px 8px; border-bottom: 2px solid #ddd; }
    .box { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
    @media print {
      body { margin: 12px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <button onclick="window.print()" style="margin-bottom:12px;padding:8px 14px;cursor:pointer;">Print</button>
  <h1>Shipment / Packing Slip</h1>
  <p class="muted">Order ${escapeHtml(orderNumber || "—")} · Printed ${new Date().toLocaleString()}</p>

  <div class="grid">
    <div class="box">
      <h2>Customer Information</h2>
      <p><strong>${escapeHtml(customerName || "—")}</strong></p>
      ${customerPhone ? `<p>Phone: ${escapeHtml(customerPhone)}</p>` : ""}
      ${customerEmail ? `<p>Email: ${escapeHtml(customerEmail)}</p>` : ""}
      <p style="margin-top:8px;">
        ${escapeHtml(addressLine1 || "")}${addressLine2 ? `<br/>${escapeHtml(addressLine2)}` : ""}<br/>
        ${escapeHtml([city, state].filter(Boolean).join(", "))}${postalCode ? ` ${escapeHtml(postalCode)}` : ""}<br/>
        ${escapeHtml(country || "")}
      </p>
    </div>
    <div class="box">
      <h2>Courier / Shipping</h2>
      <p>Courier: <strong>${escapeHtml(courierName || "—")}</strong></p>
      <p>Tracking ID: <strong style="font-family:monospace;">${escapeHtml(trackingId || "Pending")}</strong></p>
      ${shipmentRef ? `<p>Shipment Ref: ${escapeHtml(shipmentRef)}</p>` : ""}
      ${shippingCharges != null ? `<p>Shipping Charges: <strong>${escapeHtml(formatPrice(shippingCharges))}</strong></p>` : ""}
    </div>
  </div>

  <h2>Items in this shipment</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="3" style="padding:8px;">No items</td></tr>`}
    </tbody>
  </table>

  <p class="muted" style="margin-top:24px;">Attach this slip to the package or use for courier booking.</p>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

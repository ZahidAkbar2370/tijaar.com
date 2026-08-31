/**
 * Shared wallet ledger titles for customer + private seller transaction history.
 * Keep in sync with backend App\Support\WalletTransactionLabel.
 */
export function walletTransactionTitle(type, amount = 0, meta = null) {
  const t = String(type || "").toLowerCase().trim();
  const amt = parseFloat(amount || 0);
  const purpose = meta && typeof meta === "object" ? meta.purpose : null;

  if (purpose === "admin_adjustment") {
    return amt >= 0 ? "Payment Added to Wallet" : "Wallet Adjustment";
  }

  switch (t) {
    case "deposit":
    case "credit":
      return "Payment Added to Wallet";
    case "refund":
      return "Order Refunded";
    case "package_purchase":
      return "Payment for Product Promotion";
    case "listing_fee":
      return "Payment for Listing Fee";
    case "order_reject_penalty":
      return "Order Reject Penalty";
    case "earnings_credit":
      return "Earnings Added to Wallet";
    case "payout":
      return "Payout Requested";
    case "payout_refund":
      return "Payout Returned to Wallet";
    case "debit":
      return "Wallet Payment";
    case "order_payment":
      return amt > 0 ? "Order Earnings" : "Order Payment";
    default:
      return t
        ? t.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Transaction";
  }
}

export function isWalletCredit(type, amount) {
  const t = String(type || "").toLowerCase();
  if (["credit", "refund", "deposit", "earnings_credit", "payout_refund"].includes(t)) return true;
  if (t === "order_payment" && parseFloat(amount || 0) > 0) return true;
  return parseFloat(amount || 0) > 0;
}

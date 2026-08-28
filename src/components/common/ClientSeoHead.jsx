"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SITE_NAME = "Tijaar";

/** Private/account routes: title + description, noindex. */
const ROUTE_SEO = {
  "/customer/dashboard": { title: "My Dashboard", description: "Your Tijaar customer account dashboard." },
  "/customer/orders": { title: "My Orders", description: "View and track your Tijaar orders." },
  "/customer/wishlist": { title: "Wishlist", description: "Your saved products on Tijaar." },
  "/customer/notifications": { title: "Notifications", description: "Your Tijaar notifications." },
  "/customer/notifications/preferences": { title: "Notification Preferences", description: "Manage your notification settings." },
  "/customer/disputes": { title: "Disputes", description: "Your order disputes on Tijaar." },
  "/customer/profile": { title: "Profile", description: "Manage your Tijaar profile." },
  "/customer/addresses": { title: "Addresses", description: "Manage your shipping addresses." },
  "/customer/verify-whatsapp": { title: "WhatsApp Verification", description: "Verify your WhatsApp number." },
  "/customer/verify-phone": { title: "Mobile Phone Verification", description: "Manage your mobile number." },
  "/customer/sell": { title: "Sell an Item", description: "List an item for sale on Tijaar." },
  "/customer/listings": { title: "My Listings", description: "Manage your private seller listings." },
  "/customer/earnings": { title: "Earnings", description: "View your private seller earnings." },
  "/customer/transactions": { title: "Transaction History", description: "Your Tijaar transaction history." },
  "/customer/account": { title: "Account Settings", description: "Manage your Tijaar account security." },
  "/customer/messages": { title: "Messages", description: "Your Tijaar conversations." },
  "/seller/dashboard": { title: "Seller Dashboard", description: "Manage your Tijaar store." },
  "/seller/products": { title: "My Products", description: "Manage your Tijaar product listings." },
  "/seller/products/add": { title: "Add Product", description: "Add a new product to your store." },
  "/seller/flash-deals": { title: "Flash Deals", description: "Manage your store flash deals." },
  "/seller/inventory": { title: "Inventory", description: "Manage product stock levels." },
  "/seller/orders": { title: "Orders", description: "Manage customer orders." },
  "/seller/notifications": { title: "Alerts", description: "Seller notifications and alerts." },
  "/seller/disputes": { title: "Disputes", description: "Manage order disputes." },
  "/seller/payouts": { title: "Earnings & Payouts", description: "Track earnings and request payouts." },
  "/seller/packages": { title: "Promotion Packages", description: "Buy and manage promotion packages." },
  "/seller/profile": { title: "Store Profile", description: "Update your store profile." },
  "/seller/addresses": { title: "Addresses", description: "Manage your shipping addresses." },
  "/seller/verify-whatsapp": { title: "WhatsApp Verification", description: "Verify your WhatsApp number." },
  "/seller/verify-phone": { title: "Mobile Phone Verification", description: "Manage your mobile number." },
  "/seller/kyc": { title: "KYC Verification", description: "Submit seller verification documents." },
  "/seller/transactions": { title: "Transaction History", description: "Your seller transaction history." },
  "/seller/create-store": { title: "Create Store", description: "Set up your Tijaar store." },
  "/seller/account": { title: "Seller Account", description: "Manage your seller account." },
  "/seller/messages": { title: "Messages", description: "Chat with buyers." },
  "/seller/promote": { title: "Promote Products", description: "Boost product visibility." },
  "/seller/wallet/deposit": { title: "Wallet Deposit", description: "Add funds to your seller wallet." },
  "/seller/wallet/deposit/success": { title: "Deposit Successful", description: "Your wallet deposit was successful." },
  "/cart": { title: "Shopping Cart", description: "Review items in your Tijaar cart.", noIndex: true },
  "/checkout": { title: "Checkout", description: "Complete your Tijaar order.", noIndex: true },
  "/checkout/success": { title: "Order Placed", description: "Your order was placed successfully.", noIndex: true },
  "/verify-otp": { title: "Verify OTP", description: "Verify your Tijaar account.", noIndex: true },
  "/forgot-password": { title: "Forgot Password", description: "Reset your Tijaar password.", noIndex: true },
  "/reset-password": { title: "Reset Password", description: "Choose a new password for your account.", noIndex: true },
  "/auth/callback": { title: "Signing In", description: "Completing sign in to Tijaar.", noIndex: true },
};

function matchRouteMeta(pathname) {
  if (!pathname) return null;
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];
  const prefixes = [
    ["/customer/orders/", { title: "Order Details", description: "View your order details." }],
    ["/customer/disputes/", { title: "Dispute Details", description: "View dispute details." }],
    ["/customer/listings/", { title: "Edit Listing", description: "Edit your listing." }],
    ["/customer/listings/orders/", { title: "Listing Order", description: "Private listing order details." }],
    ["/customer/messages/", { title: "Conversation", description: "Tijaar message thread." }],
    ["/seller/orders/", { title: "Order Details", description: "Manage order details." }],
    ["/seller/products/", { title: "Product", description: "Manage product details." }],
    ["/seller/disputes/", { title: "Dispute Details", description: "Seller dispute details." }],
    ["/seller/messages/", { title: "Conversation", description: "Chat with a buyer." }],
    ["/seller/promote/", { title: "Promotion", description: "Product promotion details." }],
  ];
  for (const [prefix, meta] of prefixes) {
    if (pathname.startsWith(prefix)) return { ...meta, noIndex: true };
  }
  if (pathname.startsWith("/customer/") || pathname.startsWith("/seller/")) {
    return { title: "Account", description: "Your Tijaar account.", noIndex: true };
  }
  return null;
}

function upsertMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertRobots(noIndex) {
  let el = document.querySelector('meta[name="robots"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "robots");
    document.head.appendChild(el);
  }
  el.setAttribute("content", noIndex ? "noindex, nofollow" : "index, follow");
}

export default function ClientSeoHead() {
  const pathname = usePathname();

  useEffect(() => {
    const meta = matchRouteMeta(pathname);
    if (!meta) return;

    const fullTitle = `${meta.title} | ${SITE_NAME}`;
    document.title = fullTitle;
    upsertMeta("description", meta.description);
    upsertRobots(meta.noIndex !== false);
  }, [pathname]);

  return null;
}

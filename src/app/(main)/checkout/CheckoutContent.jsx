"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useMarket } from "@/context/MarketContext";
import useAuth from "@/hooks/useAuth";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { addressApi, orderApi, cartApi, couponApi, paymentApi, walletApi } from "@/lib/api";
import { useCartShipping } from "@/hooks/useCartShipping";
import LocationFields from "@/components/forms/LocationFields";
import { isValidEmail, isValidZip, normalizePhonePk, validatePhone } from "@/lib/validators";

/** Build a user-friendly error message from API validation or error response */
function formatApiError(err) {
  if (!err) return "An error occurred";
  const data = err?.data || err?.response?.data;
  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length) return messages.join(". ");
  }
  return data?.message || err?.message || "Something went wrong. Please try again.";
}

const FALLBACK_PAYMENT_OPTIONS = [
  { value: "cod", label: "Cash on Delivery (COD)", desc: "Pay when you receive" },
  { value: "stripe", label: "Credit/Debit Card", desc: "" },
  { value: "paypal", label: "PayPal", desc: "Pay with PayPal" },
  { value: "jazzcash", label: "Jazzcash / Mobicash Account", desc: "" },
  { value: "easypaisa", label: "Easypaisa", desc: "Pakistan mobile wallet" },
];

export default function CheckoutContent() {
  const { cartItems, getCartTotal, clearCart, refresh: refreshCart, hasFlashDealInCart } = useCart();
  const cartHasFlashDeal = hasFlashDealInCart?.() ?? cartItems.some((i) => i.flash_deal_id != null);
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const { user, login, register, logout } = useAuth();
  const { payment_methods: paymentOptions } = useSiteSettings();
  const paymentMethods = Array.isArray(paymentOptions) && paymentOptions.length > 0 ? paymentOptions : FALLBACK_PAYMENT_OPTIONS;
  const router = useRouter();
  const checkoutH1 = useSeoH1("checkout");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(() => (paymentMethods[0]?.value ?? "cod"));
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  // Shipping is fixed by each seller on the listing — no courier rate lookup.
  const { totalShipping: shippingCost } = useCartShipping(cartItems);

  const [guestForm, setGuestForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "Pakistan",
    zip_code: "",
  });
  const [createAccount, setCreateAccount] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const inList = paymentMethods.some((o) => o.value === paymentMethod);
    if (!inList && paymentMethods[0]?.value) {
      setPaymentMethod(paymentMethods[0].value);
    }
  }, [paymentMethods, paymentMethod]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    addressApi
      .list()
      .then((res) => {
        const addrs = res.addresses || [];
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
        if (defaultAddr) setSelectedAddressId(String(defaultAddr.id));
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWalletBalance(null);
      return;
    }
    walletApi
      .balance()
      .then((res) => {
        const bal = res?.wallet?.balance ?? res?.balance ?? 0;
        setWalletBalance(Number(bal));
      })
      .catch(() => setWalletBalance(null));
  }, [user]);

  const goToOrderDetail = (res, message) => {
    const orderId = res?.order?.id;
    clearCart();
    showSuccess?.(message || res?.message || "Order placed successfully!");
    if (orderId) {
      router.push(`/customer/orders/${orderId}`);
      return;
    }
    router.push("/customer/orders");
  };

  useEffect(() => {
    const subtotal = getCartTotal();
    const discount = cartHasFlashDeal ? 0 : (appliedCoupon?.discount ?? 0);
    const shipping = shippingCost ?? 0;
    if (subtotal <= 0 && shipping <= 0) {
      setPaymentPreview(null);
      return;
    }
    paymentApi
      .preview({ subtotal, shipping, discount, payment_method: paymentMethod })
      .then((res) => setPaymentPreview(res.payment || null))
      .catch(() => setPaymentPreview(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingCost, appliedCoupon, cartItems.length, cartHasFlashDeal, paymentMethod]);

  const feeInfo = paymentPreview?.fees;

  const formatFeeLabel = (label, type, value) => {
    if (type === "percentage" && value != null) {
      return `${label} (${Number(value)}%)`;
    }
    return label;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Online payment (JazzCash / Stripe / etc.) happens later via Pay Now on the order page.
      if (!user) {
        if (!guestForm.first_name?.trim() || !guestForm.last_name?.trim()) {
          showError?.("First name and last name are required");
          setSubmitting(false);
          return;
        }
        if (!guestForm.email?.trim() || !guestForm.phone?.trim()) {
          showError?.("Email and phone are required");
          setSubmitting(false);
          return;
        }
        if (!isValidEmail(guestForm.email)) {
          showError?.("Enter a valid email address");
          setSubmitting(false);
          return;
        }
        const guestPhoneErr = validatePhone(guestForm.phone);
        if (guestPhoneErr) {
          showError?.(guestPhoneErr);
          setSubmitting(false);
          return;
        }
        if (!guestForm.address_line_1?.trim() || !guestForm.city?.trim() || !guestForm.country?.trim()) {
          showError?.("Address, city and country are required");
          setSubmitting(false);
          return;
        }
        if (guestForm.zip_code?.trim() && !isValidZip(guestForm.zip_code)) {
          showError?.("Enter a valid postal code");
          setSubmitting(false);
          return;
        }
        if (createAccount) {
          if (!guestForm.password || guestForm.password.length < 8) {
            showError?.("Password must be at least 8 characters");
            setSubmitting(false);
            return;
          }
          if (guestForm.password !== guestForm.password_confirmation) {
            showError?.("Passwords do not match");
            setSubmitting(false);
            return;
          }
        }
        const pwd = createAccount ? guestForm.password : "Tijaar" + Date.now() + "!";
        const fullName = `${guestForm.first_name.trim()} ${guestForm.last_name.trim()}`.trim() || guestForm.first_name.trim();
        const guestPhone = normalizePhonePk(guestForm.phone);
        const reg = await register({
          name: fullName,
          email: guestForm.email.trim(),
          phone: guestPhone,
          password: pwd,
          password_confirmation: pwd,
          role: "customer",
        });
        if (reg?.requires_verification) {
          showSuccess?.(
            reg?.message || "Check your email for the verification code to continue checkout."
          );
          const email = encodeURIComponent(reg.email || guestForm.email.trim());
          router.push(`/verify-otp?email=${email}&redirect=${encodeURIComponent("/checkout")}`);
          setSubmitting(false);
          return;
        }
        const addrRes = await addressApi.create({
          type: "shipping",
          first_name: guestForm.first_name.trim(),
          last_name: guestForm.last_name.trim(),
          address_line_1: guestForm.address_line_1.trim(),
          address_line_2: guestForm.address_line_2?.trim() || "",
          city: guestForm.city.trim(),
          state: guestForm.state?.trim() || "",
          country: guestForm.country.trim(),
          zip_code: guestForm.zip_code?.trim() || "",
          phone: guestPhone,
        });
        const addrId = addrRes.address?.id;
        const guestCart = typeof window !== "undefined" ? localStorage.getItem("cart_guest") : null;
        if (guestCart) {
          try {
            const items = JSON.parse(guestCart);
            await cartApi.merge(items.map((i) => ({ product_id: i.id, quantity: i.quantity })));
            localStorage.removeItem("cart_guest");
          } catch (_) {}
        }
        const res = await orderApi.create({
          shipping_address_id: addrId,
          payment_method: paymentMethod,
          customer_notes: notes || undefined,
          coupon_code: cartHasFlashDeal ? undefined : (appliedCoupon?.code || undefined),
        });
        goToOrderDetail(
          res,
          paymentMethod === "cod" || paymentMethod === "wallet"
            ? "Order placed successfully!"
            : "Order placed. Use Pay Now on the order page to complete payment."
        );
      } else {
        if (!user.email_verified_at) {
          showError?.("Please verify your email before placing an order.");
          setSubmitting(false);
          return;
        }
        if (!user.phone || !user.phone_verified_at) {
          showError?.("Please add and verify your mobile number in Profile before placing an order.");
          setSubmitting(false);
          return;
        }
        if (!selectedAddressId) {
          showError?.("Select a shipping address");
          setSubmitting(false);
          return;
        }
        const res = await orderApi.create({
          shipping_address_id: parseInt(selectedAddressId, 10),
          payment_method: paymentMethod,
          customer_notes: notes || undefined,
          coupon_code: cartHasFlashDeal ? undefined : (appliedCoupon?.code || undefined),
        });
        goToOrderDetail(
          res,
          paymentMethod === "cod" || paymentMethod === "wallet"
            ? "Order placed successfully!"
            : "Order placed. Use Pay Now on the order page to complete payment."
        );
      }
    } catch (err) {
      if (err?.data?.error_code === "email_verification_required") {
        showError?.(err?.data?.message || "Please verify your email before placing an order.");
        return;
      }
      if (err?.data?.error_code === "phone_verification_required") {
        showError?.(
          err?.data?.message ||
            "Please add and verify your mobile number in Profile before placing an order."
        );
        return;
      }
      const msg = formatApiError(err);
      showError?.(msg);
      const lower = (msg || "").toLowerCase();
      if (lower.includes("insufficient stock") || lower.includes("only ") && lower.includes(" available")) {
        refreshCart?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !user) return;
    setApplyingCoupon(true);
    try {
      const res = await couponApi.validate(couponCode.trim());
      if (res.valid && res.discount) {
        setAppliedCoupon({ code: res.coupon.code, discount: res.discount });
        showSuccess?.(`Coupon applied! You save ${formatPrice(res.discount)}`);
      }
    } catch (err) {
      setAppliedCoupon(null);
      showError?.(formatApiError(err));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const displayTotal = () => {
    const total = getCartTotal();
    const discount = cartHasFlashDeal ? 0 : (appliedCoupon?.discount ?? 0);
    const ship = shippingCost ?? 0;
    const isCod = paymentMethod === "cod";
    const marketplace = Number(feeInfo?.marketplace_fee ?? 0);
    const txn = isCod ? 0 : Number(feeInfo?.online_transaction_fee ?? 0);
    return Math.max(0, total + ship - discount + marketplace + txn);
  };

  const formatAddressBlock = (a) => {
    if (!a) return null;
    return {
      name: [a.first_name, a.last_name].filter(Boolean).join(" "),
      line1: a.address_line_1,
      line2: a.address_line_2,
      cityState: [a.city, a.state].filter(Boolean).join(", "),
      country: a.country,
      zip: a.zip_code,
      phone: a.phone,
    };
  };

  const selectedAddress = addresses.find((a) => String(a.id) === String(selectedAddressId));
  const selectedAddressDetail = formatAddressBlock(selectedAddress);
  const guestAddressDetail = !user
    ? formatAddressBlock({
        first_name: guestForm.first_name,
        last_name: guestForm.last_name,
        address_line_1: guestForm.address_line_1,
        address_line_2: guestForm.address_line_2,
        city: guestForm.city,
        state: guestForm.state,
        country: guestForm.country,
        zip_code: guestForm.zip_code,
        phone: guestForm.phone,
      })
    : null;

  const cartTotal = getCartTotal();
  const discountAmount = cartHasFlashDeal ? 0 : Number(appliedCoupon?.discount ?? 0);
  const marketplaceFee = Number(feeInfo?.marketplace_fee ?? 0);
  const onlineTxnFee = paymentMethod === "cod" ? 0 : Number(feeInfo?.online_transaction_fee ?? 0);
  const emailBlocked = user && !user.email_verified_at;
  const phoneBlocked = user && (!user.phone || !user.phone_verified_at);
  const placeOrderDisabled =
    submitting ||
    emailBlocked ||
    phoneBlocked ||
    (user && addresses.length === 0) ||
    (!user &&
      (!guestForm.first_name?.trim() ||
        !guestForm.last_name?.trim() ||
        !guestForm.email?.trim() ||
        !guestForm.phone?.trim() ||
        !guestForm.address_line_1?.trim() ||
        !guestForm.city?.trim()));

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-12">
        <div className="animate-pulse space-y-4 max-w-xl">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-[#1790d7] font-medium hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (user?.role === "seller") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center p-8 bg-amber-50 border border-amber-200 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sellers cannot purchase while logged in</h2>
          <p className="text-gray-600 mb-6">
            To buy products and avoid incorrect earnings, commissions, and payouts, please log out and place your order as a customer.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => logout?.()}
              className="px-6 py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl transition"
            >
              Log out and shop as customer
            </button>
            <Link
              href="/seller"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Back to Seller Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
      <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1790d7] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{checkoutH1}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: customer / address / payment */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {!user && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                    <input
                      type="text"
                      value={guestForm.first_name}
                      onChange={(e) => setGuestForm((p) => ({ ...p, first_name: e.target.value }))}
                      placeholder="e.g. Ahmed"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                    <input
                      type="text"
                      value={guestForm.last_name}
                      onChange={(e) => setGuestForm((p) => ({ ...p, last_name: e.target.value }))}
                      placeholder="e.g. Khan"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="03XXXXXXXXX"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">03XXXXXXXXX (also accepts 923… / +923…)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    value={guestForm.address_line_1}
                    onChange={(e) => setGuestForm((p) => ({ ...p, address_line_1: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={guestForm.address_line_2}
                    onChange={(e) => setGuestForm((p) => ({ ...p, address_line_2: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <LocationFields
                  country={guestForm.country}
                  state={guestForm.state}
                  city={guestForm.city}
                  zipCode={guestForm.zip_code}
                  showZip
                  lockCountry
                  defaultCountry="Pakistan"
                  onZipChange={(zip) => setGuestForm((p) => ({ ...p, zip_code: zip }))}
                  onChange={({ country, state, city }) =>
                    setGuestForm((p) => ({ ...p, country: country || "Pakistan", state, city }))
                  }
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Create an account for easier checkout next time</span>
                </label>
                {createAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={guestForm.password}
                          onChange={(e) => setGuestForm((p) => ({ ...p, password: e.target.value }))}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={guestForm.password_confirmation}
                          onChange={(e) => setGuestForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Your Profile</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-[#1790d7] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                      <p className="font-medium text-gray-900">{user.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#1790d7] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="font-medium text-gray-900">{user.email || "—"}</p>
                      {!user.email_verified_at && (
                        <p className="text-xs text-amber-600 mt-0.5">Not verified</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#1790d7] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile</p>
                      <p className="font-medium text-gray-900">{user.phone || "—"}</p>
                      {user.phone && !user.phone_verified_at && (
                        <p className="text-xs text-amber-600 mt-0.5">Not verified</p>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href="/customer/profile"
                  className="inline-block mt-4 text-sm text-[#1790d7] font-medium hover:underline"
                >
                  Edit profile →
                </Link>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              {user && addresses.length === 0 ? (
                <Link
                  href="/customer/profile"
                  className="block p-4 border-2 border-dashed border-gray-200 rounded-xl text-[#1790d7] hover:border-[#1790d7]"
                >
                  Add an address first →
                </Link>
              ) : user && addresses.length > 0 ? (
                <div className="space-y-4">
                  {selectedAddressDetail && (
                    <div className="rounded-xl border border-[#1790d7]/30 bg-[#1790d7]/5 p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#1790d7] shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-800 space-y-1">
                          <p className="font-semibold text-gray-900">{selectedAddressDetail.name}</p>
                          <p>{selectedAddressDetail.line1}</p>
                          {selectedAddressDetail.line2 && <p>{selectedAddressDetail.line2}</p>}
                          <p>
                            {[selectedAddressDetail.cityState, selectedAddressDetail.zip]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <p>{selectedAddressDetail.country}</p>
                          {selectedAddressDetail.phone && (
                            <p className="text-gray-600 pt-1">Phone: {selectedAddressDetail.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {addresses.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Choose address
                      </p>
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition text-sm ${
                            selectedAddressId === String(a.id)
                              ? "border-[#1790d7] bg-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={a.id}
                            checked={selectedAddressId === String(a.id)}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="mt-1"
                          />
                          <span className="text-gray-700">
                            {[a.first_name, a.last_name].filter(Boolean).join(" ")} — {a.address_line_1}, {a.city}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <Link href="/customer/profile" className="text-sm text-[#1790d7] hover:underline">
                    Manage addresses →
                  </Link>
                </div>
              ) : !user && guestAddressDetail?.line1 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 space-y-1">
                  <p className="font-semibold text-gray-900">{guestAddressDetail.name}</p>
                  <p>{guestAddressDetail.line1}</p>
                  {guestAddressDetail.line2 && <p>{guestAddressDetail.line2}</p>}
                  <p>
                    {[guestAddressDetail.cityState, guestAddressDetail.zip].filter(Boolean).join(" · ")}
                  </p>
                  <p>{guestAddressDetail.country}</p>
                  {guestAddressDetail.phone && <p className="text-gray-600">Phone: {guestAddressDetail.phone}</p>}
                </div>
              ) : !user ? (
                <p className="text-sm text-gray-500">Complete the customer form above to set your delivery address.</p>
              ) : null}
            </div>

            {user && !cartHasFlashDeal && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Coupon Code</h2>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="font-medium text-emerald-800">
                      {appliedCoupon.code} applied (−{formatPrice(appliedCoupon.discount)})
                    </span>
                    <button type="button" onClick={removeCoupon} className="text-sm text-emerald-600 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || applyingCoupon}
                      className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl text-sm disabled:opacity-50"
                    >
                      {applyingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Order Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                placeholder="Special instructions (optional)..."
              />
            </div>
          </div>

          {/* Right: order summary + payment */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="p-5 space-y-4">
                <ul className="space-y-3 max-h-48 overflow-y-auto border-b border-gray-100 pb-4">
                  {cartItems.map((i) => (
                    <li key={`${i.id}-${i.variant_id ?? "base"}`} className="flex gap-3 text-sm">
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={i.image || "/assets/sample-image.webp"}
                          alt={i.title || i.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {i.title || i.name}
                          {i.variant_label ? ` (${i.variant_label})` : ""}
                        </p>
                        <p className="text-xs text-gray-500">Qty {i.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900 shrink-0">
                        {formatPrice((i.price || 0) * (i.quantity || 1))}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount{appliedCoupon?.code ? ` (${appliedCoupon.code})` : ""}</span>
                      <span>−{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>{Number(shippingCost) > 0 ? formatPrice(shippingCost) : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {formatFeeLabel(
                        "Marketplace fee",
                        feeInfo?.marketplace_fee_type,
                        feeInfo?.marketplace_fee_value
                      )}
                    </span>
                    <span>{formatPrice(marketplaceFee)}</span>
                  </div>
                  {paymentMethod !== "cod" ? (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {formatFeeLabel(
                          "Online transaction fee",
                          feeInfo?.online_transaction_fee_type,
                          feeInfo?.online_transaction_fee_value
                        )}
                      </span>
                      <span>{formatPrice(onlineTxnFee)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Cash on delivery — no online transaction fee.</p>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-3">
                    <span>Total</span>
                    <span className="text-[#1790d7]">{formatPrice(displayTotal())}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment method</h3>
                  <div className="space-y-2">
                    {paymentMethods.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                          paymentMethod === opt.value
                            ? "border-[#1790d7] bg-[#1790d7]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-[#1790d7]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{opt.label}</p>
                          {opt.value === "wallet" && user && walletBalance != null ? (
                            <p className="text-xs text-[#1790d7] font-semibold">
                              Available: {formatPrice(walletBalance)}
                            </p>
                          ) : opt.desc ? (
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          ) : null}
                          {paymentPreview?.options?.find((o) => o.value === opt.value) && (
                            <p className="text-xs text-[#1790d7] mt-0.5">
                              {(() => {
                                const split = paymentPreview.options.find((o) => o.value === opt.value);
                                if (!split) return null;
                                const rs = (n) =>
                                  `Rs ${Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
                                if (split.value === "cod") return `Pay ${rs(split.cod_amount)} on delivery`;
                                if (split.cod_amount > 0) {
                                  return `Pay ${rs(split.online_amount)} now · ${rs(split.cod_amount)} on delivery`;
                                }
                                if (split.online_amount > 0) return `Pay ${rs(split.online_amount)} now`;
                                return null;
                              })()}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placeOrderDisabled}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold disabled:opacity-50 hover:opacity-95 transition"
                >
                  {submitting ? "Placing order…" : "Place Order"}
                </button>
                {emailBlocked && (
                  <p className="text-sm text-center text-amber-700">
                    Verify your email to place orders.
                  </p>
                )}
                {phoneBlocked && (
                  <p className="text-sm text-center text-amber-700">
                    Verify your mobile number in{" "}
                    <Link href="/customer/profile" className="text-[#1790d7] font-medium underline">
                      Profile
                    </Link>{" "}
                    to place orders.
                  </p>
                )}
                <p className="text-[11px] text-center text-gray-400">
                  Online payment is collected after placing the order via Pay Now on the order page.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

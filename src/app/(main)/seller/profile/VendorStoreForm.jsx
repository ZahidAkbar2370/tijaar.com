"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Upload, MapPin, FileText } from "lucide-react";
import { sellerStoreApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import useAuth from "@/hooks/useAuth";

export default function VendorStoreForm() {
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    zip_code: "",
    shipping_policy: "",
    return_policy: "",
    logo_alt: "",
    banner_alt: "",
    cover_image_alt: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    sellerStoreApi
      .get()
      .then((res) => {
        if (res.has_store && res.store) {
          setStore(res.store);
          setForm({
            name: res.store.name ?? "",
            description: res.store.description ?? "",
            address: res.store.address ?? "",
            zip_code: res.store.zip_code ?? "",
            shipping_policy: res.store.shipping_policy ?? "",
            return_policy: res.store.return_policy ?? "",
            logo_alt: res.store.logo_alt ?? "",
            banner_alt: res.store.banner_alt ?? "",
            cover_image_alt: res.store.cover_image_alt ?? "",
          });
        }
      })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (logoFile) payload.logo = logoFile;
      if (bannerFile) payload.banner = bannerFile;
      if (coverFile) payload.cover_image = coverFile;
      const res = await sellerStoreApi.update(payload);
      if (res.store) setStore(res.store);
      setLogoFile(null);
      setBannerFile(null);
      setCoverFile(null);
      showSuccess?.("Store updated.");
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to update store";
      const errors = err?.data?.errors;
      if (errors && typeof errors === "object") {
        const first = Object.values(errors).flat()[0];
        showError?.(first || msg);
      } else {
        showError?.(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-6" />
        <div className="h-4 bg-gray-100 rounded w-full mb-4" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 text-center">
        <Store className="w-10 h-10 text-[#1790d7] mx-auto mb-3" />
        <p className="font-semibold text-gray-900">No store yet</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">Create your store to manage logo, policies, and contact details.</p>
        <Link
          href="/seller/create-store"
          className="inline-flex px-5 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white text-sm font-semibold rounded-xl"
        >
          Create store
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="w-6 h-6 text-[#1790d7]" />
          Store details
        </h2>
        <p className="text-sm text-gray-500 mt-1">Update store name, images, address, and policies. Contact and location are managed in your profile.</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            {store.logo && !logoFile && (
              <div className="mb-2">
                <img src={store.logo} alt={resolveImageAlt(store.logo_alt || form.logo_alt, form.name || IMAGE_ALT_FALLBACKS.storeLogo)} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">{logoFile ? logoFile.name : "Change logo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
            <input
              type="text"
              value={form.logo_alt}
              onChange={(e) => update("logo_alt", e.target.value)}
              placeholder="Logo alt text (optional)"
              className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
            {store.banner && !bannerFile && (
              <div className="mb-2">
                <img src={store.banner} alt={resolveImageAlt(store.banner_alt || form.banner_alt, form.name || IMAGE_ALT_FALLBACKS.storeBanner)} className="w-full h-20 object-cover rounded-xl border border-gray-200" />
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">{bannerFile ? bannerFile.name : "Change banner"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
            </label>
            <input
              type="text"
              value={form.banner_alt}
              onChange={(e) => update("banner_alt", e.target.value)}
              placeholder="Banner alt text (optional)"
              className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover / Timeline photo</label>
            {store.cover_image && !coverFile && (
              <div className="mb-2">
                <img src={store.cover_image} alt={resolveImageAlt(store.cover_image_alt || form.cover_image_alt, form.name || IMAGE_ALT_FALLBACKS.storeCover)} className="w-full h-20 object-cover rounded-xl border border-gray-200" />
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">{coverFile ? coverFile.name : "Change cover"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
            <input
              type="text"
              value={form.cover_image_alt}
              onChange={(e) => update("cover_image_alt", e.target.value)}
              placeholder="Cover image alt text (optional)"
              className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-2">From profile (read-only here)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <p>Email: {user?.email || "—"}</p>
            <p>Phone: {user?.phone || "—"}</p>
            <p>Province: {user?.state || "—"}</p>
            <p>City: {user?.city || "—"}</p>
            <p>Country: Pakistan</p>
          </div>
          <Link href="/seller/profile" className="inline-block mt-3 text-sm font-medium text-[#1790d7] hover:underline">
            Edit in profile
          </Link>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zip / Postal code</label>
          <input
            type="text"
            value={form.zip_code}
            onChange={(e) => update("zip_code", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Shipping policy</label>
          <textarea value={form.shipping_policy} onChange={(e) => update("shipping_policy", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Return policy</label>
          <textarea value={form.return_policy} onChange={(e) => update("return_policy", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20" />
        </div>

        <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50">
          {saving ? "Saving..." : "Save store"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { addressApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { confirmDelete } from "@/lib/sweetAlert";
import LocationFields from "@/components/forms/LocationFields";
import { isValidZip, normalizePhonePk, validatePhone } from "@/lib/validators";

export default function AddressesPanel() {
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "shipping",
    first_name: "",
    last_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "Pakistan",
    zip_code: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const addrRes = await addressApi.list();
        setAddresses(addrRes.addresses || []);
      } catch {
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const phoneErr = validatePhone(newAddress.phone);
    if (phoneErr) {
      showError?.(phoneErr);
      return;
    }
    if (!isValidZip(newAddress.zip_code)) {
      showError?.("Enter a valid postal code.");
      return;
    }
    setSubmitting(true);
    try {
      const phone = normalizePhonePk(newAddress.phone);
      await addressApi.create({ ...newAddress, phone });
      const res = await addressApi.list();
      setAddresses(res.addresses || []);
      setShowAddAddress(false);
      setNewAddress({
        type: "shipping",
        first_name: "",
        last_name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        country: "Pakistan",
        zip_code: "",
      });
      showSuccess?.("Address added.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to add address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    const confirmed = await confirmDelete({
      title: "Remove address?",
      text: "This address will be removed from your account.",
      confirmButtonText: "Yes, remove",
    });
    if (!confirmed) return;
    try {
      await addressApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showSuccess?.("Address removed.");
    } catch (err) {
      showError?.(err?.message || "Failed to remove address.");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressApi.setDefault(id);
      const res = await addressApi.list();
      setAddresses(res.addresses || []);
      showSuccess?.("Default address updated.");
    } catch (err) {
      showError?.(err?.message || "Failed to set default.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#1790d7]" />
        Addresses
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {addresses.map((a) => (
              <div key={a.id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{a.first_name} {a.last_name}</p>
                  <p className="text-sm text-gray-600">{a.address_line_1}, {a.city}, {a.country}</p>
                  {a.is_default && <span className="text-xs text-[#1790d7] font-medium">Default</span>}
                </div>
                <div className="flex gap-2">
                  {!a.is_default && (
                    <button onClick={() => handleSetDefaultAddress(a.id)} className="text-sm text-[#1790d7] hover:underline">
                      Set default
                    </button>
                  )}
                  <button onClick={() => handleDeleteAddress(a.id)} className="text-sm text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-sm text-gray-500">No addresses yet. Add one for faster checkout.</p>
            )}
          </div>
          {!showAddAddress ? (
            <button onClick={() => setShowAddAddress(true)} className="text-[#1790d7] font-semibold hover:underline">
              + Add address
            </button>
          ) : (
            <form onSubmit={handleAddAddress} className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <input type="text" placeholder="First name" value={newAddress.first_name} onChange={(e) => setNewAddress((p) => ({ ...p, first_name: e.target.value }))} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              <input type="text" placeholder="Last name" value={newAddress.last_name} onChange={(e) => setNewAddress((p) => ({ ...p, last_name: e.target.value }))} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              <input type="text" placeholder="Phone (03XXXXXXXXX)" value={newAddress.phone} onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              <input type="text" placeholder="Address line 1" value={newAddress.address_line_1} onChange={(e) => setNewAddress((p) => ({ ...p, address_line_1: e.target.value }))} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              <LocationFields
                country={newAddress.country}
                state={newAddress.state}
                city={newAddress.city}
                zipCode={newAddress.zip_code}
                showZip
                lockCountry
                defaultCountry="Pakistan"
                onZipChange={(zip) => setNewAddress((p) => ({ ...p, zip_code: zip }))}
                onChange={({ country, state, city }) =>
                  setNewAddress((p) => ({ ...p, country: country || "Pakistan", state, city }))
                }
              />
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1790d7] text-white rounded-lg font-medium">Add</button>
                <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 border border-gray-200 rounded-lg">Cancel</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

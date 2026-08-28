"use client";

import { useState, useEffect } from "react";
import { BadgeCheck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { sellerStoreApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import PageHero from "@/components/customer/PageHero";
import ProtectedRoute from "@/components/ProtectedRoute";
import KycDocumentFields, { validateKycDocumentFields } from "@/components/forms/KycDocumentFields";

export default function VendorKycPage() {
  const { user, refresh } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [form, setForm] = useState({
    bank_account_holder: "",
    bank_account_number: "",
    bank_name: "",
    bank_swift_code: "",
    document_type: "govt_id",
    cnic: "",
    licence_number: "",
  });

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  useEffect(() => {
    sellerStoreApi.get().then((r) => {
      if (r.store) setStore(r.store);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const kycStatus = user?.kyc_status || store?.kyc_status || "none";
  const isVerified = user?.is_seller_verified || kycStatus === "verified";

  const handleUpload = async (e) => {
    e.preventDefault();
    const nextErrors = validateKycDocumentFields(form, idFrontFile, idBackFile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("document_type", form.document_type || "govt_id");
      if (form.document_type === "licence") {
        fd.append("licence_number", form.licence_number);
      } else {
        fd.append("cnic", form.cnic);
      }
      fd.append("bank_account_holder", form.bank_account_holder);
      fd.append("bank_account_number", form.bank_account_number);
      fd.append("bank_name", form.bank_name);
      if (form.bank_swift_code) fd.append("bank_swift_code", form.bank_swift_code);
      fd.append("id_front", idFrontFile);
      fd.append("id_back", idBackFile);

      await sellerStoreApi.uploadKyc(fd);
      showSuccess?.("KYC submitted. Admin will verify shortly.");
      setIdFrontFile(null);
      setIdBackFile(null);
      await refresh();
      const r = await sellerStoreApi.get();
      if (r.store) setStore(r.store);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="space-y-6 max-w-2xl">
        <PageHero
          title="KYC Verification"
          description="Submit bank details and a Govt ID (CNIC) or Licence with front and back images."
          illustration="profile"
          guide="Approval usually takes 1–2 business days."
        />

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            {isVerified ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-700">Verified</p>
                  <p className="text-sm text-gray-600">Your KYC has been approved.</p>
                </div>
              </>
            ) : kycStatus === "pending" ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-700">Pending Verification</p>
                  <p className="text-sm text-gray-600">Admin is reviewing your submission.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Not Verified</p>
                  <p className="text-sm text-gray-600">Complete the form below to submit KYC.</p>
                </div>
              </>
            )}
          </div>

          {!isVerified && !loading && (
            <form onSubmit={handleUpload} className="space-y-4">
              <KycDocumentFields
                form={form}
                setField={setField}
                errors={errors}
                setErrors={setErrors}
                idFrontFile={idFrontFile}
                setIdFrontFile={setIdFrontFile}
                idBackFile={idBackFile}
                setIdBackFile={setIdBackFile}
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {uploading ? "Submitting…" : "Submit KYC"}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <BadgeCheck className="w-4 h-4 inline mr-1" />
              Verified sellers build more buyer trust on Tijaar.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

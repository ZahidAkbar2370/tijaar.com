"use client";

const inputClass = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm ${
    error ? "border-red-400" : "border-gray-200"
  } focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]`;

/**
 * Bank + identity KYC fields (Govt ID / Licence with front & back images).
 */
export default function KycDocumentFields({
  form,
  setField,
  errors = {},
  setErrors,
  idFrontFile,
  setIdFrontFile,
  idBackFile,
  setIdBackFile,
  showBank = true,
  showSwift = true,
  showTaxId = false,
}) {
  const documentType = form.document_type || "govt_id";

  const onDocumentTypeChange = (value) => {
    setField("document_type", value);
    setErrors?.((e) => ({ ...e, document_type: "", cnic: "", licence_number: "" }));
  };

  return (
    <div className="space-y-4">
      {showBank && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["bank_account_holder", "Account holder"],
            ["bank_account_number", "Account number"],
            ["bank_name", "Bank name"],
            ...(showSwift ? [["bank_swift_code", "SWIFT / branch (optional)"]] : []),
            ...(showTaxId ? [["tax_id", "NTN / tax ID (optional)"]] : []),
          ].map(([name, label]) => (
            <div key={name} className={name === "bank_account_holder" || name === "bank_name" ? "sm:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                value={form[name] || ""}
                onChange={(e) => setField(name, e.target.value)}
                className={inputClass(errors[name])}
              />
              {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-sm font-semibold text-gray-900">Identity document</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
          <select
            value={documentType}
            onChange={(e) => onDocumentTypeChange(e.target.value)}
            className={inputClass(errors.document_type)}
          >
            <option value="govt_id">Govt ID (CNIC)</option>
            <option value="licence">Licence</option>
          </select>
          {errors.document_type && <p className="text-xs text-red-600 mt-1">{errors.document_type}</p>}
        </div>

        {documentType === "govt_id" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNIC number</label>
            <input
              value={form.cnic || ""}
              onChange={(e) => setField("cnic", e.target.value)}
              placeholder="35202-1234567-1"
              className={inputClass(errors.cnic)}
            />
            {errors.cnic && <p className="text-xs text-red-600 mt-1">{errors.cnic}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Licence number</label>
            <input
              value={form.licence_number || ""}
              onChange={(e) => setField("licence_number", e.target.value)}
              className={inputClass(errors.licence_number)}
            />
            {errors.licence_number && <p className="text-xs text-red-600 mt-1">{errors.licence_number}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Front image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                setIdFrontFile(e.target.files?.[0] || null);
                setErrors?.((p) => ({ ...p, id_front: "" }));
              }}
              className="text-sm w-full"
            />
            {errors.id_front && <p className="text-xs text-red-600 mt-1">{errors.id_front}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Back image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                setIdBackFile(e.target.files?.[0] || null);
                setErrors?.((p) => ({ ...p, id_back: "" }));
              }}
              className="text-sm w-full"
            />
            {errors.id_back && <p className="text-xs text-red-600 mt-1">{errors.id_back}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function validateKycDocumentFields(form, idFrontFile, idBackFile) {
  const e = {};
  if (!form.bank_account_holder?.trim()) e.bank_account_holder = "Account holder is required";
  if (!form.bank_account_number?.trim()) e.bank_account_number = "Account number is required";
  if (!form.bank_name?.trim()) e.bank_name = "Bank name is required";

  const docType = form.document_type || "govt_id";
  if (docType === "govt_id") {
    const digits = String(form.cnic || "").replace(/\D/g, "");
    if (digits.length !== 13) e.cnic = "Enter a valid 13-digit CNIC";
  } else if (!String(form.licence_number || "").trim()) {
    e.licence_number = "Licence number is required";
  }

  if (!idFrontFile) e.id_front = "Front image is required";
  if (!idBackFile) e.id_back = "Back image is required";

  return e;
}

export function appendKycToFormData(fd, form, idFrontFile, idBackFile) {
  fd.append("document_type", form.document_type || "govt_id");
  if (form.document_type === "licence") {
    if (form.licence_number) fd.append("licence_number", form.licence_number);
  } else if (form.cnic) {
    fd.append("cnic", form.cnic);
  }
  if (idFrontFile) fd.append("id_front", idFrontFile);
  if (idBackFile) fd.append("id_back", idBackFile);
}

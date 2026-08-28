"use client";

import { useEffect, useMemo, useState } from "react";
import { locationApi } from "@/lib/api";

/**
 * Cascading country → province → city selects (admin-managed locations).
 * onChange receives canonical names for backend compatibility.
 */
export default function LocationFields({
  country = "",
  state = "",
  city = "",
  onChange,
  required = true,
  showZip = false,
  zipCode = "",
  onZipChange,
  className = "",
  labels = {},
  defaultCountry = "Pakistan",
  lockCountry = false,
}) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countryId, setCountryId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [cityId, setCityId] = useState("");

  const lbl = {
    country: labels.country || "Country",
    province: labels.province || "Province / State",
    city: labels.city || "City",
    zip: labels.zip || "Zip / Postal code",
  };

  useEffect(() => {
    let cancelled = false;
    locationApi
      .tree()
      .then((res) => {
        if (!cancelled && res?.countries) setTree(res.countries);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const provinces = useMemo(() => {
    if (!countryId) return [];
    return tree.find((c) => String(c.id) === String(countryId))?.provinces || [];
  }, [tree, countryId]);

  const cities = useMemo(() => {
    if (!provinceId) return [];
    return provinces.find((p) => String(p.id) === String(provinceId))?.cities || [];
  }, [provinces, provinceId]);

  const matchByName = (list, name) => {
    if (!name || !list?.length) return "";
    const n = name.trim().toLowerCase();
    const exact = list.find((x) => x.name?.trim().toLowerCase() === n);
    if (exact) return String(exact.id);
    const partial = list.find((x) => {
      const item = x.name?.trim().toLowerCase() || "";
      return item.includes(n) || n.includes(item);
    });
    return partial ? String(partial.id) : "";
  };

  useEffect(() => {
    if (!tree.length || loading) return;
    const resolvedCountry = country?.trim() || (lockCountry ? defaultCountry : country);
    const cId = matchByName(tree, resolvedCountry || defaultCountry);
    if (cId && cId !== countryId) setCountryId(cId);
  }, [tree, country, loading, defaultCountry, lockCountry]);

  useEffect(() => {
    if (!tree.length || loading || country?.trim()) return;
    if (!defaultCountry?.trim()) return;
    const cId = matchByName(tree, defaultCountry);
    if (!cId) return;
    setCountryId(cId);
    setProvinceId("");
    setCityId("");
    emitChange(cId, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, loading, country, defaultCountry]);

  useEffect(() => {
    if (!countryId || !tree.length) return;
    const provs = tree.find((c) => String(c.id) === String(countryId))?.provinces || [];
    const pId = matchByName(provs, state);
    if (pId && pId !== provinceId) setProvinceId(pId);
  }, [countryId, state, tree]);

  useEffect(() => {
    if (!provinceId || !countryId) return;
    const provs = tree.find((c) => String(c.id) === String(countryId))?.provinces || [];
    const prov = provs.find((p) => String(p.id) === String(provinceId));
    const cId = matchByName(prov?.cities || [], city);
    if (cId && cId !== cityId) setCityId(cId);
  }, [provinceId, city, countryId, tree]);

  const emitChange = (nextCountryId, nextProvinceId, nextCityId) => {
    const countryRow = tree.find((c) => String(c.id) === String(nextCountryId));
    const provinceRow = countryRow?.provinces?.find((p) => String(p.id) === String(nextProvinceId));
    const cityRow = provinceRow?.cities?.find((c) => String(c.id) === String(nextCityId));
    onChange?.({
      country: countryRow?.name || "",
      state: provinceRow?.name || "",
      city: cityRow?.name || "",
      country_id: nextCountryId || null,
      province_id: nextProvinceId || null,
      city_id: nextCityId || null,
      leopards_city_id: cityRow?.leopards_city_id || null,
    });
  };

  const onCountryChange = (id) => {
    setCountryId(id);
    setProvinceId("");
    setCityId("");
    emitChange(id, "", "");
  };

  const onProvinceChange = (id) => {
    setProvinceId(id);
    setCityId("");
    emitChange(countryId, id, "");
  };

  const onCityChange = (id) => {
    setCityId(id);
    emitChange(countryId, provinceId, id);
  };

  if (loading) {
    return <p className={`text-sm text-gray-500 ${className}`}>Loading locations…</p>;
  }

  if (!tree.length) {
    return (
      <p className={`text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 ${className}`}>
        Location list is not configured yet. Ask admin to add countries and cities in Settings → Locations.
      </p>
    );
  }

  const selectClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={showZip ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lbl.country} {required ? "*" : ""}
          </label>
          {lockCountry ? (
            <div className={`${selectClass} bg-gray-50 text-gray-700`}>{defaultCountry || "Pakistan"}</div>
          ) : (
            <select
              value={countryId}
              onChange={(e) => onCountryChange(e.target.value)}
              className={selectClass}
              required={required}
            >
              <option value="">Select country</option>
              {tree.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {showZip && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{lbl.zip}</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => onZipChange?.(e.target.value)}
              className={selectClass}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lbl.province} {required ? "*" : ""}
          </label>
          <select
            value={provinceId}
            onChange={(e) => onProvinceChange(e.target.value)}
            className={selectClass}
            required={required}
            disabled={!countryId}
          >
            <option value="">Select province</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lbl.city} {required ? "*" : ""}
          </label>
          <select
            value={cityId}
            onChange={(e) => onCityChange(e.target.value)}
            className={selectClass}
            required={required}
            disabled={!provinceId}
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

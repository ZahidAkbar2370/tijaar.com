"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { locationApi } from "@/lib/api";

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  emptyMessage = "No results",
  displayValue,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 80);
    return options
      .filter((o) => o.label.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
      .slice(0, 80);
  }, [options, query]);

  const selected = useMemo(
    () => options.find((o) => o.name.trim().toLowerCase() === String(value || "").trim().toLowerCase()),
    [options, value]
  );

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const pick = (opt) => {
    onChange?.(opt.name);
    setOpen(false);
    setQuery("");
  };

  const clear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.("");
    setQuery("");
  };

  const shown = displayValue || selected?.label || value || "";

  return (
    <div className="relative" ref={rootRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      )}

      {!open ? (
        <button
          type="button"
          onClick={openDropdown}
          disabled={disabled}
          className={`w-full flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-left transition ${
            disabled
              ? "opacity-60 cursor-not-allowed bg-gray-50"
              : "hover:border-[#1790d7]/40 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
          }`}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={`flex-1 truncate text-sm ${shown ? "text-gray-900" : "text-gray-400"}`}>
            {shown || placeholder}
          </span>
          {value && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={clear}
              onKeyDown={(e) => e.key === "Enter" && clear(e)}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </span>
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          )}
        </button>
      ) : (
        <div className="rounded-xl border border-[#1790d7]/40 shadow-lg bg-white overflow-hidden ring-2 ring-[#1790d7]/15">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm outline-none bg-transparent py-1.5"
              autoComplete="off"
            />
            <button type="button" onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</li>
            ) : (
              filtered.map((o) => {
                const active = selected?.id === o.id || value === o.name;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(o)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        active ? "bg-[#1790d7]/10 text-[#1790d7] font-medium" : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {o.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {required && (
        <input type="text" value={value || ""} required readOnly tabIndex={-1} className="sr-only" aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * Province (required) + city filtered by selected province. Both searchable.
 * Values are names stored on the user profile.
 */
export default function SearchableProvinceCityFields({
  state = "",
  city = "",
  onChange,
  requiredProvince = true,
  requiredCity = false,
  className = "",
}) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const list = [];
    const pakistan = tree.find((c) => (c.name || "").trim().toLowerCase() === "pakistan");
    const countries = pakistan ? [pakistan] : tree;
    for (const country of countries) {
      for (const province of country.provinces || []) {
        list.push({
          id: `p-${province.id}`,
          name: province.name,
          label: province.name,
          cities: province.cities || [],
        });
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [tree]);

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name.trim().toLowerCase() === String(state || "").trim().toLowerCase()),
    [provinces, state]
  );

  const cities = useMemo(() => {
    if (!selectedProvince) return [];
    return (selectedProvince.cities || [])
      .map((c) => ({
        id: `c-${c.id}`,
        name: c.name,
        label: c.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedProvince]);

  if (loading) {
    return <p className={`text-sm text-gray-500 ${className}`}>Loading locations…</p>;
  }

  if (!provinces.length) {
    return (
      <p className={`text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 ${className}`}>
        No provinces configured yet. Ask admin to add locations.
      </p>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <SearchableSelect
        label="Province / State"
        value={state}
        required={requiredProvince}
        options={provinces}
        placeholder="Search province…"
        onChange={(nextState) => {
          onChange?.({ state: nextState, city: "" });
        }}
      />
      <SearchableSelect
        label="City"
        value={city}
        required={requiredCity}
        disabled={!state}
        options={cities}
        placeholder={state ? "Search city…" : "Select province first"}
        emptyMessage={state ? "No cities in this province" : "Select a province first"}
        onChange={(nextCity) => {
          onChange?.({ state, city: nextCity });
        }}
      />
    </div>
  );
}

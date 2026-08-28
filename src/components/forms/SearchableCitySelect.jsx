"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { locationApi } from "@/lib/api";

/**
 * Searchable city dropdown from admin locations tree.
 * value/onChange use city name (string) for profile storage.
 */
export default function SearchableCitySelect({
  value = "",
  onChange,
  placeholder = "Search city…",
  required = false,
  className = "",
  label = "City",
}) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const cities = useMemo(() => {
    const list = [];
    for (const country of tree) {
      for (const province of country.provinces || []) {
        for (const city of province.cities || []) {
          list.push({
            id: city.id,
            name: city.name,
            province: province.name,
            country: country.name,
            label: `${city.name}${province.name ? `, ${province.name}` : ""}`,
          });
        }
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [tree]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities.slice(0, 80);
    return cities
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.province?.toLowerCase().includes(q) ||
          c.label.toLowerCase().includes(q)
      )
      .slice(0, 80);
  }, [cities, query]);

  const selected = useMemo(
    () => cities.find((c) => c.name.trim().toLowerCase() === String(value || "").trim().toLowerCase()),
    [cities, value]
  );

  const openDropdown = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const pick = (city) => {
    onChange?.(city.name);
    setOpen(false);
    setQuery("");
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setQuery("");
  };

  if (loading) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
        <p className="text-sm text-gray-500 px-1 py-2">Loading cities…</p>
      </div>
    );
  }

  if (!cities.length) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          No cities configured yet. Ask admin to add locations.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      )}

      {!open ? (
        <button
          type="button"
          onClick={openDropdown}
          className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-left hover:border-[#1790d7]/40 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition"
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={`flex-1 truncate text-sm ${selected || value ? "text-gray-900" : "text-gray-400"}`}>
            {selected?.label || value || placeholder}
          </span>
          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={clear}
              onKeyDown={(e) => e.key === "Enter" && clear(e)}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700"
              aria-label="Clear city"
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
              <li className="px-4 py-3 text-sm text-gray-500">No cities match “{query}”</li>
            ) : (
              filtered.map((c) => {
                const active = selected?.id === c.id || value === c.name;
                return (
                  <li key={`${c.id}-${c.name}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(c)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        active ? "bg-[#1790d7]/10 text-[#1790d7] font-medium" : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <span className="block font-medium">{c.name}</span>
                      {c.province && (
                        <span className="block text-xs text-gray-500 mt-0.5">{c.province}{c.country ? ` · ${c.country}` : ""}</span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Hidden input for native form required if needed */}
      {required && (
        <input type="text" value={value || ""} required readOnly tabIndex={-1} className="sr-only" aria-hidden="true" />
      )}
    </div>
  );
}

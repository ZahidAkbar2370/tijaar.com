"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/**
 * Simple searchable single-select for category/brand lists.
 * options: [{ value: string|number, label: string, indent?: number }]
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Search…",
  emptyLabel = "No matches",
  hasError = false,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value ?? "")),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const inputClass = `w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border bg-white text-gray-900 text-sm sm:text-[15px] transition focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7] ${
    hasError ? "border-red-400" : "border-gray-200 hover:border-gray-300"
  } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-gray-900 truncate" : "text-gray-400 truncate"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="w-full text-sm outline-none bg-transparent py-1"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="p-0.5 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                }}
              >
                {placeholder}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-400">{emptyLabel}</li>
            ) : (
              filtered.map((o) => (
                <li key={String(o.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(o.value) === String(value ?? "")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#1790d7]/8 ${
                      String(o.value) === String(value ?? "") ? "bg-[#1790d7]/10 text-[#1790d7] font-medium" : "text-gray-800"
                    }`}
                    style={o.indent ? { paddingLeft: `${12 + o.indent * 12}px` } : undefined}
                    onClick={() => {
                      onChange?.(o.value);
                      setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

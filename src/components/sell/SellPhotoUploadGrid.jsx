"use client";

import { useState, useEffect } from "react";
import { Camera, Plus, X } from "lucide-react";

const SLOT_CLASS = "w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] shrink-0";

/** Blob preview URL — create/revoke in one effect so Strict Mode remounts stay valid. */
function useObjectUrl(file) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url;
}

function CoverSlot({ file, existingUrl, onAdd, onRemove, onClearExisting, disabled }) {
  const url = useObjectUrl(file);
  if (file) {
    return (
      <div className={`relative ${SLOT_CLASS} rounded-lg overflow-hidden border border-gray-200 bg-gray-50`}>
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 animate-pulse" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
          aria-label="Remove cover photo"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }
  if (existingUrl) {
    return (
      <div className={`relative ${SLOT_CLASS} rounded-lg overflow-hidden border border-gray-200 bg-gray-50`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={existingUrl} alt="Cover" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onClearExisting}
          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
          aria-label="Remove cover photo"
        >
          <X className="w-3 h-3" />
        </button>
        <label className="absolute inset-0 cursor-pointer" aria-label="Replace cover photo">
          <input type="file" accept="image/*" className="hidden" onChange={onAdd} disabled={disabled} />
        </label>
      </div>
    );
  }
  return (
    <label
      className={`${SLOT_CLASS} rounded-lg border border-gray-200 bg-[#1790d7]/10 flex items-center justify-center cursor-pointer transition hover:bg-[#1790d7]/15 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Plus className="w-6 h-6 text-[#1790d7]" strokeWidth={2.5} />
      <input type="file" accept="image/*" className="hidden" onChange={onAdd} disabled={disabled} />
    </label>
  );
}

function GallerySlot({ file, index, onAdd, onRemove }) {
  const url = useObjectUrl(file);
  if (file) {
    return (
      <div className={`relative ${SLOT_CLASS} rounded-lg overflow-hidden border border-gray-200 bg-gray-50`}>
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 animate-pulse" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
          aria-label="Remove photo"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }
  return (
    <label
      className={`${SLOT_CLASS} rounded-lg border border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:border-[#1790d7]/30 hover:bg-gray-50 transition`}
    >
      <span className="relative inline-flex">
        <Camera className="w-5 h-5 text-gray-700" strokeWidth={1.75} />
        <Plus className="w-2.5 h-2.5 text-gray-700 absolute -bottom-0.5 -right-1.5 bg-white rounded-full" strokeWidth={3} />
      </span>
      <input type="file" accept="image/*" multiple className="hidden" onChange={onAdd} />
    </label>
  );
}

function ExistingGallerySlot({ url, onRemove }) {
  return (
    <div className={`relative ${SLOT_CLASS} rounded-lg overflow-hidden border border-gray-200 bg-gray-50`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
        aria-label="Remove photo"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function SellPhotoUploadGrid({
  maxImages,
  thumbnail,
  images,
  existingCoverUrl = null,
  existingGalleryUrls = [],
  onThumbnailAdd,
  onImageAdd,
  onRemoveThumbnail,
  onRemoveImage,
  onClearExistingCover,
  onRemoveExistingGallery,
  error,
}) {
  const photoCount =
    (thumbnail ? 1 : 0) +
    images.length +
    (!thumbnail && existingCoverUrl ? 1 : 0) +
    (images.length === 0 ? existingGalleryUrls.length : 0);
  const gallerySlots = Math.max(0, maxImages - 1);
  const visibleExistingGallery = images.length === 0 ? existingGalleryUrls : [];
  const usedGallerySlots = images.length + visibleExistingGallery.length;
  const extraSlots = Math.max(0, gallerySlots - usedGallerySlots);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <CoverSlot
          file={thumbnail}
          existingUrl={!thumbnail ? existingCoverUrl : null}
          onAdd={onThumbnailAdd}
          onRemove={onRemoveThumbnail}
          onClearExisting={onClearExistingCover}
          disabled={photoCount >= maxImages && !thumbnail && !existingCoverUrl}
        />
        {visibleExistingGallery.map((url, i) => (
          <ExistingGallerySlot
            key={`existing-${url}-${i}`}
            url={url}
            onRemove={() => onRemoveExistingGallery?.(i)}
          />
        ))}
        {images.map((file, i) => (
          <GallerySlot
            key={`${file.name}-${file.lastModified}-${file.size}-${i}`}
            file={file}
            index={i}
            onAdd={onImageAdd}
            onRemove={onRemoveImage}
          />
        ))}
        {Array.from({ length: extraSlots }).map((_, i) => (
          <GallerySlot key={`empty-${i}`} file={null} index={-1} onAdd={onImageAdd} onRemove={() => {}} />
        ))}
      </div>
      <p className="text-xs text-[#1e3a5f] mt-2.5">
        For the cover picture we recommend using the landscape mode.
        <span className="text-gray-400 ml-1">
          ({photoCount}/{maxImages})
        </span>
      </p>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

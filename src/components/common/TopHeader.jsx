"use client";

import {
  BadgeCheck,
  ShieldCheck,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Music2,
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const defaultStats = ["Cash on Delivery Available", "Trusted Sellers"];
const defaultSocial = { facebook: "#", twitter: "#", instagram: "#", music: "#" };

const socialPlatforms = [
  { key: "facebook", icon: Facebook, label: "Tijaar on Facebook" },
  { key: "twitter", icon: Twitter, label: "Tijaar on X (Twitter)" },
  { key: "instagram", icon: Instagram, label: "Tijaar on Instagram" },
  { key: "music", icon: Music2, label: "Tijaar on TikTok" },
];

export default function TopHeader() {
  const settings = useSiteSettings();
  const stats = Array.isArray(settings.topbar_stats) && settings.topbar_stats.length > 0
    ? settings.topbar_stats
    : defaultStats;
  const contactPhone = settings.topbar_phone ?? "";
  const socialLinks = settings.topbar_social_links && typeof settings.topbar_social_links === "object"
    ? { ...defaultSocial, ...settings.topbar_social_links }
    : defaultSocial;

  return (
    <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] w-full text-sm relative z-[60]">
      <div className="flex flex-col sm:flex-row justify-between items-center py-2.5 px-4 lg:px-8 gap-3 md:gap-0 relative z-10 w-full min-h-[44px]">
        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 min-h-[28px]">
          <span className="flex items-center gap-2 text-white min-w-[10rem] sm:min-w-[12rem]">
            <div className="p-1 bg-green-500/20 rounded-md shrink-0">
              <BadgeCheck size={14} strokeWidth={1.5} className="text-white" />
            </div>
            <span className="font-medium text-white truncate">{stats[0]}</span>
          </span>
          {stats[1] ? (
            <>
              <span className="hidden md:block w-px h-4 bg-white/30 shrink-0" />
              <span className="flex items-center gap-2 text-white min-w-[8rem] sm:min-w-[10rem]">
                <div className="p-1 bg-blue-500/20 rounded-md shrink-0">
                  <ShieldCheck size={14} strokeWidth={1.5} className="text-white" />
                </div>
                <span className="font-medium text-white truncate">{stats[1]}</span>
              </span>
            </>
          ) : (
            <span className="hidden md:flex items-center gap-2 min-w-[10rem] opacity-0 pointer-events-none" aria-hidden>
              <span className="font-medium">placeholder</span>
            </span>
          )}
        </div>

        {/* Social links */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <span className="w-px h-4 bg-white/30" />
            <div className="flex gap-2">
              {socialPlatforms.map(({ key, icon: Icon, label }) => (
                <a
                  key={key}
                  href={socialLinks[key]}
                  aria-label={label}
                  className="text-white hover:opacity-90 transition-all duration-300 hover:scale-110 p-1.5 rounded-md bg-white/10 hover:bg-white/20"
                >
                  <Icon size={14} strokeWidth={1.5} className="text-white" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — reserve height so social row does not shift layout */}
      <div className="sm:hidden border-t border-white/10 py-2 min-h-[44px]">
        <div className="flex justify-center items-center gap-4">
          {contactPhone && (
            <>
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-1.5 text-white text-xs"
              >
                <Phone size={12} />
                <span>{contactPhone}</span>
              </a>
              <span className="w-px h-3 bg-white/30" />
            </>
          )}
          <div className="flex gap-2">
            {socialPlatforms.map(({ key, icon: Icon, label }) => (
              <a
                key={key}
                href={socialLinks[key]}
                aria-label={label}
                className="text-white hover:opacity-90 transition-colors p-1"
              >
                <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

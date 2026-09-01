"use client";

import Link from "next/link";

const GUIDE_LINKS = [
  {
    href: "/shop",
    label: "Tips for improving your ads and your chances of selling",
  },
  {
    href: "/customer/listings",
    label: "All you need to know about posting ads on Tijaar",
  },
];

const GUIDE_POINTS = [
  "Use a clear cover photo and add more angles of your item.",
  "Write an honest title and description — mention condition and flaws.",
  "Set a fair price and shipping fee so buyers trust your listing.",
];

export default function SellFormHelpSidebar() {
  return (
    <aside className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 h-fit xl:sticky xl:top-24 text-[#1e3a5f]">
      <h2 className="text-base sm:text-lg font-bold mb-3">Need help getting started?</h2>
      <p className="text-sm leading-relaxed mb-4">
        Review these resources to learn how to create a great ad and increase your selling chances.
      </p>
      <ul className="list-disc pl-5 space-y-3 text-sm mb-4">
        {GUIDE_LINKS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="font-bold underline underline-offset-2 hover:text-[#1790d7]">
              {item.label}
            </Link>
          </li>
        ))}
        {GUIDE_POINTS.map((point) => (
          <li key={point} className="leading-relaxed marker:text-[#1e3a5f]">
            {point}
          </li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed">
        You can always come back to change your ad from{" "}
        <Link href="/customer/listings" className="font-semibold underline underline-offset-2 hover:text-[#1790d7]">
          My Listings
        </Link>
        .
      </p>
    </aside>
  );
}

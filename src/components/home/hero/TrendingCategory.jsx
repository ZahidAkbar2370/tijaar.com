import { Car, BriefcaseBusiness, Atom, Bus, List } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { name: "Used Cars", icon: Car },
  { name: "Caravans", icon: Bus },
  { name: "Job Openings", icon: BriefcaseBusiness },
  { name: "All Science", icon: Atom },
  { name: "All Categories", icon: List, link: "/all-categories" },
];

const TrendingCategory = () => {
  return (
    <div className="w-full py-10 px-4 lg:px-16">
      <h2 className="text-2xl font-bold mb-6 text-white">Trending Category</h2>

      <div className="flex flex-wrap gap-6">

        {/* FIRST 4 ITEMS */}
        {items.slice(0, 4).map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="border border-gray-200 rounded-3xl px-6 py-3 flex items-center gap-2 bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <Icon className="w-6 h-6 text-[#1790d7]" />
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
            </div>
          );
        })}

        {/* MOVE ALL CATEGORIES TO NEXT LINE */}
        <div className="w-full"></div>

        {/* LAST ITEM — CLICKABLE */}
        {(() => {
          const item = items[4];
          const Icon = item.icon;
          return (
            <Link to={item.link}>
              <div
                className="border border-gray-200 rounded-3xl px-6 py-3 flex items-center gap-2 bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <Icon className="w-6 h-6 text-[#1790d7]" />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })()}

      </div>
    </div>
  );
};

export default TrendingCategory;

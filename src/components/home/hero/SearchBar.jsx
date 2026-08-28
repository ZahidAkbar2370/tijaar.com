import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown, Search } from "lucide-react";

const subCategories = {
  Automotive: ["New Cars", "Used Cars", "Classic Cars", "Junk Cars", "Wanted Cars", "Bikes"],
  Property: [
    "Property for Sale",
    "Property for Rent",
    "Property Exchange",
    "International Property",
    "Property Offices",
    "Property Services",
  ],
  Electronics: [
    "Mobile Phones",
    "Tablets",
    "Cameras",
    "Home/Office Appliances",
    "Video Games",
    "Smart TVs",
    "Other Electronics",
  ],
  Contracting: [
    "Bugs Exterminator",
    "Plumber",
    "Locksmith",
    "Duct Cleaning",
    "AC Services",
    "Painter",
    "Carpenter",
  ],
  Services: ["Satellite", "Parties", "Tailor", "Other Services"],
  Camping: ["Tents", "Picnics", "Caravans", "Barbecue"],
  Sports: ["Cycling", "Fishing", "Gym & Spa", "Football", "Padel"],
  Animals: ["Dogs", "Cats", "Birds", "Sheep", "Camels", "Horses"],
  Family: [
    "Men Clothes",
    "Men Shoes",
    "Ladies Clothes",
    "Family Supplies",
    "Baby Clothes",
    "Baby Accessories",
    "Baby Toys",
  ],
  Gifts: ["Messbah", "Watches", "Pens", "Perfumes", "Gemstones"],
  Furniture: ["Bedrooms", "Tables", "Kitchens", "Textiles", "Living Room"],
  Jobs: ["Job Openings", "Job Seeker"],
  Education: [
    "School Supplies",
    "Languages",
    "All Science",
    "Math Teaching",
    "Other Subjects",
    "University Services",
  ],
  Other: ["Currencies & Stamps", "Antiques", "Books", "Wholesale", "Stickers", "Lost & Found"],
};

const countries = ["Pakistan", "USA", "UK", "Canada", "Australia"];

const SearchBar = () => {
  const [active, setActive] = useState("");

  return (
    <div className="  px-16 relative ">
<div className="flex items-center gap-6 bg-white h-24 px-23 rounded-4xl">
      {/* CATEGORY DROPDOWN */}
      <div className="relative group">

        {/* BUTTON */}
        <button className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white flex items-center justify-between px-5 py-1 h-[46px] w-[280px] font-semibold rounded-4xl hover:shadow-lg transition-all duration-300 text-md">
          <div className="flex items-center space-x-3">
            <Menu className="w-5 h-5" />
            <span>All Categories</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* DROPDOWN WRAPPER */}
        <div className="absolute left-0 mt-2 w-[620px] bg-white shadow-2xl border border-gray-200 rounded-xl hidden group-hover:flex z-50">

          {/* LEFT SIDE — CATEGORIES */}
          <ul className="w-1/2 border-r border-gray-200 p-3">
            {Object.keys(subCategories).map((category) => (
              <li
                key={category}
                className="px-3 py-2 rounded-lg text-gray-700 text-sm hover:bg-gray-100 cursor-pointer"
                onMouseEnter={() => setActive(category)}
              >
                {category}
              </li>
            ))}
          </ul>

          {/* RIGHT SIDE — SUBCATEGORIES (ONLY SHOW IF CATEGORY IS ACTIVE) */}
          <ul className="w-1/2 p-3">
            {active &&
              subCategories[active].map((sub, i) => (
                <li key={i} className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm">
                  {sub}
                </li>
              ))}
          </ul>

        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-grow max-w-5xl h-[46px] gap-4">
        <input
          type="text"
          placeholder="What are you looking for?"
          className="flex-1 px-6 py-1 outline-none text-gray-700 placeholder-gray-400 bg-white text-md border-2 border-gray-200 rounded-4xl focus:border-[#1790d7] focus:ring-1 focus:ring-[#1790d7] transition-all duration-300"
        />

        <div className="relative flex-1 border-2 border-gray-200 rounded-4xl overflow-hidden focus-within:border-[#1790d7] focus-within:ring-1 focus-within:ring-[#1790d7] transition-all duration-300">
          <select className="appearance-none w-full h-full px-4 py-1 bg-white text-gray-700 text-md pr-8 cursor-pointer focus:outline-none">
            {countries.map((country, idx) => (
              <option key={idx} value={country}>
                {country}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
        </div>

        <button className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] px-6 flex items-center justify-center rounded-3xl hover:shadow-lg transition-all duration-300">
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
      </div>
    </div>
  );
};

export default SearchBar;

// Static data - all API integration removed. Will connect to Laravel later.

const sampleImg = "/assets/sample-image.webp";

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

// Categories with slugs
export const categories = [
  { id: 1, name: "Automotive", slug: "automotive", subcategories_count: 6, products_count: 50, icon: "car" },
  { id: 2, name: "Property", slug: "property", subcategories_count: 6, products_count: 45, icon: "building" },
  { id: 3, name: "Electronics", slug: "electronics", subcategories_count: 7, products_count: 120, icon: "smartphone" },
  { id: 4, name: "Contracting", slug: "contracting", subcategories_count: 7, products_count: 35, icon: "wrench" },
  { id: 5, name: "Services", slug: "services", subcategories_count: 4, products_count: 28, icon: "hand" },
  { id: 6, name: "Camping", slug: "camping", subcategories_count: 4, products_count: 32, icon: "tent" },
  { id: 7, name: "Sports", slug: "sports", subcategories_count: 5, products_count: 58, icon: "dumbbell" },
  { id: 8, name: "Animals", slug: "animals", subcategories_count: 6, products_count: 42, icon: "paw" },
  { id: 9, name: "Family", slug: "family", subcategories_count: 7, products_count: 95, icon: "users" },
  { id: 10, name: "Gifts", slug: "gifts", subcategories_count: 5, products_count: 38, icon: "gift" },
  { id: 11, name: "Furniture", slug: "furniture", subcategories_count: 5, products_count: 72, icon: "sofa" },
  { id: 12, name: "Jobs", slug: "jobs", subcategories_count: 2, products_count: 15, icon: "briefcase" },
  { id: 13, name: "Education", slug: "education", subcategories_count: 6, products_count: 48, icon: "graduation" },
  { id: 14, name: "Other", slug: "other", subcategories_count: 6, products_count: 55, icon: "more" },
];

// Subcategories per category
export const subcategoriesMap = {
  automotive: [
    "New Cars", "Used Cars", "Classic Cars", "Junk Cars", "Wanted Cars", "Bikes",
  ].map((name) => ({ name, slug: slugify(name) })),
  property: [
    "Property for Sale", "Property for Rent", "Property Exchange", "International Property", "Property Offices", "Property Services",
  ].map((name) => ({ name, slug: slugify(name) })),
  electronics: [
    "Mobile Phones", "Tablets", "Cameras", "Home/Office Appliances", "Video Games", "Smart TVs", "Other Electronics",
  ].map((name) => ({ name, slug: slugify(name) })),
  contracting: [
    "Bugs Exterminator", "Plumber", "Locksmith", "Duct Cleaning", "AC Services", "Painter", "Carpenter",
  ].map((name) => ({ name, slug: slugify(name) })),
  services: ["Satellite", "Parties", "Tailor", "Other Services"].map((name) => ({ name, slug: slugify(name) })),
  camping: ["Tents", "Picnics", "Caravans", "Barbecue"].map((name) => ({ name, slug: slugify(name) })),
  sports: ["Cycling", "Fishing", "Gym & Spa", "Football", "Padel"].map((name) => ({ name, slug: slugify(name) })),
  animals: ["Dogs", "Cats", "Birds", "Sheep", "Camels", "Horses"].map((name) => ({ name, slug: slugify(name) })),
  family: [
    "Men Clothes", "Men Shoes", "Ladies Clothes", "Family Supplies", "Baby Clothes", "Baby Accessories", "Baby Toys",
  ].map((name) => ({ name, slug: slugify(name) })),
  gifts: ["Messbah", "Watches", "Pens", "Perfumes", "Gemstones"].map((name) => ({ name, slug: slugify(name) })),
  furniture: ["Bedrooms", "Tables", "Kitchens", "Textiles", "Living Room"].map((name) => ({ name, slug: slugify(name) })),
  jobs: ["Job Openings", "Job Seeker"].map((name) => ({ name, slug: slugify(name) })),
  education: [
    "School Supplies", "Languages", "All Science", "Math Teaching", "Other Subjects", "University Services",
  ].map((name) => ({ name, slug: slugify(name) })),
  other: ["Currencies & Stamps", "Antiques", "Books", "Wholesale", "Stickers", "Lost & Found"].map((name) => ({ name, slug: slugify(name) })),
};

// Build flat products list from all categories
const categoryProducts = {
  Automotive: [
    { title: "Automotive Product 1", price: 69.99, tags: ["New", "Popular"] },
    { title: "Automotive Product 2", price: 79.99, tags: ["Sale", "Limited"] },
    { title: "Automotive Product 3", price: 59.99, tags: ["Eco-Friendly"] },
  ],
  Property: [
    { title: "Property Product 1", price: 120000, tags: ["Sale"] },
    { title: "Property Product 2", price: 85000, tags: ["Rent"] },
  ],
  Electronics: [
    { title: "Electronics Product 1", price: 699, tags: ["New"] },
    { title: "Electronics Product 2", price: 499, tags: ["Sale"] },
    { title: "Electronics Product 3", price: 399, tags: ["Popular"] },
    { title: "Electronics Product 4", price: 299, tags: ["Home"] },
    { title: "Electronics Product 5", price: 899, tags: ["Tech"] },
    { title: "Wireless Bluetooth Earbuds Pro", price: 129.99, tags: ["Best Seller"] },
    { title: "Smart Watch Series 8", price: 299.99, tags: ["New"] },
    { title: "USB-C Fast Charger", price: 19.99, tags: ["Sale"] },
  ],
  Contracting: [
    { title: "Contracting Product 1", price: 69.99, tags: ["Service"] },
    { title: "Contracting Product 2", price: 49.99, tags: ["Repair"] },
  ],
  Services: [
    { title: "Services Product 1", price: 49.99, tags: ["Tech"] },
    { title: "Services Product 2", price: 99.99, tags: ["Event"] },
  ],
  Camping: [
    { title: "Camping Product 1", price: 79.99, tags: ["Outdoor"] },
    { title: "Camping Product 2", price: 39.99, tags: ["Fun"] },
  ],
  Sports: [
    { title: "Sports Product 1", price: 59.99, tags: ["Outdoor"] },
    { title: "Sports Product 2", price: 39.99, tags: ["Fishing"] },
  ],
  Animals: [
    { title: "Animals Product 1", price: 29.99, tags: ["Dog"] },
    { title: "Animals Product 2", price: 19.99, tags: ["Cat"] },
  ],
  Family: [
    { title: "Family Product 1", price: 29.99, tags: ["Men"] },
    { title: "Family Product 2", price: 49.99, tags: ["Shoes"] },
    { title: "Nike Running Shoe", price: 69.99, tags: ["Best Seller"] },
  ],
  Gifts: [
    { title: "Gifts Product 1", price: 9.99, tags: ["Religious"] },
    { title: "Gifts Product 2", price: 199.99, tags: ["Luxury"] },
  ],
  Furniture: [
    { title: "Furniture Product 1", price: 199.99, tags: ["Bedroom"] },
    { title: "Furniture Product 2", price: 149.99, tags: ["Tables"] },
  ],
  Jobs: [
    { title: "Jobs Product 1", price: 0, tags: ["Hiring"] },
    { title: "Jobs Product 2", price: 0, tags: ["Career"] },
  ],
  Education: [
    { title: "Education Product 1", price: 19.99, tags: ["School"] },
    { title: "Education Product 2", price: 29.99, tags: ["Languages"] },
  ],
  Other: [
    { title: "Other Product 1", price: 9.99, tags: ["Collectibles"] },
    { title: "Other Product 2", price: 29.99, tags: ["Antique"] },
  ],
};

let productId = 1;
export const products = [];
for (const [catName, items] of Object.entries(categoryProducts)) {
  const cat = categories.find((c) => c.name === catName);
  const catSlug = cat?.slug || slugify(catName);
  items.forEach((p, idx) => {
    const slug = slugify(p.title) || `product-${productId}`;
    products.push({
      id: productId++,
      slug,
      title: p.title,
      name: p.title,
      price: p.price,
      originalPrice: p.price * 1.2,
      description: `High-quality ${p.title.toLowerCase()} with modern design and reliable performance.`,
      image: sampleImg,
      thumbnail: sampleImg,
      category: catName,
      categorySlug: catSlug,
      tags: p.tags || [],
      rating: 4.8,
      rating_avg: 4.8,
      reviews: 120 + idx * 15,
      vendor: "TechStore Pro",
      vendor_name: "TechStore Pro",
      shipping: "Free Shipping",
      stock: 50,
      stock_status: "in_stock",
      inStock: true,
      created_at: new Date().toISOString(),
    });
  });
}

// Vendors with slugs
export const vendors = [
  {
    id: 1,
    slug: "techstore-pro",
    name: "TechStore Pro",
    storeName: "TechStore Pro Official",
    logo: sampleImg,
    rating: 4.9,
    reviews: 1247,
    products: 1250,
    totalSales: 15000,
    memberSince: "Jan 2020",
    verified: true,
    onTimeDelivery: "98%",
    responseRate: "98%",
    returnRate: "2.5%",
    description:
      "Your trusted source for premium electronics and tech accessories. We've been serving customers since 2020 with fast shipping and excellent customer service.",
    about:
      "TechStore Pro was founded with a mission to provide high-quality electronics at competitive prices. We source products directly from manufacturers and ensure every item meets our strict quality standards.",
    location: "Dubai, United Arab Emirates",
    email: "support@techstorepro.ae",
    phone: "+971 50 123 4567",
    categories: ["Electronics", "Gadgets", "Accessories", "Smartphones", "Laptops"],
    badges: ["Top Seller", "Verified", "Fast Shipping", "Quality Assured"],
    policies: {
      shipping: "Free shipping on orders over $50. Standard delivery: 2-4 business days.",
      returns: "30-day return policy. Full refund if not satisfied.",
      warranty: "1-year manufacturer warranty on all products.",
    },
  },
  {
    id: 2,
    slug: "fashion-hub",
    name: "Fashion Hub",
    storeName: "Fashion Hub Boutique",
    logo: sampleImg,
    rating: 4.8,
    reviews: 892,
    products: 850,
    totalSales: 12000,
    memberSince: "Mar 2019",
    verified: true,
    onTimeDelivery: "97%",
    responseRate: "95%",
    description: "Trendy fashion items for men and women. Latest styles and premium quality clothing.",
    categories: ["Fashion", "Clothing", "Accessories"],
    badges: ["Trending", "Verified", "New Arrivals"],
  },
  {
    id: 3,
    slug: "home-essentials",
    name: "Home Essentials",
    storeName: "Home Essentials Store",
    logo: sampleImg,
    rating: 4.7,
    reviews: 634,
    products: 720,
    totalSales: 9800,
    memberSince: "Jun 2021",
    verified: true,
    onTimeDelivery: "96%",
    responseRate: "94%",
    description: "Everything you need for your home. Quality furniture, decor, and household items.",
    categories: ["Furniture", "Home Decor", "Kitchen"],
    badges: ["Verified", "Quality Assured"],
  },
];

// Brands with slugs
export const brands = [
  { id: 1, slug: "apple", name: "Apple", logo: sampleImg },
  { id: 2, slug: "samsung", name: "Samsung", logo: sampleImg },
  { id: 3, slug: "sony", name: "Sony", logo: sampleImg },
  { id: 4, slug: "nike", name: "Nike", logo: sampleImg },
  { id: 5, slug: "adidas", name: "Adidas", logo: sampleImg },
];

// Hero
export const heroData = {
  title1: "Buy & Sell",
  title2: "Anything, Anywhere",
  description: "The #1 multi-vendor marketplace. Find great deals from verified sellers. Fast shipping, secure payments.",
  background_image: "/assets/herobg.jpg",
  categories: categories.slice(0, 4),
  featured_products: products.slice(0, 4),
};

// Top header
export const topHeaderData = {
  stats: ["Verified Sellers", "Secure Payments", "24/7 Support"],
  contactPhone: "+971 50 123 4567",
  location: "Pakistan",
  language: "English",
  socialLinks: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    music: "#",
  },
};

// Footer
export const footerData = {
  logo: sampleImg,
  about: "Tijaar is the #1 multi-vendor marketplace connecting buyers and sellers. Shop with confidence from verified vendors. Pakistan & Pakistan.",
  contact: {
    address: "Dubai, United Arab Emirates",
    phone: "+971 50 123 4567",
    email: "support@tijaar.com",
    support_hours: "24/7",
  },
  socialLinks: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    youtube: "#",
  },
};

// Deals (for Flash Deals section)
export const deals = products.slice(0, 6).map((p, i) => ({
  id: i + 1,
  product: { ...p },
  discount_percent: 15 + i * 5,
  discounted_price: p.price * (1 - (15 + i * 5) / 100),
  ends_at: new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
}));

// Blogs
export const blogs = [
  {
    id: 1,
    slug: "dummy-blog-1",
    blog_name: "Dummy Blog 1",
    title: "Dummy Blog 1",
    thumbnail: sampleImg,
    author: "Author 1",
    author_name: "Author 1",
    author_image: sampleImg,
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur dignissimos aspernatur exercitationem fuga ullam a, asperiores placeat nisi delectus fugiat quia.",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    slug: "dummy-blog-2",
    blog_name: "Dummy Blog 2",
    title: "Dummy Blog 2",
    thumbnail: sampleImg,
    author: "Author 2",
    author_name: "Author 2",
    author_image: sampleImg,
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora quos fugiat non autem repellat minus blanditiis.",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    slug: "dummy-blog-3",
    blog_name: "Dummy Blog 3",
    title: "Dummy Blog 3",
    thumbnail: sampleImg,
    author: "Author 3",
    author_name: "Author 3",
    author_image: sampleImg,
    description: "Lorem ipsum dolor sit amet. Omnis aliquid, quia nam voluptatibus quis tempore.",
    created_at: new Date().toISOString(),
  },
];

// About Us
export const aboutUsData = {
  mission_description: "We're building the future of e-commerce by connecting customers with trusted vendors worldwide.\n\nOur mission is to make buying and selling simple, secure, and enjoyable for everyone.",
  values: [
    { id: 1, title: "Trust", paragraph: "We verify every vendor to ensure a safe marketplace." },
    { id: 2, title: "Quality", paragraph: "We uphold high standards for products and service." },
  ],
  journeys: [
    { id: 1, year: "2020", title: "Founded", paragraph: "Started with a vision to connect buyers and sellers." },
    { id: 2, year: "2023", title: "Growth", paragraph: "Reached 50,000+ users and 2,500+ vendors." },
  ],
  team_members: [
    { id: 1, name: "John Doe", designation: "CEO" },
    { id: 2, name: "Jane Smith", designation: "CTO" },
  ],
};

// Helper to get product by slug
export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}

// Helper to get category by slug
export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}

// Helper to get vendor by slug
export function getVendorBySlug(slug) {
  return vendors.find((v) => v.slug === slug);
}

// Helper to get brand by slug
export function getBrandBySlug(slug) {
  return brands.find((b) => b.slug === slug);
}

// Helper to get blog by slug
export function getBlogBySlug(slug) {
  return blogs.find((b) => b.slug === slug);
}

// Helper to get products by category
export function getProductsByCategory(categorySlug, subcategorySlug = null) {
  let filtered = products.filter((p) => p.categorySlug === categorySlug);
  if (subcategorySlug && filtered.length) {
    const sub = subcategoriesMap[categorySlug]?.find((s) => s.slug === subcategorySlug);
    if (sub) {
      const word = sub.name.toLowerCase().split(" ")[0];
      const subFiltered = filtered.filter((p) => p.title.toLowerCase().includes(word));
      return subFiltered.length ? subFiltered : filtered;
    }
  }
  return filtered;
}

// Helper to get products by brand
export function getProductsByBrand(brandSlug) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];
  const matched = products.filter((p) => p.tags?.some((t) => t.toLowerCase().includes(brand.name.toLowerCase())) || p.category?.toLowerCase().includes(brand.name.toLowerCase()));
  return matched.length ? matched : products.slice(0, 12);
}

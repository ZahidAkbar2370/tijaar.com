import sampleImg from "/assets/sample-image.webp";

export const subCategories = {
  Automotive: {
    items: ["New Cars", "Used Cars", "Classic Cars", "Junk Cars", "Wanted Cars", "Bikes"],
    products: [
      { title: "Automotive Product 1", price: 69.99, image: sampleImg, description: "High-quality automotive product with modern design and reliable performance.", tags: ["New", "Popular"] },
      { title: "Automotive Product 2", price: 79.99, image: sampleImg, description: "Durable and efficient product suitable for all automotive needs.", tags: ["Sale", "Limited"] },
      { title: "Automotive Product 3", price: 59.99, image: sampleImg, description: "Compact and stylish, perfect for daily automotive use.", tags: ["Eco-Friendly"] },
      { title: "Automotive Product 4", price: 89.99, image: sampleImg, description: "Premium automotive product offering superior performance.", tags: ["Premium"] },
      { title: "Automotive Product 5", price: 99.99, image: sampleImg, description: "Reliable and affordable automotive solution for everyone.", tags: ["Best Seller"] },
    ],
  },

  Property: {
    items: ["Property for Sale","Property for Rent","Property Exchange","International Property","Property Offices","Property Services"],
    products: [
      { title: "Property Product 1", price: 120000, image: sampleImg, description: "Beautiful property located in prime area with modern facilities.", tags: ["Sale"] },
      { title: "Property Product 2", price: 85000, image: sampleImg, description: "Affordable property for rent in a secure neighborhood.", tags: ["Rent"] },
      { title: "Property Product 3", price: 95000, image: sampleImg, description: "Spacious property perfect for families and small businesses.", tags: ["Exchange"] },
      { title: "Property Product 4", price: 150000, image: sampleImg, description: "Luxury property with premium interiors and amenities.", tags: ["Luxury"] },
      { title: "Property Product 5", price: 110000, image: sampleImg, description: "Well-maintained property in a convenient location.", tags: ["Popular"] },
    ],
  },

  Electronics: {
    items: ["Mobile Phones","Tablets","Cameras","Home/Office Appliances","Video Games","Smart TVs","Other Electronics"],
    products: [
      { title: "Electronics Product 1", price: 699, image: sampleImg, description: "Latest smartphone with high-end features and sleek design.", tags: ["New"] },
      { title: "Electronics Product 2", price: 499, image: sampleImg, description: "Powerful tablet suitable for work and entertainment.", tags: ["Sale"] },
      { title: "Electronics Product 3", price: 399, image: sampleImg, description: "High-resolution camera perfect for photography enthusiasts.", tags: ["Popular"] },
      { title: "Electronics Product 4", price: 299, image: sampleImg, description: "Essential home appliance for daily use.", tags: ["Home"] },
      { title: "Electronics Product 5", price: 899, image: sampleImg, description: "Smart TV with 4K display and modern connectivity features.", tags: ["Tech"] },
    ],
  },

  Contracting: {
    items: ["Bugs Exterminator","Plumber","Locksmith","Duct Cleaning","AC Services","Painter","Carpenter"],
    products: [
      { title: "Contracting Product 1", price: 69.99, image: sampleImg, description: "Reliable pest control services to keep your home safe.", tags: ["Service"] },
      { title: "Contracting Product 2", price: 49.99, image: sampleImg, description: "Professional plumbing services for all types of repairs.", tags: ["Repair"] },
      { title: "Contracting Product 3", price: 59.99, image: sampleImg, description: "Certified locksmith services for home and office security.", tags: ["Security"] },
      { title: "Contracting Product 4", price: 79.99, image: sampleImg, description: "Duct cleaning services to maintain clean and fresh air.", tags: ["Cleaning"] },
      { title: "Contracting Product 5", price: 89.99, image: sampleImg, description: "AC servicing to ensure optimal cooling performance.", tags: ["AC"] },
    ],
  },

  Services: {
    items: ["Satellite","Parties","Tailor","Other Services"],
    products: [
      { title: "Services Product 1", price: 49.99, image: sampleImg, description: "Professional satellite installation and support services.", tags: ["Tech"] },
      { title: "Services Product 2", price: 99.99, image: sampleImg, description: "Event planning services for parties and celebrations.", tags: ["Event"] },
      { title: "Services Product 3", price: 29.99, image: sampleImg, description: "Tailoring services for custom clothing and alterations.", tags: ["Fashion"] },
      { title: "Services Product 4", price: 39.99, image: sampleImg, description: "Various home and personal services for convenience.", tags: ["Home"] },
      { title: "Services Product 5", price: 59.99, image: sampleImg, description: "Specialized services for unique requirements.", tags: ["Special"] },
    ],
  },

  Camping: {
    items: ["Tents","Picnics","Caravans","Barbecue"],
    products: [
      { title: "Camping Product 1", price: 79.99, image: sampleImg, description: "Durable tent for outdoor adventures and camping trips.", tags: ["Outdoor"] },
      { title: "Camping Product 2", price: 39.99, image: sampleImg, description: "Picnic essentials for a perfect outdoor experience.", tags: ["Fun"] },
      { title: "Camping Product 3", price: 129.99, image: sampleImg, description: "Comfortable caravan for family camping trips.", tags: ["Travel"] },
      { title: "Camping Product 4", price: 49.99, image: sampleImg, description: "Barbecue set for outdoor cooking and gatherings.", tags: ["BBQ"] },
      { title: "Camping Product 5", price: 99.99, image: sampleImg, description: "All-in-one camping kit with essential tools.", tags: ["Adventure"] },
    ],
  },

  Sports: {
    items: ["Cycling","Fishing","Gym & Spa","Football","Padel"],
    products: [
      { title: "Sports Product 1", price: 59.99, image: sampleImg, description: "High-quality cycling gear for all skill levels.", tags: ["Outdoor"] },
      { title: "Sports Product 2", price: 39.99, image: sampleImg, description: "Fishing equipment for both beginners and pros.", tags: ["Fishing"] },
      { title: "Sports Product 3", price: 69.99, image: sampleImg, description: "Gym & Spa products for fitness and relaxation.", tags: ["Fitness"] },
      { title: "Sports Product 4", price: 49.99, image: sampleImg, description: "Official footballs and accessories.", tags: ["Football"] },
      { title: "Sports Product 5", price: 79.99, image: sampleImg, description: "Padel rackets and sports gear.", tags: ["Padel"] },
    ],
  },

  Animals: {
    items: ["Dogs","Cats","Birds","Sheep","Camels","Horses"],
    products: [
      { title: "Animals Product 1", price: 29.99, image: sampleImg, description: "High-quality dog food and accessories.", tags: ["Dog"] },
      { title: "Animals Product 2", price: 19.99, image: sampleImg, description: "Cat care products and toys.", tags: ["Cat"] },
      { title: "Animals Product 3", price: 14.99, image: sampleImg, description: "Bird cages and feeding supplies.", tags: ["Bird"] },
      { title: "Animals Product 4", price: 49.99, image: sampleImg, description: "Sheep care and feeding products.", tags: ["Sheep"] },
      { title: "Animals Product 5", price: 69.99, image: sampleImg, description: "Horse grooming and riding accessories.", tags: ["Horse"] },
    ],
  },

  Family: {
    items: ["Men Clothes","Men Shoes","Ladies Clothes","Family Supplies","Baby Clothes","Baby Accessories","Baby Toys"],
    products: [
      { title: "Family Product 1", price: 29.99, image: sampleImg, description: "Stylish men clothing collection.", tags: ["Men"] },
      { title: "Family Product 2", price: 49.99, image: sampleImg, description: "Comfortable men shoes for everyday wear.", tags: ["Shoes"] },
      { title: "Family Product 3", price: 39.99, image: sampleImg, description: "Elegant ladies clothing line.", tags: ["Ladies"] },
      { title: "Family Product 4", price: 19.99, image: sampleImg, description: "Essential family supplies for daily use.", tags: ["Family"] },
      { title: "Family Product 5", price: 14.99, image: sampleImg, description: "Cute baby toys for kids.", tags: ["Baby"] },
    ],
  },

  Gifts: {
    items: ["Messbah","Watches","Pens","Perfumes","Gemstones"],
    products: [
      { title: "Gifts Product 1", price: 9.99, image: sampleImg, description: "Traditional Messbah for gift purposes.", tags: ["Religious"] },
      { title: "Gifts Product 2", price: 199.99, image: sampleImg, description: "Luxury watches for special occasions.", tags: ["Luxury"] },
      { title: "Gifts Product 3", price: 4.99, image: sampleImg, description: "Premium pens for writing and gifting.", tags: ["Office"] },
      { title: "Gifts Product 4", price: 59.99, image: sampleImg, description: "Popular perfumes for men and women.", tags: ["Fragrance"] },
      { title: "Gifts Product 5", price: 999.99, image: sampleImg, description: "Gemstones and jewelry for gifting.", tags: ["Jewelry"] },
    ],
  },

  Furniture: {
    items: ["Bedrooms","Tables","Kitchens","Textiles","Living Room"],
    products: [
      { title: "Furniture Product 1", price: 199.99, image: sampleImg, description: "Comfortable bedroom furniture set.", tags: ["Bedroom"] },
      { title: "Furniture Product 2", price: 149.99, image: sampleImg, description: "Stylish tables for home and office.", tags: ["Tables"] },
      { title: "Furniture Product 3", price: 299.99, image: sampleImg, description: "Modern kitchen furniture collection.", tags: ["Kitchen"] },
      { title: "Furniture Product 4", price: 89.99, image: sampleImg, description: "Textiles for a cozy home.", tags: ["Textiles"] },
      { title: "Furniture Product 5", price: 399.99, image: sampleImg, description: "Living room furniture for comfort and style.", tags: ["Living Room"] },
    ],
  },

  Jobs: {
    items: ["Job Openings","Job Seeker"],
    products: [
      { title: "Jobs Product 1", price: 0, image: sampleImg, description: "Latest job openings for various industries.", tags: ["Hiring"] },
      { title: "Jobs Product 2", price: 0, image: sampleImg, description: "Resources for job seekers.", tags: ["Career"] },
      { title: "Jobs Product 3", price: 0, image: sampleImg, description: "Internship opportunities for students.", tags: ["Internship"] },
      { title: "Jobs Product 4", price: 0, image: sampleImg, description: "Part-time and freelance jobs.", tags: ["Part-time"] },
      { title: "Jobs Product 5", price: 0, image: sampleImg, description: "Remote jobs for various skill sets.", tags: ["Remote"] },
    ],
  },

  Education: {
    items: ["School Supplies","Languages","All Science","Math Teaching","Other Subjects","University Services"],
    products: [
      { title: "Education Product 1", price: 19.99, image: sampleImg, description: "All essential school supplies for students.", tags: ["School"] },
      { title: "Education Product 2", price: 29.99, image: sampleImg, description: "Language courses and learning materials.", tags: ["Languages"] },
      { title: "Education Product 3", price: 39.99, image: sampleImg, description: "Science kits and teaching aids.", tags: ["Science"] },
      { title: "Education Product 4", price: 24.99, image: sampleImg, description: "Mathematics teaching materials.", tags: ["Math"] },
      { title: "Education Product 5", price: 49.99, image: sampleImg, description: "University-related services and tools.", tags: ["University"] },
    ],
  },

  Other: {
    items: ["Currencies & Stamps","Antiques","Books","Wholesale","Stickers","Lost & Found"],
    products: [
      { title: "Other Product 1", price: 9.99, image: sampleImg, description: "Collectible currencies and stamps.", tags: ["Collectibles"] },
      { title: "Other Product 2", price: 29.99, image: sampleImg, description: "Antique items for collectors.", tags: ["Antique"] },
      { title: "Other Product 3", price: 14.99, image: sampleImg, description: "Books for learning and leisure.", tags: ["Books"] },
      { title: "Other Product 4", price: 199.99, image: sampleImg, description: "Wholesale items for businesses.", tags: ["Wholesale"] },
      { title: "Other Product 5", price: 4.99, image: sampleImg, description: "Fun stickers and collectibles.", tags: ["Stickers"] },
    ],
  },
};

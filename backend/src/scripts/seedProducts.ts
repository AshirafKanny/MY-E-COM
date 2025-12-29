import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Product } from "../models/Product.js";

async function seed() {
  await connectDB(env.mongoUri);

  const sample = [
    {
      title: "Noise-Canceling Headphones",
      description: "Over-ear ANC headphones with 35h battery, Bluetooth 5.2, and quick charge.",
      price: 249,
      category: "audio",
      image: "https://via.placeholder.com/400x300?text=Headphones",
      stock: 25,
      isFeatured: true,
    },
    {
      title: "4K OLED TV",
      description: "55-inch OLED panel with HDR10+, Dolby Vision, and 120Hz refresh.",
      price: 1299,
      category: "tv",
      image: "https://via.placeholder.com/400x300?text=OLED+TV",
      stock: 10,
      isFeatured: true,
    },
    {
      title: "Smartwatch",
      description: "GPS, heart-rate, SpO2, sleep tracking, and 7-day battery life.",
      price: 299,
      category: "wearables",
      image: "https://via.placeholder.com/400x300?text=Smartwatch",
      stock: 40,
      isFeatured: false,
    },
    {
      title: "Gaming Laptop",
      description: "Ryzen 7, RTX 4070, 16GB RAM, 1TB NVMe, 15.6-inch 165Hz QHD.",
      price: 1799,
      category: "laptops",
      image: "https://via.placeholder.com/400x300?text=Gaming+Laptop",
      stock: 8,
      isFeatured: false,
    },
  ];

  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log(`Seeded ${sample.length} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

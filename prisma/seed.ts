import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Wireless Mechanical Keyboard",
    sku: "KB-WM-001",
    category: "Electronics",
    price: 2099000,
    stock: 45,
    description: "Compact 75% layout with hot-swap switches and RGB backlighting.",
  },
  {
    name: "USB-C Hub 7-in-1",
    sku: "HUB-UC-001",
    category: "Electronics",
    price: 799000,
    stock: 120,
    description: "Supports 4K HDMI, 100W PD, SD card reader, and 3 USB-A ports.",
  },
  {
    name: "Ergonomic Office Chair",
    sku: "CHR-ERG-001",
    category: "Furniture",
    price: 5599000,
    stock: 18,
    description: "Lumbar support, adjustable armrests, and breathable mesh back.",
  },
  {
    name: "Standing Desk 140cm",
    sku: "DSK-STD-001",
    category: "Furniture",
    price: 7999000,
    stock: 8,
    description: "Electric height-adjustable desk with memory presets.",
  },
  {
    name: '27" 4K IPS Monitor',
    sku: "MON-4K-001",
    category: "Electronics",
    price: 6399000,
    stock: 30,
    description: "3840x2160 resolution, 60Hz, HDR400, USB-C with 65W PD.",
  },
  {
    name: "Noise-Cancelling Headphones",
    sku: "HP-NC-001",
    category: "Electronics",
    price: 3499000,
    stock: 55,
    description: "Active noise cancellation with 30-hour battery life.",
  },
  {
    name: "Webcam 1080p",
    sku: "CAM-WB-001",
    category: "Electronics",
    price: 1299000,
    stock: 0,
    description: "Full HD 1080p at 30fps with built-in microphone and autofocus.",
  },
  {
    name: "Desk Lamp LED",
    sku: "LMP-LED-001",
    category: "Accessories",
    price: 549000,
    stock: 200,
    description:
      "Touch-sensitive dimmer with 5 color temperatures and USB charging port.",
  },
  {
    name: "Mouse Pad XL",
    sku: "MP-XL-001",
    category: "Accessories",
    price: 299000,
    stock: 300,
    description: "900x400mm extended desk mat with non-slip rubber base.",
  },
  {
    name: "Laptop Stand Aluminum",
    sku: "LS-ALU-001",
    category: "Accessories",
    price: 719000,
    stock: 5,
    description: 'Adjustable height and angle, foldable, compatible with 10-17" laptops.',
  },
  {
    name: "Wireless Mouse",
    sku: "MS-WL-001",
    category: "Electronics",
    price: 949000,
    stock: 85,
    description: "Silent clicks, 2.4GHz wireless, 12-month battery life.",
  },
  {
    name: "Cable Management Kit",
    sku: "CMK-001",
    category: "Accessories",
    price: 199000,
    stock: 150,
    description: "Velcro straps, cable clips, and cable sleeves for a clean desk setup.",
  },
  {
    name: "Portable SSD 1TB",
    sku: "SSD-PTB-001",
    category: "Electronics",
    price: 1299000,
    stock: 60,
    description: "USB 3.2 Gen2 with read speeds up to 1050MB/s, pocket-sized.",
  },
  {
    name: "Smart Speaker",
    sku: "SPK-SMT-001",
    category: "Electronics",
    price: 849000,
    stock: 40,
    description: "360° sound, built-in voice assistant, and multi-room audio support.",
  },
  {
    name: "Portable Charger 20000mAh",
    sku: "CHG-20K-001",
    category: "Electronics",
    price: 499000,
    stock: 110,
    description: "65W USB-C PD fast charging with dual USB-A ports.",
  },
  {
    name: "Whiteboard 120x90cm",
    sku: "WB-120-001",
    category: "Furniture",
    price: 899000,
    stock: 22,
    description: "Magnetic dry-erase board with aluminum frame and accessory tray.",
  },
  {
    name: "Gaming Chair Pro",
    sku: "CHR-GMG-001",
    category: "Furniture",
    price: 4499000,
    stock: 12,
    description:
      "Racing-style seat with 4D armrests, recline up to 180°, and lumbar pillow.",
  },
  {
    name: "Desk Organizer",
    sku: "ORG-DSK-001",
    category: "Accessories",
    price: 249000,
    stock: 175,
    description: "5-compartment bamboo organizer with pen holder and phone slot.",
  },
  {
    name: "Thermal Coffee Mug",
    sku: "MUG-THM-001",
    category: "Accessories",
    price: 199000,
    stock: 250,
    description:
      "450ml vacuum-insulated stainless steel mug, keeps drinks hot for 12 hours.",
  },
  {
    name: "Mechanical Pencil Set",
    sku: "PEN-MCH-001",
    category: "Stationery",
    price: 149000,
    stock: 320,
    description: "Set of 3 mechanical pencils (0.3, 0.5, 0.7mm) with extra lead refills.",
  },
  {
    name: "Wireless Numpad",
    sku: "NP-WL-001",
    category: "Electronics",
    price: 449000,
    stock: 65,
    description:
      "Slim Bluetooth numpad with rechargeable battery, compatible with Mac and Windows.",
  },
  {
    name: "RGB LED Strip 5m",
    sku: "LED-RGB-001",
    category: "Accessories",
    price: 329000,
    stock: 140,
    description: "App-controlled LED strip with music sync and 16 million colors.",
  },
  {
    name: "Monitor Arm Dual",
    sku: "MA-DL-001",
    category: "Accessories",
    price: 1199000,
    stock: 28,
    description:
      'Full-motion dual monitor mount, supports up to 32" screens, C-clamp and grommet base.',
  },
  {
    name: "Adjustable Footrest",
    sku: "FR-ADJ-001",
    category: "Furniture",
    price: 599000,
    stock: 47,
    description:
      "Non-slip ergonomic footrest with massage surface and height adjustment.",
  },
  {
    name: "Wireless Presentation Clicker",
    sku: "CLK-WL-001",
    category: "Electronics",
    price: 379000,
    stock: 90,
    description: "2.4GHz USB receiver, laser pointer, supports PowerPoint and Keynote.",
  },
  {
    name: "A4 Printer Paper 500 Sheets",
    sku: "PPR-A4-001",
    category: "Stationery",
    price: 89000,
    stock: 500,
    description: "80gsm bright white multipurpose copy paper, acid-free.",
  },
  {
    name: "Sticky Notes Set",
    sku: "STK-NT-001",
    category: "Stationery",
    price: 59000,
    stock: 600,
    description: "Assorted colors, 6-pack of 100-sheet pads in 75x75mm.",
  },
  {
    name: "Noise Machine",
    sku: "NSM-WH-001",
    category: "Electronics",
    price: 699000,
    stock: 35,
    description: "30 ambient sound profiles including white noise, rain, and fan.",
  },
  {
    name: "Under-Desk Drawer",
    sku: "DRW-UND-001",
    category: "Furniture",
    price: 449000,
    stock: 55,
    description:
      "Tool-free clamp mount, fits desks up to 5cm thick, 38x23cm storage tray.",
  },
  {
    name: "Bluetooth Barcode Scanner",
    sku: "SCAN-BT-001",
    category: "Electronics",
    price: 1499000,
    stock: 20,
    description:
      "1D/2D QR scanner, wireless range up to 10m, compatible with iOS and Android.",
  },
  {
    name: "Gel Ink Pen 12-Pack",
    sku: "PEN-GEL-001",
    category: "Stationery",
    price: 79000,
    stock: 450,
    description: "Smooth 0.5mm gel ink pens in 12 assorted colors.",
  },
  {
    name: 'Laptop Backpack 15.6"',
    sku: "BAG-LP-001",
    category: "Accessories",
    price: 899000,
    stock: 70,
    description:
      "Water-resistant with USB charging port, anti-theft back pocket, and padded shoulder straps.",
  },
  {
    name: "Foldable Whiteboard Easel",
    sku: "WB-ESL-001",
    category: "Furniture",
    price: 1299000,
    stock: 14,
    description:
      "Height-adjustable tripod easel for whiteboards and flip charts, folds flat.",
  },
  {
    name: 'Screen Privacy Filter 24"',
    sku: "PVF-24-001",
    category: "Accessories",
    price: 549000,
    stock: 38,
    description: "Anti-glare and anti-spy filter for 24-inch widescreen monitors (16:9).",
  },
  {
    name: "USB Desk Fan",
    sku: "FAN-USB-001",
    category: "Electronics",
    price: 249000,
    stock: 180,
    description: "Quiet brushless motor, 3-speed, 360° tilt, powered via USB-A.",
  },
  {
    name: "Highlighter Set 6-Pack",
    sku: "HLT-6PK-001",
    category: "Stationery",
    price: 49000,
    stock: 700,
    description:
      "Chisel-tip fluorescent highlighters in 6 vibrant colors, smear-resistant.",
  },
  {
    name: "Wrist Rest Keyboard",
    sku: "WR-KB-001",
    category: "Accessories",
    price: 189000,
    stock: 130,
    description: "Memory foam keyboard wrist rest with non-slip base, 43cm wide.",
  },
  {
    name: 'Portable Monitor 15.6"',
    sku: "MON-PTB-001",
    category: "Electronics",
    price: 2499000,
    stock: 22,
    description: "1080p IPS, USB-C and micro-HDMI input, 4600mAh built-in battery.",
  },
  {
    name: "Cable Raceway 1.8m",
    sku: "CRW-001",
    category: "Accessories",
    price: 149000,
    stock: 200,
    description: "Self-adhesive paintable PVC raceway for concealing wall cables.",
  },
];

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin1234",
  },
];

async function main() {
  console.log("Seeding products...");

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  console.log(`Done. ${products.length} products seeded.`);

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { ...user, password: hashed },
      create: { ...user, password: hashed },
    });
  }

  console.log(`Done. ${users.length} users seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

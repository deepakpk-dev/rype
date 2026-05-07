import { PrismaClient, Category, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS } from "../data/products";

const prisma = new PrismaClient();

async function seedProducts() {
  console.log("Seeding products…");
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      // Upsert: create on first run, leave admin edits intact on subsequent runs.
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        price: p.price,
        unit: p.unit,
        category: p.category as Category,
        origin: p.origin,
        organic: p.organic,
        inSeason: p.inSeason,
        featured: p.featured ?? false,
        stock: p.stock,
        images: p.images,
        nutrition: p.nutrition,
        tags: p.tags,
      },
      update: {},
    });
  }
  console.log(`✓ Seeded ${PRODUCTS.length} products`);
}

async function seedUsers() {
  console.log("Seeding users…");
  const users = [
    {
      email: "admin@rype.local",
      name: "Riley Admin",
      role: Role.admin,
      password: "admin123",
    },
    {
      email: "staff@rype.local",
      name: "Sam Staff",
      role: Role.staff,
      password: "staff123",
    },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
      },
      update: {
        // Keep passwordHash fresh in case bcrypt cost factor changes.
        passwordHash,
        name: u.name,
        role: u.role,
      },
    });
  }
  console.log(`✓ Seeded ${users.length} users`);
}

async function seedOrders() {
  console.log("Seeding orders…");
  // Idempotent for orders: clear and reseed (orders are demo data only).
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.order.create({
    data: {
      id: "ord_seed_1",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
      status: "processing",
      customerName: "Aoife Byrne",
      customerEmail: "aoife@example.com",
      customerAddress: "12 Grafton St",
      customerCity: "Dublin",
      customerZip: "D02 X285",
      customerCountry: "Ireland",
      subtotal: 1497,
      shipping: 0,
      total: 1497,
      items: {
        create: [
          { productId: "p01", name: "Heirloom Tomatoes", qty: 2, price: 549 },
          { productId: "p02", name: "Fuji Apples", qty: 1, price: 399 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: "ord_seed_2",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: "pending",
      customerName: "Lukas Müller",
      customerEmail: "lukas@example.com",
      customerAddress: "Friedrichstr. 22",
      customerCity: "Berlin",
      customerZip: "10117",
      customerCountry: "Germany",
      subtotal: 2196,
      shipping: 0,
      total: 2196,
      items: {
        create: [
          { productId: "p01", name: "Heirloom Tomatoes", qty: 4, price: 549 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: "ord_seed_3",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      status: "delivered",
      customerName: "Sophie Laurent",
      customerEmail: "sophie@example.com",
      customerAddress: "5 rue Cler",
      customerCity: "Paris",
      customerZip: "75007",
      customerCountry: "France",
      subtotal: 1197,
      shipping: 399,
      total: 1596,
      items: {
        create: [
          { productId: "p02", name: "Fuji Apples", qty: 3, price: 399 },
        ],
      },
    },
  });

  console.log("✓ Seeded 3 orders");
}

async function main() {
  await seedProducts();
  await seedUsers();
  await seedOrders();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Firstframe V1 — Database Seed Script
 * 
 * Run with: npm run seed
 * 
 * This creates:
 * 1. Admin document in Firestore (links to your Firebase Auth user)
 * 2. Sample creators in the pool
 * 3. A sample brand + access code
 * 4. A sample campaign
 * 5. A creator token for magic link testing
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

// ---- Initialize Firebase Admin ----
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey || serviceAccountKey === "{}") {
  console.error("\n❌ FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local");
  console.error("   Please follow SETUP.md Step 4 to get your service account key.\n");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (e) {
  console.error("\n❌ FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.");
  console.error("   Make sure you paste the entire JSON content on one line in .env.local\n");
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);
const auth = getAuth(app);

// ---- Helpers ----
const now = Timestamp.now;

function generateAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ---- Main Seed Function ----
async function seed() {
  console.log("\n🌱 Firstframe V1 — Seeding Database...\n");

  // ============================================================
  // 1. Find or create admin user
  // ============================================================
  let adminUid;
  let adminEmail;
  try {
    const listResult = await auth.listUsers(1);
    if (listResult.users.length > 0) {
      adminUid = listResult.users[0].uid;
      adminEmail = listResult.users[0].email;
      console.log(`✅ Found existing admin user: ${adminEmail} (${adminUid})`);
    } else {
      // Create admin user
      const user = await auth.createUser({
        email: "admin@firstframe.in",
        password: "Admin@123",
        displayName: "Firstframe Admin",
      });
      adminUid = user.uid;
      adminEmail = "admin@firstframe.in";
      console.log(`✅ Created admin user: ${adminEmail} (${adminUid})`);
      console.log(`   Password: Admin@123`);
    }
  } catch (err) {
    console.error("❌ Failed to setup admin user:", err.message);
    process.exit(1);
  }

  // Create admin doc in Firestore
  await db.collection("admins").doc(adminUid).set({
    email: adminEmail,
    name: "Admin",
    createdAt: now(),
  });
  console.log(`✅ Admin document created in Firestore`);

  // ============================================================
  // 2. Create sample creators
  // ============================================================
  const creators = [
    {
      name: "Priya Sharma",
      niche: "Beauty",
      city: "Mumbai",
      email: "priya@example.com",
      phone: "+919876543210",
      instagramHandle: "priya_beauty",
      bestVideoUrl: "",
      thumbnailUrl: "",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Arjun Patel",
      niche: "Tech",
      city: "Bangalore",
      email: "arjun@example.com",
      phone: "+919876543211",
      instagramHandle: "arjun_tech",
      bestVideoUrl: "",
      thumbnailUrl: "",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Sneha Reddy",
      niche: "Lifestyle",
      city: "Hyderabad",
      email: "sneha@example.com",
      phone: "+919876543212",
      instagramHandle: "sneha_lifestyle",
      bestVideoUrl: "",
      thumbnailUrl: "",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Rahul Kumar",
      niche: "Fashion",
      city: "Delhi",
      email: "rahul@example.com",
      phone: "+919876543213",
      instagramHandle: "rahul_fashion",
      bestVideoUrl: "",
      thumbnailUrl: "",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Ananya Iyer",
      niche: "Food",
      city: "Chennai",
      email: "ananya@example.com",
      phone: "+919876543214",
      instagramHandle: "ananya_food",
      bestVideoUrl: "",
      thumbnailUrl: "",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Vikram Singh",
      niche: "Fitness",
      city: "Pune",
      email: "vikram@example.com",
      phone: "+919876543215",
      instagramHandle: "vikram_fit",
      bestVideoUrl: "",
      thumbnailUrl: "",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  const creatorIds = [];
  for (const creator of creators) {
    const ref = await db.collection("creators").add(creator);
    creatorIds.push(ref.id);
    console.log(`✅ Creator: ${creator.name} (${ref.id})`);
  }

  // ============================================================
  // 3. Create sample brand + access code + campaign
  // ============================================================
  const accessCode = generateAccessCode();

  // Create campaign
  const campaignRef = await db.collection("campaigns").add({
    brandId: "",
    brandName: "GlowUp Cosmetics",
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  });
  console.log(`✅ Campaign created: GlowUp Cosmetics (${campaignRef.id})`);

  // Create brand
  const brandRef = await db.collection("brands").add({
    companyName: "GlowUp Cosmetics",
    email: "brand@glowup.com",
    accessCode: accessCode,
    accessCodeExpiry: null,
    accessCodeUsed: false,
    campaignId: campaignRef.id,
    createdAt: now(),
    createdBy: adminUid,
  });
  console.log(`✅ Brand created: GlowUp Cosmetics (${brandRef.id})`);

  // Create access code
  await db.collection("accessCodes").add({
    code: accessCode,
    brandEmail: "brand@glowup.com",
    brandCompanyName: "GlowUp Cosmetics",
    isUsed: false,
    usedAt: null,
    expiresAt: null,
    createdBy: adminUid,
    createdAt: now(),
  });
  console.log(`✅ Access Code: ${accessCode}`);

  // ============================================================
  // 4. Create sample campaign-creator invites (first 3 creators)
  // ============================================================
  for (let i = 0; i < 3; i++) {
    await db.collection("campaignCreators").add({
      campaignId: campaignRef.id,
      creatorId: creatorIds[i],
      creatorName: creators[i].name,
      status: "invited",
      agreedRate: null,
      invitedAt: now(),
      acceptedAt: null,
      notes: null,
      trackingLink: null,
      shippingAddress: null,
      revisionCount: 0,
      lastUpdated: now(),
      createdAt: now(),
    });
    console.log(`✅ Invited: ${creators[i].name} → GlowUp campaign`);
  }

  // ============================================================
  // 5. Create sample product
  // ============================================================
  await db.collection("products").add({
    campaignId: campaignRef.id,
    name: "Matte Foundation",
    variants: [
      { id: "v1", label: "Shade 01 - Fair" },
      { id: "v2", label: "Shade 02 - Medium" },
      { id: "v3", label: "Shade 03 - Deep" },
    ],
    assignedCreatorIds: [creatorIds[0], creatorIds[1], creatorIds[2]],
    scriptContent: null,
    scriptVersion: 0,
    scriptUpdatedAt: null,
    status: "draft",
    createdAt: now(),
  });
  console.log(`✅ Product: Matte Foundation (3 variants)`);

  // ============================================================
  // 6. Create creator tokens for magic link testing
  // ============================================================
  const tokens = [];
  for (let i = 0; i < 3; i++) {
    const token = generateToken();
    await db.collection("creatorTokens").add({
      creatorId: creatorIds[i],
      token: token,
      createdAt: now(),
      usedAt: null,
    });
    tokens.push({ name: creators[i].name, token });
  }

  // ============================================================
  // 7. Add some activity log entries
  // ============================================================
  await db.collection("activityLog").add({
    campaignId: campaignRef.id,
    actorType: "admin",
    actorId: adminUid,
    actorName: "Admin",
    action: "Created campaign for GlowUp Cosmetics",
    entityType: "campaign",
    entityId: campaignRef.id,
    timestamp: now(),
  });
  await db.collection("activityLog").add({
    campaignId: campaignRef.id,
    actorType: "admin",
    actorId: adminUid,
    actorName: "Admin",
    action: `Generated access code ${accessCode} for GlowUp Cosmetics`,
    entityType: "accessCode",
    entityId: accessCode,
    timestamp: now(),
  });
  console.log(`✅ Activity log seeded`);

  // ============================================================
  // Done!
  // ============================================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 SEED COMPLETE! Here are your login credentials:");
  console.log("=".repeat(60));
  console.log("");
  console.log("┌─────────────────────────────────────────────────┐");
  console.log("│  ADMIN LOGIN                                    │");
  console.log(`│  URL:      http://localhost:3000/admin/login     │`);
  console.log(`│  Email:    ${(adminEmail || "").padEnd(38)}│`);
  console.log(`│  Password: Admin@123                            │`);
  console.log("├─────────────────────────────────────────────────┤");
  console.log("│  BRAND LOGIN                                    │");
  console.log(`│  URL:      http://localhost:3000/brand/login     │`);
  console.log(`│  Company:  GlowUp Cosmetics                     │`);
  console.log(`│  Code:     ${accessCode.padEnd(38)}│`);
  console.log("├─────────────────────────────────────────────────┤");
  console.log("│  CREATOR JOIN LINKS                             │");
  for (const t of tokens) {
    const url = `http://localhost:3000/creator/join?token=${t.token}`;
    console.log(`│  ${t.name.padEnd(15)} → ${url.substring(0, 30)}... │`);
  }
  console.log("└─────────────────────────────────────────────────┘");
  console.log("");
  console.log("Creator join URLs (full):");
  for (const t of tokens) {
    console.log(`  ${t.name}: http://localhost:3000/creator/join?token=${t.token}`);
  }
  console.log("");
  console.log("Now run:  npm run dev");
  console.log("");

  process.exit(0);
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});

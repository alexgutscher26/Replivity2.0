import { db } from "@/server/db";
import { products } from "@/server/db/schema/products-schema";
import {
  featurePermissions,
  AVAILABLE_FEATURES,
} from "@/server/db/schema/feature-permissions-schema";
import { nanoid } from "nanoid";

/**
 * Seed script to populate feature permissions for existing products
 * This script assigns default features to products based on their pricing tier
 */
async function seedFeaturePermissions() {
  console.log("🌱 Starting feature permissions seeding...");

  try {
    // Get all existing products
    const allProducts = await db.select().from(products);
    console.log(`📦 Found ${allProducts.length} products`);

    // Clear existing feature permissions
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await db.delete(featurePermissions);
    console.log("🧹 Cleared existing feature permissions");

    // Define feature sets for different plan types
    const featureSets = {
      free: [AVAILABLE_FEATURES.BROWSER_EXTENSION], // Free plans only get browser extension
      basic: [
        AVAILABLE_FEATURES.BROWSER_EXTENSION,
        AVAILABLE_FEATURES.AI_CAPTION_GENERATOR,
      ], // Basic plans get browser extension + AI caption generator
      pro: [
        AVAILABLE_FEATURES.BROWSER_EXTENSION,
        AVAILABLE_FEATURES.AI_CAPTION_GENERATOR,
        AVAILABLE_FEATURES.TWEET_GENERATOR,
        AVAILABLE_FEATURES.BIO_OPTIMIZER,
      ], // Pro plans get all features
    };

    // Process each product
    for (const product of allProducts) {
      let features: string[] = [];

      // Determine feature set based on product characteristics
      const priceValue = parseFloat(product.price);
      if (product.isFree || priceValue === 0) {
        features = featureSets.free;
        console.log(`📱 Assigning FREE features to: ${product.name}`);
      } else if (
        product.name.toLowerCase().includes("basic") ||
        priceValue < 20
      ) {
        features = featureSets.basic;
        console.log(`📊 Assigning BASIC features to: ${product.name}`);
      } else {
        features = featureSets.pro;
        console.log(`🚀 Assigning PRO features to: ${product.name}`);
      }

      // Insert feature permissions for this product
      for (const featureKey of features) {
        await db.insert(featurePermissions).values({
          id: nanoid(),
          productId: product.id,
          featureKey,
        });
      }

      console.log(`✅ Added ${features.length} features for ${product.name}`);
    }

    console.log("🎉 Feature permissions seeding completed successfully!");

    // Display summary
    const totalPermissions = await db.select().from(featurePermissions);
    console.log(
      `📊 Total feature permissions created: ${totalPermissions.length}`,
    );
  } catch (error) {
    console.error("❌ Error seeding feature permissions:", error);
    throw error;
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedFeaturePermissions()
    .then(() => {
      console.log("✨ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedFeaturePermissions };

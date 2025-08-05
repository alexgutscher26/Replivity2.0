import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as appsumoLicense from "./schema/appsumo-license-schema";
import * as auth from "./schema/auth-schema";
import * as billing from "./schema/billing-schema";
import * as featurePermissions from "./schema/feature-permissions-schema";
import * as generations from "./schema/generations-schema";
import * as hashtags from "./schema/hashtag-schema";
import * as post from "./schema/post-schema";
import * as products from "./schema/products-schema";
import * as settings from "./schema/settings-schema";
import * as usage from "./schema/usage-schema";

// Import optimized connection pool
import { pooledDb, checkDatabaseHealth, closeDatabaseConnections } from "./pool";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// Legacy database connection (for backward compatibility)
export const db = drizzle(conn, {
  schema: {
    ...post,
    ...auth,
    ...appsumoLicense,
    ...billing,
    ...featurePermissions,
    ...generations,
    ...hashtags,
    ...products,
    ...settings,
    ...usage,
  },
});

// Optimized database connection with pooling (recommended for new code)
export const optimizedDb = pooledDb;

// Database utilities
export { checkDatabaseHealth, closeDatabaseConnections };

// Query optimization utilities
export {
  UserQueryOptimizer,
  GenerationQueryOptimizer,
  BillingQueryOptimizer,
  QueryAnalyzer,
  CacheManager,
  cachedQuery,
  paginatedQuery,
  buildDateRangeCondition,
} from "./query-optimizer";

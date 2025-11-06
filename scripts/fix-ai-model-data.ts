#!/usr/bin/env bun

import { db } from "@/server/db";
import { settings } from "@/server/db/schema/settings-schema";
import { eq } from "drizzle-orm";

async function fixAiModelData() {
    console.log("Checking AI model data format...");

    const allSettings = await db.query.settings.findFirst();

    if (!allSettings) {
        console.log("No settings found in database");
        return;
    }

    console.log("Current AI settings:", JSON.stringify(allSettings.general?.ai, null, 2));

    const aiSettings = allSettings.general?.ai;

    if (aiSettings?.enabledModels && Array.isArray(aiSettings.enabledModels)) {
        let needsUpdate = false;
        const transformedModels = aiSettings.enabledModels.map((model: any) => {
            if (typeof model === 'string' && model.includes('/')) {
                console.log(`Found old format: ${model}`);
                needsUpdate = true;
                const transformed = model.split('/')[1];
                console.log(`Transforming to: ${transformed}`);
                return transformed;
            }
            return model;
        });

        if (needsUpdate) {
            console.log("Updating database with transformed models...");

            const updatedAiSettings = {
                ...aiSettings,
                enabledModels: transformedModels,
            };

            await db
                .update(settings)
                .set({
                    general: {
                        ...allSettings.general,
                        ai: updatedAiSettings,
                    },
                })
                .where(eq(settings.id, allSettings.id));

            console.log("Database updated successfully!");
            console.log("New AI settings:", JSON.stringify(updatedAiSettings, null, 2));
        } else {
            console.log("No transformation needed - data is already in correct format");
        }
    } else {
        console.log("No enabled models found or not an array");
    }
}

fixAiModelData().catch(console.error);
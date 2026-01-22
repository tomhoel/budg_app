"use server";

import { sendChatMessage, generateRecipePlan } from "@/lib/gemini-client";
import { matchIngredientsToProducts, calculateTotals } from "@/lib/deal-logic";

export async function submitChatMessage(history: any[], message: string) {
    try {
        const responseText = await sendChatMessage(history, message);
        const isReady = responseText.includes("[READY_TO_PLAN]");

        // Clean the tag from the response to show user
        const displayResponse = responseText.replace("[READY_TO_PLAN]", "").trim();

        return {
            success: true,
            response: displayResponse,
            isReady,
            fullResponse: responseText // Keep original for summary context if needed
        };
    } catch (error) {
        console.error("Chat Error:", error);
        return { success: false, error: "Failed to connect to AI" };
    }
}

export async function generateFinalPlan(chatHistorySummary: string, budget: number) {
    try {
        // 1. Generate Recipe JSON from Gemini
        const recipeData = await generateRecipePlan(chatHistorySummary, budget);

        // 2. Match with Meny Products
        const shoppingList = await matchIngredientsToProducts(recipeData.ingredients);

        // 3. Calculate Totals
        const { totalCost, trumfBonus } = calculateTotals(shoppingList);

        return {
            success: true,
            recipe: recipeData,
            shoppingList,
            totalCost,
            trumfBonus
        };
    } catch (error) {
        console.error("Plan Generation Error:", error);
        return { success: false, error: "Failed to generate plan" };
    }
}

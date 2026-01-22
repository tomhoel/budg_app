
import { searchProducts, MenyProduct } from "./meny-client";

export interface ShoppingListItem {
    ingredientName: string;
    product: MenyProduct | null;
    quantity: number; // Count of units to buy
    totalPrice: number;
}

export async function matchIngredientsToProducts(
    ingredients: { name: string; amount: string }[]
): Promise<ShoppingListItem[]> {
    const shoppingList: ShoppingListItem[] = [];

    for (const ing of ingredients) {
        // 1. Search for the product
        // We clean the name a bit to remove weights like "400g kjøttdeig" -> "kjøttdeig" if possible, 
        // but Gemini usually gives "Kjøttdeig" separately from amount.
        const products = await searchProducts(ing.name, { pageSize: 20 });

        if (products.length === 0) {
            shoppingList.push({
                ingredientName: ing.name,
                product: null,
                quantity: 1,
                totalPrice: 0
            });
            continue;
        }

        // 2. Filter & Sort Strategy
        // Strategy:
        // a. Filter for available items (isForSale)
        // b. Priority 1: Items on offer (isOffer === true)
        // c. Priority 2: Lowest pricePerUnit (or just price)

        const available = products.filter(p => p.isForSale && !p.isOutOfStock);

        // Sort by: Offer first, then price ascending
        available.sort((a, b) => {
            if (a.isOffer && !b.isOffer) return -1;
            if (!a.isOffer && b.isOffer) return 1;
            return a.pricePerUnit - b.pricePerUnit;
        });

        const bestMatch = available[0] || products[0]; // Fallback to first if none available

        // 3. Estimate quantity needed (This is hard without structured parsing, assumption: 1 unit)
        // For a cleaner implementation we could parse "400g" and compare with "weight", but for MVP we assume 1 unit.

        shoppingList.push({
            ingredientName: ing.name,
            product: bestMatch,
            quantity: 1,
            totalPrice: bestMatch.pricePerUnit
        });
    }

    return shoppingList;
}

export function calculateTotals(list: ShoppingListItem[]) {
    const totalCost = list.reduce((sum, item) => sum + item.totalPrice, 0);

    // Trumf is typically 1%, sometimes 3% on Triple Trumf days. 
    // Offers sometimes have extra trumf but data is complex. We'll assume 1% base.
    const trumfBonus = Math.round(totalCost * 0.01);

    return { totalCost, trumfBonus };
}

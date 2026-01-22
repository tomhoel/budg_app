
import { searchProducts } from "../src/lib/meny-client";

async function main() {
    console.log("Testing Meny API...");

    try {
        const products = await searchProducts("kjøttdeig");
        console.log(`Found ${products.length} products for 'kjøttdeig'`);

        if (products.length > 0) {
            console.log("First product:", products[0].title, products[0].pricePerUnit, "kr");
            console.log("For sale:", products[0].isForSale);
        } else {
            console.warn("No products found? API might be blocked or changed.");
        }

        // Test Category / Deal Logic
        const milk = await searchProducts("melk");
        console.log(`Found ${milk.length} products for 'melk'`);

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

main();

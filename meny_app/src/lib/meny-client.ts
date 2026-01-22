
const BASE_URL = "https://platform-rest-prod.ngdata.no/api/episearch/1300/products";
const PRODUCT_DETAIL_URL = "https://platform-rest-prod.ngdata.no/api/products/1300";
const DEFAULT_STORE_ID = "7080001150488"; // Meny Bryn

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://meny.no/"
};

export interface MenyProduct {
    ean: string;
    title: string;
    subtitle: string;
    pricePerUnit: number;
    comparePricePerUnit: number;
    compareUnit: string;
    imagePath: string;
    isOffer: boolean;
    offerDiscountPerUnit?: number;
    isForSale: boolean;
    isOutOfStock: boolean;
}

export interface MenyResponse {
    hits: {
        total: number | { value: number };
        hits: Array<{
            contentId: string;
            contentData: {
                _source: MenyProduct;
            };
        }>;
    };
}

export async function searchProducts(
    query: string,
    options: {
        facet?: string;
        pageSize?: number;
        storeId?: string;
        fullResponse?: boolean;
    } = {}
) {
    const {
        facet,
        pageSize = 50,
        storeId = DEFAULT_STORE_ID,
        fullResponse = true
    } = options;

    const params = new URLSearchParams({
        search: query,
        store_id: storeId,
        page_size: pageSize.toString(),
        full_response: fullResponse.toString(),
        types: "products"
    });

    if (facet) {
        params.append("facet", facet);
    }

    try {
        const res = await fetch(`${BASE_URL}?${params.toString()}`, {
            headers: HEADERS,
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`Meny API Error: ${res.statusText}`);
        }

        const data: MenyResponse = await res.json();
        return data.hits.hits.map(hit => hit.contentData._source);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

export function getImageUrl(path: string, size: "small" | "medium" | "large" = "medium") {
    return `https://bilder.ngdata.no/${path}/${size}.jpg`;
}

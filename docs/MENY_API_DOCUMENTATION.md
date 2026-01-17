# Meny / NorgesGruppen Product Search API Documentation

> **Purpose**: This document provides a complete technical reference for the Meny grocery store product API. It is designed to be consumed by AI systems and developers building applications that interact with Norwegian grocery data.

---

## Overview

The Meny API is a REST-based product search endpoint powered by Elasticsearch. It is part of the NorgesGruppen (NG) digital platform and provides access to the full product catalog of Meny grocery stores in Norway.

| Property | Value |
|----------|-------|
| **Base URL** | `https://platform-rest-prod.ngdata.no/api/episearch/1300/products` |
| **Protocol** | HTTPS |
| **Method** | GET |
| **Response Format** | JSON |
| **Authentication** | None required (public API) |
| **Rate Limiting** | Undocumented, but standard browser-like request patterns are recommended |

---

## Required Headers

The API requires browser-like headers to avoid being blocked:

```json
{
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Referer": "https://meny.no/"
}
```

---

## Query Parameters

### Core Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | `""` | Free-text search query. Empty string returns all products. |
| `store_id` | string | Yes | - | The GTIN-13 identifier of the store. Example: `7080001150488` |
| `page` | integer | No | `1` | Page number for pagination (1-indexed) |
| `page_size` | integer | No | `20` | Number of results per page. Maximum effective value: `250` |
| `full_response` | string | No | `"false"` | Set to `"true"` to include aggregations and full product metadata |
| `types` | string | No | `"products"` | Content type filter. Use `"products"` for product data only. |

### Filtering Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `facet` | string | Apply a filter or request aggregations. Format: `<FacetName>:<Value>` | `facet=Categories:Drikke` |
| `showNotForSale` | string | Include products not currently for sale. `"true"` or `"false"` | `showNotForSale=true` |
| `popularity` | string | Sort by popularity. `"true"` or `"false"` | `popularity=true` |

### Facet Filter Format

To filter by a specific facet:
```
facet=Categories:Bakeri
facet=Allergens:melk
facet=IsOffer:true
```

To request aggregation data without filtering (returns available facet values):
```
facet=Categories
```

> **Warning**: Using multiple `facet` parameters in a single request (e.g., `&facet=A&facet=B`) may cause a 500 Server Error. Instead, make separate requests per category.

---

## Response Structure

### Top-Level Keys

```json
{
  "took": 42,
  "timed_out": false,
  "_shards": { ... },
  "hits": { ... },
  "aggregations": { ... },
  "suggest": { ... },
  "searchType": "products",
  "otherSegments": [ ... ]
}
```

### Hits Object

The `hits` object contains the search results:

```json
{
  "hits": {
    "total": 11507,  // Can be integer or { "value": 11507, "relation": "eq" }
    "max_score": 1.0,
    "hits": [
      {
        "contentId": "7090037180045",
        "title": "Morenepoteter",
        "contentData": {
          "_source": { ... }  // Full product data
        }
      }
    ]
  }
}
```

### Aggregations Object

When `full_response=true` and `facet=Categories` is requested:

```json
{
  "aggregations": {
    "Categories": {
      "buckets": [
        { "key": "Drikke", "doc_count": 1371 },
        { "key": "Middagstilbehør", "doc_count": 1385 },
        ...
      ]
    }
  }
}
```

---

## Product Data Schema

Each product is located at `hits.hits[].contentData._source`. Below is the complete schema:

### Core Identifiers

| Field | Type | Description |
|-------|------|-------------|
| `ean` | string | EAN-13 barcode (unique product identifier) |
| `epdNumber` | integer | EPD (wholesale) product number |
| `title` | string | Product name |
| `subtitle` | string | Additional descriptor (e.g., "pr stk", "500g") |
| `brand` | string | Brand name (may be `null`) |
| `vendor` | string | Supplier/vendor name |

### Categorization

| Field | Type | Description |
|-------|------|-------------|
| `categoryName` | string | Top-level category (e.g., "Frukt & grønt") |
| `shoppingListGroupName` | string | Shopping list category |
| `shoppingListGroupName1` | string | Subcategory for shopping lists |
| `slugifiedUrl` | string | URL path to product page |

### Pricing

| Field | Type | Description |
|-------|------|-------------|
| `pricePerUnit` | float | Current price per unit |
| `pricePerUnitOriginal` | float | Original price before discount |
| `comparePricePerUnit` | float | Comparison price (per kg/liter) |
| `compareUnit` | string | Unit for comparison price (e.g., "kg", "liter") |
| `calcPricePerUnit` | float | Calculated price per unit |
| `calcUnit` | string | Calculation unit |

### Stock & Availability

| Field | Type | Description |
|-------|------|-------------|
| `isForSale` | boolean | Whether the product is currently for sale |
| `isOutOfStock` | boolean | Whether the product is out of stock |
| `isRevoked` | boolean | Whether the product has been revoked |
| `mustOrderFromSupplier` | boolean | Whether item must be special-ordered |
| `availableInventory` | integer/null | Available inventory count |

### Promotions & Offers

| Field | Type | Description |
|-------|------|-------------|
| `isOffer` | boolean | Whether the product is on sale |
| `isNew` | boolean | Whether the product is new |
| `usesPromotionPrice` | boolean | Whether promo pricing is active |
| `promotionId` | integer | ID of the active promotion |
| `offerDiscountPerUnit` | float | Discount amount per unit |
| `promotions` | array | List of promotion objects (see below) |

### Promotion Object Schema

```json
{
  "promotionId": 127002,
  "name": "MENY F&G UKE 2-3 - KR 20",
  "type": 2,
  "promotionPrice": 20,
  "from": "2026-01-04T00:00:00+01:00",
  "to": "2026-01-17T23:59:59+01:00",
  "trumfCampaign": false,
  "isMarketed": true,
  "marketText": "Tilbud",
  "tags": ["tilbud", "banner"]
}
```

### Product Attributes

| Field | Type | Description |
|-------|------|-------------|
| `unitWeight` | float | Weight per unit in kg |
| `weight` | float | Total weight |
| `unit` | string | Sale unit (e.g., "stk", "kg") |
| `unitType` | string | Unit type (e.g., "Stykk", "Kilo") |
| `ageLimit` | integer | Age restriction (0 = none, 18 = alcohol) |
| `containsAlcohol` | boolean | Whether product contains alcohol |
| `recycleValue` | float | Pant/deposit value in NOK |
| `isFreshProduce` | boolean | Whether item is fresh produce |
| `isLocal` | boolean | Whether item is locally sourced |
| `productSoldByWeight` | boolean | Whether sold by weight |

### Images

| Field | Type | Description |
|-------|------|-------------|
| `imagePath` | string | Path to image (relative) |
| `imageGtin` | string | GTIN used for image lookup |

**Image URL Construction**:
```
https://bilder.ngdata.no/{imagePath}/medium.jpg
https://bilder.ngdata.no/{imagePath}/large.jpg
https://bilder.ngdata.no/{imagePath}/small.jpg
```

---

## Pagination & Limits

### Elasticsearch Limit

The API uses Elasticsearch which has a default `max_result_window` of **10,000 items**. This means:

- You cannot paginate beyond `page * page_size > 10000`
- Requests for items beyond this limit will return a **500 Internal Server Error**

### Solution: Category-Based Partitioning

To extract all products (11,500+), partition requests by category:

1. Request aggregations: `?facet=Categories&full_response=true&page_size=1`
2. Extract category names from `aggregations.Categories.buckets[].key`
3. Make separate requests per category: `?facet=Categories:Bakeri&page_size=250`
4. Merge results, deduplicating by `contentId`

---

## Available Categories (21 Total)

| Category | Product Count |
|----------|---------------|
| Middagstilbehør | 1,385 |
| Drikke | 1,371 |
| Personlige artikler | 1,249 |
| Middag | 941 |
| Pålegg & frokost | 927 |
| Snacks & godteri | 790 |
| Hus & hjem | 726 |
| Bakeri | 653 |
| Bakevarer og kjeks | 580 |
| Kjøtt | 407 |
| Ost | 391 |
| Frukt & grønt | 379 |
| Dessert og iskrem | 357 |
| Meieri & egg | 337 |
| Kioskvarer | 247 |
| Barneprodukter | 238 |
| Fisk & skalldyr | 224 |
| Dyr | 172 |
| Kylling og fjærkre | 87 |
| Apotekvarer | 35 |
| Blomster og planter | 11 |

---

## Example Requests

### Basic Product Search

```http
GET https://platform-rest-prod.ngdata.no/api/episearch/1300/products?search=melk&store_id=7080001150488&page_size=20&full_response=true
```

### Get All Categories

```http
GET https://platform-rest-prod.ngdata.no/api/episearch/1300/products?facet=Categories&store_id=7080001150488&full_response=true&page_size=1
```

### Filter by Category

```http
GET https://platform-rest-prod.ngdata.no/api/episearch/1300/products?facet=Categories:Drikke&store_id=7080001150488&page_size=250&full_response=true
```

### Get Products on Offer

```http
GET https://platform-rest-prod.ngdata.no/api/episearch/1300/products?facet=IsOffer:true&store_id=7080001150488&page_size=250&full_response=true
```

---

---

## Store API

Access the complete store registry for the NorgesGruppen 1300 chain (Meny).

| Endpoint Type | URL |
|---------------|-----|
| **Registry** | `https://api.ngdata.no/sylinder/stores/v1/basic-info?chainId=1300` |
| **Extended** | `https://api.ngdata.no/sylinder/stores/v1/extended-info/{GLN}` |

### Store Object Schema

The registry returns a list of objects containing:

| Field | Type | Description |
|-------|------|-------------|
| `gln` | string | **Primary ID**. Map this to `store_id` in product requests. |
| `storeDetails.storeId` | string | Internal numeric identifier. |
| `storeDetails.storeName`| string | Human-readable name (e.g., "MENY Bryn"). |
| `storeDetails.position` | object | Geographic center (`lat`, `lng`). |
| `storeDetails.organization`| object | Address, city, postalCode, phone, and email. |
| `storeDetails.shopServices` | array | List of available services (PostNord, Gavekort, etc). |

---

## Python Reference Implementation

### Product Search Module

```python
import requests
import json

class MenyAPI:
    def __init__(self, store_id="7080001150488"):
        self.base_url = "https://platform-rest-prod.ngdata.no/api/episearch/1300/products"
        self.store_id = store_id
        self.image_base_url = "https://bilder.ngdata.no"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://meny.no/"
        }

    def search_products(self, query="", page=1, page_size=20, **extra_params):
        params = {
            "search": query,
            "page_size": page_size,
            "page": page,
            "store_id": self.store_id,
            "full_response": "true",
            "types": "products"
        }
        params.update(extra_params)
        response = requests.get(self.base_url, headers=self.headers, params=params)
        response.raise_for_status()
        data = response.json()
        total = data.get("hits", {}).get("total", 0)
        if isinstance(total, dict):
            total = total.get("value", 0)
        return data, total

    def get_categories(self):
        # Uses aggregations to discover partitions
        data, _ = self.search_products(page_size=1, facet="Categories")
        buckets = data.get("aggregations", {}).get("Categories", {}).get("buckets", [])
        return [b["key"] for b in buckets]

    def get_image_url(self, image_path, size="medium"):
        return f"{self.image_base_url}/{image_path}/{size}.jpg"
```

### Store Mapping Module

```python
class MenyStoreMapper:
    def __init__(self):
        self.url = "https://api.ngdata.no/sylinder/stores/v1/basic-info?chainId=1300"
        self.headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://meny.no/"}

    def get_all_stores(self):
        response = requests.get(self.url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_store_by_city(self, city_name):
        stores = self.get_all_stores()
        return [s for s in stores if s["storeDetails"]["organization"]["city"].upper() == city_name.upper()]
```

---

## Undocumented & Advanced Features

These features were discovered through reverse engineering of the Meny web platform.

### 1. Extended Content Types

While products are the main focus, the `episearch` system handles other content types via dedicated endpoints:

| Content Type | Endpoint URL |
|--------------|--------------|
| **Recipes** | `https://platform-rest-prod.ngdata.no/api/episearch/1300/recipes` |
| **Articles** | `https://platform-rest-prod.ngdata.no/api/episearch/1300/articles` |

### 2. Advanced Sorting & Filtering

The `products` search endpoint supports several undocumented parameters for fine-tuning results.

| Parameter | Values | Description |
|-----------|--------|-------------|
| `sort` | `price:asc`, `price:desc` | Sort by price (relevance is default) |
| `popularity`| `true`, `false` | Boost popular items |
| `suggest` | `true` | Enable "did you mean" logic |

#### Special Facet Filters

| Facet Group | Example Filter |
|-------------|----------------|
| **Labels** | `facet=EnvironmentalLabels:Økologisk` |
| **Brands** | `facet=Brand:Jacobs Utvalgte` |
| **Allergens**| `facet=Allergens:melk` (Returns products without milk) |

### 3. Product Details & Recommendations

To get the most data for a single item, use the `products` detail endpoint rather than search.

**Endpoint**: `GET /api/products/1300/{store_id}/{ean}`

| Query Param | Description |
|-------------|-------------|
| `fieldset=maximal` | Returns all available metadata |
| `similar=1` | **Recommendations**: Includes a `similar` array of suggested products |

### 4. Replacement Items (Out of Stock)

Used to suggest substitutes for products that are unavailable in a specific store.

**Endpoint**: `GET /api/suggest/replacementproducts/1300/{store_id}?ids={ean}`

### 5. Type-ahead Suggestions

For building autocomplete search bars.

**Endpoint**: `GET /api/episearch/1300/querysuggestions`
**Params**: `search={term}&size=15&store_id={id}&popularity=true`

---

## Python Reference Implementation

### Full-Featured API Client

```python
import requests

class MenyProAPI:
    def __init__(self, store_id="7080001150488"):
        self.chain_id = "1300"
        self.store_id = store_id
        self.headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://meny.no/"
        }

    def get_product(self, ean):
        """Get full details + similar recommendations"""
        url = f"https://platform-rest-prod.ngdata.no/api/products/{self.chain_id}/{self.store_id}/{ean}"
        return requests.get(url, headers=self.headers, params={"similar": "1", "fieldset": "maximal"}).json()

    def get_replacements(self, ean):
        """Get substitutes for an item"""
        url = f"https://platform-rest-prod.ngdata.no/api/suggest/replacementproducts/{self.chain_id}/{self.store_id}"
        return requests.get(url, headers=self.headers, params={"ids": ean}).json()

    def search_recipes(self, query):
        url = f"https://platform-rest-prod.ngdata.no/api/episearch/{self.chain_id}/recipes"
        return requests.get(url, headers=self.headers, params={"search": query}).json()
```

---

## Error Handling

| HTTP Code | Cause | Solution |
|-----------|-------|----------|
| 200 | Success | Parse JSON response |
| 400 | Invalid parameters | Check parameter format |
| 403 | Missing/invalid headers | Add User-Agent and Referer headers |
| 500 | Pagination limit exceeded | Use category partitioning (see above) |
| 500 | Server error | Retry with exponential backoff |

---

## Data Freshness

- Product prices and availability are typically updated **daily**
- Promotions are updated based on campaign dates (usually weekly)
- Stock levels (`isOutOfStock`) are updated in near real-time

---

## Legal Notice

This API documentation is provided for educational and research purposes. The API is operated by NorgesGruppen ASA. Usage should comply with their terms of service. This documentation was created through reverse engineering of publicly accessible endpoints.

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial documentation created |
| 2026-01-17 | 1.1 | Added store mapping, replacement products, and similar items |

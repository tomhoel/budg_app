"use client";

import { ShoppingListItem } from "@/lib/deal-logic";
import { getImageUrl } from "@/lib/meny-client";
import styles from "./ShoppingList.module.css";

interface ShoppingListProps {
    recipe: any;
    items: ShoppingListItem[];
    totalCost: number;
    budget: number;
    trumfBonus: number;
}

export default function ShoppingList({ recipe, items, totalCost, budget, trumfBonus }: ShoppingListProps) {
    const isOverBudget = totalCost > budget;

    return (
        <div className={styles.container}>
            {/* Recipe Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>{recipe.title}</h2>
                <p className={styles.description}>{recipe.description}</p>
                <div className={styles.stats}>
                    <div className={styles.statTag}>👥 {recipe.people} People</div>
                    {/* Mocked Calories for MVP */}
                    <div className={styles.statTag}>🔥 ~600 kcal/portion</div>
                </div>
            </div>

            {/* Shopping List */}
            <div className={styles.list}>
                <h3 className={styles.sectionTitle}>Shopping List</h3>
                {items.map((item, idx) => (
                    <div key={idx} className={styles.item}>
                        {item.product ? (
                            <>
                                <div className={styles.imageWrapper}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getImageUrl(item.product.imagePath, "small")}
                                        alt={item.product.title}
                                        className={styles.image}
                                    />
                                </div>
                                <div className={styles.details}>
                                    <div className={styles.productTitle}>{item.product.title}</div>
                                    <div className={styles.subtitle}>{item.product.subtitle}</div>
                                    {item.product.isOffer && (
                                        <span className={styles.dealTag}>DEAL!</span>
                                    )}
                                </div>
                                <div className={styles.price}>
                                    {item.product.pricePerUnit.toFixed(2)} kr
                                </div>
                            </>
                        ) : (
                            <div className={styles.notFound}>
                                Could not find match for: {item.ingredientName}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer / Totals */}
            <div className={styles.footer}>
                <div className={styles.row}>
                    <span>Budget:</span>
                    <span>{budget} kr</span>
                </div>
                <div className={`${styles.row} ${isOverBudget ? styles.danger : styles.success}`}>
                    <span>Total:</span>
                    <span className={styles.totalPrice}>{totalCost.toFixed(2)} kr</span>
                </div>
                <div className={styles.trumf}>
                    <span className={styles.trumfIcon}>Ⓣ</span>
                    You get <strong>{trumfBonus} kr</strong> in Trumf bonus
                </div>
            </div>
        </div>
    );
}

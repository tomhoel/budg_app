"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./BudgetInput.module.css";

export default function BudgetInput() {
    const [budget, setBudget] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (budget && !isNaN(Number(budget))) {
            // Navigate to planner with budget param
            router.push(`/planner?budget=${budget}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <label className={styles.label}>
                What is your budget for this meal?
            </label>
            <div className={styles.inputWrapper}>
                <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="500"
                    className={styles.input}
                    autoFocus
                />
                <span className={styles.currency}>NOK</span>
            </div>
            <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: "2rem", fontSize: "1.2rem", padding: "16px 48px" }}
                disabled={!budget}
            >
                Start Planning
            </button>
        </form>
    );
}

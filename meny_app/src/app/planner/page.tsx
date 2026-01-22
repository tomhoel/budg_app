"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import ChatInterface from "@/components/ChatInterface";
import ShoppingList from "@/components/ShoppingList";
import { generateFinalPlan } from "@/app/actions";

function PlannerContent() {
    const searchParams = useSearchParams();
    const budget = Number(searchParams.get("budget")) || 500;

    const [mode, setMode] = useState<"CHAT" | "LOADING" | "RESULT">("CHAT");
    const [planData, setPlanData] = useState<any>(null);

    const handleChatReady = async (summary: string) => {
        setMode("LOADING");

        // Call server action
        const result = await generateFinalPlan(summary, budget);

        if (result.success) {
            setPlanData(result);
            setMode("RESULT");
        } else {
            alert("Something went wrong generating the plan. Please try again.");
            setMode("CHAT");
        }
    };

    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            gap: "2rem",
            background: "radial-gradient(circle at 50% 10%, #1e2430 0%, var(--bg-deep) 60%)"
        }}>
            <header style={{
                width: "100%",
                maxWidth: "600px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
            }}>
                <h1 style={{ fontSize: "1.5rem", color: "var(--primary)" }}>Meny Planner</h1>
                <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-full)" }}>
                    Budget: <strong>{budget} kr</strong>
                </div>
            </header>

            {mode === "CHAT" && (
                <ChatInterface budget={budget} onReady={handleChatReady} />
            )}

            {mode === "LOADING" && (
                <div style={{ textAlign: "center", marginTop: "4rem" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🍳</div>
                    <h2>Our AI Chef is cooking...</h2>
                    <p style={{ color: "var(--text-secondary)" }}>Finding the best deals at Meny for you...</p>
                </div>
            )}

            {mode === "RESULT" && planData && (
                <ShoppingList
                    recipe={planData.recipe}
                    items={planData.shoppingList}
                    totalCost={planData.totalCost}
                    budget={budget}
                    trumfBonus={planData.trumfBonus}
                />
            )}
        </main>
    );
}

export default function PlannerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PlannerContent />
        </Suspense>
    );
}

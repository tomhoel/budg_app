
import BudgetInput from "@/components/BudgetInput";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 50% 10%, #1e2430 0%, var(--bg-deep) 60%)"
    }}>
      <div className="glass-panel" style={{
        padding: "4rem",
        borderRadius: "var(--radius-lg)",
        textAlign: "center"
      }}>
        <h1 style={{ marginBottom: "0.5rem", fontSize: "2.5rem" }}>
          <span style={{ color: "var(--primary)" }}>Meny</span> Planner
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>
          Eat better, save more. Powered by AI.
        </p>

        <BudgetInput />
      </div>
    </main>
  );
}

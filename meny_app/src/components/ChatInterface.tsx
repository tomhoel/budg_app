"use client";

import { useState, useRef, useEffect } from "react";
import { submitChatMessage } from "@/app/actions";
import styles from "./ChatInterface.module.css";

interface ChatInterfaceProps {
    budget: number;
    onReady: (summary: string) => void;
}

export default function ChatInterface({ budget, onReady }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<any[]>([
        { role: "model", parts: `Hi! I see you have a budget of ${budget} NOK. Who are you cooking for today, and what kind of meal are you craving?` }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: "user", parts: input };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput("");
        setLoading(true);


        const result = await submitChatMessage(messages, input);

        if (result.success && result.response) {
            setMessages(prev => [...prev, { role: "model", parts: result.response }]);

            if (result.isReady) {
                // Collect conversation into a summary string
                const summary = newHistory.map(m => `${m.role}: ${m.parts}`).join("\n");
                onReady(summary);
            }
        } else {
            // Error handling
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.messages} ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`${styles.bubble} ${m.role === "user" ? styles.user : styles.model}`}>
                        {m.parts}
                    </div>
                ))}
                {loading && <div className={styles.loading}>Thinking...</div>}
            </div>

            <form onSubmit={handleSend} className={styles.inputArea}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer..."
                    className={styles.input}
                    autoFocus
                />
                <button type="submit" className={styles.sendBtn} disabled={loading}>
                    Send
                </button>
            </form>
        </div>
    );
}

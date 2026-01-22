
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const SYSTEM_INSTRUCTION = `
You are a smart, efficient Menu Planner for the grocery store Meny.
Your goal is to gather requirements from the user to create a perfect meal plan.
You already know their budget (passed in context).
You need to find out:
1. Who are they cooking for? (How many people/adults/kids)
2. What is the vibe/cuisine? (Quick dinner, romantic date, family feast, healthy, etc.)
3. Any allergies or dislikes?

Keep your questions short and conversational. Group questions if it feels natural, but don't overwhelm.
When you feel you have enough information to generate a recipe, end your message with the token: [READY_TO_PLAN].
`;

export async function sendChatMessage(history: { role: "user" | "model", parts: string }[], newMessage: string) {

    // Filter out initial model message if present (Gemini requires User to start)
    const validHistory = history.filter((h, i) => {
        if (i === 0 && h.role === "model") return false;
        return true;
    });

    const chat = model.startChat({
        history: validHistory.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }]
        })),
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    // If history was empty (first message), prepend system context to the message
    let finalMessage = newMessage;
    if (validHistory.length === 0) {
        finalMessage = `${SYSTEM_INSTRUCTION}\n\nUser Message: ${newMessage}`;
    }

    // Prepend system instruction logic if it's the start (Gemini Pro doesn't strictly support system prompt same way as 1.5 in all SDK versions, but we can prepend context)
    // Actually, let's just rely on the first prompt context or assume the caller handles the "context" injection.
    // For simplicity, we'll assume the interaction starts with a hidden context prompt.

    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    return response.text();
}

export async function generateRecipePlan(summary: string, budget: number) {
    const prompt = `
    Based on the following user preferences: "${summary}", and a budget of ${budget} NOK.
    
    Create a detailed recipe.
    Return ONLY a JSON object with this structure:
    {
      "title": "Recipe Title",
      "description": "Short appetizing description",
      "people": 4,
      "ingredients": [
        { "name": "Ingredient Name (generic)", "amount": "400g", "category": "Kjøtt" },
        { "name": "Another Ingredient", "amount": "1 stk", "category": "Grønt" }
      ],
      "instructions": ["Step 1", "Step 2"]
    }
    
    The ingredient names should be searchable in a Norwegian grocery store (Meny). Use Norwegian names for ingredients.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Basic cleaning of markdown code blocks if present
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse recipe JSON", e);
        throw new Error("Recipe generation failed");
    }
}

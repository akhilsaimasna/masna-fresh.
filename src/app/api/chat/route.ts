import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Shyamala, a friendly and helpful saree shopping assistant for "Shyamala Sarees" - a premium saree store based in Kalwakurthy, Telangana, India.

About the store:
- Name: Shyamala Sarees
- Location: Kalwakurthy, Telangana 509324
- WhatsApp: +91 9440653443
- Website: shyamalasarees.com
- Tagline: "మా ఇంటి నుంచే మీ ఇంటికి" (From our home to yours)

What they sell:
- Premium silk sarees (Kanjivaram, Banarasi, Gadwal, Mysore Silk)
- Bridal sarees
- Cotton sarees
- Party wear sarees
- Jewellery and Lehengas

How ordering works:
- Customers browse the website and click "WhatsApp Order" 
- The order details are sent directly to WhatsApp (+91 9440653443)
- No online payment needed - orders are confirmed via WhatsApp chat

Your job:
- Help customers find the right saree for their occasion, budget, and style
- Answer questions about saree types, fabrics, and care
- Be warm, friendly, and speak simply (customers may speak Telugu or English — respond in whichever language they use)
- Always end by encouraging them to WhatsApp for ordering or to browse the products page
- Keep responses SHORT and friendly (2-4 sentences max)
- If someone asks about price, say "prices start from ₹2,000 and go up depending on the saree — WhatsApp us for exact pricing!"
- Never make up specific prices or product details you don't know

Important: You represent a family-run traditional saree business. Be warm, personal, and trustworthy.`;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Chatbot not configured. Please contact us on WhatsApp!" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build conversation history for Gemini
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Who are you and what can you help with?" }],
                },
                {
                    role: "model",
                    parts: [{ text: SYSTEM_PROMPT + "\n\nHi! I'm Shyamala 🌸 Your personal saree assistant! I can help you find the perfect saree for any occasion. What are you looking for today?" }],
                },
                ...history,
            ],
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = result.response.text();

        return NextResponse.json({ message: response });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { message: "I'm having trouble right now 🙏 Please WhatsApp us directly at +91 9440653443 for help!" },
            { status: 200 }
        );
    }
}

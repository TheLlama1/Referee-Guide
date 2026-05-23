import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    // 1. Destructure "mode" from the request body
    const { message, mode } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const filePath = path.join(process.cwd(), "rules.pdf");
    let pdfPart = null;

    if (fs.existsSync(filePath)) {
      const pdfBuffer = fs.readFileSync(filePath);
      const base64Pdf = pdfBuffer.toString("base64");

      pdfPart = {
        inline_data: {
          mime_type: "application/pdf",
          data: base64Pdf,
        },
      };
    }

    // 2. Formulate specific prompt instructions based on the mode selected
    const toneInstruction =
      mode === "detailed"
        ? "Provide a detailed, professional rules analysis. Structure your response using clear bullet points or bold headers where appropriate. Break down any complex technical nuances, define specific terminology, and explicitly give 1-2 practical match scenarios or examples to illustrate how the rule applies on the field. Always cite the exact Law, Section, or Page number."
        : "Act as a friendly coach giving a quick rule summary. Explain the rule plainly in 2 to 3 short sentences maximum. Use simple language that players or fans can understand immediately. Do not use complex referee jargon, do not include long background context, and do not quote large walls of text. Provide only the primary Law number as a quick reference.";

    const systemInstruction =
      `You are an expert referee assistant. Use the laws of the game rulebook to answer the user's question. ` +
      `Rely strictly on this document. ${toneInstruction} Always provide the primary Law or Section number reference.`;

    const parts: any[] = [
      { text: `${systemInstruction}\n\nUser Question: ${message}` },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      },
    );

    const data = await response.json();
    const aiAnswer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I had trouble reading the rulebook.";

    return NextResponse.json({ answer: aiAnswer });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI response" },
      { status: 500 },
    );
  }
}

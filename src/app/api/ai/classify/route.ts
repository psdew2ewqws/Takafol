import { NextRequest, NextResponse } from "next/server";
import { classifyText } from "@/lib/classifier";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

interface ClassifyResponse {
  categoryId: string;
  confidence: number;
}

const CATEGORY_MAP: Record<string, string> = {
  food_essentials: "Food & Essentials / طعام ومستلزمات",
  clothing: "Clothing / ملابس",
  education: "Education & Tutoring / تعليم ودروس",
  medical: "Medical & Health / صحة وطب",
  financial: "Financial Aid / مساعدة مالية",
  transportation: "Transportation / مواصلات",
  household: "Household Items / مستلزمات منزلية",
};

const CLASSIFICATION_PROMPT = `You are a text classifier for a Jordanian community help platform (Takafol).
Classify the following text into exactly ONE of these categories:
- food_essentials: Food, meals, groceries, iftar, suhoor, cooking
- clothing: Clothes, shoes, fabric, blankets, sewing
- education: School, tutoring, books, studying, university
- medical: Health, doctors, medicine, hospitals, clinics
- financial: Money, rent, bills, debts, zakat, donations
- transportation: Rides, cars, delivery, moving, fuel
- household: Furniture, appliances, repair, plumbing, electrical, painting, cleaning

The text may be in Arabic or English. Respond with ONLY a JSON object in this exact format:
{"categoryId":"<one of the category IDs above>","confidence":<number 1-99>}

Text to classify:
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text ?? "").trim();

    if (!text || text.length < 5) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "Text too short for classification" },
        { status: 400 },
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      const fallback = classifyText(text);
      return NextResponse.json<ApiResponse<ClassifyResponse>>({ data: fallback });
    }

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${CLASSIFICATION_PROMPT}${text}` }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 100,
            },
          }),
          signal: AbortSignal.timeout(8000),
        },
      );

      if (!geminiResponse.ok) {
        logger.warn("Gemini API returned non-OK status, falling back to keyword classifier", "AIClassify", {
          status: geminiResponse.status,
        });
        const fallback = classifyText(text);
        return NextResponse.json<ApiResponse<ClassifyResponse>>({ data: fallback });
      }

      const geminiData = await geminiResponse.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const jsonMatch = rawText.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        logger.warn("Gemini response did not contain valid JSON", "AIClassify", { rawText });
        const fallback = classifyText(text);
        return NextResponse.json<ApiResponse<ClassifyResponse>>({ data: fallback });
      }

      const parsed = JSON.parse(jsonMatch[0]) as ClassifyResponse;

      if (!parsed.categoryId || !(parsed.categoryId in CATEGORY_MAP)) {
        logger.warn("Gemini returned invalid categoryId", "AIClassify", { parsed });
        const fallback = classifyText(text);
        return NextResponse.json<ApiResponse<ClassifyResponse>>({ data: fallback });
      }

      const confidence = Math.min(Math.max(Math.round(parsed.confidence), 1), 99);

      return NextResponse.json<ApiResponse<ClassifyResponse>>({
        data: { categoryId: parsed.categoryId, confidence },
      });
    } catch (aiError) {
      logger.warn("Gemini API call failed, falling back to keyword classifier", "AIClassify", {
        error: aiError instanceof Error ? aiError.message : String(aiError),
      });
      const fallback = classifyText(text);
      return NextResponse.json<ApiResponse<ClassifyResponse>>({ data: fallback });
    }
  } catch (error) {
    logger.error("Classification endpoint error", "AIClassify", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "Classification failed" },
      { status: 500 },
    );
  }
}

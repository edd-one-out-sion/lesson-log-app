// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, history } = await req.json();
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ suggestion: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 모델 명칭을 'gemini-1.5-flash'로 고정
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `당신은 프로 골퍼의 레슨 도우미입니다. 회원 ${name}의 이전 기록 ${JSON.stringify(history)}을 분석해서 오늘 레슨에서 강조할 점 1개와 드릴 1개를 2문장으로 아주 짧게 제안하세요.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ suggestion: response.text() });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ suggestion: `분석 실패: ${error.message}` }, { status: 500 });
  }
}
// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, history } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      너는 전문 골프 레슨 프로의 어시스턴트야. 
      회원명: ${name}
      최근 레슨 기록: ${JSON.stringify(history)}
      
      위 데이터를 바탕으로 프로님에게만 보여줄 짧은 분석 보고서를 작성해줘.
      1. 이 회원이 반복적으로 겪는 문제점 1가지.
      2. 오늘 레슨에서 시도해볼만한 새로운 드릴이나 해결책 1가지.
      단, 답변은 3문장 이내로 아주 간결하게 프로다운 말투로 작성해.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ suggestion: response.text() });
  } catch (error) {
    return NextResponse.json({ suggestion: "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
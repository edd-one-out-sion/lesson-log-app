// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, history } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ suggestion: "API 키 설정 누락" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 모델명을 'gemini-1.5-flash'로 정확히 지정 (혹은 'gemini-1.5-flash-latest')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      당신은 전문 골프 프로의 어시스턴트입니다.
      회원명: ${name}
      이전 기록: ${JSON.stringify(history)}
      
      이 데이터를 바탕으로 프로님에게만 보여줄 짧은 분석 보고서를 작성하세요.
      1. 반복되는 문제점 1가지.
      2. 오늘 시도해볼 새로운 드릴 1가지.
      전문가다운 말투로 2문장 이내로 작성하세요.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ suggestion: text });
  } catch (error) {
    console.error("AI Error:", error);
    // 에러 메시지를 화면에 더 자세히 띄워줍니다.
    return NextResponse.json({ suggestion: `분석 실패: ${error.message}` }, { status: 500 });
  }
}
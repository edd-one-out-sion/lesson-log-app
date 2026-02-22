// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';

export default function GolfProApp() {
  const [name, setName] = useState("");
  const [goals, setGoals] = useState(""); 
  const [remaining, setRemaining] = useState(10);
  const [points, setPoints] = useState([]);
  const [memo, setMemo] = useState("");
  const [history, setHistory] = useState([]);
  const [members, setMembers] = useState([]); // 회원 리스트 상태
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const keywords = ["힌지 유지", "수직 낙하", "배치기 방지", "체중 이동", "릴리즈 타이밍", "헤드업 금지", "에이밍"];

  useEffect(() => {
    const savedHistory = localStorage.getItem('golf-pro-v6-history');
    const savedMembers = localStorage.getItem('golf-pro-v6-members');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMembers) setMembers(JSON.parse(savedMembers));
  }, []);

  // 회원 선택 시 데이터 자동 로드
  useEffect(() => {
    if (!name.trim()) return;
    const memberHistory = history.filter(h => h.name === name);
    if (memberHistory.length > 0) {
      const last = memberHistory[0];
      setRemaining(last.remaining); 
      setGoals(last.goals || ""); 
    }
  }, [name, history]);

  // 회원 추가 기능
  const addMember = () => {
    const newName = prompt("새로운 회원 이름을 입력하세요.");
    if (newName && !members.includes(newName)) {
      const updatedMembers = [...members, newName];
      setMembers(updatedMembers);
      localStorage.setItem('golf-pro-v6-members', JSON.stringify(updatedMembers));
      setName(newName);
    }
  };

  // AI 분석 요청 (서버 액션 혹은 API 루트로 연결 필요)
  const askAI = async () => {
    if (!name) return alert("회원을 선택해주세요.");
    setIsAiLoading(true);
    
    // 이 부분은 추후 api/analyze 경로에 생성할 서버 로직과 연결됩니다.
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ name, history: history.filter(h => h.name === name) }),
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion);
    } catch (e) {
      setAiSuggestion("AI 분석은 API 설정 후 활성화됩니다. 현재는 프로님의 기록 기반 분석 모드입니다.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAndShare = () => {
    if (!name) return alert("회원 이름을 선택해주세요.");
    const newRemaining = Number(remaining) - 1;
    const report = `[레슨 리포트]\n회원: ${name}\n목표: ${goals}\n교정: ${points.join(", ") || "기본기 점검"}\n코멘트: ${memo}\n남은 레슨: ${newRemaining}회`;

    const newEntry = { id: Date.now(), name, goals, points, memo, remaining: newRemaining, date: new Date().toLocaleString() };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('golf-pro-v6-history', JSON.stringify(updated));

    if (navigator.share) {
      navigator.share({ title: '레슨 리포트', text: report });
    } else {
      navigator.clipboard.writeText(report);
      alert("복사 완료");
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto min-h-screen bg-[#0a0a0a] text-white flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#bfff00] italic uppercase">Golf Pro Log</h1>
        <button onClick={addMember} className="text-[10px] bg-[#1f1f1f] px-3 py-1 rounded-full border border-gray-800">+ 회원추가</button>
      </div>

      <div className="flex gap-2">
        <div className="flex-[3] flex flex-col gap-2">
          <select 
            className="w-full p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-sm outline-none text-white"
            value={name}
            onChange={e => setName(e.target.value)}
          >
            <option value="">회원 선택</option>
            {members.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input className="w-full p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-xs text-gray-400 outline-none" 
            placeholder="특이사항/목표" value={goals} onChange={e => setGoals(e.target.value)} />
        </div>
        <div className="flex-1 bg-[#141414] border border-[#1f1f1f] rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] text-gray-500 font-bold uppercase">Remain</span>
          <input type="number" className="w-full text-center bg-transparent text-[#ff00ff] text-2xl font-black outline-none" 
            value={remaining} onChange={e => setRemaining(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={askAI} className="w-full py-2 bg-[#1f1f1f] border border-[#bfff00]/30 text-[#bfff00] text-[10px] font-bold rounded-lg uppercase tracking-tighter">
          {isAiLoading ? "분석 중..." : "AI 코칭 대안 분석하기"}
        </button>
        {aiSuggestion && (
          <div className="p-3 bg-[#1a1a1a] border-l-2 border-[#bfff00] rounded-r-lg text-[10px] text-gray-400 leading-relaxed">
            {aiSuggestion}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {keywords.map(k => (
            <button key={k} onClick={() => setPoints(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])}
              className={`px-3 py-2 rounded-lg text-xs font-bold ${points.includes(k) ? "bg-[#bfff00] text-black" : "bg-[#141414] text-gray-400 border border-[#1f1f1f]"}`}>
              {k}
            </button>
          ))}
        </div>
        <textarea className="w-full p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-sm min-h-[100px] outline-none" 
          placeholder="오늘의 레슨 피드백..." value={memo} onChange={e => setMemo(e.target.value)} />
      </div>

      <button className="w-full py-5 bg-[#bfff00] text-black font-black rounded-2xl active:scale-95 transition-all text-lg shadow-lg" 
        onClick={handleSaveAndShare}>
        데이터 저장 및 리포트 전송
      </button>
    </main>
  );
}
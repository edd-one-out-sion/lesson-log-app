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
  const [lastLesson, setLastLesson] = useState(null);

  const keywords = ["힌지 유지", "수직 낙하", "배치기 방지", "체중 이동", "릴리즈 타이밍", "헤드업 금지", "에이밍"];

  useEffect(() => {
    const saved = localStorage.getItem('golf-pro-v5');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!name.trim()) {
      setLastLesson(null);
      setGoals("");
      return;
    }
    const memberHistory = history.filter(h => h.name === name);
    if (memberHistory.length > 0) {
      const last = memberHistory[0];
      setLastLesson(last);
      setRemaining(last.remaining); 
      setGoals(last.goals || ""); 
    }
  }, [name, history]);

  const handleSaveAndShare = () => {
    if (!name) return alert("회원 이름을 입력해줘.");
    
    const newRemaining = Number(remaining) - 1;
    const report = `[레슨 리포트]\n회원: ${name}\n목표: ${goals}\n교정: ${points.join(", ") || "기본기 점검"}\n코멘트: ${memo}\n남은 레슨: ${newRemaining}회`;

    const newEntry = { id: Date.now(), name, goals, points, memo, remaining: newRemaining, date: new Date().toLocaleString() };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('golf-pro-v5', JSON.stringify(updated));

    if (navigator.share) {
      navigator.share({ title: '레슨 리포트', text: report }).catch(() => {
        navigator.clipboard.writeText(report);
        alert("복사 완료! 카톡에 붙여넣어 줘.");
      });
    } else {
      navigator.clipboard.writeText(report);
      alert("복사 완료! 카톡에 붙여넣어 줘.");
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto min-h-screen bg-[#0a0a0a] text-white flex flex-col gap-6">
      <h1 className="text-2xl font-black text-[#bfff00] italic uppercase">Golf Pro Log</h1>

      {/* 상단: 이름/목표(좌), 남은 횟수(우) */}
      <div className="flex gap-2">
        <div className="flex-[3] flex flex-col gap-2">
          <input 
            className="w-full p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-sm outline-none focus:border-[#bfff00]" 
            placeholder="회원명" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <input 
            className="w-full p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-xs text-gray-400 outline-none" 
            placeholder="회원 특이사항/목표" 
            value={goals} 
            onChange={e => setGoals(e.target.value)} 
          />
        </div>
        <div className="flex-1 bg-[#141414] border border-[#1f1f1f] rounded-xl flex flex-col items-center justify-center">
          <span className="text-[9px] text-gray-500 font-bold uppercase">Remain</span>
          <input 
            type="number" 
            className="w-full text-center bg-transparent text-[#ff00ff] text-2xl font-black outline-none" 
            value={remaining} 
            onChange={e => setRemaining(e.target.value)} 
          />
        </div>
      </div>

      {/* 지난 레슨 요약 */}
      {lastLesson && (
        <div className="p-3 bg-[#1a1a1a] border-l-4 border-[#bfff00] rounded-r-xl">
          <p className="text-[10px] text-[#bfff00] font-bold">LAST: {lastLesson.points.join(", ")}</p>
        </div>
      )}

      {/* 키워드 및 메모 */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {keywords.map(k => (
            <button 
              key={k} 
              onClick={() => setPoints(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${points.includes(k) ? "bg-[#bfff00] text-black" : "bg-[#141414] text-gray-400 border border-[#1f1f1f]"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <textarea 
          className="w-full p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-sm min-h-[100px] outline-none" 
          placeholder="오늘의 레슨 피드백..." 
          value={memo} 
          onChange={e => setMemo(e.target.value)} 
        />
      </div>

      <button 
        className="w-full py-5 bg-[#bfff00] text-black font-black rounded-2xl active:scale-95 transition-all text-lg" 
        onClick={handleSaveAndShare}
      >
        데이터 저장 및 리포트 전송
      </button>

      {/* 히스토리 목록 */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Recent Activity</h2>
        {history.slice(0, 5).map(h => (
          <div key={h.id} className="p-3 bg-[#141414] border border-[#1f1f1f] rounded-lg flex justify-between items-center mb-2">
            <div className="text-xs">
              <p className="font-bold">{h.name}</p>
              <p className="text-[10px] text-gray-500 truncate w-32">{h.goals || "목표 없음"}</p>
            </div>
            <span className="text-[10px] text-[#ff00ff] font-bold">{h.remaining}회 남음</span>
          </div>
        ))}
      </div>
    </main>
  );
}
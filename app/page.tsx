"use client";
import React, { useState, useEffect } from 'react';

// 레슨 데이터의 형식을 정의합니다
interface Lesson {
  id: number;
  name: string;
  trait: string;
  points: string[];
  memo: string;
  date: string;
}

export default function LessonLog() {
  const [name, setName] = useState("");
  const [trait, setTrait] = useState(""); // 회원 특징
  const [points, setPoints] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [history, setHistory] = useState<Lesson[]>([]);

  const options = ["스윙 궤도", "체중 이동", "그립 교정", "임팩트", "피니시", "에이밍"];

  // 1. 앱을 켰을 때 저장된 과거 기록을 불러옵니다 (무료)
  useEffect(() => {
    const saved = localStorage.getItem('lesson-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const togglePoint = (p: string) => {
    setPoints(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  // 2. 저장 및 전송 로직
  const handleSaveAndShare = () => {
    if (!name) return alert("이름을 입력해주세요.");

    const newLesson: Lesson = {
      id: Date.now(),
      name,
      trait,
      points,
      memo,
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    };

    // 히스토리 최상단에 추가하고 저장
    const updatedHistory = [newLesson, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('lesson-history', JSON.stringify(updatedHistory));

    // 전송용 텍스트 생성
    const fullText = `오늘 ${name}님(${trait}) 레슨 요약\n📍포인트: ${points.join(", ") || "없음"}\n📝메모: ${memo}\n오늘도 수고하셨습니다!`;

    if (navigator.share) {
      navigator.share({ title: '레슨 리포트', text: fullText });
    } else {
      navigator.clipboard.writeText(fullText);
      alert("기록이 저장되었고 내용이 복사되었습니다. 카톡에 붙여넣으세요!");
    }
  };

  // 3. 히스토리에서 이름을 클릭하면 자동 완성해주는 기능
  const loadMember = (item: Lesson) => {
    setName(item.name);
    setTrait(item.trait);
  };

  return (
    <main className="p-6 max-w-md mx-auto min-h-screen flex flex-col gap-8 bg-background text-foreground">
      <h1 className="text-3xl font-black text-primary tracking-tighter">Lesson Manager</h1>
      
      {/* 입력 섹션 */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <input 
            className="p-4 bg-card border border-border rounded-xl outline-none focus:border-primary text-sm"
            placeholder="회원 이름" 
            value={name}
            onChange={e => setName(e.target.value)} 
          />
          <input 
            className="p-4 bg-card border border-border rounded-xl outline-none focus:border-primary text-sm"
            placeholder="특징 (예: 슬라이스)" 
            value={trait}
            onChange={e => setTrait(e.target.value)} 
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map(o => (
            <button 
              key={o} 
              onClick={() => togglePoint(o)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                points.includes(o) ? "bg-primary text-black border-primary" : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        <textarea 
          className="w-full p-4 bg-card border border-border rounded-xl min-h-[80px] outline-none text-sm"
          placeholder="오늘의 상세 피드백"
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />

        <button 
          className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
          onClick={handleSaveAndShare}
        >
          기록 저장 및 전송
        </button>
      </div>

      {/* 리스트 섹션: 카톡방을 뒤질 필요가 없어집니다 */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary rounded-full"></span>
          최근 레슨 히스토리
        </h2>
        
        <div className="flex flex-col gap-3">
          {history.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground text-sm">아직 기록이 없습니다.</p>
          ) : (
            history.map(item => (
              <div 
                key={item.id} 
                onClick={() => loadMember(item)}
                className="p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm">{item.name} <span className="text-primary text-[10px] ml-1">{item.trait}</span></span>
                  <span className="text-[10px] text-muted-foreground">{item.date}</span>
                </div>
                <div className="text-[11px] text-foreground/80 leading-relaxed line-clamp-2">
                  {item.points.join(", ")} | {item.memo}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
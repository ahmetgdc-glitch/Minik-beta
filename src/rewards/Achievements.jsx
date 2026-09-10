import React from 'react';
import { Check, Lock, Medal } from 'lucide-react';
import { Art } from '../components/Visual.jsx';
import { achievementState } from './achievements.js';

export default function Achievements({progress}){
  const lang=progress.settings.lang;
  const items=achievementState(progress);
  const unlocked=items.filter(x=>x.unlocked).length;
  return <section className="achievement-section">
    <div className="section-heading achievement-heading">
      <div>
        <span className="eyebrow">{lang==='tr'?'Başarıların':'Deine Erfolge'}</span>
        <h2>{lang==='tr'?'Mino madalyaları':'Minos Medaillen'}</h2>
        <p>{lang==='tr'?'Oynadıkça ve öğrendikçe yeni madalyalar açılır.':'Beim Spielen und Lernen schaltest du neue Medaillen frei.'}</p>
      </div>
      <span className="achievement-count"><Medal size={20}/>{unlocked} / {items.length}</span>
    </div>
    <div className="achievement-grid">
      {items.map(a=><article key={a.id} className={`achievement-card ${a.unlocked?'unlocked':''}`}>
        <div className="achievement-art"><Art name={a.asset}/>{a.unlocked?<span className="achievement-check"><Check size={17}/></span>:<span className="achievement-lock"><Lock size={16}/></span>}</div>
        <h3>{lang==='tr'?a.tr:a.de}</h3>
        <p>{lang==='tr'?a.textTr:a.textDe}</p>
      </article>)}
    </div>
  </section>
}

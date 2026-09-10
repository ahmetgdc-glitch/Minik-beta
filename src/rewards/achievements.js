export const achievements = [
  { id:'first-star', asset:'glowing-star', de:'Erster Stern', tr:'İlk yıldız', textDe:'Sammle deinen ersten Stern.', textTr:'İlk yıldızını topla.', test:p=>p.stars>=1 },
  { id:'star-25', asset:'star', de:'Sternensammler', tr:'Yıldız avcısı', textDe:'Sammle 25 Sterne.', textTr:'25 yıldız topla.', test:p=>p.stars>=25 },
  { id:'star-100', asset:'trophy', de:'Sternenprofi', tr:'Yıldız ustası', textDe:'Sammle 100 Sterne.', textTr:'100 yıldız topla.', test:p=>p.stars>=100 },
  { id:'five-sessions', asset:'game-die', de:'Spielentdecker', tr:'Oyun kâşifi', textDe:'Beende 5 Spiele.', textTr:'5 oyunu tamamla.', test:p=>p.sessions.filter(s=>s.completed).length>=5 },
  { id:'twenty-sessions', asset:'puzzle-piece', de:'Spielprofi', tr:'Oyun ustası', textDe:'Beende 20 Spiele.', textTr:'20 oyunu tamamla.', test:p=>p.sessions.filter(s=>s.completed).length>=20 },
  { id:'learn-10', asset:'brain', de:'Schlaukopf', tr:'Akıllı minik', textDe:'Lerne 10 Begriffe sicher.', textTr:'10 kelimeyi iyice öğren.', test:p=>Object.values(p.mastery).filter(x=>(x?.independent||0)>=3).length>=10 },
  { id:'learn-50', asset:'brain', de:'Wissensschatz', tr:'Bilgi hazinesi', textDe:'Lerne 50 Begriffe sicher.', textTr:'50 kelimeyi iyice öğren.', test:p=>Object.values(p.mastery).filter(x=>(x?.independent||0)>=3).length>=50 },
  { id:'streak-5', asset:'fire', de:'5 am Stück', tr:'5 doğru üst üste', textDe:'Schaffe 5 richtige Antworten hintereinander.', textTr:'Arka arkaya 5 doğru cevap ver.', test:p=>p.bestStreak>=5 },
  { id:'streak-15', asset:'high-voltage', de:'Super-Serie', tr:'Süper seri', textDe:'Schaffe 15 richtige Antworten hintereinander.', textTr:'Arka arkaya 15 doğru cevap ver.', test:p=>p.bestStreak>=15 },
  { id:'worlds-3', asset:'star', de:'Weltenbummler', tr:'Dünya gezgini', textDe:'Spiele in 3 verschiedenen Lernwelten.', textTr:'3 farklı öğrenme dünyasında oyna.', test:p=>new Set(p.sessions.filter(s=>s.completed).map(s=>s.worldId)).size>=3 },
  { id:'games-5', asset:'game-die', de:'Alles ausprobiert', tr:'Her şeyi denedim', textDe:'Probiere 5 verschiedene Spielarten.', textTr:'5 farklı oyun türünü dene.', test:p=>new Set(p.sessions.filter(s=>s.completed).map(s=>s.gameId)).size>=5 },
  { id:'treasure-5', asset:'wrapped-gift', de:'Schatzhüter', tr:'Hazine koruyucusu', textDe:'Öffne 5 Aquarium-Schätze.', textTr:'5 akvaryum hazinesi aç.', test:p=>p.inventory.length>=5 },
];

export function achievementState(progress){
  return achievements.map(a=>({...a, unlocked:!!a.test(progress)}));
}

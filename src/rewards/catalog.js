export const rewards = [
  { id:"shell", stars:5, asset:"spiral-shell", de:"Glitzermuschel", tr:"Parlak deniz kabuğu" },
  { id:"coral", stars:10, asset:"sunflower", de:"Meeresblume", tr:"Deniz çiçeği" },
  { id:"friend", stars:20, asset:"blowfish", de:"Minos Kugelfisch-Freund", tr:"Mino’nun balon balığı arkadaşı" },
  { id:"crown", stars:35, asset:"crown", de:"Minos Krone", tr:"Mino’nun tacı" },
  { id:"castle", stars:50, asset:"castle", de:"Unterwasserschloss", tr:"Su altı şatosu" },
  { id:"rainbow", stars:70, asset:"rainbow", de:"Meeresregenbogen", tr:"Deniz gökkuşağı" },
  { id:"star", stars:90, asset:"glowing-star", de:"Leuchtstern", tr:"Parlayan yıldız" },
  { id:"turtle", stars:120, asset:"turtle", de:"Schildkrötenfreund", tr:"Kaplumbağa arkadaşı" },
  { id:"dolphin", stars:150, asset:"dolphin", de:"Delfinfreund", tr:"Yunus arkadaşı" },
  { id:"island", stars:180, asset:"desert-island", de:"Minos Insel", tr:"Mino’nun adası" },
  { id:"gem", stars:220, asset:"gem-stone", de:"Ozean-Juwel", tr:"Okyanus mücevheri" },
  { id:"rocket", stars:260, asset:"rocket", de:"Blasen-Rakete", tr:"Baloncuk roketi" },
  { id:"trophy", stars:300, asset:"trophy", de:"Ozean-Pokal", tr:"Okyanus kupası" },
];
export const nextReward = (state) => rewards.find((r) => !state.inventory.includes(r.id));
export const claimableRewards = (state) => rewards.filter((r) => r.stars <= state.stars && !state.inventory.includes(r.id));

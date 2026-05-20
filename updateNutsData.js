const fs = require('fs');

let data = fs.readFileSync('app/data/nutsData.ts', 'utf8');

if (!data.includes("rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythic';")) {
  data = data.replace(
    'allergyInfo: string;',
    "allergyInfo: string;\n  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythic';"
  );
}

const rarityMap = {
  6: 'Common', 11: 'Common', 12: 'Common', 15: 'Common', 16: 'Common', 18: 'Common',
  0: 'Uncommon', 2: 'Uncommon', 4: 'Uncommon', 13: 'Uncommon', 14: 'Uncommon',
  3: 'Rare', 5: 'Rare', 7: 'Rare', 10: 'Rare',
  1: 'Legendary', 8: 'Legendary', 9: 'Legendary',
  17: 'Mythic', 19: 'Mythic'
};

const entries = data.match(/\{\s*id: \d+,[\s\S]*?\},/g);
if (entries) {
  entries.forEach(entry => {
    const idMatch = entry.match(/id: (\d+),/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const rarity = rarityMap[id];
      if (rarity && !entry.includes(`rarity: '`)) {
        let newEntry = entry.replace(/(\s*)\},$/, `$1  rarity: '${rarity}',$1},`);
        data = data.replace(entry, newEntry);
      }
    }
  });
}
// Handle the last entry which might not have a trailing comma
const lastEntry = data.match(/\{\s*id: 19,[\s\S]*?\}\n\];/);
if (lastEntry && !lastEntry[0].includes(`rarity: '`)) {
  const newLastEntry = lastEntry[0].replace(/(\s*)\}\n\];/, `$1  rarity: 'Mythic',\n  }\n];`);
  data = data.replace(lastEntry[0], newLastEntry);
}

fs.writeFileSync('app/data/nutsData.ts', data);
console.log('Updated nutsData.ts successfully.');

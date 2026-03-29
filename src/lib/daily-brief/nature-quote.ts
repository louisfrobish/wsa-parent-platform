const NATURE_QUOTES = [
  { quote: "In every walk with nature one receives far more than he seeks.", author: "John Muir" },
  { quote: "Study nature, love nature, stay close to nature.", author: "Frank Lloyd Wright" },
  { quote: "Look deep into nature, and then you will understand everything better.", author: "Albert Einstein" },
  { quote: "The poetry of the earth is never dead.", author: "John Keats" },
  { quote: "Nature is pleased with simplicity.", author: "Isaac Newton" }
];

export function getNatureQuoteForDate(requestDate: string) {
  return NATURE_QUOTES[stableIndex(requestDate, NATURE_QUOTES.length)];
}

function stableIndex(seed: string, length: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}

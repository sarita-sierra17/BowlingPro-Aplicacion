export type BowlingFrame = {
  number: number;
  rolls: number[];
  score: number | null;
  total: number | null;
};

export function nextRollLimit(rolls: number[]): number | null {
  let cursor = 0;

  for (let frame = 0; frame < 9; frame += 1) {
    const first = rolls[cursor];
    if (first === undefined) return 10;
    if (first === 10) {
      cursor += 1;
      continue;
    }
    const second = rolls[cursor + 1];
    if (second === undefined) return 10 - first;
    cursor += 2;
  }

  const finalRolls = rolls.slice(cursor);
  const first = finalRolls[0];
  if (first === undefined) return 10;
  if (first === 10) return finalRolls.length < 3 ? 10 : null;

  const second = finalRolls[1];
  if (second === undefined) return 10 - first;
  if (first + second === 10) return finalRolls.length < 3 ? 10 : null;
  return null;
}

export function scoreGame(rolls: number[]): number {
  let cursor = 0;
  let score = 0;

  for (let frame = 0; frame < 9; frame += 1) {
    const first = rolls[cursor] ?? 0;
    if (first === 10) {
      score += 10 + (rolls[cursor + 1] ?? 0) + (rolls[cursor + 2] ?? 0);
      cursor += 1;
      continue;
    }

    const second = rolls[cursor + 1] ?? 0;
    if (first + second === 10) {
      score += 10 + (rolls[cursor + 2] ?? 0);
    } else {
      score += first + second;
    }
    cursor += 2;
  }

  return score + rolls.slice(cursor).reduce((total, pins) => total + pins, 0);
}

export function getFrames(rolls: number[]): BowlingFrame[] {
  const frames: BowlingFrame[] = [];
  let cursor = 0;
  let cumulative = 0;
  let cumulativeKnown = true;

  for (let frame = 0; frame < 9; frame += 1) {
    const first = rolls[cursor];
    if (first === undefined) {
      frames.push({ number: frame + 1, rolls: [], score: null, total: null });
      cumulativeKnown = false;
      continue;
    }

    let frameRolls: number[];
    let frameScore: number | null;
    if (first === 10) {
      frameRolls = [first];
      const bonusOne = rolls[cursor + 1];
      const bonusTwo = rolls[cursor + 2];
      frameScore = bonusOne === undefined || bonusTwo === undefined ? null : 10 + bonusOne + bonusTwo;
      cursor += 1;
    } else {
      const second = rolls[cursor + 1];
      frameRolls = second === undefined ? [first] : [first, second];
      if (second === undefined) {
        frameScore = null;
      } else if (first + second === 10) {
        const bonus = rolls[cursor + 2];
        frameScore = bonus === undefined ? null : 10 + bonus;
      } else {
        frameScore = first + second;
      }
      if (second !== undefined) cursor += 2;
    }

    if (frameScore === null) cumulativeKnown = false;
    else cumulative += frameScore;
    frames.push({
      number: frame + 1,
      rolls: frameRolls,
      score: frameScore,
      total: cumulativeKnown ? cumulative : null,
    });
  }

  const finalRolls = rolls.slice(cursor, cursor + 3);
  const first = finalRolls[0];
  const second = finalRolls[1];
  let finalScore: number | null = null;
  if (first !== undefined && second !== undefined) {
    if (first === 10 || first + second === 10) {
      if (finalRolls[2] !== undefined) finalScore = first + second + finalRolls[2];
    } else {
      finalScore = first + second;
    }
  }
  if (finalScore === null) cumulativeKnown = false;
  else cumulative += finalScore;
  frames.push({
    number: 10,
    rolls: finalRolls,
    score: finalScore,
    total: cumulativeKnown ? cumulative : null,
  });

  return frames;
}

export function rollLabel(rolls: number[], index: number, frameNumber?: number): string {
  const value = rolls[index];
  if (value === undefined) return "";
  if (value === 10) return "X";
  if (value === 0) return "–";
  const isTenthBonus = frameNumber === 10 && index === 2;
  if (!isTenthBonus && index > 0 && rolls[index - 1] !== 10 && rolls[index - 1] + value === 10) return "/";
  return String(value);
}

export function bestStrikeRun(rolls: number[]): number {
  let current = 0;
  let best = 0;
  for (const roll of rolls) {
    current = roll === 10 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}
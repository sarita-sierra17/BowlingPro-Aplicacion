import { describe, expect, it } from 'vitest';
import { getFrames, nextRollLimit, rollLabel, scoreGame } from './scoring';

describe('official ten-pin scoring', () => {
  it('scores a perfect game as 300', () => {
    expect(scoreGame(Array(12).fill(10))).toBe(300);
  });

  it('awards strike bonuses from the next two rolls', () => {
    const rolls = [10, 7, 2, ...Array(16).fill(0)];
    expect(getFrames(rolls)[0]).toMatchObject({ score: 19, total: 19 });
  });

  it('awards the next roll as a spare bonus', () => {
    const rolls = [5, 5, 7, 2, ...Array(14).fill(0)];
    expect(getFrames(rolls)[0]).toMatchObject({ score: 17, total: 17 });
  });

  it('scores ten consecutive spares as 150', () => {
    const rolls = [...Array(9).fill([5, 5]).flat(), 5, 5, 5];
    expect(scoreGame(rolls)).toBe(150);
  });

  it('tracks valid roll limits in the tenth frame', () => {
    const nineStrikes = Array(9).fill(10);
    expect(nextRollLimit([...nineStrikes, 10])).toBe(10);
    expect(nextRollLimit([...nineStrikes, 8])).toBe(2);
    expect(nextRollLimit([...nineStrikes, 8, 2])).toBe(10);
    expect(nextRollLimit([...nineStrikes, 8, 1])).toBeNull();
  });

  it('uses a number instead of spare notation on a tenth-frame bonus ball', () => {
    expect(rollLabel([10, 5, 5], 2, 10)).toBe('5');
    expect(rollLabel([5, 5, 7], 1, 10)).toBe('/');
  });
});
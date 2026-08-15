/**
 * T091: unit tests for src/build/support-string.ts's generateSupportString, previously 0%
 * covered (the port relied entirely on Gate 1's byte-identical build diff for verification).
 */
import { describe, it, expect } from 'vitest';
import { generateSupportString } from '../../src/build/support-string';

describe('generateSupportString (single value)', () => {
  it.each([
    ['y', 'ye', 'yes'],
    ['n', 'no', 'none'],
    ['p', 'pa', 'partial'],
    ['na', 'na', 'not applicable'],
    ['u', 'un', 'unknown'],
    ['garbage', 'un', 'unknown'],
  ])('%s -> class %s, string %s', (input, cls, str) => {
    expect(generateSupportString(input)).toEqual({ class: cls, string: str });
  });
});

describe('generateSupportString (array)', () => {
  it('empty array is unknown', () => {
    expect(generateSupportString([])).toEqual({ class: 'un', string: 'unknown' });
  });

  it('all-na collapses to not applicable', () => {
    expect(generateSupportString(['na', 'na'])).toEqual({ class: 'na', string: 'not applicable' });
  });

  it('na values are filtered before comparison', () => {
    expect(generateSupportString(['na', 'y', 'y'])).toEqual({ class: 'ye', string: 'supported' });
  });

  it('all non-na values equal and passing is fully supported', () => {
    expect(generateSupportString(['y', 'y', 'y'])).toEqual({ class: 'ye', string: 'supported' });
  });

  it('all non-na values equal and not "y" delegates to the single-value case', () => {
    expect(generateSupportString(['n', 'n'])).toEqual({ class: 'no', string: 'none' });
  });

  it('mix of pass and unknown reports the unknown count (singular)', () => {
    expect(generateSupportString(['y', 'y', 'u'])).toEqual({ class: 'pa', string: 'supported with 1 unknown result' });
  });

  it('mix of pass and unknown reports the unknown count (plural)', () => {
    expect(generateSupportString(['y', 'u', 'u'])).toEqual({ class: 'pa', string: 'supported with 2 unknown results' });
  });

  it('any passing result among mixed values reports a fraction', () => {
    expect(generateSupportString(['y', 'n', 'p'])).toEqual({ class: 'pa', string: 'partial (1/3)' });
  });

  it('no passing but some partial reports "some partial support"', () => {
    expect(generateSupportString(['p', 'n'])).toEqual({ class: 'pa', string: 'some partial support' });
  });

  it('no passing, no partial, any failing reports no known support', () => {
    expect(generateSupportString(['n', 'n'])).toEqual({ class: 'no', string: 'none' });
    // three distinct non-na values with no y/p forces the mixed-value branch
    expect(generateSupportString(['n', 'u'])).toEqual({ class: 'no', string: 'no known support' });
  });

  it('no passing, no partial, no failing falls through to unknown support', () => {
    expect(generateSupportString(['u', 'garbage'])).toEqual({ class: 'un', string: 'unknown support' });
  });
});

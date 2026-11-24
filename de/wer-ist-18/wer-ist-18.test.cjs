const assert = require('node:assert/strict');
const test = require('node:test');
const { parse, anniversary } = require('../../calendar.js');
const birthPeriod = require('./wer-ist-18.js');

for (const [asOf, age, birthday, start] of [
  ['2026-11-24', 18, '2008-11-24', '2007-11-25'],
  ['2028-02-29', 18, '2010-02-28', '2009-03-01'],
  ['2026-02-28', 18, '2008-02-28', '2007-03-01'],
  ['2026-03-01', 18, '2008-03-01', '2007-03-02'],
  ['2028-02-29', 4, '2024-02-29', '2023-03-01'],
  ['2026-01-01', 1, '2025-01-01', '2024-01-02'],
  ['2026-12-31', 120, '1906-12-31', '1906-01-01']
]) {
  test(`${age} years on ${asOf}`, () => {
    const date = parse(asOf);
    const original = date.getTime();
    assert.deepEqual(birthPeriod(age, date), {
      birthday: parse(birthday), start: parse(start), end: parse(birthday)
    });
    assert.equal(date.getTime(), original);
  });
}

test('leap-day birth uses February 28 for a non-leap anniversary', () => {
  const birth = parse('2008-02-29');
  assert.deepEqual(anniversary(birth, 2025), parse('2025-02-28'));
  // The requested inverse formula clamps the reference date independently.
  assert.deepEqual(birthPeriod(17, anniversary(birth, 2025)), {
    birthday: parse('2008-02-28'),
    start: parse('2007-03-01'),
    end: parse('2008-02-28')
  });
});

test('invalid ages throw a range error', () => {
  for (const age of [0, -1, 121, 18.5, NaN, Infinity, '18', null]) {
    assert.throws(() => birthPeriod(age, parse('2026-11-24')), RangeError);
  }
});

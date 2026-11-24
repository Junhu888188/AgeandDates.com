const assert = require('node:assert/strict');
const test = require('node:test');
const { parse } = require('../../calendar.js');
const ageInMonths = require('./alter-in-monaten.js');

for (const [birth, asOf, months, days] of [
  ['2023-01-31', '2023-02-28', 1, 0],
  ['2024-01-31', '2024-02-28', 0, 28],
  ['2024-01-31', '2024-02-29', 1, 0],
  ['2023-01-31', '2023-03-30', 1, 30],
  ['2023-01-31', '2023-03-31', 2, 0],
  ['2024-02-29', '2025-02-28', 12, 0],
  ['2024-02-29', '2025-03-01', 12, 1],
  ['2024-02-29', '2028-02-29', 48, 0],
  ['2026-06-05', '2026-06-05', 0, 0],
  ['2026-06-05', '2026-06-20', 0, 15],
  ['2024-06-05', '2026-06-05', 24, 0],
  ['1990-03-15', '2024-07-24', 412, 9]
]) {
  test(`${birth} to ${asOf} is ${months} months and ${days} days`, () => {
    assert.deepEqual(ageInMonths(parse(birth), parse(asOf)), { months, days });
  });
}

test('a reference date before birth has no result', () => {
  assert.equal(ageInMonths(parse('2026-06-05'), parse('2026-06-04')), null);
});

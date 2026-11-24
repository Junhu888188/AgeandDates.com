(() => {
  'use strict';
  const calendar = typeof window === 'undefined' ? require('../../calendar.js') : window.ADCalendar;

  function ageInMonths(birthDate, asOfDate) {
    const age = calendar.age(birthDate, asOfDate);
    if (!age) return null;
    return { months: age.y * 12 + age.m, days: age.d };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ageInMonths;
    return;
  }

  const form = document.getElementById('month-form');
  const birthInput = document.getElementById('birth-date');
  const asOfInput = document.getElementById('as-of-date');
  const output = document.getElementById('month-result');

  function parseGermanDate(value) {
    // The numeric keyboard also allows TTMMJJJJ without dots.
    const parts = /^(\d{2})(\.?)(\d{2})\2(\d{4})$/.exec(value.trim());
    return parts && calendar.parse(`${parts[4]}-${parts[3]}-${parts[1]}`);
  }

  asOfInput.value = calendar.iso(calendar.today()).split('-').reverse().join('.');
  form.addEventListener('input', () => {
    birthInput.setCustomValidity('');
    asOfInput.setCustomValidity('');
    output.value = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const birthDate = parseGermanDate(birthInput.value);
    const asOfDate = parseGermanDate(asOfInput.value);
    if (!birthDate || !asOfDate) {
      const input = birthDate ? asOfInput : birthInput;
      input.setCustomValidity('Gib ein gültiges Datum im Format TT.MM.JJJJ ein.');
      input.reportValidity();
      return;
    }
    const result = ageInMonths(birthDate, asOfDate);
    if (!result) {
      asOfInput.setCustomValidity('Der Stichtag darf nicht vor dem Geburtsdatum liegen.');
      asOfInput.reportValidity();
      return;
    }
    const { months, days } = result;
    output.value = `${months} ${months === 1 ? 'Monat' : 'Monate'} und ${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  });
})();

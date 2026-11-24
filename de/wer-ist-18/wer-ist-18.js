(() => {
  'use strict';
  const calendar = typeof window === 'undefined' ? require('../../calendar.js') : window.ADCalendar;

  function birthPeriod(age, asOfDate) {
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      throw new RangeError('Das Alter muss eine ganze Zahl zwischen 1 und 120 sein.');
    }
    const birthday = calendar.anniversary(asOfDate, asOfDate.getUTCFullYear() - age);
    const start = calendar.anniversary(asOfDate, asOfDate.getUTCFullYear() - age - 1);
    start.setUTCDate(start.getUTCDate() + 1);
    return { birthday, start, end: new Date(birthday) };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = birthPeriod;
    return;
  }

  const form = document.getElementById('age-form');
  const ageInput = document.getElementById('age');
  const asOfInput = document.getElementById('as-of-date');
  const output = document.getElementById('age-result');
  const lead = Array.from(document.querySelectorAll('p')).find(paragraph =>
    paragraph.textContent.trim() === 'Berechne, wer an einem bestimmten Stichtag genau Geburtstag hat und welcher Geburtszeitraum zu einem Alter gehört.');

  function parseGermanDate(value) {
    const parts = /^(\d{2})(\.?)(\d{2})\2(\d{4})$/.exec(value.trim());
    return parts && calendar.parse(`${parts[4]}-${parts[3]}-${parts[1]}`);
  }

  function format(date) {
    return calendar.iso(date).split('-').reverse().join('.');
  }

  const today = calendar.today();
  asOfInput.value = format(today);
  const initial = birthPeriod(18, today);
  if (lead) lead.append(` Heute, am ${format(today)}, sind nach dieser Kalenderrechnung alle vom ${format(initial.start)} bis zum ${format(initial.end)} Geborenen 18 Jahre alt.`);

  form.addEventListener('input', () => {
    ageInput.setCustomValidity('');
    asOfInput.setCustomValidity('');
    output.value = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const asOfDate = parseGermanDate(asOfInput.value);
    if (!asOfDate) {
      asOfInput.setCustomValidity('Gib ein gültiges Datum im Format TT.MM.JJJJ ein.');
      asOfInput.reportValidity();
      return;
    }
    const age = Number(ageInput.value);
    let result;
    try {
      result = birthPeriod(age, asOfDate);
    } catch (error) {
      ageInput.setCustomValidity(error.message);
      ageInput.reportValidity();
      return;
    }
    output.value = `Am Stichtag genau ${age} geworden: geboren am ${format(result.birthday)}\nAm Stichtag ${age} Jahre alt: geboren zwischen ${format(result.start)} und ${format(result.end)}`;
  });
})();

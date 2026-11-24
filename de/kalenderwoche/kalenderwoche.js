(() => {
  'use strict';
  const { today, parse, iso, isoWeek, addDays } = window.ADCalendar;
  const input = document.getElementById('week-date');
  const heading = document.getElementById('week-number');
  const list = document.getElementById('week-days');
  const dateFormat = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });

  function showWeek() {
    const selected = parse(input.value);
    list.replaceChildren();
    list.hidden = !selected;
    if (!selected) {
      heading.textContent = 'Wähle ein gültiges Datum.';
      return;
    }
    const { year, week, monday, sunday } = isoWeek(selected);
    heading.textContent = `KW ${week} im ISO-Wochenjahr ${year}`;
    for (let day = monday; day <= sunday; day = addDays(day, 1)) {
      const item = document.createElement('li');
      const time = document.createElement('time');
      time.dateTime = iso(day);
      time.textContent = dateFormat.format(day);
      if (time.dateTime === input.value) {
        const selectedDay = document.createElement('strong');
        selectedDay.append(time);
        item.append(selectedDay);
      } else {
        item.append(time);
      }
      list.append(item);
    }
  }

  const current = today();
  document.querySelector('.local-lead').textContent =
    `Heute ist KW ${isoWeek(current).week} (${dateFormat.format(current)}).`;
  input.value = iso(current);
  input.addEventListener('input', showWeek);
  showWeek();
})();

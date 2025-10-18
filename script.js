const userNameInput = document.getElementById('userName');
const monthPicker = document.getElementById('monthPicker');
const loadDataBtn = document.getElementById('loadData');
const mealTable = document.getElementById('mealTable');
const summary = document.getElementById('summary');
const markBreakfastBtn = document.getElementById('markBreakfast');
const markDinnerBtn = document.getElementById('markDinner');
const exportCsvBtn = document.getElementById('exportCsv');
const clearDataBtn = document.getElementById('clearData');

function getStorageKey(name, month) {
  return `mealTracker::${name.toLowerCase()}::${month}`;
}

function loadMealData(name, month) {
  const data = localStorage.getItem(getStorageKey(name, month));
  return data ? JSON.parse(data) : {};
}

function saveMealData(name, month, data) {
  localStorage.setItem(getStorageKey(name, month), JSON.stringify(data));
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildTable() {
  const name = userNameInput.value.trim();
  const monthValue = monthPicker.value;
  if (!name || !monthValue) {
    mealTable.innerHTML = '<tr><td>Please enter name and select a month.</td></tr>';
    return;
  }

  const [year, month] = monthValue.split('-').map(Number);
  const data = loadMealData(name, monthValue);
  const days = daysInMonth(year, month - 1);

  mealTable.innerHTML = '';
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Day</th><th>Breakfast</th><th>Dinner</th>';
  mealTable.appendChild(headerRow);

  let breakfastCount = 0;
  let dinnerCount = 0;

  for (let d = 1; d <= days; d++) {
    const row = document.createElement('tr');
    const dayCell = document.createElement('td');
    dayCell.textContent = d;

    const breakfastCell = document.createElement('td');
    breakfastCell.textContent = data[d]?.breakfast ? '✔️' : '—';
    breakfastCell.classList.toggle('breakfast', !!data[d]?.breakfast);

    const dinnerCell = document.createElement('td');
    dinnerCell.textContent = data[d]?.dinner ? '✔️' : '—';
    dinnerCell.classList.toggle('dinner', !!data[d]?.dinner);

    if (data[d]?.breakfast) breakfastCount++;
    if (data[d]?.dinner) dinnerCount++;

    breakfastCell.addEventListener('click', () => {
      data[d] = data[d] || {};
      data[d].breakfast = !data[d].breakfast;
      saveMealData(name, monthValue, data);
      buildTable();
    });

    dinnerCell.addEventListener('click', () => {
      data[d] = data[d] || {};
      data[d].dinner = !data[d].dinner;
      saveMealData(name, monthValue, data);
      buildTable();
    });

    row.appendChild(dayCell);
    row.appendChild(breakfastCell);
    row.appendChild(dinnerCell);
    mealTable.appendChild(row);
  }

  summary.innerHTML = `<strong>${name}</strong> in ${monthValue}: Breakfasts = ${breakfastCount}, Dinners = ${dinnerCount}`;
}

loadDataBtn.addEventListener('click', buildTable);

markBreakfastBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  const monthValue = monthPicker.value;
  if (!name || !monthValue) return alert('Enter name and select month');
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  if (monthValue !== currentMonth) return alert('Month not current');

  const data = loadMealData(name, monthValue);
  const day = today.getDate();
  data[day] = data[day] || {};
  data[day].breakfast = true;
  saveMealData(name, monthValue, data);
  buildTable();
});

markDinnerBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  const monthValue = monthPicker.value;
  if (!name || !monthValue) return alert('Enter name and select month');
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  if (monthValue !== currentMonth) return alert('Month not current');

  const data = loadMealData(name, monthValue);
  const day = today.getDate();
  data[day] = data[day] || {};
  data[day].dinner = true;
  saveMealData(name, monthValue, data);
  buildTable();
});

exportCsvBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  const monthValue = monthPicker.value;
  if (!name || !monthValue) return alert('Enter name and select month');

  const data = loadMealData(name, monthValue);
  let csv = 'Day,Breakfast,Dinner\n';
  for (let d in data) {
    csv += `${d},${data[d].breakfast ? 'Yes' : 'No'},${data[d].dinner ? 'Yes' : 'No'}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_${monthValue}_meals.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

clearDataBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  const monthValue = monthPicker.value;
  if (!name || !monthValue) return alert('Enter name and select month');
  if (confirm('Clear all meal data for this month?')) {
    localStorage.removeItem(getStorageKey(name, monthValue));
    buildTable();
  }
});

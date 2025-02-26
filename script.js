// =====================
// Manejo de pestañas
// =====================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remover "active" de todas las pestañas y contenidos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activar la pestaña clicada y mostrar su contenido
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
    
    if (tabId === "calendarioAnual") {
      generateYearCalendar();
    }
    if (tabId === "calendario") {
      renderWeeklyCalendar();
    }
  });
});

// =====================
// Variables globales y persistencia
// =====================
let currentWeekStart = getMonday(new Date()); // lunes de la semana actual

// Recuperar datos de localStorage (si existen)
let weeklyTasks = localStorage.getItem('weeklyTasks')
  ? JSON.parse(localStorage.getItem('weeklyTasks'))
  : {};
let completedWeeks = localStorage.getItem('completedWeeks')
  ? JSON.parse(localStorage.getItem('completedWeeks'))
  : [];

// Función para actualizar localStorage
function updateLocalStorage() {
  localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
  localStorage.setItem('completedWeeks', JSON.stringify(completedWeeks));
}

// =====================
// Funciones de utilidad
// =====================

// Formatea una fecha en "YYYY-MM-DD"
function formatDateISO(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Dada una fecha, devuelve el lunes de esa semana
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// =====================
// Renderización del Calendario Semanal
// =====================
function renderWeeklyCalendar() {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  
  days.forEach((day, i) => {
    let currentDate = new Date(currentWeekStart);
    currentDate.setDate(currentDate.getDate() + i);
    const dateISO = formatDateISO(currentDate);
    
    // Actualizar encabezado
    const header = document.getElementById(`th-${day}`);
    if (header) {
      header.textContent = `${day} (${currentDate.getDate()}/${currentDate.getMonth() + 1})`;
    }
    
    // Actualizar celdas
    const cells = document.querySelectorAll(`#calendarTable td[data-day="${day}"]`);
    cells.forEach(cell => {
      cell.setAttribute('data-date', dateISO);
      cell.innerHTML = "";
      const period = cell.parentElement.getAttribute('data-period');
      if (weeklyTasks[dateISO] && weeklyTasks[dateISO][period]) {
        weeklyTasks[dateISO][period].forEach(taskText => {
          const taskDiv = document.createElement('div');
          taskDiv.className = 'completed-task';
          taskDiv.setAttribute('data-task', taskText);
          taskDiv.textContent = taskText;
          cell.appendChild(taskDiv);
        });
      }
    });
  });
  
  const endDate = new Date(currentWeekStart);
  endDate.setDate(endDate.getDate() + 6);
  const weekDisplay = document.getElementById("currentWeekDisplay");
  if (weekDisplay) {
    weekDisplay.textContent = `Semana: ${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
  }
  
  // Mostrar u ocultar los botones de marcar/cancelar semana completada
  const mondayISO = formatDateISO(currentWeekStart);
  if (completedWeeks.includes(mondayISO)) {
    document.getElementById("completeWeek").style.display = "none";
    document.getElementById("uncompleteWeek").style.display = "inline-block";
  } else {
    document.getElementById("completeWeek").style.display = "inline-block";
    document.getElementById("uncompleteWeek").style.display = "none";
  }
  
  updateLocalStorage();
}

// =====================
// Navegación de semanas
// =====================
document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderWeeklyCalendar();
});
document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderWeeklyCalendar();
});

// =====================
// Marcar la semana como completada
// =====================
document.getElementById("completeWeek").addEventListener("click", () => {
  const mondayISO = formatDateISO(currentWeekStart);
  if (!completedWeeks.includes(mondayISO)) {
    completedWeeks.push(mondayISO);
  }
  alert("Semana marcada como completada");
  renderWeeklyCalendar();
  generateYearCalendar();
});

// =====================
// Desmarcar (cancelar) la semana completada
// =====================
document.getElementById("uncompleteWeek").addEventListener("click", () => {
  const mondayISO = formatDateISO(currentWeekStart);
  const index = completedWeeks.indexOf(mondayISO);
  if (index > -1) {
    completedWeeks.splice(index, 1);
  }
  alert("Semana desmarcada");
  renderWeeklyCalendar();
  generateYearCalendar();
});

// =====================
// Reiniciar el calendario (resetear todos los datos)
// =====================
document.getElementById("resetCalendar").addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas reiniciar el calendario? Se borrarán todas las tareas y semanas completadas.")) {
    weeklyTasks = {};
    completedWeeks = [];
    updateLocalStorage();
    renderWeeklyCalendar();
    generateYearCalendar();
    alert("Calendario reiniciado");
  }
});

// Inicialmente, renderizar la semana actual
renderWeeklyCalendar();

// =====================
// Seguimiento: marcar/desmarcar tareas
// =====================
const checkboxes = document.querySelectorAll('.check-task');
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    const todayISO = formatDateISO(new Date());
    const period = this.getAttribute('data-period');
    const taskText = this.getAttribute('data-task');
    
    if (!weeklyTasks[todayISO]) {
      weeklyTasks[todayISO] = {};
    }
    if (!weeklyTasks[todayISO][period]) {
      weeklyTasks[todayISO][period] = [];
    }
    
    if (this.checked) {
      if (!weeklyTasks[todayISO][period].includes(taskText)) {
        weeklyTasks[todayISO][period].push(taskText);
      }
    } else {
      const index = weeklyTasks[todayISO][period].indexOf(taskText);
      if (index > -1) {
        weeklyTasks[todayISO][period].splice(index, 1);
      }
    }
    updateCellForDatePeriod(todayISO, period);
    
    const row = this.closest('tr');
    if (this.checked) {
      row.classList.add('completed');
    } else {
      row.classList.remove('completed');
    }
    
    updateLocalStorage();
  });
});

function updateCellForDatePeriod(date, period) {
  const row = document.querySelector(`#calendarTable tr[data-period="${period}"]`);
  if (row) {
    const cell = row.querySelector(`td[data-date="${date}"]`);
    if (cell) {
      cell.innerHTML = "";
      if (weeklyTasks[date] && weeklyTasks[date][period]) {
        weeklyTasks[date][period].forEach(taskText => {
          const taskDiv = document.createElement('div');
          taskDiv.className = 'completed-task';
          taskDiv.setAttribute('data-task', taskText);
          taskDiv.textContent = taskText;
          cell.appendChild(taskDiv);
        });
      }
    }
  }
}

// =====================
// Modificar Rutina mediante formulario
// =====================
const scheduleForm = document.getElementById('scheduleForm');
scheduleForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const day = document.getElementById('daySelect').value;
  const period = document.getElementById('periodSelect').value;
  const activity = document.getElementById('activityInput').value;
  
  const dayMapping = {
    "Lunes": 0,
    "Martes": 1,
    "Miércoles": 2,
    "Jueves": 3,
    "Viernes": 4,
    "Sábado": 5,
    "Domingo": 6
  };
  
  const offset = dayMapping[day];
  let targetDate = new Date(currentWeekStart);
  targetDate.setDate(targetDate.getDate() + offset);
  const targetISO = formatDateISO(targetDate);
  
  if (!weeklyTasks[targetISO]) {
    weeklyTasks[targetISO] = {};
  }
  // Reemplazar la(s) tarea(s) existente(s) para el período; para acumular, usa push
  weeklyTasks[targetISO][period] = [activity];
  
  renderWeeklyCalendar();
  scheduleForm.reset();
  updateLocalStorage();
});

// =====================
// Generar Calendario Anual (agrupado por semanas)
// =====================
function generateYearCalendar() {
  const container = document.getElementById('yearCalendar');
  container.innerHTML = "";
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const currentYear = new Date().getFullYear();
  
  for (let month = 0; month < 12; month++) {
    const monthDiv = document.createElement('div');
    monthDiv.className = "month-calendar";
    
    const monthTitle = document.createElement('h3');
    monthTitle.textContent = monthNames[month];
    monthDiv.appendChild(monthTitle);
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    daysOfWeek.forEach(day => {
      const th = document.createElement('th');
      th.textContent = day;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    const firstDayIndex = new Date(currentYear, month, 1).getDay();
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    
    let startDate = 1 - firstDayIndex;
    while (startDate <= daysInMonth) {
      const tr = document.createElement('tr');
      let weekDates = [];
      for (let i = 0; i < 7; i++) {
        const td = document.createElement('td');
        let d = startDate + i;
        if (d < 1 || d > daysInMonth) {
          td.textContent = "";
          weekDates.push(null);
        } else {
          td.textContent = d;
          const cellDate = new Date(currentYear, month, d);
          const cellISO = formatDateISO(cellDate);
          td.setAttribute("data-date", cellISO);
          weekDates.push(cellDate);
        }
        tr.appendChild(td);
      }
      // Calcular el lunes de la semana (primer día válido)
      let mondayOfWeek = null;
      for (let d of weekDates) {
        if (d !== null) {
          mondayOfWeek = getMonday(d);
          break;
        }
      }
      if (mondayOfWeek) {
        const mondayISO = formatDateISO(mondayOfWeek);
        if (completedWeeks.includes(mondayISO)) {
          tr.classList.add("completed-week");
        }
      }
      tbody.appendChild(tr);
      startDate += 7;
    }
    table.appendChild(tbody);
    monthDiv.appendChild(table);
    container.appendChild(monthDiv);
  }
}

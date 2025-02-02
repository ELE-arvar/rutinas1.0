// =====================
// Manejo de pestañas
// =====================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remover clase "active" de todas las pestañas y sus contenidos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Agregar clase "active" al botón clicado y mostrar su contenido
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');

    // Si se selecciona la pestaña "calendarioAnual", generar el calendario anual
    if (tabId === "calendarioAnual") {
      generateYearCalendar();
    }
    // Si se selecciona la pestaña "calendario" (semanal), renderizar la semana actual (o la seleccionada)
    if (tabId === "calendario") {
      renderWeeklyCalendar();
    }
  });
});

// =====================
// Variables globales para el Calendario Semanal
// =====================

// currentWeekStart guarda el lunes de la semana mostrada actualmente
let currentWeekStart = getMonday(new Date());
// weeklyTasks guarda las tareas por fecha y período
// Ejemplo: weeklyTasks["2025-02-01"]["Mañana"] = ["Tarea 1", "Tarea 2"]
let weeklyTasks = {};
// completedWeeks es un arreglo que guarda los lunes (en formato ISO) de las semanas completadas
let completedWeeks = [];

// =====================
// Funciones de utilidad
// =====================

// Dada una fecha, devuelve el lunes de esa semana (asumiendo que la semana inicia el lunes)
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
    const dateISO = currentDate.toISOString().split('T')[0];

    // Actualizar encabezado de la columna (se requiere un elemento con id="th-[NombreDelDia]")
    const header = document.getElementById(`th-${day}`);
    if (header) {
      header.textContent = `${day} (${currentDate.getDate()}/${currentDate.getMonth() + 1})`;
    }

    // Actualizar celdas de la columna (celdas con data-day="[NombreDelDia]")
    const cells = document.querySelectorAll(`#calendarTable td[data-day="${day}"]`);
    cells.forEach(cell => {
      cell.setAttribute('data-date', dateISO);
      cell.innerHTML = ""; // Limpiar contenido previo

      // Obtener el período de la fila contenedora (atributo data-period en <tr>)
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

  // Actualizar display de la semana (ejemplo: "Semana: 15/5 - 21/5")
  const endDate = new Date(currentWeekStart);
  endDate.setDate(endDate.getDate() + 6);
  const weekDisplay = document.getElementById("currentWeekDisplay");
  if (weekDisplay) {
    weekDisplay.textContent = `Semana: ${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
  }
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
  const mondayISO = currentWeekStart.toISOString().split("T")[0];
  if (!completedWeeks.includes(mondayISO)) {
    completedWeeks.push(mondayISO);
  }
  alert("Semana marcada como completada");
  renderWeeklyCalendar();
  generateYearCalendar(); // Refresca el Calendario Anual
});

// Inicialmente, renderizamos la semana actual
renderWeeklyCalendar();

// =====================
// Seguimiento: marcar/desmarcar tareas
// =====================
const checkboxes = document.querySelectorAll('.check-task');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    // Se utiliza la fecha de hoy para guardar la tarea
    const todayISO = new Date().toISOString().split('T')[0];
    const period = this.getAttribute('data-period');
    const taskText = this.getAttribute('data-task');

    // Inicializar la estructura si no existe para hoy y el período
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

    // Actualizar la celda en el Calendario Semanal para la fecha de hoy y período
    updateCellForDatePeriod(todayISO, period);

    // Opcional: marcar/desmarcar la fila en la tabla de seguimiento
    const row = this.closest('tr');
    if (this.checked) {
      row.classList.add('completed');
    } else {
      row.classList.remove('completed');
    }
  });
});

// Función que actualiza la celda del Calendario Semanal para una fecha y período dados
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
// Modificar Rutina (Calendario Semanal) mediante formulario
// =====================
const scheduleForm = document.getElementById('scheduleForm');

scheduleForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const day = document.getElementById('daySelect').value;
  const period = document.getElementById('periodSelect').value;
  const activity = document.getElementById('activityInput').value;

  // Mapeo de días para calcular el offset respecto al lunes de la semana mostrada
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
  const targetISO = targetDate.toISOString().split("T")[0];

  // Inicializar la entrada si no existe para la fecha objetivo
  if (!weeklyTasks[targetISO]) {
    weeklyTasks[targetISO] = {};
  }
  // Guardamos (o reemplazamos) la tarea en el período para esa fecha
  weeklyTasks[targetISO][period] = [activity];

  renderWeeklyCalendar();
  scheduleForm.reset();
});

// =====================
// Generar Calendario Anual
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
    const firstDay = new Date(currentYear, month, 1).getDay();
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        const td = document.createElement('td');
        if (i === 0 && j < firstDay) {
          td.textContent = "";
        } else if (date > daysInMonth) {
          td.textContent = "";
        } else {
          td.textContent = date;
          const cellDate = new Date(currentYear, month, date);
          const cellISO = cellDate.toISOString().split("T")[0];
          td.setAttribute("data-date", cellISO);
          // Determinar el lunes de la semana de esta celda
          const mondayOfCell = getMonday(cellDate).toISOString().split("T")[0];
          if (completedWeeks.includes(mondayOfCell)) {
            td.classList.add("completed-week");
          }
          date++;
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    monthDiv.appendChild(table);
    container.appendChild(monthDiv);
  }
}



// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initializeData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// DOM Elements
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  sideBar: document.getElementById('side-bar-div')
};

let activeBoard = '';

// Fetch and Display Boards and Tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem('activeBoard'));
    activeBoard = localStorageBoard || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Display Boards
function displayBoards(boards) {
  const boardsContainer = document.getElementById('boards-nav-links-div');
  boardsContainer.innerHTML = '';
  boards.forEach(board => {
    const boardElement = document.createElement('button');
    boardElement.textContent = board;
    boardElement.classList.add('board-btn');
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem('activeBoard', JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filter and Display Tasks by Board
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute('data-status');
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task-div');
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

// Style Active Board
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === boardName);
  });
}

// Add Task to UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  const tasksContainer = column.querySelector('.tasks-container') || document.createElement('div');
  tasksContainer.className = 'tasks-container';
  column.appendChild(tasksContainer);

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  taskElement.addEventListener('click', () => {
    openEditTaskModal(task);
  });

  tasksContainer.appendChild(taskElement);
}

// Refresh Tasks UI
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Toggle Modal
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
  elements.filterDiv.style.display = show ? 'block' : 'none';
}

// Toggle Sidebar
function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'flex' : 'none';
  localStorage.setItem('showSideBar', show);
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}

// Toggle Theme
function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

// Add Task
function addTask(event) {
  event.preventDefault();

  const titleInput = document.getElementById('title-input').value.trim();
  const descriptionInput = document.getElementById('desc-input').value.trim();
  const statusInput = document.getElementById('select-status').value;

  if (!titleInput) {
    alert('Task title cannot be empty!');
    return;
  }

  const task = {
    title: titleInput,
    description: descriptionInput,
    status: statusInput,
    board: activeBoard
  };

  const newTask = createNewTask(task);
  addTaskToUI(newTask);
  toggleModal(false);
  refreshTasksUI();
}

// Open Edit Task Modal
function openEditTaskModal(task) {
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  saveChangesBtn.replaceWith(saveChangesBtn.cloneNode(true));
  document.getElementById('save-task-changes-btn').addEventListener('click', () => saveTaskChanges(task.id));

  const deleteTaskBtn = document.getElementById('delete-task-btn');
  deleteTaskBtn.replaceWith(deleteTaskBtn.cloneNode(true));
  document.getElementById('delete-task-btn').addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });

  toggleModal(true, elements.editTaskModal);
}

// Save Task Changes
function saveTaskChanges(taskId) {
  patchTask(taskId, {
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
    board: activeBoard,
  });

  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

// Setup Event Listeners
function setupEventListeners() {
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  elements.themeSwitch.addEventListener('change', toggleTheme);
  elements.createNewTaskBtn.addEventListener('click', () => toggleModal(true));
  elements.modalWindow.addEventListener('submit', (event) => addTask(event));
}

// Initialize Application
function init() {
  initializeData();
  setupEventListeners();
  toggleSidebar(localStorage.getItem('showSideBar') === 'true');
  document.body.classList.toggle('light-theme', localStorage.getItem('light-theme') === 'enabled');
  fetchAndDisplayBoardsAndTasks();
}

document.addEventListener('DOMContentLoaded', init);

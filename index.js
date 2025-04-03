// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    console.log("Setting initial data in localStorage...");
    console.log("Initial Data:", initialData);

    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

function clearLocalStorage() {
  localStorage.clear();
  console.log("Local storage cleared.");
  location.reload(); // Reload the page to reflect changes
}
document.getElementById('clear-local-storage').addEventListener('click', clearLocalStorage);

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  createNewTaskBtn: document.getElementById('create-task-btn'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  logo: document.getElementById('logo'),
  buttons: document.querySelectorAll('.board-btn'),
  titleInput: document.getElementById('title-input'),
  description: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = '<h4 id="headline-sidepanel">ALL BOARDS</h4>'; // Clears the container but keeps the heading
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.onclick = () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    };
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

/** 
*@param {string} boardName
*/

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  // Add click event listener to open edit modal
  taskElement.addEventListener('click', () => {
    openEditTaskModal(task);
  });
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'flex' : 'none'; 
  if (show) {
    elements.filterDiv.style.display = 'block';
  } else {
    elements.filterDiv.style.display = 'none';
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 
  
  // Assign user input to the task object
  const task = {
    description: elements.description.value,
    title: elements.titleInput.value,
    status: elements.selectStatus.value,
    board: activeBoard
  };
  
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}


function toggleSidebar(show) {
  const sidebarElement = document.querySelector('.side-bar');
  sidebarElement.classList.toggle('show-sidebar', show);
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  localStorage.setItem('showSideBar', show.toString());
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  
  // Update logo based on theme
  if (isLightTheme) {
    elements.logo.src = './assets/logo-light.svg';
    localStorage.setItem('light-theme', 'enabled');
  } else {
    elements.logo.src = './assets/logo-dark.svg';
    localStorage.setItem('light-theme', 'disabled');
  }
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  const editTitleInput = document.getElementById('edit-task-title-input');
  const editDescInput = document.getElementById('edit-task-desc-input');
  const editStatusSelect = document.getElementById('edit-select-status');
  
  editTitleInput.value = task.title;
  editDescInput.value = task.description;
  editStatusSelect.value = task.status;
  
  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  
  // Remove any existing event listeners to prevent duplicates
  const newSaveChangesBtn = saveChangesBtn.cloneNode(true);
  saveChangesBtn.parentNode.replaceChild(newSaveChangesBtn, saveChangesBtn);
  
  const newDeleteTaskBtn = deleteTaskBtn.cloneNode(true);
  deleteTaskBtn.parentNode.replaceChild(newDeleteTaskBtn, deleteTaskBtn);
  
  // Call saveTaskChanges upon click of Save Changes button
  newSaveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });
  
  // Delete task using a helper function and close the task modal
  newDeleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });
  
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const editTitleInput = document.getElementById('edit-task-title-input');
  const editDescInput = document.getElementById('edit-task-desc-input');
  const editStatusSelect = document.getElementById('edit-select-status');
  
  // Create an object with the updated task details
  const updates = {
    title: editTitleInput.value,
    description: editDescInput.value,
    status: editStatusSelect.value
  };
  
  // Update task using a helper function
  patchTask(taskId, updates);
  
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData(); // Initialize data in localStorage
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  if (showSidebar === true) {
    document.getElementById("dropDownIcon").src = 
    "assets/icon-chevron-up.svg";
  } else {
    document.getElementById("dropDownIcon").src = 
    "assets/icon-chevron-down.svg";
  }
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  if (isLightTheme && elements.logo) {
    elements.logo.src = './assets/logo-light.svg';
  }
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

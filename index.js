// index.js
  
  // Function checks if local storage already has data, if not it loads initialData to localStorage
  function initializeData() {
    if (!localStorage.getItem('tasks')) {
      localStorage.setItem('tasks', JSON.stringify(initialData)); 
      localStorage.setItem('showSideBar', 'true');
    } else {
      console.log('Data already exists in localStorage');
    }
  }
  
  // Get elements from the DOM
  const elements = {
    headerBoardName: document.getElementById('header-board-name'),
    columnDivs: document.querySelectorAll('.column-div'),
    modalWindow: document.getElementById('new-task-modal-window'),
    editTaskModal: document.querySelector('.edit-task-modal-window'),
    filterDiv: document.getElementById('filterDiv'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
    themeSwitch: document.getElementById('switch'),
    createNewTaskBtn: document.getElementById('add-new-task-btn'),
    modalWindowForm: document.getElementById('new-task-modal-window'),
  };
  
  let activeBoard = "";
  
  // Extracts unique board names from tasks
  function fetchAndDisplayBoardsAndTasks() {
    const tasks = getTasks();
    const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
    displayBoards(boards);
    if (boards.length > 0) {
      const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
      activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
      elements.headerBoardName.textContent = activeBoard;
      styleActiveBoard(activeBoard);
      refreshTasksUI();
    }
  }
  
  // Creates different boards in the DOM
  function displayBoards(boards) {
    const boardsContainer = document.getElementById("boards-nav-links-div");
    boardsContainer.innerHTML = ''; // Clears the container
    boards.forEach(board => {
      const boardElement = document.createElement("button");
      boardElement.textContent = board;
      boardElement.classList.add("board-btn");
      boardElement.addEventListener('click', () => {
        elements.headerBoardName.textContent = board;
        filterAndDisplayTasksByBoard(board);
        activeBoard = board; //assigns active board
        localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
        styleActiveBoard(activeBoard);
      });
      boardsContainer.appendChild(boardElement);
    });
  }
  
  // Filters tasks corresponding to the board name and displays them on the DOM.
  function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks(); // Fetch tasks from a simulated local storage function
    const filteredTasks = tasks.filter(task => task.board === boardName);
  
    elements.columnDivs.forEach(column => {
      const status = column.getAttribute("data-status");
      // Reset column content while preserving the column title
      column.innerHTML = `<div class="column-head-div">
                            <span class="dot" id="${status}-dot"></span>
                            <h4 class="columnHeader">${status.toUpperCase()}</h4>
                          </div>`;
  
      const tasksContainer = document.createElement("div");
      tasksContainer.className = 'tasks-container';
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
  
  // Styles the active board by adding an active class
  function styleActiveBoard(boardName) {
    document.querySelectorAll('.board-btn').forEach(btn => { 
      if(btn.textContent === boardName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  // Adds a task to the UI
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
    
    tasksContainer.appendChild(taskElement); 
  }
  
  // Sets up all the necessary event listeners
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
    elements.createNewTaskBtn.addEventListener('click', () => {
      toggleModal(true);
      elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    });
  
    // Add new task form submission event listener
    elements.modalWindowForm.addEventListener('submit', (event) => {
      addTask(event);
    });
  }
  
  // Toggles the visibility of the modal
  function toggleModal(show, modal = elements.modalWindow) {
    modal.style.display = show ? 'block' : 'none'; 
  }
  
  // Adds a new task
  function addTask(event) {
    event.preventDefault(); 
  
    // Assign user input to the task object
    const task = {
      title: document.getElementById('title-input').value,
      description: document.getElementById('desc-input').value,
      status: document.getElementById('select-status').value,
      board: activeBoard,
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
  
  // Toggles the visibility of the sidebar
  function toggleSidebar(show) {
    const sidebar = document.getElementById('side-bar-div');
    sidebar.style.display = show ? 'flex' : 'none';
    localStorage.setItem('showSideBar', show);
  }
  
  // Toggles the theme between light and dark
  function toggleTheme() {
    const isLightTheme = document.body.classList.toggle('light-theme');
    localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
  }
  
  // Opens the edit task modal
  function openEditTaskModal(task) {
    // Set task details in modal inputs
    document.getElementById('edit-task-title-input').value = task.title;
    document.getElementById('edit-task-desc-input').value = task.description;
    document.getElementById('edit-select-status').value = task.status;
  
    // Get button elements from the task modal
    const saveChangesBtn = document.getElementById('save-task-changes-btn');
    const deleteTaskBtn = document.getElementById('delete-task-btn');
  
    // Call saveTaskChanges upon click of Save Changes button
    saveChangesBtn.addEventListener('click', () => saveTaskChanges(task.id));
  
    // Delete task using a helper function and close the task modal
    deleteTaskBtn.addEventListener('click', () => {
      deleteTask(task.id);
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    });
  
    toggleModal(true, elements.editTaskModal); // Show the edit task modal
  }
  
  // Saves the changes made to a task
  function saveTaskChanges(taskId) {
    // Get new user inputs
    const updatedTask = {
      title: document.getElementById('edit-task-title-input').value,
      description: document.getElementById('edit-task-desc-input').value,
      status: document.getElementById('edit-select-status').value,
    };
  
    // Update task using a helper function
    patchTask(taskId, updatedTask);
  
    // Close the modal and refresh the UI to reflect the changes
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  }
  
  // Refreshes the tasks UI
  function refreshTasksUI() {
    filterAndDisplayTasksByBoard(activeBoard);
  }
  
  // Initializes the application when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    init(); // init is called after the DOM is fully loaded
  });
  
  function init() {
    initializeData();
    setupEventListeners();
    const showSidebar = localStorage.getItem('showSideBar') === 'true';
    toggleSidebar(showSidebar);
    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme);
    fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  }
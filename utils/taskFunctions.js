// utils/taskFunctions.js

// Simulate fetching tasks from localStorage
export const getTasks = () => {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  };
  
  // Simulate saving tasks to localStorage
  const saveTasks = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };
  
  // Create a new task and save it to localStorage
  export const createNewTask = (task) => {
    const tasks = getTasks(); // Retrieve existing tasks
    const newTask = { ...task, id: new Date().getTime() }; // Create new task with unique ID
    tasks.push(newTask); // Add new task to the array
    saveTasks(tasks); // Save updated tasks array to local storage
    return newTask; // Return the newly created task
  };
  
  // Update an existing task with new data
  export const patchTask = (id, updates) => {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        saveTasks(tasks);
    }
    return tasks; // Optionally return the updated tasks list for further processing
  };
  
  // Delete a task by ID
  export const deleteTask = (id) => {
    const tasks = getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    return updatedTasks; // Optionally return the updated tasks list for further processing
  };
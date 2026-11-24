class TodoApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.todos = this.loadTodos();
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.renderCalendar();
    }

    initializeElements() {
        // Calendar elements
        this.calendarGrid = document.getElementById('calendar-grid');
        this.monthYear = document.getElementById('month-year');
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        
        // Todo elements
        this.todoList = document.getElementById('todo-list');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.addTaskForm = document.getElementById('add-task-form');
        this.taskInput = document.getElementById('task-input');
        this.saveTaskBtn = document.getElementById('save-task');
        this.cancelTaskBtn = document.getElementById('cancel-task');
        this.selectedDateSpan = document.getElementById('selected-date');
        this.currentDateSpan = document.getElementById('current-date');
    }

    bindEvents() {
        // Calendar navigation
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        
        // Todo form events
        this.addTaskBtn.addEventListener('click', () => this.showAddTaskForm());
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());
        this.cancelTaskBtn.addEventListener('click', () => this.hideAddTaskForm());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveTask();
        });
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.monthYear.textContent = `${this.getMonthName(month)} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        this.calendarGrid.innerHTML = '';
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            // Check if it's today
            if (this.isToday(date)) {
                dayElement.classList.add('today');
            }
            
            // Check if it's selected
            if (this.isSameDate(date, this.selectedDate)) {
                dayElement.classList.add('selected');
            }
            
            // Check if it's from other month
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            // Check if it has tasks
            if (this.hasTasksForDate(date)) {
                dayElement.classList.add('has-tasks');
            }
            
            dayElement.addEventListener('click', () => this.selectDate(date));
            this.calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        this.updateDisplay();
        this.renderCalendar();
    }

    updateDisplay() {
        this.selectedDateSpan.textContent = this.formatDate(this.selectedDate);
        this.currentDateSpan.textContent = this.formatDate(new Date());
        this.renderTodos();
    }

    renderTodos() {
        this.todoList.innerHTML = '';
        const dateKey = this.getDateKey(this.selectedDate);
        const todos = this.todos[dateKey] || [];
        
        if (todos.length === 0) {
            this.todoList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No tasks for this date</p>';
            return;
        }
        
        todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });
    }

    createTodoElement(todo) {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoItem.dataset.id = todo.id;
        
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Bind events
        const checkbox = todoItem.querySelector('.todo-checkbox');
        const editBtn = todoItem.querySelector('.edit-btn');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
        editBtn.addEventListener('click', () => this.editTodo(todo.id));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        
        return todoItem;
    }

    showAddTaskForm() {
        this.addTaskForm.style.display = 'block';
        this.addTaskBtn.style.display = 'none';
        this.taskInput.focus();
    }

    hideAddTaskForm() {
        this.addTaskForm.style.display = 'none';
        this.addTaskBtn.style.display = 'block';
        this.taskInput.value = '';
        this.editingTaskId = null;
    }

    saveTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const dateKey = this.getDateKey(this.selectedDate);
        
        if (!this.todos[dateKey]) {
            this.todos[dateKey] = [];
        }
        
        if (this.editingTaskId) {
            // Edit existing task
            const todo = this.todos[dateKey].find(t => t.id === this.editingTaskId);
            if (todo) {
                todo.text = text;
            }
        } else {
            // Add new task
            const newTodo = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.todos[dateKey].push(newTodo);
        }
        
        this.saveTodos();
        this.hideAddTaskForm();
        this.updateDisplay();
        this.renderCalendar();
    }

    toggleTodo(todoId) {
        const dateKey = this.getDateKey(this.selectedDate);
        const todo = this.todos[dateKey]?.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.updateDisplay();
            this.renderCalendar();
        }
    }

    editTodo(todoId) {
        const dateKey = this.getDateKey(this.selectedDate);
        const todo = this.todos[dateKey]?.find(t => t.id === todoId);
        if (todo) {
            this.editingTaskId = todoId;
            this.taskInput.value = todo.text;
            this.showAddTaskForm();
        }
    }

    deleteTodo(todoId) {
        const dateKey = this.getDateKey(this.selectedDate);
        this.todos[dateKey] = this.todos[dateKey]?.filter(t => t.id !== todoId) || [];
        this.saveTodos();
        this.updateDisplay();
        this.renderCalendar();
    }

    hasTasksForDate(date) {
        const dateKey = this.getDateKey(date);
        return this.todos[dateKey] && this.todos[dateKey].length > 0;
    }

    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month];
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : {};
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

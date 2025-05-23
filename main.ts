import Fuse from "fuse.js";

// Загружаем список задач из localStorage или создаём пустой массив
let tasks: Task[] = JSON.parse(localStorage.getItem("tasks") || "[]");

// Класс задачи
class Task {
  id: string;
  title: string;

  constructor(title: string) {
    this.id = Task.generateId();
    this.title = title;
  }

  static generateId(): string {
    return crypto.randomUUID();
  }
}

// Элементы DOM
const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
const modalAdd = document.getElementById("modalAdd")!;
const taskInput = document.getElementById("task") as HTMLInputElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const taskListContainer = document.getElementById("list")!;
const editTaskInput = document.getElementById("editTask") as HTMLInputElement;
const modalEdit = document.getElementById("modalEdit")!;
const closeModalButton = document.getElementById("closeModal")!;

// Удаление задачи
function deleteTask(taskToDelete: Task) {
  tasks = tasks.filter((task) => task.id !== taskToDelete.id);
  saveTasks();
  updateFuse();
  renderTasks(getFilteredTasks());
}

// Открытие модального окна для редактирования
function openEditModal(taskToEdit: Task) {
  modalEdit.style.display = "flex";
  editTaskInput.value = taskToEdit.title;

  // Удаляем предыдущие обработчики, чтобы не было дублирования
  const newCloseButton = closeModalButton.cloneNode(true);
  closeModalButton.replaceWith(newCloseButton);

  newCloseButton.addEventListener("click", () => {
    modalEdit.style.display = "none";

    const updatedTask = tasks.find((task) => task.id === taskToEdit.id);
    if (updatedTask) {
      updatedTask.title = editTaskInput.value.trim();
      saveTasks();
      updateFuse();
      renderTasks(getFilteredTasks());
    }
  });
}

// Сохранение в localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Отрисовка задач
function renderTasks(tasks: Task[]) {
  taskListContainer.innerHTML = "";

  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.addEventListener("click", () => deleteTask(task));

    const editButton = document.createElement("button");
    editButton.textContent = "Редактировать";
    editButton.addEventListener("click", () => openEditModal(task));

    listItem.appendChild(deleteButton);
    listItem.appendChild(editButton);
    taskListContainer.appendChild(listItem);
  });
}

// Настройка Fuse
const fuse = new Fuse(tasks, {
  includeScore: true,
  keys: ["title"], // где искать
  threshold: 0.3, // насколько неточным может быть запрос
});

let currentSearchQuery = "";

function getFilteredTasks(): Task[] {
  if (!currentSearchQuery) return tasks;
  return fuse.search(currentSearchQuery).map((r) => r.item);
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  } as T;
}

function updateFuse() {
  fuse.setCollection(tasks);
}

// Поиск задачи
const handleSearch = () => {
  currentSearchQuery = searchInput.value.trim();

  if (!currentSearchQuery) {
    renderTasks(tasks);
    return;
  }

  const result = fuse.search(currentSearchQuery).map((r) => r.item);
  renderTasks(result);
};

searchInput.addEventListener("input", debounce(handleSearch, 300));

// Добавление новой задачи
function handleAddTask(event: Event) {
  event.preventDefault();
  const inputText = taskInput.value.trim();
  if (!inputText) return;

  const newTask = new Task(inputText);
  tasks.push(newTask);
  saveTasks();
  updateFuse();
  renderTasks(getFilteredTasks());
  modalAdd.style.display = "none";
  taskInput.value = "";
}

// Подписка на отправку формы
addBtn.addEventListener("click", () => (modalAdd.style.display = "flex"));
document.querySelector("form")!.addEventListener("submit", handleAddTask);
// Первичная отрисовка
renderTasks(getFilteredTasks());

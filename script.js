// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQm8eAFcn7cFItpRniQrukTIwbJsc1XbE",
  authDomain: "todolist1-89dd1.firebaseapp.com",
  projectId: "todolist1-89dd1",
  storageBucket: "todolist1-89dd1.appspot.com",
  messagingSenderId: "950076984524",
  appId: "1:950076984524:web:24a25f819e50fe5d148669",
  measurementId: "G-B8XY4TPZPR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to register a new user
window.registrar = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("contrasena").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario registrado:", user);
  } catch (error) {
    console.error("Error en el registro:", error.message);
  }
};

// Function to log in a user
window.ingresar = async function () {
  const email = document.getElementById("email2").value;
  const password = document.getElementById("contrasena2").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario logueado:", user);
    window.location.href = "todolist.html";
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
  }
};


// Function to log out a user
window.cerrar = async function () {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.log(error);
  }
};

// Function to protect the to-do list page
document.addEventListener("DOMContentLoaded",  () => {
  
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");

  taskForm.addEventListener("submit", addTask);
  taskList.addEventListener("click", handleTaskActions);

  async function addTask(event) {
    event.preventDefault();
    const taskInput = document.getElementById("new-task");
    const taskText = taskInput.value.trim();

    const task = {
      tarea: taskText,
      completada: false,
    };

    if (navigator.onLine) {
      // If online, add the task to Firestore
      try {
        const docRef = await addDoc(collection(db, "tasks"), task);
        task.id = docRef.id; // Store the document ID
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }

    storeTaskOffline(task);
    renderTasks();
    taskInput.value = "";
  }

  async function loadTasksFromFirestore() {
    if (navigator.onLine) {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const tasks = [];
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        task.id = doc.id; // Store the document ID
        tasks.push(task);
      });
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }

  function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskList.innerHTML = ""; // Clear the task list

    tasks.forEach((task) => {
      const taskItem = createTaskItem(task.tarea, task.completada, task.id);
      taskList.appendChild(taskItem);
    });
  }

  function createTaskItem(text, completada, id) {
    const li = document.createElement("li");
    li.setAttribute("data-id", id); // Store the document ID in a data attribute
    const span = document.createElement("span");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = completada;
    checkbox.addEventListener("change", async () => {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const taskIndex = tasks.findIndex((task) => task.id === id);
      if (taskIndex > -1) {
        tasks[taskIndex].completada = checkbox.checked;
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }
    
      if (navigator.onLine) {
        try {
          const taskDoc = doc(db, "tasks", id);
          await updateDoc(taskDoc, {
            completada: checkbox.checked,
          });
          console.log("Document updated with ID: ", id);
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      }
    });
    span.textContent = text;

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("actions");

    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.classList.add("edit");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";

    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actionsDiv);

    return li;
  }

  async function handleTaskActions(event) {
    const target = event.target;
    const taskItem = target.closest("li");
    const id = taskItem.getAttribute("data-id");

    if (target.textContent === "Eliminar") {
      try {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.filter((task) => task.id !== id);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));

        if (navigator.onLine) {
          const taskDoc = doc(db, "tasks", id);
          await deleteDoc(taskDoc);
          console.log("Document deleted with ID: ", id);
        }

        taskList.removeChild(taskItem); // Remove the task item from the DOM
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    } else if (target.textContent === "Editar") {
      const span = taskItem.querySelector("span");
      const newTaskText = prompt("Editar tarea:", span.textContent);

      if (newTaskText !== null) {
        try {
          const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
          const taskIndex = tasks.findIndex((task) => task.id === id);
          if (taskIndex > -1) {
            tasks[taskIndex].tarea = newTaskText.trim();
            localStorage.setItem("tasks", JSON.stringify(tasks));
          }

          if (navigator.onLine) {
            const taskDoc = doc(db, "tasks", id);
            await updateDoc(taskDoc, {
              tarea: newTaskText.trim(),
            });
            console.log("Document updated with ID: ", id);
          }

          span.textContent = newTaskText.trim();
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      }
    }
  }

  function storeTaskOffline(task) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  async function syncTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (tasks.length > 0 && navigator.onLine) {
      for (const task of tasks) {
        if (!task.id) {
          try {
            const docRef = await addDoc(collection(db, "tasks"), {
              tarea: task.tarea,
              completada: task.completada,
            });
            task.id = docRef.id;
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        }
      }
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }

  window.addEventListener("online", async () => {
    await syncTasks();
    await loadTasksFromFirestore();
    renderTasks();
  });

  window.addEventListener("offline", () => {
    console.log("App is offline. Tasks will be stored locally.");
  });

  loadTasksFromFirestore();
  renderTasks();
});
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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





window.registrar = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("contrasena").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Usuario registrado:", user);
  } catch (error) {
    console.error("Error en el registro:", error.message);
  }
};


window.ingresar = async function () {
  const email = document.getElementById("email2").value;
  const password = document.getElementById("contrasena2").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Usuario logueado:", user);
    window.location.href = "/todolist.html";
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
  }
};

function observador () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('hay un usuario activo')
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      // ...
    } else {
      //window.location.href = "/index.html"
      console.log ('no hay un usuario activo')
      // User is signed out
      // ...
    }
  });
}


  observador();


window.cerrar = async function () {
  try{
    signOut(auth)

    window.location.href = "/index.html"
  }catch(error){
    console.log(error)
  }
}

const querySnapshot = await getDocs(collection(db, "tasks"));
querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${doc.data().first}`);
});

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');

  taskForm.addEventListener('submit', addTask);
  taskList.addEventListener('click', handleTaskActions);

  async function addTask(event) {
      event.preventDefault();
      const taskInput = document.getElementById('new-task');
      const taskText = taskInput.value.trim();
      try {
        const docRef = await addDoc(collection(db, "tasks"), {
          tarea: `${taskText}`,
          completada: false
        });
        console.log("Document written with ID: ", docRef.id);
        if (taskText !== '') {
          const taskItem = createTaskItem(taskText);
          taskList.appendChild(taskItem);
          taskInput.value = '';
      }
      } catch (e) {
        console.error("Error adding document: ", e);
      }

      
  }

  function createTaskItem(text) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = text;

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('actions');

      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.classList.add('edit');

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar';

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);

      li.appendChild(span);
      li.appendChild(actionsDiv);

      return li;
  }

  function handleTaskActions(event) {
      const target = event.target;

      if (target.textContent === 'Eliminar') {
          const taskItem = target.closest('li');
          taskList.removeChild(taskItem);
      } else if (target.textContent === 'Editar') {
          const taskItem = target.closest('li');
          const span = taskItem.querySelector('span');
          const newTaskText = prompt('Editar tarea:', span.textContent);

          if (newTaskText !== null) {
              span.textContent = newTaskText.trim();
          }
      }
  }
});




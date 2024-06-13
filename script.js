// Importa y configura Firebase
// Configuración de tu aplicación Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCI-1p15kAGpDwHKbBGAK7_slkht7nENho",
    authDomain: "todolist-2f30c.firebaseapp.com",
    projectId: "todolist-2f30c",
    storageBucket: "todolist-2f30c.appspot.com",
    messagingSenderId: "530109514758",
    appId: "1:530109514758:web:27e2e61fb3d785c2616f87"
  };
  
  // Inicializa Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  document.getElementById('task-form').addEventListener('submit', function(e) {
      e.preventDefault();
      addTask();
  });
  
  function addTask() {
      const taskName = document.getElementById('task').value;
      const newTaskKey = database.ref().child('tasks').push().key;
      const newTask = {
          id: newTaskKey,
          name: taskName
      };
      database.ref('tasks/' + newTaskKey).set(newTask);
      document.getElementById('task-form').reset();
  }
  
  database.ref('tasks').on('value', function(snapshot) {
      const taskList = document.getElementById('task-list');
      taskList.innerHTML = '';
      snapshot.forEach(function(childSnapshot) {
          const task = childSnapshot.val();
          const li = document.createElement('li');
          
          li.innerHTML = `
              ${task.name}
              <div>
                  <button class="edit" onclick="editTask('${task.id}')">Editar</button>
                  <button class="delete" onclick="deleteTask('${task.id}')">Eliminar</button>
              </div>
          `;
          taskList.appendChild(li);
      });
  });
  
  function deleteTask(id) {
      database.ref('tasks/' + id).remove();
  }
  
  function editTask(id) {
      database.ref('tasks/' + id).once('value').then(function(snapshot) {
          const task = snapshot.val();
          document.getElementById('task').value = task.name;
          deleteTask(id);
      });
  }
  
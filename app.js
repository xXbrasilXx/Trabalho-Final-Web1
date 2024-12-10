// Elemento principal onde o conteúdo será renderizado
const app = document.getElementById('app');

// Estado inicial
let users = []; // Usuários serão carregados do banco
let state = { page: 'login', userToEdit: null };

// Função para renderizar a página atual
function render() {
  if (state.page === 'login') {
    renderLogin();
  } else if (state.page === 'users') {
    renderUserList();
  } else if (state.page === 'form') {
    renderForm();
  }
}

// Tela de login
function renderLogin() {
  app.innerHTML = `
    <h1>Login</h1>
    <form id="loginForm">
      <label for="username">Nome:</label>
      <input type="text" id="username" required>
      <br>
      <label for="password">Senha:</label>
      <input type="password" id="password" required>
      <br>
      <input type="submit" value="Entrar">
    </form>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Login fictício (substituir por lógica real de autenticação se necessário)
    if (username && password) {
      state.page = 'users';
      await fetchUsers(); // Carrega usuários do banco
      render();
    } else {
      alert('Por favor, insira um nome de usuário e senha válidos.');
    }
  });
}

// Tela de lista de usuários
function renderUserList() {
    app.innerHTML = `
      <h1>Usuários Cadastrados</h1>
      <ul id="userList">
        ${users.map(user => `
          <li>
            <div class="user-info">
              ${user.name} (${user.email}, ${user.age} anos)
            </div>
            <div class="actions">
              <button class="edit" onclick="editUser(${user.id})">Editar</button>
              <button class="delete" onclick="deleteUser(${user.id})">Excluir</button>
            </div>
          </li>
        `).join('')}
      </ul>
      <button onclick="createUser()">Novo Usuário</button>
    `;
  }
  

app.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit')) {
      editUser(event.target.dataset.id);
    } else if (event.target.classList.contains('delete')) {
      deleteUser(event.target.dataset.id);
    }
  });
  

// Tela de formulário
function renderForm() {
  const user = state.userToEdit || { name: '', email: '', age: '' };

  app.innerHTML = `
    <h1>${state.userToEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>
    <form id="userForm">
      <label for="name">Nome:</label>
      <input type="text" id="name" value="${user.name}" required>
      <br>
      <label for="email">Email:</label>
      <input type="email" id="email" value="${user.email}" required>
      <br>
      <label for="age">Idade:</label>
      <input type="number" id="age" value="${user.age}" min="0" max="100" required>
      <br>
      <input type="submit" value="${state.userToEdit ? 'Salvar' : 'Cadastrar'}">
    </form>
    <button onclick="cancelForm()">Cancelar</button>
  `;

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;

    if (state.userToEdit) {
      await updateUser(state.userToEdit.id, { name, email, age });
    } else {
      await createUserAPI({ name, email, age });
    }

    state.userToEdit = null;
    state.page = 'users';
    await fetchUsers();
    render();
  });
}

// Funções de controle
async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/usuarios');
    users = await response.json();
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  }
}

async function createUserAPI(user) {
  try {
    await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  }
}

async function updateUser(id, user) {
  try {
    await fetch(`http://localhost:3000/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  }
}

async function deleteUserAPI(id) {
  try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
          method: 'DELETE',
      });

      if (!response.ok) {
          throw new Error('Erro ao excluir usuário');
      }
  } catch (error) {
      console.error('Erro ao excluir usuário:', error);
  }
}


async function deleteUser(id) {
  openModal(
    'Tem certeza de que deseja excluir este usuário?',
    async () => {
      await deleteUserAPI(id);
      await fetchUsers();
      render();
    },
    () => console.log('Exclusão cancelada')
  );
}

function createUser() {
  state.userToEdit = null;
  state.page = 'form';
  render();
}

function editUser(id) {
  state.userToEdit = users.find(user => user.id === id);
  state.page = 'form';
  render();
}

function cancelForm() {
  state.userToEdit = null;
  state.page = 'users';
  render();
}

// Modal de confirmação
function openModal(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <h2>Confirmação</h2>
      <p>${message}</p>
      <button class="confirm">Confirmar</button>
      <button class="cancel">Cancelar</button>
    </div>
  `;

  overlay.querySelector('.confirm').addEventListener('click', () => {
    onConfirm();
    document.body.removeChild(overlay);
  });

  overlay.querySelector('.cancel').addEventListener('click', () => {
    if (onCancel) onCancel();
    document.body.removeChild(overlay);
  });

  document.body.appendChild(overlay);
}

// Inicialização
(async () => {
  await fetchUsers();
  render();
})();

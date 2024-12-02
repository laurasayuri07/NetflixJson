const apiUrl = "http://localhost:3000/usuarios";

// Verificar se o usuário é administrador
let authToken = localStorage.getItem('authToken');
let isAdmin = localStorage.getItem('isAdmin');

if (!authToken || isAdmin !== 'true') {
  // Se o usuário não estiver logado ou não for admin, redireciona para o login
  window.location.href = 'index.html';
}

// Função para carregar a lista de usuários
async function carregarUsuarios() {
  const response = await fetch(apiUrl);
  const usuarios = await response.json();

  const userList = document.getElementById("user-list");
  userList.innerHTML = usuarios.map(user => `
    <li>
      ${user.nome} ${user.sobrenome} - ${user.rg} - ${user.email} 
      <button onclick="editarUsuario('${user.id}')">Editar</button>
    </li>
  `).join('');
}

// Função de busca de usuários por RG
document.getElementById("search-btn")?.addEventListener("click", async function() {
  const rg = document.getElementById("search-rg").value;
  const response = await fetch(apiUrl);
  const usuarios = await response.json();

  const filteredUsers = usuarios.filter(u => u.rg.includes(rg));
  const userList = document.getElementById("user-list");
  userList.innerHTML = filteredUsers.map(user => `
    <li>
      ${user.nome} ${user.sobrenome} (${user.rg}) 
      <button onclick="editarUsuario('${user.id}')">Editar</button>
    </li>
  `).join('');
});

// Função para editar um usuário
async function editarUsuario(userId) {
    const response = await fetch(`${apiUrl}/${userId}`);
    const usuario = await response.json();
  
    document.getElementById("edit-form").style.display = 'block';
    document.getElementById("edit-nome").value = usuario.nome;
    document.getElementById("edit-sobrenome").value = usuario.sobrenome;
    document.getElementById("edit-rg").value = usuario.rg;
    document.getElementById("edit-email").value = usuario.email;
    document.getElementById("edit-senha").value = usuario.senha;
  
    // Salvar as mudanças
    document.getElementById("save-edit").onclick = async function() {
      const updatedUser = {
        nome: document.getElementById("edit-nome").value,
        sobrenome: document.getElementById("edit-sobrenome").value,
        rg: document.getElementById("edit-rg").value,
        email: document.getElementById("edit-email").value,
        senha: document.getElementById("edit-senha").value,
        isAdmin: usuario.isAdmin // Manter o status de admin
      };
  
      const updateResponse = await fetch(`${apiUrl}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });
  
      if (updateResponse.ok) {
        alert("Usuário atualizado com sucesso!");
        carregarUsuarios(); // Recarregar a lista de usuários após a atualização
        document.getElementById("edit-form").style.display = 'none'; // Ocultar o formulário de edição
      } else {
        alert("Erro ao atualizar o usuário.");
      }
    };
  }
  
  // Função para carregar a lista de usuários
  async function carregarUsuarios() {
    const response = await fetch(apiUrl);
    const usuarios = await response.json();
  
    const userList = document.getElementById("user-list");
    userList.innerHTML = usuarios.map(user => `
      <li>
        ${user.nome} ${user.sobrenome} - ${user.rg} - ${user.email} 
        <button onclick="editarUsuario('${user.id}')">Editar</button>
      </li>
    `).join('');
  }
  
  // Carregar a lista de usuários assim que a página carregar
  document.addEventListener("DOMContentLoaded", carregarUsuarios);
  

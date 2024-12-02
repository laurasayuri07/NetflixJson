// Configurar a URL da API
const apiUrl = "http://localhost:3000/usuarios";

// Função de login
document.getElementById("login-form")?.addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const response = await fetch(apiUrl);
  const usuarios = await response.json();

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (user) {
    localStorage.setItem("authToken", user.id); // Salvar o ID do usuário no localStorage
    localStorage.setItem("nome", user.nome); // Salvar o nome no localStorage
    localStorage.setItem("sobrenome", user.sobrenome); // Salvar o sobrenome no localStorage
    localStorage.setItem("isAdmin", user.isAdmin.toString()); // Salvar o status de admin

    // Verificar se o usuário é administrador
    if (user.isAdmin) {
      window.location.href = "admin.html"; // Redireciona para a página de administração
    } else {
      window.location.href = "boasvindas.html"; // Redireciona para a página de boas-vindas
    }
  } else {
    alert("Credenciais inválidas!");
  }
});

// Função de cadastro
document.getElementById("register-form")?.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const sobrenome = document.getElementById("sobrenome").value;
  const rg = document.getElementById("rg").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const newUser = {
    nome,
    sobrenome,
    rg,
    email,
    senha, // **IMPORTANTE**: Enviar senhas hasheadas no futuro
    isAdmin: false
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUser)
    });

    if (response.ok) {
      alert("Usuário cadastrado com sucesso!");
      window.location.href = "index.html"; // Redireciona para login
    } else {
      const error = await response.json();
      alert(`Erro ao cadastrar usuário: ${error.message}`);
    }
  } catch (error) {
    alert(`Erro ao cadastrar: ${error.message}`);
  }
});

// Verificar autenticação
async function checkAuth(adminRequired = false) {
  const token = localStorage.getItem("authToken");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token || (adminRequired && !isAdmin)) {
    localStorage.clear();
    alert("Acesso negado.");
    window.location.href = "index.html";
    return false;
  }

  // Validação no servidor (exemplo de implementação)
  try {
    const response = await fetch(`${apiUrl}/validateToken`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Sessão inválida ou expirada");
    const data = await response.json();
    if (adminRequired && !data.isAdmin) throw new Error("Acesso não autorizado");

    return true;
  } catch (error) {
    localStorage.clear();
    alert(error.message);
    window.location.href = "index.html";
    return false;
  }
}

// Exibir lista de usuários para administrador
document.addEventListener("DOMContentLoaded", async () => {
  if (!(await checkAuth(true))) return;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Erro ao buscar usuários");

    const usuarios = await response.json();
    const userList = document.getElementById("user-list");
    userList.innerHTML = usuarios.map(u => `
      <li>${u.nome} ${u.sobrenome} (${u.rg}) - ${u.email} ${u.isAdmin ? "(Admin)" : "(Usuário)"}</li>
    `).join('');
  } catch (error) {
    alert(`Erro ao carregar usuários: ${error.message}`);
  }
});

// Função de busca de usuários por RG
document.getElementById("search-btn")?.addEventListener("click", async function () {
  const rg = document.getElementById("search-rg").value;
  const searchBtn = document.getElementById("search-btn");
  searchBtn.textContent = "Buscando...";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Erro ao buscar usuários");

    const usuarios = await response.json();
    const filteredUsers = usuarios.filter(u => u.rg.includes(rg));

    const userList = document.getElementById("user-list");
    userList.innerHTML = filteredUsers.map(user => `
      <li>${user.nome} ${user.sobrenome} (${user.rg})</li>
    `).join('');
  } catch (error) {
    alert(`Erro ao buscar usuários: ${error.message}`);
  } finally {
    searchBtn.textContent = "Buscar Usuário";
  }
});

// Botão de sair
document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

/**
 * =========================================
 * Autenticação e Usuários
 * =========================================
 */

// --- BANCO DE DADOS E SESSÃO ---
function obterUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios_db')) || [];
}

function obterUsuarioAtivo() {
    return JSON.parse(localStorage.getItem('usuario_logado'));
}

function atualizarBancoDeDadosUsuario(usuarioAtualizado) {
    let usuarios = obterUsuarios();
    let index = usuarios.findIndex(u => u.email === usuarioAtualizado.email);
    if (index !== -1) {
        usuarios[index] = usuarioAtualizado;
        localStorage.setItem('usuarios_db', JSON.stringify(usuarios));
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioAtualizado));
    }
}

function inicializarContasTeste() {
    let usuarios = obterUsuarios();
    if (usuarios.length === 0) {
        usuarios = [
            { nome: "João Admin", email: "admin@raizes.com", senha: "admin", cargo: "admin", pontos: 0, pedidos: [] },
            { nome: "Pedro Atendente", email: "atendente@raizes.com", senha: "123", cargo: "atendente", pontos: 0, pedidos: [] },
            { nome: "Maria Cliente", email: "cliente@teste.com", senha: "123", cargo: "cliente", pontos: 0, pedidos: [] }
        ];
        localStorage.setItem('usuarios_db', JSON.stringify(usuarios));
    }
}

// --- LOGIN E CADASTRO ---
function cadastrarUsuario(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Verificação do aceite da LGPD
    const aceiteLGPD = document.getElementById('aceiteLGPDCadastro');
    if (aceiteLGPD && !aceiteLGPD.checked) {
        mostrarAviso('Você precisa aceitar a Política de Privacidade (em acordo com a LGPD) para criar a conta.', 'erro');
        return;
    }

    let usuarios = obterUsuarios();
    if (usuarios.find(u => u.email === email)) {
        mostrarAviso('Este e-mail já está cadastrado!', 'erro');
        return;
    }

    usuarios.push({ nome, email, senha, cargo: 'cliente', pontos: 0, pedidos: [] });
    localStorage.setItem('usuarios_db', JSON.stringify(usuarios));
    
    mostrarAviso('Cadastro realizado com sucesso! Faça login.', 'sucesso');
    setTimeout(() => window.location.href = 'login.html', 2000);
}

function fazerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    let usuario = obterUsuarios().find(u => u.email === email && u.senha === senha);

    if (usuario) {
        localStorage.setItem('usuario_logado', JSON.stringify(usuario));
        mostrarAviso('Login realizado! Redirecionando...', 'sucesso');
        setTimeout(() => window.location.href = 'cardapio.html', 1000);
    } else {
        mostrarAviso('E-mail ou senha incorretos!', 'erro');
    }
}

function fazerLogout() {
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('carrinho'); 
    window.location.href = 'index.html';
}

// --- ATUALIZAÇÃO DO MENU COM AUTENTICAÇÃO ---
function atualizarMenuAutenticacao() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const linkExistente = document.getElementById('authMenu');
    if (linkExistente) linkExistente.remove();

    const usuario = obterUsuarioAtivo();
    const authContainer = document.createElement('div');
    authContainer.id = 'authMenu';
    authContainer.style.display = 'flex';
    authContainer.style.alignItems = 'center';
    authContainer.style.gap = '10px';
    authContainer.style.marginLeft = '10px';

    if (usuario) {
        const primeiroNome = usuario.nome.split(' ')[0];
        let botaoPainelHtml = (usuario.cargo === 'admin' || usuario.cargo === 'atendente') 
            ? `<a id="linkPainelNav" href="painel.html" class="btn-painel">PAINEL</a>` : '';

        authContainer.innerHTML = `
            ${botaoPainelHtml}
            <span style="color: white; font-weight: bold;">Olá, ${primeiroNome}</span>
            <a href="#" onclick="fazerLogout()" style="padding: 4px 8px; border: 1px solid #bd1010; border-radius: 4px; color: #9e0a0a; background: transparent;">Sair</a>
        `;
    } else {
        authContainer.innerHTML = `<a href="login.html" style="background: var(--dark); color: white; border-radius: 4px; padding: 6px 12px; margin-left: auto;">Entrar</a>`;
    }
    
    nav.appendChild(authContainer);
}
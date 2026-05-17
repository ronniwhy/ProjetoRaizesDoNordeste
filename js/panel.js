/**
 * =========================================
 * Gerenciamento Administrativo
 * =========================================
 */

function carregarPainel() {
    const content = document.getElementById("painelContent");
    if (!content) return; 

    const user = obterUsuarioAtivo();
    if (!user || user.cargo === 'cliente' || !user.cargo) {
        content.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <h3 style="color:#E74C3C;">⛔ Acesso Negado</h3>
                <button onclick="window.location.href='index.html'" class="btn-principal">Início</button>
            </div>`;
        return;
    }

    let html = `<div class="painel-secao"><h3>Gestão de Pedidos</h3><div id="listaPedidosPainel"></div></div>`;

    if (user.cargo === 'admin') {
        html += `
        <div class="painel-secao">
            <h3>Gestão de Usuários (Admin)</h3>
            <div id="listaUsuariosPainel"></div>
            <div class="form-painel">
                <input type="hidden" id="editEmailAntigo">
                <input type="text" id="formNome" placeholder="Nome">
                <input type="email" id="formEmail" placeholder="E-mail">
                <input type="password" id="formSenha" placeholder="Senha">
                <select id="formCargo"><option value="cliente">Cliente</option><option value="atendente">Atendente</option><option value="admin">Admin</option></select>
                <button onclick="salvarUsuarioPainel()" class="btn-acao" style="width: 100%;">Salvar</button>
                <button onclick="limparFormularioPainel()" class="btn-voltar" style="width: 100%; margin:0;">Limpar</button>
            </div>
        </div>`;
    }
    content.innerHTML = html;
    
    renderizarPedidosPainel(user.cargo);
    if (user.cargo === 'admin') renderizarUsuariosPainel();
}

// --- GESTÃO DE PEDIDOS ---
function renderizarPedidosPainel(cargoLogado) {
    const lista = document.getElementById("listaPedidosPainel");
    let todosPedidos = [];
    obterUsuarios().forEach(u => u.pedidos?.forEach(p => todosPedidos.push({ ...p, donoNome: u.nome, donoEmail: u.email })));
    todosPedidos.sort((a, b) => b.id - a.id);

    if (todosPedidos.length === 0) return lista.innerHTML = "<p>Nenhum pedido no sistema.</p>";

    const opcoesStatus = ["Pedido recebido 📝", "Em preparação 👨‍🍳", "Aguardando retirada no balcão... 📍", "Pedido entregue ✅", "Cancelado ❌"];
    lista.innerHTML = "";

    todosPedidos.forEach(p => {
        const statusAtual = p.statusManual || obterStatusReal(p.id);
        const div = document.createElement('div');
        div.className = 'painel-item';
        
        let selectHtml = `<select id="status_${p.id}">${opcoesStatus.map(opt => `<option value="${opt}" ${statusAtual === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
        let botaoCancelar = cargoLogado === 'admin' && statusAtual !== "Cancelado ❌" 
            ? `<button onclick="alterarStatusPedido('${p.donoEmail}', ${p.id}, 'Cancelado ❌')" class="btn-acao btn-perigo">Cancelar</button>` : '';

        div.innerHTML = `
            <div><strong>#${p.id}</strong> - ${p.donoNome} <br><span class="badge-status" style="margin-top:5px; display:inline-block">${statusAtual}</span></div>
            <div class="painel-controles">${selectHtml}<button onclick="atualizarStatusSelect('${p.donoEmail}', ${p.id})" class="btn-acao">Atualizar</button>${botaoCancelar}</div>
        `;
        lista.appendChild(div);
    });
}

function atualizarStatusSelect(emailUsuario, idPedido) {
    alterarStatusPedido(emailUsuario, idPedido, document.getElementById(`status_${idPedido}`).value);
}

function alterarStatusPedido(emailUsuario, idPedido, novoStatus) {
    let usuarios = obterUsuarios();
    let indexUser = usuarios.findIndex(u => u.email === emailUsuario);
    if (indexUser !== -1) {
        let indexPed = usuarios[indexUser].pedidos.findIndex(p => p.id === idPedido);
        if (indexPed !== -1) {
            usuarios[indexUser].pedidos[indexPed].statusManual = novoStatus;
            localStorage.setItem('usuarios_db', JSON.stringify(usuarios));
            mostrarAviso("Status atualizado!", "sucesso");
            carregarPainel(); 
        }
    }
}

// --- GESTÃO DE USUÁRIOS ---
function renderizarUsuariosPainel() {
    const lista = document.getElementById("listaUsuariosPainel");
    lista.innerHTML = "";
    obterUsuarios().forEach(u => {
        const div = document.createElement('div');
        div.className = 'painel-item';
        div.innerHTML = `
            <div><strong>${u.nome}</strong> (${u.email}) <br><span style="color:#777; font-size:0.9em;">Cargo: <b>${u.cargo.toUpperCase()}</b> | Pontos: ${u.pontos}</span></div>
            <div class="painel-controles"><button onclick="carregarEdicaoUsuario('${u.email}')" class="btn-acao" style="background:#3498db">Editar</button><button onclick="excluirUsuarioPainel('${u.email}')" class="btn-acao btn-perigo">Excluir</button></div>
        `;
        lista.appendChild(div);
    });
}

function carregarEdicaoUsuario(email) {
    let u = obterUsuarios().find(x => x.email === email);
    if (u) {
        document.getElementById('editEmailAntigo').value = u.email;
        document.getElementById('formNome').value = u.nome;
        document.getElementById('formEmail').value = u.email;
        document.getElementById('formSenha').value = u.senha;
        document.getElementById('formCargo').value = u.cargo;
    }
}

function limparFormularioPainel() {
    document.querySelectorAll('.form-painel input, .form-painel select').forEach(el => el.value = el.id === 'formCargo' ? 'cliente' : '');
}

function salvarUsuarioPainel() {
    const emailAntigo = document.getElementById('editEmailAntigo').value;
    const novoNome = document.getElementById('formNome').value;
    const novoEmail = document.getElementById('formEmail').value;
    const novaSenha = document.getElementById('formSenha').value;
    const novoCargo = document.getElementById('formCargo').value;

    if (!novoNome || !novoEmail || !novaSenha) return mostrarAviso("Preencha tudo!", "erro");

    let usuarios = obterUsuarios();
    if (emailAntigo) { 
        let index = usuarios.findIndex(u => u.email === emailAntigo);
        if (index !== -1) { usuarios[index] = { ...usuarios[index], nome: novoNome, email: novoEmail, senha: novaSenha, cargo: novoCargo }; }
    } else { 
        if (usuarios.find(u => u.email === novoEmail)) return mostrarAviso("E-mail já existe!", "erro");
        usuarios.push({ nome: novoNome, email: novoEmail, senha: novaSenha, cargo: novoCargo, pontos: 0, pedidos: [] });
    }

    localStorage.setItem('usuarios_db', JSON.stringify(usuarios));
    limparFormularioPainel();
    carregarPainel(); 
    mostrarAviso("Salvo com sucesso!", "sucesso");
}

function excluirUsuarioPainel(email) {
    if(confirm(`Excluir o usuário ${email}?`)) {
        localStorage.setItem('usuarios_db', JSON.stringify(obterUsuarios().filter(u => u.email !== email)));
        mostrarAviso("Cadastro de usuário excluído.", "info");
        carregarPainel();
    }
}
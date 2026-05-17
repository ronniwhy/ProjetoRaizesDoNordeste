/**
 * =========================================
 * Pagamentos e Acompanhamento
 * =========================================
 */

let descontoAplicado = 0;
let pontosUtilizados = 0;

// --- PAGAMENTO E FINALIZAÇÃO ---
function irParaPagamento() {
    if (carrinho.length === 0) return mostrarAviso("Seu carrinho está vazio!", 'erro');
    if (!obterUsuarioAtivo()) {
        mostrarAviso("Você precisa fazer login para finalizar o pedido.", 'erro');
        setTimeout(() => window.location.href = "login.html", 2000);
        return;
    }
    window.location.href = "pagamento.html";
}

function alternarMetodoPagamento() {
    const metodo = document.getElementById("metodoPgto").value;
    document.getElementById("areaPix").style.display = (metodo === "pix") ? "block" : "none";
    document.getElementById("areaCartao").style.display = (metodo === "cartao") ? "flex" : "none";
}

function carregarPagamento() {
    const el = document.getElementById("totalPagamento");
    if (!el) return;

    let total = calcularTotal();
    el.textContent = "R$ " + total.toFixed(2);

    const user = obterUsuarioAtivo();
    let pontosAtuais = user ? user.pontos : 0;
    const areaDesconto = document.getElementById("areaDesconto");
    
    if (pontosAtuais >= 100 && total > 0 && areaDesconto) {
        areaDesconto.style.display = "block";
        document.getElementById("qtdPontosDisplay").textContent = pontosAtuais;

        let maxDesconto = Math.floor(pontosAtuais / 100);
        if (maxDesconto > total) maxDesconto = Math.floor(total);

        const btnUsarPontos = document.getElementById("btnUsarPontos");
        btnUsarPontos.textContent = `Usar ${maxDesconto * 100} pontos (Desconto de R$ ${maxDesconto.toFixed(2)})`;
        
        btnUsarPontos.onclick = () => {
            descontoAplicado = maxDesconto;
            pontosUtilizados = maxDesconto * 100;
            el.innerHTML = `<strike style="font-size: 0.8em; color: #777;">R$ ${total.toFixed(2)}</strike> R$ ${(total - descontoAplicado).toFixed(2)}`;
            btnUsarPontos.disabled = true;
            btnUsarPontos.textContent = "Desconto Aplicado!";
            btnUsarPontos.style.backgroundColor = "var(--primary)";
            btnUsarPontos.style.color = "white";
        };
    }
}

function processarPagamento() {
    const aceiteLGPD = document.getElementById("aceiteLGPDPgto");
    if (aceiteLGPD && !aceiteLGPD.checked) return mostrarAviso("Aceite a Política de Privacidade (em acordo com a LGPD) para confirmar.", "erro");

    const metodo = document.getElementById("metodoPgto").value;
    if (metodo === "cartao") {
        const num = document.getElementById("numCartao").value;
        const nome = document.getElementById("nomeCartao").value;
        if (!num || !nome) return mostrarAviso("Preencha todos os dados do cartão.", "erro");
    }

    const btn = document.querySelector('button[onclick="processarPagamento()"]');
    if(btn) {
        btn.disabled = true; 
        btn.textContent = "Processando...";
        btn.style.opacity = "0.7"; 
    }

    setTimeout(() => {
        if(btn) {
            btn.textContent = metodo === "pix" ? "Gerando Pix..." : "Pagamento aprovado!";
            btn.style.backgroundColor = "#2ECC71"; 
            btn.style.opacity = "1";
        }
        setTimeout(() => finalizarPedido(), 1500); 
    }, 1500);
}

function finalizarPedido() {
    let user = obterUsuarioAtivo();
    if (!user || carrinho.length === 0) return;

    let totalPago = calcularTotal() - descontoAplicado;
    user.pontos = (user.pontos - pontosUtilizados) + Math.floor(totalPago);

    user.pedidos.push({ id: Date.now(), itens: carrinho, status: "Pedido criado" });
    atualizarBancoDeDadosUsuario(user);

    carrinho = [];
    salvarCarrinho();
    descontoAplicado = 0;
    pontosUtilizados = 0;
    window.location.href = "pedidos.html"; 
}

// --- CARREGAR STATUS E HISTÓRICO ---
function buscarPedidoGlobal(idPedido) {
    for (let u of obterUsuarios()) {
        let ped = u.pedidos.find(p => p.id == idPedido);
        if (ped) return ped;
    }
    return null;
}

function obterStatusReal(idPedido) {
    const pedido = buscarPedidoGlobal(idPedido);
    if (pedido && pedido.statusManual) return pedido.statusManual;

    const segundosDecorridos = Math.floor((Date.now() - idPedido) / 1000);
    if (segundosDecorridos < 5) return "Pedido recebido 📝";
    else if (segundosDecorridos < 10) return "Em preparação 👨‍🍳";
    else if (segundosDecorridos < 15) return "Aguardando retirada no balcão... 📍";
    else return "Pedido entregue ✅";
}

function carregarPedidos() {
    const lista = document.getElementById("listaPedidos");
    if (!lista) return;

    const user = obterUsuarioAtivo();
    if (!user) return lista.innerHTML = "<p>Faça login para ver seu histórico.</p>";

    lista.innerHTML = "";
    if (!user.pedidos || user.pedidos.length === 0) return lista.innerHTML = "<p>Você não tem pedidos.</p>";

    user.pedidos.slice().reverse().forEach(pedido => {
        const div = document.createElement("div");
        div.classList.add("pedido");
        
        let previa = pedido.itens.map(i => `${i.quantidade || 1}x ${i.nome}`).slice(0, 2).join(", ");
        if (pedido.itens.length > 2) previa += ` e mais...`;

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <p><strong>Pedido #${pedido.id}</strong></p>
                <small>${formatarData(pedido.id)}</small>
            </div>
            <p><em>${previa}</em></p>
            <p>Status: <span class="badge-status status-dinamico" data-id="${pedido.id}">${obterStatusReal(pedido.id)}</span></p>
            <button onclick="verPedido(${pedido.id})" class="btn-voltar">Ver detalhes</button>
        `;
        lista.appendChild(div);
    });
}

function verPedido(id) {
    const user = obterUsuarioAtivo();
    const pedido = user?.pedidos.find(p => p.id === id);
    if (!pedido) return;

    let html = `
        <h3>Pedido #${pedido.id}</h3>
        <p>🕒 ${formatarData(pedido.id)}</p>
        <ul>
    `;
    pedido.itens.forEach(item => {
        html += `<li><strong>${item.quantidade || 1}x ${item.nome}</strong> - R$ ${(item.preco * (item.quantidade || 1)).toFixed(2)}</li>`;
    });
    html += `</ul><p>Status: <span class="badge-status status-dinamico" data-id="${pedido.id}">${obterStatusReal(pedido.id)}</span></p>`;
    
    document.getElementById("detalhesPedido").innerHTML = html;
    document.getElementById("visaoLista").style.display = "none";
    document.getElementById("visaoDetalhes").style.display = "block";
}

function voltarParaLista() {
    document.getElementById("visaoLista").style.display = "block";
    document.getElementById("visaoDetalhes").style.display = "none";
    carregarPedidos(); 
}
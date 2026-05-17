/**
 * =========================================
 * Gestão do Carrinho de Compras
 * =========================================
 */

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function calcularTotal() {
    return carrinho.reduce((total, item) => total + (item.preco * (item.quantidade || 1)), 0);
}

// --- ADICIONAR ITENS ---
function adicionarAoCarrinho(nome, preco) {
    let unidadeParaCarrinho = localStorage.getItem("unidade_ativa") || "todas";

    if (window.event && window.event.target) {
        const cardProduto = window.event.target.closest('.menu-item');
        if (cardProduto && cardProduto.querySelector('.badge-unidade')) {
            unidadeParaCarrinho = cardProduto.querySelector('.badge-unidade').textContent.replace('📍', '').trim();
        }
    }

    if (unidadeParaCarrinho === "todas") unidadeParaCarrinho = "Filial não especificada";

    const itemExistente = carrinho.find(item => item.nome === nome && item.unidade === unidadeParaCarrinho);
    if (itemExistente) {
        itemExistente.quantidade += 1; 
    } else {
        carrinho.push({ nome, preco, unidade: unidadeParaCarrinho, quantidade: 1 });
    }
    
    salvarCarrinho();
    mostrarAviso(`${nome} adicionado! (${unidadeParaCarrinho})`, 'sucesso');
}

function comprarAgora(nome, preco) {
    adicionarAoCarrinho(nome, preco);
    window.location.href = "carrinho.html";
}

// --- RENDERIZAR E EDITAR CARRINHO ---
function carregarCarrinho() {
    const lista = document.getElementById("listaCarrinho");
    const totalEl = document.getElementById("total");
    const btnPagamento = document.querySelector("button[onclick='irParaPagamento()']");
    
    if (!lista) return; 
    lista.innerHTML = "";
    
    if (carrinho.length === 0) {
        lista.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #777;">
                <p style="font-size: 3rem; margin: 0 0 10px 0;">🛒</p>
                <p>Seu carrinho está vazio.</p>
                <p>Que tal escolher algumas delícias nordestinas no cardápio?</p>
            </div>
        `;
        totalEl.textContent = "Total: R$ 0,00";
        if (btnPagamento) btnPagamento.style.display = "none";
        return;
    }

    if (btnPagamento) btnPagamento.style.display = "inline-block";
    let total = 0;
    
    carrinho.forEach((item, index) => {
        const qtd = item.quantidade || 1; 
        const subtotal = item.preco * qtd; 
        total += subtotal; 

        const li = document.createElement("li");
        li.innerHTML = `
            <div style="flex: 1;">
                <strong>${item.nome}</strong><br>
                <small>📍 Retirada: ${item.unidade || "Não especificado"}</small>
                <div style="color: var(--primary); font-weight: bold; margin-top: 5px;">R$ ${subtotal.toFixed(2)}</div>
            </div>
            <div class="controles-carrinho">
                <button onclick="alterarQuantidade(${index}, -1)" class="btn-qtd">-</button>
                <span style="font-weight: bold; min-width: 20px; text-align: center;">${qtd}</span>
                <button onclick="alterarQuantidade(${index}, 1)" class="btn-qtd">+</button>
                <button onclick="removerItem(${index})" class="btn-remover" title="Excluir item">🗑️</button>
            </div>
        `;
        lista.appendChild(li);
    });
    totalEl.textContent = "Total: R$ " + total.toFixed(2);
}

function alterarQuantidade(index, mudanca) {
    if (carrinho[index].quantidade + mudanca > 0) {
        carrinho[index].quantidade += mudanca;
    } else {
        carrinho.splice(index, 1);
        mostrarAviso("Item removido da lista.", "info");
    }
    salvarCarrinho();
    carregarCarrinho(); 
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    carregarCarrinho();
    mostrarAviso("Item excluído da lista.", "info");
}
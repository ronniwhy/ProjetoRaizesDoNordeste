/**
 * =========================================
 * Inicialização Principal
 * =========================================
 */

// --- FILTROS DO CARDÁPIO ---
function selecionarUnidade() {
    localStorage.setItem("unidade_ativa", document.getElementById("unidade").value);
    filtrarCardapio();
}

function filtrarCardapio() {
    const regiao = document.getElementById("unidade")?.value.toLowerCase();
    if(!regiao) return;

    document.querySelectorAll(".menu-item").forEach(item => {
        item.style.display = (regiao === "todas" || item.getAttribute("data-regiao").toLowerCase().includes(regiao.split(" - ")[0])) ? "flex" : "none";
    });
}

// --- CLUBE DE FIDELIDADE ---
function carregarFidelidade() {
    const pontosEl = document.querySelector(".pontos");
    if (!pontosEl) return;
    
    const user = obterUsuarioAtivo();
    if (!user) {
        pontosEl.textContent = "0";
        document.querySelector(".info").innerHTML = "<strong>Faça login</strong> para acumular pontos!";
    } else {
        pontosEl.textContent = user.pontos;
    }
}

// --- MOTOR DE INICIALIZAÇÃO E STATUS EM TEMPO REAL ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Core / Sessão
    inicializarContasTeste(); 
    atualizarMenuAutenticacao();

    // 2. Baseado na Tela Aberta
    const unidadeSelect = document.getElementById("unidade");
    if (unidadeSelect) {
        const unidadeSalva = localStorage.getItem("unidade_ativa");
        if (unidadeSalva) unidadeSelect.value = unidadeSalva;
        filtrarCardapio();
    }
    
    if (document.getElementById("listaCarrinho")) carregarCarrinho();
    if (document.getElementById("listaPedidos")) carregarPedidos(); 
    if (document.getElementById("totalPagamento")) carregarPagamento();
    if (document.querySelector(".pontos")) carregarFidelidade();
    if (document.getElementById("painelContent")) carregarPainel();

    // 3. Atualizador Dinâmico de Status de Pedido
    setInterval(() => {
        document.querySelectorAll('.status-dinamico').forEach(elemento => {
            const idPedido = elemento.getAttribute('data-id');
            if (idPedido) elemento.textContent = obterStatusReal(idPedido);
        });
    }, 3000);
});
/**
 * =========================================
 * Funções utilitárias e visuais
 * =========================================
 */

// --- SISTEMA DE NOTIFICAÇÕES (TOASTS) ---
function mostrarAviso(mensagem, tipo = 'info') {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${tipo}`);
    
    let icone = tipo === 'sucesso' ? '✅' : (tipo === 'erro' ? '❌' : '🔔');

    toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); 
    }, 3000);
}

// --- FORMATAÇÃO DE DATA ---
function formatarData(timestamp) {
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
}

function aceitarLGPD() {
    localStorage.setItem('lgpd_aceito', 'true');
    const banner = document.getElementById('lgpdBanner');
    if (banner) banner.style.display = 'none';
}
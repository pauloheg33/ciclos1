// Script para a página de correlação proposta
console.log('🔗 Carregando página de correlação...');

// Estado global da aplicação
let correlationData = [];
let filteredData = [];

// Aguardar DOM
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('🚀 Inicializando página de correlação...');
    
    try {
        // Carregar dados
        await loadCorrelationData();
        
        // Configurar filtros
        setupFilters();
        
        // Renderizar tabela inicial
        renderTable();
        
        // Atualizar estatísticas
        updateStatistics();
        
        // Configurar exportação
        setupExport();
        
        console.log('✅ Página de correlação inicializada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showError('Erro ao carregar os dados de correlação');
    }
}

async function loadCorrelationData() {
    console.log('📥 Carregando dados de correlação...');
    
    try {
        const response = await fetch('./Correção sugerida ao SPAECE.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        correlationData = processCorrelationData(data);
        filteredData = [...correlationData];
        
        console.log('✅ Dados carregados:', correlationData.length, 'habilidades');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
    }
}

function processCorrelationData(rawData) {
    return rawData.map(item => ({
        codigo_habilidade: item.codigo_habilidade || '',
        descricao_habilidade: item.descricao_habilidade || '',
        bncc: item.bncc || '',
        spaece: item.spaece ? item.spaece.descricao || '' : '',
        componente: item.componente || '',
        ano: item.ano || ''
    })).filter(item => item.codigo_habilidade); // Filtrar itens inválidos
}

function setupFilters() {
    const componenteFilter = document.getElementById('componente-filter');
    const anoFilter = document.getElementById('ano-filter');
    const searchInput = document.getElementById('search-input');
    
    if (componenteFilter) {
        componenteFilter.addEventListener('change', applyFilters);
    }
    
    if (anoFilter) {
        anoFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
}

function applyFilters() {
    const componenteFilter = document.getElementById('componente-filter')?.value || '';
    const anoFilter = document.getElementById('ano-filter')?.value || '';
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    filteredData = correlationData.filter(item => {
        const matchesComponente = !componenteFilter || item.componente === componenteFilter;
        const matchesAno = !anoFilter || item.ano === anoFilter;
        const matchesSearch = !searchTerm || 
            item.codigo_habilidade.toLowerCase().includes(searchTerm) ||
            item.descricao_habilidade.toLowerCase().includes(searchTerm) ||
            item.bncc.toLowerCase().includes(searchTerm) ||
            item.spaece.toLowerCase().includes(searchTerm);
        
        return matchesComponente && matchesAno && matchesSearch;
    });
    
    renderTable();
    updateStatistics();
}

function renderTable() {
    const tbody = document.getElementById('correlations-tbody');
    if (!tbody) return;
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem; color: #666;">
                    🔍 Nenhuma habilidade encontrada com os filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    const html = filteredData.map(item => `
        <tr onclick="showDetails('${item.codigo_habilidade}')" style="cursor: pointer;" title="Clique para ver detalhes">
            <td class="cnca-cell">
                <div class="skill-code">${item.codigo_habilidade}</div>
                <div class="skill-description">${item.descricao_habilidade}</div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                    📚 ${item.componente} | 🎓 ${item.ano}
                </div>
            </td>
            <td class="bncc-cell">
                ${item.bncc ? `<div class="bncc-code">${item.bncc}</div>` : '<div class="no-correlation">Sem correlação</div>'}
            </td>
            <td class="spaece-cell">
                ${item.spaece ? `<div class="spaece-description">${item.spaece}</div>` : '<div class="no-correlation">Sem correlação</div>'}
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

function updateStatistics() {
    const totalCount = document.getElementById('total-count');
    const spaeceCount = document.getElementById('spaece-count');
    const bnccCoverage = document.getElementById('bncc-coverage');
    const spaeceCoverage = document.getElementById('spaece-coverage');
    const componentStats = document.getElementById('component-stats');
    
    const total = filteredData.length;
    const withSpaece = filteredData.filter(item => item.spaece).length;
    const withBncc = filteredData.filter(item => item.bncc).length;
    
    if (totalCount) totalCount.textContent = total;
    if (spaeceCount) spaeceCount.textContent = withSpaece;
    
    if (bnccCoverage) {
        const percentage = total > 0 ? Math.round((withBncc / total) * 100) : 0;
        bnccCoverage.textContent = `${percentage}%`;
    }
    
    if (spaeceCoverage) {
        const percentage = total > 0 ? Math.round((withSpaece / total) * 100) : 0;
        spaeceCoverage.textContent = `${percentage}%`;
    }
    
    if (componentStats) {
        const componentCounts = {};
        filteredData.forEach(item => {
            const key = `${item.componente} - ${item.ano}`;
            componentCounts[key] = (componentCounts[key] || 0) + 1;
        });
        
        const statsHtml = Object.entries(componentCounts)
            .map(([key, count]) => `<div>${key}: ${count} habilidades</div>`)
            .join('');
        
        componentStats.innerHTML = statsHtml || 'Nenhum dado disponível';
    }
}

function showDetails(codigoHabilidade) {
    const item = correlationData.find(h => h.codigo_habilidade === codigoHabilidade);
    if (!item) return;
    
    const modal = document.getElementById('detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = `Detalhes: ${item.codigo_habilidade}`;
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3>🎯 Habilidade CNCA</h3>
            <div class="detail-content">
                <strong>Código:</strong> ${item.codigo_habilidade}<br>
                <strong>Descrição:</strong> ${item.descricao_habilidade}<br>
                <strong>Componente:</strong> ${item.componente}<br>
                <strong>Ano:</strong> ${item.ano}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>📚 Correlação BNCC</h3>
            <div class="detail-content">
                ${item.bncc ? `<strong>Código BNCC:</strong> ${item.bncc}` : '<em>Sem correlação identificada</em>'}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>🎓 Correlação SPAECE</h3>
            <div class="detail-content">
                ${item.spaece ? `<strong>Descrição:</strong> ${item.spaece}` : '<em>Sem correlação identificada</em>'}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupExport() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToPDF);
    }
}

async function exportToPDF() {
    const exportBtn = document.getElementById('export-btn');
    const originalText = exportBtn.textContent;
    
    try {
        exportBtn.textContent = '⏳ Gerando...';
        exportBtn.disabled = true;
        
        // Verificar se jsPDF está disponível
        if (typeof window.jspdf === 'undefined') {
            throw new Error('Biblioteca jsPDF não encontrada');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        // Cabeçalho
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        
        const title = 'Correlação Proposta - CNCA, BNCC e SPAECE';
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        
        doc.text(title, titleX, margin + 5);
        
        // Subtítulo
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        
        const subtitle = 'Mapeamento entre Habilidades - 2025';
        const subtitleWidth = doc.getTextWidth(subtitle);
        const subtitleX = (pageWidth - subtitleWidth) / 2;
        
        doc.text(subtitle, subtitleX, margin + 15);
        
        // Linha separadora
        doc.setDrawColor(79, 172, 254);
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 20, pageWidth - margin, margin + 20);
        
        // Estatísticas
        let y = margin + 35;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text('Estatísticas:', margin, y);
        
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        const stats = [
            `Total de habilidades: ${filteredData.length}`,
            `Com correlação BNCC: ${filteredData.filter(item => item.bncc).length}`,
            `Com correlação SPAECE: ${filteredData.filter(item => item.spaece).length}`
        ];
        
        stats.forEach(stat => {
            doc.text(`• ${stat}`, margin + 3, y);
            y += 6;
        });
        
        // Tabela
        y += 10;
        
        const tableData = filteredData.map(item => [
            `${item.codigo_habilidade}\n${item.descricao_habilidade}\n(${item.componente} - ${item.ano})`,
            item.bncc || 'Sem correlação',
            item.spaece || 'Sem correlação'
        ]);
        
        const tableConfig = {
            startY: y,
            head: [['Habilidade CNCA', 'Código BNCC', 'Descrição SPAECE']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [79, 172, 254],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                textColor: 60,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            columnStyles: {
                0: { cellWidth: 'auto', minCellWidth: 60 },
                1: { cellWidth: 35, halign: 'center' },
                2: { cellWidth: 'auto', minCellWidth: 50 }
            },
            margin: { left: margin, right: margin },
            styles: {
                cellPadding: 2,
                fontSize: 8,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
                overflow: 'linebreak'
            }
        };
        
        doc.autoTable(tableConfig);
        
        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            
            const footerText = 'Correlação Proposta - Sistema Educacional 2025';
            doc.text(footerText, margin, pageHeight - 8);
            
            const pageText = `Página ${i} de ${pageCount}`;
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 8);
        }
        
        // Salvar
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `Correlacao_Proposta_CNCA_BNCC_SPAECE_${timestamp}.pdf`;
        
        doc.save(fileName);
        
        console.log('✅ PDF exportado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao exportar PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    }
}

function showError(message) {
    const tbody = document.getElementById('correlations-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem; color: #e53e3e;">
                    ❌ ${message}
                </td>
            </tr>
        `;
    }
}

// Função utilitária de debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fechar modal ao clicar no backdrop
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        closeModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

console.log('✅ Script de correlação carregado!');
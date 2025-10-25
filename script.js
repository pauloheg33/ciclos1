// Dashboard Educacional - VERSÃO SIMPLIFICADA FUNCIONAL
console.log('🔄 Carregando versão simplificada do dashboard...');

// Estado global simples
let appData = {
    jsonData: null,
    habilidadesData: null,
    escolasData: null,
    currentFilters: {
        ano: '',
        componente: '',
        escola: '',
        turma: '',
        performanceRange: 'todas'
    }
};

// Aguardar DOM
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('🚀 Inicializando dashboard...');
    
    try {
        // Carregar dados
        await loadData();
        
        // Carregar habilidades
        await loadHabilidades();
        
        // Carregar dados das escolas
        await loadEscolas();
        
        // Configurar filtros
        setupFilters();
        
        // Configurar pré-seleção dos filtros
        setupDefaultFilters();
        
        // Configurar botão de relatório
        setupReportButton();
        
        console.log('✅ Dashboard inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
}

async function loadData() {
    console.log('📥 Carregando dados JSON...');
    
    const response = await fetch('./codigos_com_percentuais.json');
    const text = await response.text();
    
    // Limpar NaN do JSON
    const cleanText = text.replace(/:\s*NaN/g, ': null');
    appData.jsonData = JSON.parse(cleanText);
    
    console.log('✅ Dados carregados:', Object.keys(appData.jsonData));
}

async function loadHabilidades() {
    console.log('📚 Carregando dados das habilidades...');
    
    try {
        // Usar o arquivo JSON em vez do YAML para compatibilidade
        const response = await fetch('./tabelas_sem_ciclos.json');
        const jsonData = await response.json();
        
        // Processar dados JSON em um mapa para lookup rápido
        appData.habilidadesData = {};
        
        Object.keys(jsonData).forEach(categoria => {
            const habilidades = jsonData[categoria];
            if (Array.isArray(habilidades)) {
                habilidades.forEach(hab => {
                    if (hab.CÓDIGO) {
                        appData.habilidadesData[hab.CÓDIGO] = {
                            codigo: hab.CÓDIGO,
                            habilidade: hab.HABILIDADE,
                            bncc: hab['HABILIDADE BNCC'],
                            ut: hab.UT || null, // Para matemática
                            categoria: categoria
                        };
                    }
                });
            }
        });
        
        console.log('✅ Habilidades carregadas:', Object.keys(appData.habilidadesData).length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar habilidades:', error);
        appData.habilidadesData = {};
    }
}



async function loadEscolas() {
    console.log('🏫 Carregando dados das escolas...');
    
    try {
        const response = await fetch('./escolas.yaml');
        const yamlText = await response.text();
        const yamlData = jsyaml.load(yamlText);
        
        appData.escolasData = yamlData.escolas || [];
        
        console.log('✅ Escolas carregadas:', appData.escolasData.length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar escolas:', error);
        appData.escolasData = [];
    }
}

function setupFilters() {
    // Obter elementos
    const anoSelect = document.getElementById('ano-escolar');
    const componenteSelect = document.getElementById('componente');
    const escolaSelect = document.getElementById('escola');
    const turmaSelect = document.getElementById('turma');
    
    if (!anoSelect) {
        console.error('❌ Elemento ano-escolar não encontrado!');
        return;
    }
    
    console.log('📋 Configurando filtro de anos...');
    
    // Extrair anos únicos
    const anos = new Set();
    Object.keys(appData.jsonData).forEach(key => {
        const match = key.match(/tabelas_(\d+)o_ano/);
        if (match) {
            anos.add(match[1] + 'º Ano');
        }
    });
    
    // Popular filtro de anos
    const anosArray = Array.from(anos).sort();
    console.log('📚 Anos encontrados:', anosArray);
    
    anoSelect.innerHTML = '<option value="">Selecione o ano</option>';
    anosArray.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        anoSelect.appendChild(option);
    });
    
    // Event listeners
    anoSelect.addEventListener('change', handleAnoChange);
    if (componenteSelect) componenteSelect.addEventListener('change', handleComponenteChange);
    if (escolaSelect) escolaSelect.addEventListener('change', handleEscolaChange);
    if (turmaSelect) turmaSelect.addEventListener('change', handleTurmaChange);
    
    // Adicionar event listener para filtro de faixa de desempenho
    const performanceRangeSelect = document.getElementById('performance-range');
    if (performanceRangeSelect) {
        performanceRangeSelect.addEventListener('change', handlePerformanceRangeChange);
    }
    
    console.log('✅ Filtros configurados!');
}

function setupDefaultFilters() {
    console.log('🎯 Configurando pré-seleção dos filtros...');
    
    // Aguardar um pequeno delay para garantir que os options foram populados
    setTimeout(() => {
        // Pré-selecionar 2º Ano
        const anoSelect = document.getElementById('ano-escolar');
        if (anoSelect) {
            anoSelect.value = '2º Ano';
            if (anoSelect.value === '2º Ano') {
                appData.currentFilters.ano = '2º Ano';
                console.log('✅ Pré-selecionado: 2º Ano');
                
                // Atualizar componentes
                updateComponenteOptions();
                
                // Aguardar e selecionar Leitura
                setTimeout(() => {
                    const componenteSelect = document.getElementById('componente');
                    if (componenteSelect) {
                        componenteSelect.value = 'Leitura';
                        if (componenteSelect.value === 'Leitura') {
                            appData.currentFilters.componente = 'Leitura';
                            console.log('✅ Pré-selecionado: Leitura');
                            
                            // Atualizar escolas
                            updateEscolaOptions();
                            
                            // Aguardar e selecionar escola
                            setTimeout(() => {
                                const escolaSelect = document.getElementById('escola');
                                if (escolaSelect) {
                                    escolaSelect.value = '03 DE DEZEMBRO';
                                    if (escolaSelect.value === '03 DE DEZEMBRO') {
                                        appData.currentFilters.escola = '03 DE DEZEMBRO';
                                        console.log('✅ Pré-selecionado: 03 DE DEZEMBRO');
                                        
                                        // Atualizar turmas
                                        updateTurmaOptions();
                                        
                                        // Aguardar e selecionar turma A
                                        setTimeout(() => {
                                            const turmaSelect = document.getElementById('turma');
                                            if (turmaSelect) {
                                                turmaSelect.value = 'A';
                                                if (turmaSelect.value === 'A') {
                                                    appData.currentFilters.turma = 'A';
                                                    console.log('✅ Pré-selecionado: Turma A');
                                                    
                                                    // Renderizar cards com filtros pré-selecionados
                                                    renderCards();
                                                    updateReportButton();
                                                    
                                                    console.log('🎯 Pré-seleção completa!');
                                                }
                                            }
                                        }, 200);
                                    }
                                }
                            }, 200);
                        }
                    }
                }, 200);
            }
        }
    }, 100);
}

function handleAnoChange(event) {
    const ano = event.target.value;
    console.log('🔄 Ano selecionado:', ano);
    
    appData.currentFilters.ano = ano;
    appData.currentFilters.componente = '';
    appData.currentFilters.escola = '';
    appData.currentFilters.turma = '';
    
    // Resetar filtro de performance range quando ano muda
    const performanceRangeSelect = document.getElementById('performance-range');
    if (performanceRangeSelect) {
        performanceRangeSelect.value = 'todas';
        appData.currentFilters.performanceRange = 'todas';
    }
    
    updateComponenteOptions();
    updateReportButton();
}

function updateComponenteOptions() {
    const componenteSelect = document.getElementById('componente');
    const escolaSelect = document.getElementById('escola');
    const turmaSelect = document.getElementById('turma');
    
    // Limpar selects dependentes
    if (componenteSelect) componenteSelect.innerHTML = '<option value="">Selecione o componente</option>';
    if (escolaSelect) escolaSelect.innerHTML = '<option value="">Selecione a escola</option>';
    if (turmaSelect) turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';
    
    const ano = appData.currentFilters.ano;
    if (!ano) return;
    
    const anoNum = ano.match(/(\d+)º/)?.[1];
    if (!anoNum) return;
    
    // Buscar componentes
    const componentes = new Set();
    Object.keys(appData.jsonData).forEach(key => {
        const match = key.match(/tabelas_(\d+)o_ano_(.+)/);
        if (match && match[1] === anoNum) {
            componentes.add(match[2]);
        }
    });
    
    const componentesArray = Array.from(componentes).sort();
    console.log('📖 Componentes para', ano, ':', componentesArray);
    
    if (componenteSelect) {
        componentesArray.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp;
            option.textContent = comp;
            componenteSelect.appendChild(option);
        });
    }
}

function handleComponenteChange(event) {
    const componente = event.target.value;
    console.log('🔄 Componente selecionado:', componente);
    
    appData.currentFilters.componente = componente;
    appData.currentFilters.escola = '';
    appData.currentFilters.turma = '';
    
    // Resetar filtro de performance range quando componente muda
    const performanceRangeSelect = document.getElementById('performance-range');
    if (performanceRangeSelect) {
        performanceRangeSelect.value = 'todas';
        appData.currentFilters.performanceRange = 'todas';
    }
    
    updateEscolaOptions();
    updateReportButton();
}

function updateEscolaOptions() {
    const escolaSelect = document.getElementById('escola');
    const turmaSelect = document.getElementById('turma');
    
    if (escolaSelect) escolaSelect.innerHTML = '<option value="">Selecione a escola</option>';
    if (turmaSelect) turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';
    
    const { ano, componente } = appData.currentFilters;
    if (!ano || !componente) return;
    
    const anoNum = ano.match(/(\d+)º/)?.[1];
    const tabelaKey = `tabelas_${anoNum}o_ano_${componente}`;
    const dados = appData.jsonData[tabelaKey];
    
    if (!dados || !Array.isArray(dados)) return;
    
    // Extrair escolas
    const escolas = new Set();
    dados.slice(1).forEach(linha => {
        if (linha.Escola && typeof linha.Escola === 'string' && 
            linha.Escola !== null && linha.Escola.trim() !== '') {
            escolas.add(linha.Escola);
        }
    });
    
    const escolasArray = Array.from(escolas).sort();
    console.log('🏫 Escolas para', componente, ':', escolasArray);
    
    if (escolaSelect) {
        escolasArray.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola;
            option.textContent = escola;
            escolaSelect.appendChild(option);
        });
    }
}

function handleEscolaChange(event) {
    const escola = event.target.value;
    console.log('🔄 Escola selecionada:', escola);
    
    appData.currentFilters.escola = escola;
    appData.currentFilters.turma = '';
    
    updateTurmaOptions();
    renderCards();
    updateReportButton();
}

function updateTurmaOptions() {
    const turmaSelect = document.getElementById('turma');
    
    if (turmaSelect) turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';
    
    const { ano, componente, escola } = appData.currentFilters;
    if (!ano || !componente || !escola) return;
    
    const anoNum = ano.match(/(\d+)º/)?.[1];
    const tabelaKey = `tabelas_${anoNum}o_ano_${componente}`;
    const dados = appData.jsonData[tabelaKey];
    
    if (!dados || !Array.isArray(dados)) return;
    
    // Extrair turmas
    const turmas = new Set();
    dados.slice(1).forEach(linha => {
        if (linha.Escola === escola && linha.Turma && 
            typeof linha.Turma === 'string' && linha.Turma !== null) {
            turmas.add(linha.Turma);
        }
    });
    
    const turmasArray = Array.from(turmas).sort();
    console.log('🎪 Turmas para', escola, ':', turmasArray);
    
    if (turmaSelect) {
        turmasArray.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma;
            option.textContent = turma;
            turmaSelect.appendChild(option);
        });
    }
}

function handleTurmaChange(event) {
    const turma = event.target.value;
    console.log('🔄 Turma selecionada:', turma);
    
    appData.currentFilters.turma = turma;
    renderCards();
    updateReportButton();
}

function handlePerformanceRangeChange(event) {
    const performanceRange = event.target.value;
    console.log('🔄 Faixa de desempenho selecionada:', performanceRange);
    
    appData.currentFilters.performanceRange = performanceRange;
    renderCards();
    updateReportButton();
}

function setupReportButton() {
    const reportButton = document.getElementById('generate-report');
    if (reportButton) {
        reportButton.addEventListener('click', generateReport);
        updateReportButton(); // Estado inicial
    }
}

function updateReportButton() {
    const reportButton = document.getElementById('generate-report');
    if (!reportButton) return;
    
    const { ano, componente, escola } = appData.currentFilters;
    const hasBasicFilters = ano && componente && escola;
    
    reportButton.disabled = !hasBasicFilters;
    
    if (hasBasicFilters) {
        reportButton.querySelector('.report-text').textContent = 'Gerar Relatório';
    } else {
        reportButton.querySelector('.report-text').textContent = 'Selecione os filtros';
    }
}

function renderCards() {
    console.log('🎨 Renderizando cards com filtros:', appData.currentFilters);
    
    const container = document.getElementById('cards-container');
    const noDataDiv = document.getElementById('no-data');
    
    if (!container) return;
    
    const dados = getFilteredData();
    
    if (dados.length === 0) {
        container.style.display = 'none';
        if (noDataDiv) noDataDiv.style.display = 'flex';
        return;
    }
    
    // Ocultar no-data e mostrar container
    if (noDataDiv) noDataDiv.style.display = 'none';
    container.style.display = 'flex';
    
    // Agrupar por escola
    const porEscola = new Map();
    dados.forEach(item => {
        if (!porEscola.has(item.escola)) {
            porEscola.set(item.escola, []);
        }
        porEscola.get(item.escola).push(item);
    });
    
    let html = '';
    let schoolCount = 0;
    
    for (const [escola, items] of porEscola) {
        schoolCount++;
        // Aproveitar melhor o espaço da tela com mais habilidades
        const maxItemsPerSchool = appData.currentFilters.turma ? 
            Math.min(45, items.length) : // Se turma específica, mostra mais
            Math.min(30, items.length);   // Se geral, quantidade moderada
        
        const limitedItems = items.slice(0, maxItemsPerSchool);
        
        html += `
            <div class="school-section">
                <div class="school-header">
                    <h2 class="school-title">🏫 ${escola}</h2>
                    <p class="school-meta">${appData.currentFilters.turma ? `Turma ${appData.currentFilters.turma} - ` : ''}${limitedItems.length}${limitedItems.length < items.length ? `/${items.length}` : ''} habilidades</p>
                </div>
                <div class="habilidades-grid">
                    ${limitedItems.map(createCard).join('')}
                </div>
            </div>
        `;
        
        // Mostrar mais escolas aproveitando o espaço
        if (schoolCount >= 4 && !appData.currentFilters.turma) break;
        if (schoolCount >= 2 && appData.currentFilters.turma) break;
    }
    
    container.innerHTML = html;
}

function getHabilidadeTooltip(codigoH) {
    // Primeiro tentar encontrar o código real da habilidade
    let codigoReal = null;
    
    // Procurar nos dados JSON qual código corresponde a este H
    const { ano, componente } = appData.currentFilters;
    if (ano && componente) {
        const anoNum = ano.match(/(\d+)º/)?.[1];
        const tabelaKey = `tabelas_${anoNum}o_ano_${componente}`;
        const dados = appData.jsonData[tabelaKey];
        
        if (dados && Array.isArray(dados) && dados.length > 0) {
            const headerRow = dados[0];
            if (headerRow[codigoH]) {
                codigoReal = headerRow[codigoH];
            }
        }
    }
    
    // Buscar a habilidade correspondente
    const habilidade = codigoReal ? appData.habilidadesData[codigoReal] : null;
    
    if (!habilidade) {
        return `📋 ${codigoH}\n\n🔍 Clique no card para mais informações sobre esta habilidade.`;
    }
    
    let tooltip = `📋 ${habilidade.codigo} (${codigoH})\n\n`;
    tooltip += `📖 Habilidade:\n${habilidade.habilidade}\n\n`;
    
    if (habilidade.bncc) {
        tooltip += `🎯 Código BNCC: ${habilidade.bncc}\n`;
    }
    if (habilidade.ut) {
        tooltip += `📊 Unidade Temática: ${habilidade.ut}\n`;
    }
    
    // Extrair informações da categoria de forma mais limpa
    const categoria = habilidade.categoria.replace(/^tabelas_/, '').replace(/\.xlsx_/, ' - ');
    tooltip += `📂 Origem: ${categoria}`;
    
    return tooltip;
}

function createCard(item) {
    const perc = parseFloat(item.percentage);
    let classe = 'performance-low';
    let desempenho = '';
    
    if (perc > 80) {
        classe = 'performance-high';
        desempenho = 'Adequado (> 80%)';
    } else if (perc >= 60) {
        classe = 'performance-medium-high';
        desempenho = 'Intermediário (60-80%)';
    } else {
        classe = 'performance-medium-low';
        desempenho = 'Crítico (< 60%)';
    }
    
    let tooltipText = getHabilidadeTooltip(item.habilidade);
    tooltipText += `\n\n📊 Desempenho: ${desempenho}`;
    tooltipText += `\n🎯 Percentual de acerto: ${perc.toFixed(1)}%`;
    tooltipText += `\n🏫 Turma: ${item.turma}`;
    
    return `
        <div class="habilidade-card ${classe}" 
             data-tooltip="${tooltipText.replace(/"/g, '&quot;')}">
            <div class="performance-indicator ${classe}"></div>
            <div class="habilidade-code">${item.habilidade}</div>
            <div class="habilidade-percentage">${perc.toFixed(1)}%</div>
            <div class="habilidade-turma">Turma ${item.turma}</div>
        </div>
    `;
}

function getFilteredData() {
    const { ano, componente, escola, turma, performanceRange } = appData.currentFilters;
    
    if (!ano || !componente) return [];
    
    const anoNum = ano.match(/(\d+)º/)?.[1];
    const tabelaKey = `tabelas_${anoNum}o_ano_${componente}`;
    const dados = appData.jsonData[tabelaKey];
    
    if (!dados || !Array.isArray(dados)) return [];
    
    const resultado = [];
    
    dados.slice(1).forEach(linha => {
        if (escola && linha.Escola !== escola) return;
        if (turma && linha.Turma !== turma) return;
        
        Object.entries(linha).forEach(([key, value]) => {
            if (key.startsWith('H') && typeof value === 'number') {
                // Aplicar filtro de faixa de desempenho
                if (performanceRange && performanceRange !== 'todas') {
                    const percentage = parseFloat(value);
                    
                    switch (performanceRange) {
                        case 'critico':
                            if (percentage >= 60) return; // Só mostrar < 60%
                            break;
                        case 'intermediario':
                            if (percentage < 60 || percentage > 80) return; // Só mostrar 60-80%
                            break;
                        case 'adequado':
                            if (percentage <= 80) return; // Só mostrar > 80%
                            break;
                    }
                }
                
                resultado.push({
                    escola: linha.Escola,
                    turma: linha.Turma,
                    habilidade: key,
                    percentage: value
                });
            }
        });
    });
    
    return resultado;
}

// Sistema de tooltips customizados
function initTooltipSystem() {
    let tooltip = null;
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.habilidade-card[data-tooltip]')) {
            const card = e.target.closest('.habilidade-card[data-tooltip]');
            showTooltip(card, card.dataset.tooltip);
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.habilidade-card[data-tooltip]')) {
            hideTooltip();
        }
    });
    
    function showTooltip(element, text) {
        hideTooltip(); // Remove tooltip anterior se existir
        
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.bottom + 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Ajustar se sair da tela
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 10;
        }
        
        tooltip.style.top = top + window.scrollY + 'px';
        tooltip.style.left = left + 'px';
        
        // Mostrar com animação
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }
    
    function hideTooltip() {
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    }
}

// Debug global
window.debugApp = () => console.log('Debug:', appData);

console.log('✅ Script simplificado carregado!');

async function generateReport() {
    const reportButton = document.getElementById('generate-report');
    const reportIcon = reportButton.querySelector('.report-icon');
    const reportText = reportButton.querySelector('.report-text');
    
    // Estado de loading
    reportButton.classList.add('generating');
    reportIcon.textContent = '⏳';
    reportText.textContent = 'Gerando...';
    
    try {
        console.log('📄 Iniciando geração de relatório...');
        
        // Obter dados filtrados
        const dadosFiltrados = getFilteredData();
        
        if (dadosFiltrados.length === 0) {
            alert('Nenhum dado encontrado com os filtros selecionados.');
            return;
        }
        
        // Criar documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        // Cabeçalho do relatório
        await addReportHeader(doc, pageWidth, margin);
        
        // Informações dos filtros
        let yPosition = addFilterInfo(doc, margin, 35);
        
        // Resumo estatístico
        yPosition = addStatisticalSummary(doc, dadosFiltrados, margin, yPosition + 5);
        
        // Tabela de habilidades
        yPosition = await addSkillsTable(doc, dadosFiltrados, yPosition + 8);
        
        // Lista de descrições das habilidades
        await addSkillDescriptions(doc, dadosFiltrados, yPosition);
        
        // Rodapé
        addReportFooter(doc, pageWidth, pageHeight, margin);
        
        // Gerar nome do arquivo
        const fileName = generateFileName();
        
        // Salvar PDF
        doc.save(fileName);
        
        console.log('✅ Relatório gerado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
        // Restaurar estado do botão
        reportButton.classList.remove('generating');
        reportIcon.textContent = '📄';
        reportText.textContent = 'Gerar Relatório';
    }
}

async function addReportHeader(doc, pageWidth, margin) {
    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    
    const title = 'Relatório Educacional - Análise de Desempenho por Habilidade';
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    
    doc.text(title, titleX, margin + 3);
    
    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    const subtitle = 'Ciclos CNCA e PROEA 2025';
    const subtitleWidth = doc.getTextWidth(subtitle);
    const subtitleX = (pageWidth - subtitleWidth) / 2;
    
    doc.text(subtitle, subtitleX, margin + 12);
    
    // Linha separadora
    doc.setDrawColor(79, 172, 254);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 17, pageWidth - margin, margin + 17);
    
    // Data de geração
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    
    const dataGeracao = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataGeracao}`, pageWidth - margin - 45, margin + 22);
}

function addFilterInfo(doc, margin, yStart) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Filtros Aplicados:', margin, yStart);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    let y = yStart + 6;
    const { ano, componente, escola, turma } = appData.currentFilters;
    
    doc.text(`• Ano Escolar: ${ano}`, margin + 3, y);
    y += 4;
    doc.text(`• Componente Curricular: ${componente}`, margin + 3, y);
    y += 4;
    doc.text(`• Escola: ${escola}`, margin + 3, y);
    
    if (turma) {
        y += 4;
        doc.text(`• Turma: ${turma}`, margin + 3, y);
    }
    
    return y;
}

function addStatisticalSummary(doc, dados, margin, yStart) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumo Estatístico', margin, yStart);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Calcular estatísticas
    const percentuais = dados.map(item => parseFloat(item.percentage)).filter(p => !isNaN(p));
    const total = percentuais.length;
    const media = total > 0 ? (percentuais.reduce((a, b) => a + b, 0) / total).toFixed(1) : 0;
    
    // Contadores por faixa de desempenho
    let adequado = 0, intermediario = 0, critico = 0;
    
    percentuais.forEach(perc => {
        if (perc > 80) adequado++;
        else if (perc >= 60) intermediario++;
        else critico++;
    });
    
    let y = yStart + 8;
    
    // Formatação organizada e limpa
    const estatisticas = [
        `Total de habilidades: ${total}`,
        `Média de acerto: ${media}%`,
        `Adequado (>80%): ${adequado} habilidades`,
        `Intermediário (60-80%): ${intermediario} habilidades`,
        `Crítico (<60%): ${critico} habilidades`
    ];
    
    estatisticas.forEach(texto => {
        doc.text(`• ${texto}`, margin + 5, y);
        y += 6; // Espaçamento consistente entre linhas
    });
    
    return y + 5;
}

async function addSkillsTable(doc, dados, yStart) {
    // Preparar dados da tabela com códigos completos
    const tableData = dados.map(item => {
        const perc = parseFloat(item.percentage);
        
        // Obter código real da habilidade
        let codigoReal = null;
        const { ano, componente } = appData.currentFilters;
        
        if (ano && componente) {
            const anoNum = ano.match(/(\d+)º/)?.[1];
            const tabelaKey = `tabelas_${anoNum}o_ano_${componente}`;
            const dadosTabela = appData.jsonData[tabelaKey];
            
            if (dadosTabela && Array.isArray(dadosTabela) && dadosTabela.length > 0) {
                const headerRow = dadosTabela[0];
                if (headerRow[item.habilidade]) {
                    codigoReal = headerRow[item.habilidade];
                }
            }
        }
        
        // Formato: H01: 1EF05_P
        const habilidadeFormatada = codigoReal ? `${item.habilidade}: ${codigoReal}` : item.habilidade;
        
        return [
            habilidadeFormatada,
            item.turma,
            `${perc.toFixed(1)}%`
        ];
    });
    
    // Configuração da tabela otimizada
    const tableConfig = {
        startY: yStart,
        head: [['Habilidade', 'Turma', 'Percentual']],
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
            cellPadding: 2
        },
        alternateRowStyles: {
            fillColor: [248, 248, 248]
        },
        columnStyles: {
            0: { cellWidth: 'auto', minCellWidth: 50 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: 20, right: 20 },
        styles: {
            cellPadding: 1.5,
            fontSize: 8,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        }
    };
    
    doc.autoTable(tableConfig);
    
    // Retorna a posição Y após a tabela
    return doc.lastAutoTable.finalY;
}

async function addSkillDescriptions(doc, dados, startY) {
    // Obter habilidades únicas
    const habilidadesUnicas = [...new Set(dados.map(item => item.habilidade))];
    
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = pageWidth - (margin * 2);
    const lineHeight = 5; // Altura da linha consistente
    
    // Verificar se há espaço suficiente na página atual
    let y = startY + 15;
    if (y > pageHeight - 80) {
        doc.addPage();
        y = 25;
    }
    
    // Título da seção
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Descrições das Habilidades Avaliadas', margin, y);
    
    y += 15; // Espaço após título
    
    for (const codigoH of habilidadesUnicas) {
        // Obter código real da habilidade
        let codigoReal = null;
        const { ano, componente } = appData.currentFilters;
        
        if (ano && componente) {
            const anoNum = ano.match(/(\d+)º/)?.[1];
            const tabelaKey = `tabelas_${anoNum}o_ano_${componente}`;
            const dadosTabela = appData.jsonData[tabelaKey];
            
            if (dadosTabela && Array.isArray(dadosTabela) && dadosTabela.length > 0) {
                const headerRow = dadosTabela[0];
                if (headerRow[codigoH]) {
                    codigoReal = headerRow[codigoH];
                }
            }
        }
        
        const habilidade = codigoReal ? appData.habilidadesData[codigoReal] : null;
        
        if (habilidade) {
            // Calcular espaço necessário para este item
            let textoCompleto = `${codigoH}: ${habilidade.codigo} - ${habilidade.habilidade}`;
            if (habilidade.bncc) {
                textoCompleto += ` BNCC: "${habilidade.bncc}"`;
            }
            
            const linhasTexto = doc.splitTextToSize(textoCompleto, maxWidth);
            const espacoNecessario = (linhasTexto.length * lineHeight) + (habilidade.ut ? lineHeight + 5 : 0) + 10;
            
            // Verificar se precisa de nova página
            if (y + espacoNecessario > pageHeight - 30) {
                doc.addPage();
                y = 25;
            }
            
            // Renderizar código da habilidade em negrito
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(44, 62, 80);
            doc.text(`${codigoH}: ${habilidade.codigo}`, margin, y);
            
            y += lineHeight + 2;
            
            // Renderizar descrição da habilidade
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            
            const descricaoLinhas = doc.splitTextToSize(habilidade.habilidade, maxWidth - 10);
            doc.text(descricaoLinhas, margin + 5, y);
            y += descricaoLinhas.length * lineHeight + 3;
            
            // BNCC em linha separada se existir
            if (habilidade.bncc) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`BNCC: "${habilidade.bncc}"`, margin + 5, y);
                y += lineHeight + 2;
            }
            
            // Unidade Temática em linha separada se existir
            if (habilidade.ut) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(120, 120, 120);
                doc.text(`Unidade Temática: ${habilidade.ut}`, margin + 5, y);
                y += lineHeight + 2;
            }
            
            // Espaço entre habilidades
            y += 8;
        }
    }
    
    return y;
}

function addReportFooter(doc, pageWidth, pageHeight, margin) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Texto do rodapé
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        
        const footerText = 'Dashboard Educacional - Ciclos CNCA e PROEA 2025';
        doc.text(footerText, margin, pageHeight - 8);
        
        // Numeração das páginas
        const pageText = `Página ${i} de ${pageCount}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 8);
    }
}

function generateFileName() {
    const { ano, componente, escola, turma } = appData.currentFilters;
    const timestamp = new Date().toISOString().slice(0, 10);
    
    let fileName = `Relatorio_${ano.replace('º Ano', 'ano')}_${componente}_${escola}`;
    
    if (turma) {
        fileName += `_Turma${turma}`;
    }
    
    fileName += `_${timestamp}.pdf`;
    
    // Limpar caracteres especiais
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Inicializar sistema de tooltips quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initTooltipSystem();
});
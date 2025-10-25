// Dashboard Educacional - VERSÃO SIMPLIFICADA FUNCIONAL
console.log('🔄 Carregando versão simplificada do dashboard...');

// Estado global simples
let appData = {
    jsonData: null,
    currentFilters: {
        ano: '',
        componente: '',
        escola: '',
        turma: ''
    }
};

// Aguardar DOM
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('🚀 Inicializando dashboard...');
    
    try {
        // Carregar dados
        await loadData();
        
        // Configurar filtros
        setupFilters();
        
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
    
    console.log('✅ Filtros configurados!');
}

function handleAnoChange(event) {
    const ano = event.target.value;
    console.log('🔄 Ano selecionado:', ano);
    
    appData.currentFilters.ano = ano;
    appData.currentFilters.componente = '';
    appData.currentFilters.escola = '';
    appData.currentFilters.turma = '';
    
    updateComponenteOptions();
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
    
    updateEscolaOptions();
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

function createCard(item) {
    const perc = parseFloat(item.percentage);
    let classe = 'performance-low';
    
    if (perc > 80) classe = 'performance-high';
    else if (perc > 60) classe = 'performance-medium-high';
    else if (perc > 40) classe = 'performance-medium-low';
    
    return `
        <div class="habilidade-card ${classe}">
            <div class="performance-indicator ${classe}"></div>
            <div class="habilidade-code">${item.habilidade}</div>
            <div class="habilidade-percentage">${perc.toFixed(1)}%</div>
            <div class="habilidade-turma">Turma ${item.turma}</div>
        </div>
    `;
}

function getFilteredData() {
    const { ano, componente, escola, turma } = appData.currentFilters;
    
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

// Debug global
window.debugApp = () => console.log('Debug:', appData);

console.log('✅ Script simplificado carregado!');
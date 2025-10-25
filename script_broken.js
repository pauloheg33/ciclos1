// Dashboard Educacional - Script Principal Redesign
// Processamento direto dos dados JSON com nova interface

// Estado global da aplicação
const AppState = {
    filters: {
        anoEscolar: '',
        componente: '',
        escola: '',
        turma: '',
        performanceRange: 'todas'
    },
    jsonData: null, // Dados do codigos_com_percentuais.json
    escolasData: null, // Dados das escolas do YAML
    isLoading: true
};

// Elementos DOM
const elements = {
    anoEscolar: null,
    componente: null,
    escola: null,
    turma: null,
    performanceRange: null,
    cardsContainer: null,
    loading: null,
    noData: null
};

// Inicializar elementos após DOM estar pronto
function initializeElements() {
    elements.anoEscolar = document.getElementById('ano-escolar');
    elements.componente = document.getElementById('componente');
    elements.escola = document.getElementById('escola');
    elements.turma = document.getElementById('turma');
    elements.performanceRange = document.getElementById('performance-range');
    elements.cardsContainer = document.getElementById('cards-container');
    elements.loading = document.getElementById('loading');
    elements.noData = document.getElementById('no-data');
    
    console.log('Elementos encontrados:', {
        anoEscolar: !!elements.anoEscolar,
        componente: !!elements.componente,
        escola: !!elements.escola,
        turma: !!elements.turma,
        performanceRange: !!elements.performanceRange,
        cardsContainer: !!elements.cardsContainer
    });
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando aplicação...');
    initializeElements();
    initializeEventListeners();
    loadAllData();
});

// Event listeners
function initializeEventListeners() {
    elements.anoEscolar?.addEventListener('change', handleFilterChange);
    elements.componente?.addEventListener('change', handleFilterChange);
    elements.escola?.addEventListener('change', handleFilterChange);
    elements.turma?.addEventListener('change', handleFilterChange);
    elements.performanceRange?.addEventListener('change', handleFilterChange);

    // Keyboard events
    document.addEventListener('keydown', handleKeyboardEvents);
}

// Carregamento de dados
async function loadAllData() {
    try {
        setLoadingState(true);
        
        // Carregar dados JSON e YAML em paralelo
        const [jsonData, escolasData] = await Promise.all([
            loadJsonData(),
            loadEscolasData()
        ]);
        
        AppState.jsonData = jsonData;
        AppState.escolasData = escolasData;
        
        // Inicializar filtros com dados carregados
        initializeFilters();
        
        // Renderizar cards iniciais
        renderCards();
        
        setLoadingState(false);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar os dados. Verifique a conexão.');
        setLoadingState(false);
    }
}

// Carregar dados JSON
async function loadJsonData() {
    try {
        const response = await fetch('codigos_com_percentuais.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar JSON:', error);
        throw error;
    }
}

// Carregar dados das escolas
async function loadEscolasData() {
    try {
        const response = await fetch('escolas.yaml');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('Erro ao carregar YAML:', error);
        throw error;
    }
}

// Inicializar filtros com dados disponíveis
function initializeFilters() {
    if (!AppState.jsonData) {
        console.error('Dados JSON não carregados');
        return;
    }
    
    console.log('Chaves dos dados JSON:', Object.keys(AppState.jsonData));
    
    // Extrair anos disponíveis da estrutura dos dados
    const anos = new Set();
    Object.keys(AppState.jsonData).forEach(key => {
        const match = key.match(/tabelas_(\d+)o_ano/);
        if (match) {
            anos.add(match[1] + 'º Ano');
        }
    });
    
    console.log('Anos encontrados:', Array.from(anos));
    
    const anosArray = Array.from(anos).sort();
    populateSelect(elements.anoEscolar, anosArray, 'Selecione o ano');
    
    // Configurar event listeners para filtros interdependentes
    updateComponenteOptions();
}

// Atualizar opções de componente baseado no ano selecionado
function updateComponenteOptions() {
    const anoSelecionado = AppState.filters.anoEscolar;
    elements.componente.innerHTML = '<option value="">Selecione o componente</option>';
    elements.escola.innerHTML = '<option value="">Selecione a escola</option>';
    elements.turma.innerHTML = '<option value="">Selecione a turma</option>';
    
    if (!anoSelecionado) return;
    
    // Extrair número do ano (ex: "2º Ano" -> "2")
    const anoNumero = anoSelecionado.match(/(\d+)º/)?.[1];
    console.log('Ano selecionado:', anoSelecionado, 'Número:', anoNumero);
    
    if (!anoNumero) return;
    
    // Buscar componentes disponíveis para este ano
    const componentes = new Set();
    Object.keys(AppState.jsonData).forEach(key => {
        const match = key.match(/tabelas_(\d+)o_ano_(.+)/);
        if (match && match[1] === anoNumero) {
            componentes.add(match[2]);
        }
    });
    
    console.log('Componentes encontrados:', Array.from(componentes));
    
    const componentesArray = Array.from(componentes).sort();
    populateSelect(elements.componente, componentesArray, 'Selecione o componente');
}

// Atualizar opções de escola baseado no componente selecionado
function updateEscolaOptions() {
    const { anoEscolar, componente } = AppState.filters;
    elements.escola.innerHTML = '<option value="">Selecione a escola</option>';
    elements.turma.innerHTML = '<option value="">Selecione a turma</option>';
    
    if (!anoEscolar || !componente) return;
    
    // Extrair número do ano
    const anoNumero = anoEscolar.match(/(\d+)º/)?.[1];
    if (!anoNumero) return;
    
    // Buscar tabela correspondente
    const tabelaKey = `tabelas_${anoNumero}o_ano_${componente}`;
    const tabelaData = AppState.jsonData[tabelaKey];
    
    if (!tabelaData || !Array.isArray(tabelaData)) return;
    
    // Extrair escolas únicas dos dados (ignorar primeira linha de cabeçalho)
    const escolas = new Set();
    tabelaData.slice(1).forEach(row => {
        if (row.Escola && typeof row.Escola === 'string') {
            escolas.add(row.Escola);
        }
    });
    
    const escolasArray = Array.from(escolas).sort();
    populateSelect(elements.escola, escolasArray, 'Selecione a escola');
}

// Atualizar opções de turma baseado na escola selecionada
function updateTurmaOptions() {
    const { anoEscolar, componente, escola } = AppState.filters;
    elements.turma.innerHTML = '<option value="">Selecione a turma</option>';
    
    if (!anoEscolar || !componente || !escola) return;
    
    // Extrair número do ano
    const anoNumero = anoEscolar.match(/(\d+)º/)?.[1];
    if (!anoNumero) return;
    
    // Buscar tabela correspondente
    const tabelaKey = `tabelas_${anoNumero}o_ano_${componente}`;
    const tabelaData = AppState.jsonData[tabelaKey];
    
    if (!tabelaData || !Array.isArray(tabelaData)) return;
    
    // Extrair turmas únicas para a escola selecionada
    const turmas = new Set();
    tabelaData.slice(1).forEach(row => {
        if (row.Escola === escola && row.Turma && typeof row.Turma === 'string') {
            turmas.add(row.Turma);
        }
    });
    
    const turmasArray = Array.from(turmas).sort();
    populateSelect(elements.turma, turmasArray, 'Selecione a turma');
}

// Popular select com opções
function populateSelect(selectElement, options, placeholderText) {
    if (!selectElement) {
        console.error('Select element não encontrado');
        return;
    }
    
    console.log(`Populando select com ${options.length} opções:`, options);
    
    selectElement.innerHTML = `<option value="">${placeholderText}</option>`;
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// Manipulador de mudança de filtros
function handleFilterChange(event) {
    const filterId = event.target.id;
    const value = event.target.value;
    
    // Mapear IDs para propriedades do estado
    const filterMap = {
        'ano-escolar': 'anoEscolar',
        'componente': 'componente',
        'escola': 'escola',
        'turma': 'turma',
        'performance-range': 'performanceRange'
    };
    
    const filterProperty = filterMap[filterId];
    if (filterProperty) {
        AppState.filters[filterProperty] = value;
        
        // Atualizar filtros dependentes
        if (filterProperty === 'anoEscolar') {
            AppState.filters.componente = '';
            AppState.filters.escola = '';
            AppState.filters.turma = '';
            updateComponenteOptions();
        } else if (filterProperty === 'componente') {
            AppState.filters.escola = '';
            AppState.filters.turma = '';
            updateEscolaOptions();
        } else if (filterProperty === 'escola') {
            AppState.filters.turma = '';
            updateTurmaOptions();
        }
        
        // Renderizar cards com novos filtros
        renderCards();
    }
}

// Renderizar cards
function renderCards() {
    if (!elements.cardsContainer) return;
    
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        showNoData();
        return;
    }
    
    // Agrupar dados por escola
    const dataBySchool = groupDataBySchool(filteredData);
    
    let html = '';
    
    for (const [schoolCode, schoolData] of dataBySchool) {
        const schoolName = getSchoolName(schoolCode);
        
        html += `
            <div class="school-section">
                <div class="school-header">
                    <h2 class="school-title">
                        🏫 ${schoolName}
                    </h2>
                    <p class="school-meta">
                        ${schoolData.length} habilidades • ${AppState.filters.anoEscolar} • ${AppState.filters.componente}
                        ${AppState.filters.turma ? ` • Turma ${AppState.filters.turma}` : ''}
                    </p>
                </div>
                <div class="habilidades-grid">
                    ${schoolData.map(item => createHabilidadeCard(item)).join('')}
                </div>
            </div>
        `;
    }
    
    elements.cardsContainer.innerHTML = html;
    elements.cardsContainer.style.display = 'block';
    
    if (elements.noData) elements.noData.style.display = 'none';
}

// Obter dados filtrados
function getFilteredData() {
    const { anoEscolar, componente, escola, turma, performanceRange } = AppState.filters;
    
    if (!anoEscolar || !componente) return [];
    
    // Extrair número do ano
    const anoNumero = anoEscolar.match(/(\d+)º/)?.[1];
    if (!anoNumero) return [];
    
    // Buscar tabela correspondente
    const tabelaKey = `tabelas_${anoNumero}o_ano_${componente}`;
    const tabelaData = AppState.jsonData[tabelaKey];
    
    if (!tabelaData || !Array.isArray(tabelaData)) return [];
    
    const data = [];
    
    // Processar dados (ignorar primeira linha de cabeçalho)
    tabelaData.slice(1).forEach(row => {
        // Filtrar por escola se especificada
        if (escola && row.Escola !== escola) return;
        
        // Filtrar por turma se especificada  
        if (turma && row.Turma !== turma) return;
        
        // Processar cada habilidade (H01, H02, etc.)
        Object.entries(row).forEach(([key, value]) => {
            if (key.startsWith('H') && typeof value === 'number') {
                // Verificar filtro de performance
                if (matchesPerformanceFilter(value, performanceRange)) {
                    data.push({
                        escola: row.Escola,
                        turma: row.Turma,
                        habilidade: key,
                        percentage: value
                    });
                }
            }
        });
    });
    
    return data;
}

// Verificar se percentual atende ao filtro de performance
function matchesPerformanceFilter(percentage, performanceRange) {
    if (performanceRange === 'todas') return true;
    
    const perc = parseFloat(percentage);
    
    switch (performanceRange) {
        case 'baixo': return perc <= 40;
        case 'medio-baixo': return perc > 40 && perc <= 60;
        case 'medio-alto': return perc > 60 && perc <= 80;
        case 'alto': return perc > 80;
        default: return true;
    }
}

// Agrupar dados por escola
function groupDataBySchool(data) {
    const grouped = new Map();
    
    data.forEach(item => {
        if (!grouped.has(item.escola)) {
            grouped.set(item.escola, []);
        }
        grouped.get(item.escola).push(item);
    });
    
    return grouped;
}

// Obter nome da escola
function getSchoolName(schoolName) {
    // O JSON já contém os nomes das escolas, não códigos
    // Apenas retornar o nome como está
    return schoolName || 'Escola não identificada';
}

// Criar card de habilidade
function createHabilidadeCard(item) {
    const percentage = parseFloat(item.percentage);
    const performanceClass = getPerformanceClass(percentage);
    
    return `
        <div class="habilidade-card">
            <div class="performance-indicator ${performanceClass}"></div>
            <div class="habilidade-code">${item.habilidade}</div>
            <div class="habilidade-percentage ${performanceClass}">${percentage.toFixed(1)}%</div>
            <div class="habilidade-turma">Turma ${item.turma}</div>
        </div>
    `;
}

// Obter classe de performance baseada no percentual
function getPerformanceClass(percentage) {
    if (percentage <= 40) return 'performance-low';
    if (percentage <= 60) return 'performance-medium-low';
    if (percentage <= 80) return 'performance-medium-high';
    return 'performance-high';
}

// Estados visuais
function setLoadingState(isLoading) {
    AppState.isLoading = isLoading;
    
    if (elements.loading) {
        elements.loading.style.display = isLoading ? 'flex' : 'none';
    }
    
    if (elements.cardsContainer) {
        elements.cardsContainer.style.display = isLoading ? 'none' : 'block';
    }
}

function showNoData() {
    if (elements.cardsContainer) {
        elements.cardsContainer.style.display = 'none';
    }
    
    if (elements.noData) {
        elements.noData.style.display = 'flex';
    }
}

function showError(message) {
    console.error('Erro na aplicação:', message);
    // Implementar notificação de erro se necessário
}

// Eventos de teclado
function handleKeyboardEvents(event) {
    // Implementar navegação por teclado se necessário
    if (event.key === 'Escape') {
        // Limpar filtros ou fechar modals
    }
}

// Utilitários para debugging
window.AppState = AppState;
window.debugFilters = () => console.log('Filtros atuais:', AppState.filters);
window.debugData = () => console.log('Dados carregados:', AppState.jsonData);
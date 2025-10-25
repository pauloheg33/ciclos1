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
    anoEscolar: document.getElementById('ano-escolar'),
    componente: document.getElementById('componente'),
    escola: document.getElementById('escola'),
    turma: document.getElementById('turma'),
    performanceRange: document.getElementById('performance-range'),
    cardsContainer: document.getElementById('cards-container'),
    loading: document.getElementById('loading'),
    noData: document.getElementById('no-data')
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
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
    if (!AppState.jsonData) return;
    
    // Obter anos disponíveis
    const anos = Object.keys(AppState.jsonData).sort();
    populateSelect(elements.anoEscolar, anos, 'Selecione o ano');
    
    // Configurar event listeners para filtros interdependentes
    updateComponenteOptions();
}

// Atualizar opções de componente baseado no ano selecionado
function updateComponenteOptions() {
    const anoSelecionado = AppState.filters.anoEscolar;
    elements.componente.innerHTML = '<option value="">Selecione o componente</option>';
    elements.escola.innerHTML = '<option value="">Selecione a escola</option>';
    elements.turma.innerHTML = '<option value="">Selecione a turma</option>';
    
    if (!anoSelecionado || !AppState.jsonData[anoSelecionado]) return;
    
    const componentes = Object.keys(AppState.jsonData[anoSelecionado]).sort();
    populateSelect(elements.componente, componentes, 'Selecione o componente');
}

// Atualizar opções de escola baseado no componente selecionado
function updateEscolaOptions() {
    const { anoEscolar, componente } = AppState.filters;
    elements.escola.innerHTML = '<option value="">Selecione a escola</option>';
    elements.turma.innerHTML = '<option value="">Selecione a turma</option>';
    
    if (!anoEscolar || !componente || !AppState.jsonData[anoEscolar]?.[componente]) return;
    
    const escolas = Object.keys(AppState.jsonData[anoEscolar][componente]).sort();
    populateSelect(elements.escola, escolas, 'Selecione a escola');
}

// Atualizar opções de turma baseado na escola selecionada
function updateTurmaOptions() {
    const { anoEscolar, componente, escola } = AppState.filters;
    elements.turma.innerHTML = '<option value="">Selecione a turma</option>';
    
    if (!anoEscolar || !componente || !escola || !AppState.jsonData[anoEscolar]?.[componente]?.[escola]) return;
    
    const turmas = Object.keys(AppState.jsonData[anoEscolar][componente][escola]).sort();
    populateSelect(elements.turma, turmas, 'Selecione a turma');
}

// Popular select com opções
function populateSelect(selectElement, options, placeholderText) {
    if (!selectElement) return;
    
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
                        <span style="font-size: 0.7em; color: rgba(255,255,255,0.6);">(${schoolCode})</span>
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
    
    const data = [];
    const yearData = AppState.jsonData[anoEscolar];
    
    if (!yearData || !yearData[componente]) return [];
    
    const componentData = yearData[componente];
    
    // Se escola específica foi selecionada
    if (escola && componentData[escola]) {
        const schoolData = componentData[escola];
        
        // Se turma específica foi selecionada
        if (turma && schoolData[turma]) {
            const turmaData = schoolData[turma];
            Object.entries(turmaData).forEach(([habilidade, percentage]) => {
                if (matchesPerformanceFilter(percentage, performanceRange)) {
                    data.push({
                        escola: escola,
                        turma: turma,
                        habilidade: habilidade,
                        percentage: percentage
                    });
                }
            });
        } else if (!turma) {
            // Mostrar todas as turmas da escola
            Object.entries(schoolData).forEach(([turmaKey, turmaData]) => {
                Object.entries(turmaData).forEach(([habilidade, percentage]) => {
                    if (matchesPerformanceFilter(percentage, performanceRange)) {
                        data.push({
                            escola: escola,
                            turma: turmaKey,
                            habilidade: habilidade,
                            percentage: percentage
                        });
                    }
                });
            });
        }
    } else {
        // Mostrar todas as escolas
        Object.entries(componentData).forEach(([schoolCode, schoolData]) => {
            Object.entries(schoolData).forEach(([turmaKey, turmaData]) => {
                if (!turma || turmaKey === turma) {
                    Object.entries(turmaData).forEach(([habilidade, percentage]) => {
                        if (matchesPerformanceFilter(percentage, performanceRange)) {
                            data.push({
                                escola: schoolCode,
                                turma: turmaKey,
                                habilidade: habilidade,
                                percentage: percentage
                            });
                        }
                    });
                }
            });
        });
    }
    
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
function getSchoolName(schoolCode) {
    if (AppState.escolasData && AppState.escolasData.escolas) {
        const school = AppState.escolasData.escolas.find(e => e.codigo === schoolCode);
        return school ? school.nome : schoolCode;
    }
    return schoolCode;
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
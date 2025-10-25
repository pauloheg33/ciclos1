// Dashboard Educacional - Script Principal
// Gerenciamento de estado e funcionalidades interativas

// Estado global da aplicação
const AppState = {
    filters: {
        anoEscolar: '',
        componente: '',
        escola: '',
        performanceRange: 'todas'
    },
    data: [],
    skillsData: {}, // Dados das habilidades carregados dos arquivos Excel
    isLoading: true
};

// Elementos DOM
const elements = {
    anoEscolar: document.getElementById('ano-escolar'),
    componente: document.getElementById('componente'),
    escola: document.getElementById('escola'),
    performanceRange: document.getElementById('performance-range'),
    cardsContainer: document.getElementById('cards-container'),
    loading: document.getElementById('loading'),
    noData: document.getElementById('no-data'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalDescription: document.getElementById('modal-description'),
    modalDetails: document.getElementById('modal-details'),
    announcements: document.getElementById('announcements')
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadExcelData();
    populateFilterOptions();
});

// Event listeners
function initializeEventListeners() {
    // Filtros
    elements.anoEscolar.addEventListener('change', handleFilterChange);
    elements.componente.addEventListener('change', handleFilterChange);
    elements.escola.addEventListener('change', handleFilterChange);
    elements.performanceRange.addEventListener('change', handleFilterChange);

    // Modal
    document.addEventListener('keydown', handleKeyboardEvents);
    
    // Clique fora do modal para fechar
    elements.modal.addEventListener('click', function(e) {
        if (e.target === elements.modal || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });
}

// Carregamento dos dados dos arquivos Excel
async function loadExcelData() {
    try {
        // Simulação do carregamento dos dados Excel
        // Em uma implementação real, você usaria uma biblioteca como SheetJS ou enviaria os arquivos para um servidor
        AppState.skillsData = {
            '2': await loadSkillsFor2ndYear(),
            '5': await loadSkillsFor5thYear(),
            '9': await loadSkillsFor9thYear()
        };
        
        AppState.isLoading = false;
        showNoDataState();
        announceToScreenReader('Dados das habilidades carregados. Use os filtros para visualizar os dados.');
    } catch (error) {
        console.error('Erro ao carregar dados das habilidades:', error);
        AppState.isLoading = false;
        showNoDataState();
    }
}

// Função para carregar habilidades do 2º ano
async function loadSkillsFor2ndYear() {
    // Dados baseados na estrutura típica de habilidades do 2º ano
    return {
        'lingua-portuguesa': [
            {
                code: 'D01',
                title: 'Localizar informações explícitas em textos',
                description: 'Capacidade de identificar informações que estão claramente apresentadas no texto, sem necessidade de inferências.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D02',
                title: 'Estabelecer relações entre partes de um texto',
                description: 'Habilidade de conectar diferentes partes do texto, identificando relações de causa e efeito, comparação, etc.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D03',
                title: 'Inferir o sentido de uma palavra ou expressão',
                description: 'Capacidade de deduzir o significado de palavras ou expressões através do contexto.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D04',
                title: 'Inferir uma informação implícita em um texto',
                description: 'Habilidade de deduzir informações que não estão explicitamente declaradas no texto.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D05',
                title: 'Interpretar texto com auxílio de material gráfico diverso',
                description: 'Capacidade de compreender textos que combinam linguagem verbal com elementos visuais.',
                component: 'Língua Portuguesa'
            }
        ],
        'matematica': [
            {
                code: 'D06',
                title: 'Identificar a localização/movimentação de objeto em mapas, croquis e outras representações gráficas',
                description: 'Habilidade de interpretar posições e movimentos em representações espaciais.',
                component: 'Matemática'
            },
            {
                code: 'D07',
                title: 'Identificar propriedades comuns e diferenças entre poliedros e corpos redondos',
                description: 'Capacidade de distinguir características de diferentes formas geométricas tridimensionais.',
                component: 'Matemática'
            },
            {
                code: 'D08',
                title: 'Identificar propriedades comuns e diferenças entre figuras bidimensionais',
                description: 'Habilidade de reconhecer características de formas geométricas planas.',
                component: 'Matemática'
            }
        ]
    };
}

// Função para carregar habilidades do 5º ano
async function loadSkillsFor5thYear() {
    return {
        'lingua-portuguesa': [
            {
                code: 'D01',
                title: 'Localizar informações explícitas em um texto',
                description: 'Localizar informações explícitas, ou seja, aquelas que estão na "superfície" do texto.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D02',
                title: 'Estabelecer relações entre partes de um texto',
                description: 'Identificar repetições ou substituições que contribuem para a continuidade de um texto.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D03',
                title: 'Inferir o sentido de uma palavra ou expressão',
                description: 'Inferir o sentido de uma palavra ou expressão, considerando o contexto em que aparece.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D04',
                title: 'Inferir uma informação implícita em um texto',
                description: 'Inferir informação implícita em um texto, ou seja, compreender aquilo que não está escrito no texto.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D05',
                title: 'Interpretar texto com auxílio de material gráfico diverso',
                description: 'Interpretar texto que conjuga linguagem verbal e não verbal.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D06',
                title: 'Identificar o tema de um texto',
                description: 'Identificar o assunto principal do texto, aquilo de que o texto está tratando.',
                component: 'Língua Portuguesa'
            }
        ],
        'matematica': [
            {
                code: 'D07',
                title: 'Resolver problemas com números naturais',
                description: 'Resolver problema com números naturais, envolvendo diferentes significados da adição ou subtração.',
                component: 'Matemática'
            },
            {
                code: 'D08',
                title: 'Resolver problemas com números naturais',
                description: 'Resolver problema com números naturais, envolvendo diferentes significados da multiplicação ou divisão.',
                component: 'Matemática'
            },
            {
                code: 'D09',
                title: 'Resolver problemas utilizando a escrita decimal de cédulas e moedas do sistema monetário brasileiro',
                description: 'Trabalhar com valores monetários, desenvolvendo habilidades práticas de uso do dinheiro.',
                component: 'Matemática'
            },
            {
                code: 'D10',
                title: 'Num problema, estabelecer trocas entre cédulas e moedas do sistema monetário brasileiro',
                description: 'Compreender equivalências e fazer trocas entre diferentes denominações monetárias.',
                component: 'Matemática'
            }
        ]
    };
}

// Função para carregar habilidades do 9º ano
async function loadSkillsFor9thYear() {
    return {
        'lingua-portuguesa': [
            {
                code: 'D01',
                title: 'Localizar informações explícitas em um texto',
                description: 'Localizar informações explícitas em um texto é uma habilidade que pode ser avaliada por meio de textos verbais e não verbais.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D02',
                title: 'Estabelecer relações entre partes de um texto',
                description: 'Identificar a relação existente entre duas ou mais partes ou elementos do texto.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D03',
                title: 'Inferir o sentido de uma palavra ou expressão',
                description: 'Inferir o sentido de uma palavra ou expressão a partir do contexto no qual se insere.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D04',
                title: 'Inferir uma informação implícita em um texto',
                description: 'Inferir uma informação implícita em um texto consiste em captar informações que não estão explicitamente marcadas.',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D05',
                title: 'Interpretar texto com auxílio de material gráfico diverso',
                description: 'Interpretar texto com auxílio de material gráfico diverso (propagandas, quadrinhos, foto etc.).',
                component: 'Língua Portuguesa'
            },
            {
                code: 'D06',
                title: 'Identificar o tema de um texto',
                description: 'Identificar o tema de um texto significa identificar o assunto principal do texto.',
                component: 'Língua Portuguesa'
            }
        ],
        'matematica': [
            {
                code: 'D07',
                title: 'Identificar a localização/movimentação de objeto em mapas, croquis',
                description: 'Identificar a localização/movimentação de objeto em mapas, croquis e outras representações gráficas.',
                component: 'Matemática'
            },
            {
                code: 'D08',
                title: 'Resolver problema utilizando propriedades dos polígonos',
                description: 'Resolver problema utilizando propriedades dos polígonos (soma de seus ângulos internos, número de diagonais, cálculo da medida de cada ângulo interno nos polígonos regulares).',
                component: 'Matemática'
            },
            {
                code: 'D09',
                title: 'Interpretar informações apresentadas por meio de coordenadas cartesianas',
                description: 'Interpretar informações apresentadas por meio de coordenadas cartesianas.',
                component: 'Matemática'
            },
            {
                code: 'D10',
                title: 'Utilizar relações métricas do triângulo retângulo',
                description: 'Utilizar relações métricas do triângulo retângulo para resolver problemas significativos.',
                component: 'Matemática'
            }
        ]
    };
}

// Popular opções dos filtros baseado nos dados carregados
function populateFilterOptions() {
    // Popular anos escolares
    const anoSelect = elements.anoEscolar;
    const anos = ['2º Ano', '5º Ano', '9º Ano'];
    anos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano.charAt(0); // '2', '5', '9'
        option.textContent = ano;
        anoSelect.appendChild(option);
    });

    // Popular componentes curriculares
    const componenteSelect = elements.componente;
    const componentes = [
        { value: 'lingua-portuguesa', text: 'Língua Portuguesa' },
        { value: 'matematica', text: 'Matemática' }
    ];
    componentes.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.value;
        option.textContent = comp.text;
        componenteSelect.appendChild(option);
    });

    // Popular escolas (exemplo)
    const escolaSelect = elements.escola;
    const escolas = [
        'Escola Municipal João Silva',
        'Escola Estadual Maria Santos',
        'Escola Municipal Pedro Costa',
        'Escola Estadual Ana Oliveira'
    ];
    escolas.forEach(escola => {
        const option = document.createElement('option');
        option.value = escola.toLowerCase().replace(/\s+/g, '-');
        option.textContent = escola;
        escolaSelect.appendChild(option);
    });
}

// Manipulador de mudanças de filtro
function handleFilterChange(event) {
    const filterId = event.target.id.replace('-', '');
    AppState.filters[filterId] = event.target.value;
    
    // Verificar se todos os filtros obrigatórios estão preenchidos
    const requiredFilters = ['anoEscolar', 'componente', 'escola'];
    const allFiltersSelected = requiredFilters.every(filter => AppState.filters[filter]);
    
    if (allFiltersSelected) {
        loadSkillsData();
    } else {
        showNoDataState();
    }
}

// Carregar dados de habilidades baseado nos filtros selecionados
function loadSkillsData() {
    showLoadingState();
    
    setTimeout(() => {
        const skillsData = getFilteredSkillsData();
        displaySkillsCards(skillsData);
        announceToScreenReader(`${skillsData.length} habilidades carregadas com sucesso.`);
    }, 800);
}

// Obter dados filtrados das habilidades
function getFilteredSkillsData() {
    const { anoEscolar, componente, escola, performanceRange } = AppState.filters;
    
    if (!anoEscolar || !componente || !AppState.skillsData[anoEscolar]) {
        return [];
    }
    
    const yearData = AppState.skillsData[anoEscolar];
    const componentData = yearData[componente] || [];
    
    // Adicionar percentuais simulados para cada habilidade
    const skillsWithPercentage = componentData.map(skill => {
        const basePercentage = generatePercentageForSkill(skill.code, escola);
        const performance = getPerformanceLevel(basePercentage);
        
        return {
            ...skill,
            percentage: basePercentage,
            performance: performance,
            students: getStudentCount(escola),
            year: anoEscolar,
            school: escola
        };
    });
    
    // Filtrar por faixa de desempenho se selecionado
    if (performanceRange !== 'todas') {
        return skillsWithPercentage.filter(skill => skill.performance === performanceRange);
    }
    
    return skillsWithPercentage;
}

// Gerar percentual baseado no código da habilidade e escola
function generatePercentageForSkill(skillCode, school) {
    // Usar hash simples para gerar percentuais consistentes
    let hash = 0;
    const str = skillCode + (school || 'geral');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Normalizar para um percentual entre 25% e 95%
    const normalized = Math.abs(hash) % 70 + 25;
    return normalized;
}

// Determinar nível de performance baseado no percentual
function getPerformanceLevel(percentage) {
    if (percentage <= 40) return 'baixo';
    if (percentage <= 60) return 'medio-baixo';
    if (percentage <= 80) return 'medio-alto';
    return 'alto';
}

// Obter número de estudantes baseado na escola
function getStudentCount(school) {
    if (school === 'geral') return 1240; // Total geral
    
    // Números simulados diferentes para cada escola
    const counts = {
        'escola-municipal-joao-silva': 180,
        'escola-estadual-maria-santos': 320,
        'escola-municipal-pedro-costa': 240,
        'escola-estadual-ana-oliveira': 280
    };
    
    return counts[school] || 200;
}



// Exibir cards de habilidades
function displaySkillsCards(skills) {
    elements.loading.style.display = 'none';
    elements.noData.style.display = 'none';
    elements.cardsContainer.style.display = 'grid';
    
    elements.cardsContainer.innerHTML = skills.map(skill => createSkillCard(skill)).join('');
    
    // Adicionar event listeners aos cards
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', () => openSkillModal(card.dataset.skillCode));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSkillModal(card.dataset.skillCode);
            }
        });
    });
}

// Criar HTML do card de habilidade
function createSkillCard(skill) {
    const performanceIcon = getPerformanceIcon(skill.performance);
    
    return `
        <div class="skill-card performance-${skill.performance}" 
             data-skill-code="${skill.code}" 
             tabindex="0" 
             role="button"
             aria-label="Habilidade ${skill.code} - ${skill.title} - ${skill.percentage}% de acerto">
            <div class="card-header">
                <div class="card-code-badge">
                    <span class="card-code">${skill.code}</span>
                    <span class="card-component">${skill.component}</span>
                </div>
                <span class="card-percentage">${skill.percentage}%</span>
            </div>
            <h3 class="card-title">${skill.title}</h3>
            <p class="card-description">${truncateText(skill.description, 120)}</p>
            <div class="card-footer">
                <span class="card-performance">
                    ${performanceIcon} ${getPerformanceText(skill.performance).split(' - ')[0]}
                </span>
                <span class="card-students">
                    👥 ${skill.students} estudantes
                </span>
            </div>
        </div>
    `;
}

// Função para truncar texto
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Obter cor por performance
function getPerformanceColor(performance) {
    const colors = {
        'baixo': '#ff4757',
        'medio-baixo': '#ffa502',
        'medio-alto': '#3742fa',
        'alto': '#2ed573'
    };
    return colors[performance] || '#4facfe';
}

// Obter ícone por performance
function getPerformanceIcon(performance) {
    const icons = {
        'baixo': '🔴',
        'medio-baixo': '🟠',
        'medio-alto': '🔵',
        'alto': '🟢'
    };
    return icons[performance] || '⚪';
}

// Abrir modal com detalhes da habilidade
function openSkillModal(skillCode) {
    const skill = findSkillByCode(skillCode);
    if (!skill) return;
    
    elements.modalTitle.textContent = `${skill.code} - ${skill.title}`;
    elements.modalDescription.textContent = skill.description;
    
    const performanceText = getPerformanceText(skill.performance);
    const performanceIcon = getPerformanceIcon(skill.performance);
    
    elements.modalDetails.innerHTML = `
        <div class="modal-stats">
            <div class="stat-item">
                <strong>Código da Habilidade:</strong> 
                <span class="highlight">${skill.code}</span>
            </div>
            <div class="stat-item">
                <strong>Componente Curricular:</strong> 
                <span>${skill.component}</span>
            </div>
            <div class="stat-item">
                <strong>Ano Escolar:</strong> 
                <span>${skill.year}º Ano</span>
            </div>
            <div class="stat-item">
                <strong>Percentual de Acerto:</strong> 
                <span class="performance-${skill.performance} highlight">${skill.percentage}%</span>
            </div>
            <div class="stat-item">
                <strong>Número de Estudantes Avaliados:</strong> 
                <span>${skill.students}</span>
            </div>
            <div class="stat-item">
                <strong>Faixa de Desempenho:</strong> 
                <span>${performanceIcon} ${performanceText}</span>
            </div>
            <div class="stat-item">
                <strong>Descrição Completa:</strong> 
                <div class="full-description">${skill.description}</div>
            </div>
            <div class="stat-item">
                <strong>Análise Pedagógica:</strong> 
                <div class="analysis">${generateAnalysis(skill.percentage, skill.performance)}</div>
            </div>
        </div>
    `;
    
    elements.modal.style.display = 'block';
    elements.modal.querySelector('.modal-close').focus();
    
    announceToScreenReader(`Modal aberto para habilidade ${skill.code}`);
}

// Fechar modal
function closeModal() {
    elements.modal.style.display = 'none';
    announceToScreenReader('Modal fechado');
}

// Encontrar habilidade por código
function findSkillByCode(code) {
    const skillsData = getFilteredSkillsData();
    return skillsData.find(skill => skill.code === code);
}

// Obter texto da performance
function getPerformanceText(performance) {
    const texts = {
        'baixo': 'Até 40% - Necessita intervenção',
        'medio-baixo': 'De 41% a 60% - Em desenvolvimento',
        'medio-alto': 'De 61% a 80% - Adequado',
        'alto': 'Acima de 80% - Avançado'
    };
    return texts[performance] || 'Não classificado';
}

// Gerar análise automática
function generateAnalysis(percentage, performance) {
    if (performance === 'alto') {
        return 'Excelente desempenho! A maioria dos estudantes demonstra domínio desta habilidade.';
    } else if (performance === 'medio-alto') {
        return 'Bom desempenho geral. Considere atividades de reforço para estudantes com dificuldades.';
    } else if (performance === 'medio-baixo') {
        return 'Desempenho moderado. Recomenda-se intensificar as práticas pedagógicas para esta habilidade.';
    } else {
        return 'Desempenho abaixo do esperado. É necessária intervenção pedagógica focada nesta habilidade.';
    }
}

// Estados de exibição
function showLoadingState() {
    elements.loading.style.display = 'flex';
    elements.noData.style.display = 'none';
    elements.cardsContainer.style.display = 'none';
}

function showNoDataState() {
    elements.loading.style.display = 'none';
    elements.noData.style.display = 'flex';
    elements.cardsContainer.style.display = 'none';
}

// Eventos de teclado
function handleKeyboardEvents(event) {
    if (event.key === 'Escape' && elements.modal.style.display === 'block') {
        closeModal();
    }
}

// Anúncios para leitores de tela
function announceToScreenReader(message) {
    elements.announcements.textContent = message;
    setTimeout(() => {
        elements.announcements.textContent = '';
    }, 1000);
}

// Funcões globais para o HTML
window.closeModal = closeModal;
// Dashboard Educacional - Script Principal
// Gerenciamento de estado e funcionalidades interativas

// Estado global da aplicação
const AppState = {
    filters: {
        anoEscolar: '',
        componente: '',
        escola: '',
        turma: '',
        performanceRange: 'todas'
    },
    data: [],
    skillsData: {}, // Dados das habilidades carregados dos arquivos Excel
    escolasData: null, // Dados das escolas carregados do YAML
    percentuaisData: null, // Dados reais de percentuais do arquivo JSON
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
    loadAllData();
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

// Carregamento de todos os dados necessários
async function loadAllData() {
    try {
        // Carregar dados das habilidades
        AppState.skillsData = {
            '2': await loadSkillsFor2ndYear(),
            '5': await loadSkillsFor5thYear(),
            '9': await loadSkillsFor9thYear()
        };
        
        // Carregar dados das escolas
        await loadEscolasData();
        
        // Carregar dados de percentuais do Excel
        await loadPercentuaisData();
        
        // Popular filtros após carregar todos os dados
        populateFilterOptions();
        
        AppState.isLoading = false;
        showNoDataState();
        announceToScreenReader('Dados carregados. Use os filtros para visualizar os dados.');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        AppState.isLoading = false;
        showNoDataState();
    }
}

// Carregar dados das escolas do arquivo YAML
async function loadEscolasData() {
    try {
        console.log('Tentando carregar escolas.yaml...');
        const response = await fetch('escolas.yaml');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const yamlText = await response.text();
        console.log('YAML carregado:', yamlText.substring(0, 200) + '...');
        
        AppState.escolasData = jsyaml.load(yamlText);
        console.log('Dados das escolas carregados:', AppState.escolasData);
        
    } catch (error) {
        console.error('Erro ao carregar dados das escolas:', error);
        console.log('Usando dados fixos como fallback');
        
        // Dados completos das escolas como fallback
        AppState.escolasData = {
            escolas: [
                {
                    nome: "03 DE DEZEMBRO",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A"] },
                        { ano_escolar: "5º Ano", turmas: ["A"] },
                        { ano_escolar: "9º Ano", turmas: ["A"] }
                    ]
                },
                {
                    nome: "21 DE DEZEMBRO",
                    anos: [
                        { ano_escolar: "9º Ano", turmas: ["A", "B", "C"] }
                    ]
                },
                {
                    nome: "ANTONIO DE SOUSA BARROS",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A"] },
                        { ano_escolar: "5º Ano", turmas: ["A"] },
                        { ano_escolar: "9º Ano", turmas: ["A"] }
                    ]
                },
                {
                    nome: "FIRMINO JOSÉ",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A", "B"] },
                        { ano_escolar: "5º Ano", turmas: ["A", "B"] },
                        { ano_escolar: "9º Ano", turmas: ["A", "B"] }
                    ]
                },
                {
                    nome: "JOAQUIM FERREIRA",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A"] },
                        { ano_escolar: "5º Ano", turmas: ["A"] }
                    ]
                },
                {
                    nome: "JOSE ALVES DE SENA",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A"] },
                        { ano_escolar: "5º Ano", turmas: ["A"] },
                        { ano_escolar: "9º Ano", turmas: ["A"] }
                    ]
                },
                {
                    nome: "MARIA AMELIA",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A"] },
                        { ano_escolar: "5º Ano", turmas: ["A"] }
                    ]
                },
                {
                    nome: "MOURÃO LIMA",
                    anos: [
                        { ano_escolar: "2º Ano", turmas: ["A", "B"] },
                        { ano_escolar: "5º Ano", turmas: ["A", "B"] }
                    ]
                }
            ]
        };
    }
}

// Carregar dados de percentuais do arquivo Excel
async function loadPercentuaisData() {
    try {
        console.log('Carregando dados de percentuais do Excel...');
        
        const response = await fetch('codigos_com_percentuais_preenchidos.xlsx');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        
        console.log('Abas disponíveis no Excel:', workbook.SheetNames);
        
        // Processar todas as abas do Excel
        AppState.percentuaisData = {};
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            console.log(`Processando aba: ${sheetName}`);
            AppState.percentuaisData[sheetName] = processExcelSheet(jsonData, sheetName);
        });
        
        console.log('Dados de percentuais carregados:', AppState.percentuaisData);
        
    } catch (error) {
        console.error('Erro ao carregar dados de percentuais:', error);
        AppState.percentuaisData = {}; // Usar dados simulados como fallback
    }
}

// Processar dados de uma aba do Excel
function processExcelSheet(jsonData, sheetName) {
    if (!jsonData || jsonData.length === 0) return [];
    
    // Assumir que a primeira linha contém cabeçalhos
    const headers = jsonData[0];
    const processedData = [];
    
    console.log(`Headers da aba ${sheetName}:`, headers);
    
    // Processar cada linha (exceto cabeçalho)
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const rowData = {};
        headers.forEach((header, index) => {
            if (header) {
                rowData[header.toString().trim()] = row[index];
            }
        });
        
        // Adicionar dados processados se tiver informações essenciais
        if (rowData.codigo || rowData.Codigo || rowData.CODIGO) {
            processedData.push(rowData);
        }
    }
    
    console.log(`Dados processados da aba ${sheetName}:`, processedData.slice(0, 3)); // Mostrar apenas 3 primeiros
    return processedData;
}

// Obter percentual real de uma habilidade específica
function getPercentualReal(codigo, escola, ano, componente) {
    if (!AppState.percentuaisData) {
        return null;
    }
    
    let percentual = null;
    console.log(`Buscando dados para: ${codigo} | Escola: ${escola} | Ano: ${ano} | Componente: ${componente}`);
    
    // Buscar em todas as abas
    Object.keys(AppState.percentuaisData).forEach(abaNome => {
        const dadosAba = AppState.percentuaisData[abaNome];
        console.log(`Verificando aba: ${abaNome}`);
        
        if (Array.isArray(dadosAba)) {
            const registro = dadosAba.find(item => {
                // Tentar diferentes variações do código
                const possiveisCodigos = [
                    item.codigo, item.Codigo, item.CODIGO, item['Código'], 
                    item['Codigo da Habilidade'], item['CODIGO DA HABILIDADE'],
                    item.descriptor, item.Descriptor, item.DESCRIPTOR
                ];
                
                return possiveisCodigos.some(itemCodigo => {
                    if (!itemCodigo) return false;
                    const codigoLimpo = itemCodigo.toString().trim().toUpperCase();
                    return codigoLimpo === codigo.toUpperCase();
                });
            });
            
            if (registro && !percentual) {
                console.log(`Registro encontrado na aba ${abaNome}:`, registro);
                
                // 1. Tentar colunas de percentual genéricas
                const possiveisColunasPercentual = [
                    'percentual', 'Percentual', 'PERCENTUAL', '%', 'percent', 'Percent',
                    'acerto', 'Acerto', 'ACERTO', 'resultado', 'Resultado', 'RESULTADO',
                    'media', 'Media', 'MEDIA', 'Média', 'MÉDIA'
                ];
                
                for (const coluna of possiveisColunasPercentual) {
                    if (registro[coluna] !== undefined && registro[coluna] !== null && registro[coluna] !== '') {
                        let valor = parseFloat(registro[coluna]);
                        if (!isNaN(valor)) {
                            if (valor <= 1 && valor >= 0) {
                                valor = Math.round(valor * 100);
                            }
                            percentual = Math.round(valor);
                            console.log(`Percentual encontrado na coluna ${coluna}: ${percentual}%`);
                            break;
                        }
                    }
                }
                
                // 2. Se é "Média Geral", buscar por colunas que indiquem média geral
                if (!percentual && escola === 'geral') {
                    const colunasMediaGeral = Object.keys(registro).filter(key => 
                        key.toUpperCase().includes('GERAL') || 
                        key.toUpperCase().includes('TOTAL') ||
                        key.toUpperCase().includes('MÉDIA') ||
                        key.toUpperCase().includes('MEDIA')
                    );
                    
                    for (const coluna of colunasMediaGeral) {
                        if (registro[coluna] !== undefined && registro[coluna] !== null && registro[coluna] !== '') {
                            let valor = parseFloat(registro[coluna]);
                            if (!isNaN(valor)) {
                                if (valor <= 1 && valor >= 0) {
                                    valor = Math.round(valor * 100);
                                }
                                percentual = Math.round(valor);
                                console.log(`Média geral encontrada na coluna ${coluna}: ${percentual}%`);
                                break;
                            }
                        }
                    }
                }
                
                // 3. Buscar por nome da escola específica
                if (!percentual && escola && escola !== 'geral') {
                    const nomeEscola = getEscolaDisplayName(escola);
                    const palavrasChave = nomeEscola.split(' ').filter(palavra => palavra.length > 3);
                    
                    for (const palavra of palavrasChave) {
                        const colunaEscola = Object.keys(registro).find(key => 
                            key.toUpperCase().includes(palavra.toUpperCase())
                        );
                        
                        if (colunaEscola && registro[colunaEscola] !== undefined && registro[colunaEscola] !== null && registro[colunaEscola] !== '') {
                            let valor = parseFloat(registro[colunaEscola]);
                            if (!isNaN(valor)) {
                                if (valor <= 1 && valor >= 0) {
                                    valor = Math.round(valor * 100);
                                }
                                percentual = Math.round(valor);
                                console.log(`Percentual da escola encontrado na coluna ${colunaEscola}: ${percentual}%`);
                                break;
                            }
                        }
                    }
                }
                
                // 4. Último recurso: buscar qualquer coluna numérica que possa ser percentual
                if (!percentual) {
                    Object.keys(registro).forEach(key => {
                        if (!percentual && registro[key] !== undefined && registro[key] !== null && registro[key] !== '') {
                            let valor = parseFloat(registro[key]);
                            if (!isNaN(valor) && valor >= 0 && valor <= 100) {
                                percentual = Math.round(valor);
                                console.log(`Percentual encontrado na coluna ${key} (último recurso): ${percentual}%`);
                            }
                        }
                    });
                }
            }
        }
    });
    
    if (!percentual) {
        console.log(`Nenhum percentual encontrado para ${codigo}`);
    }
    
    return percentual;
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
    populateAnosEscolares();
    populateComponentesCurriculares();
    populateEscolas();
    addFilterResetFunctionality();
}

// Adicionar funcionalidade de reset aos filtros
function addFilterResetFunctionality() {
    // Adicionar event listener para detectar quando um filtro é limpo
    [elements.anoEscolar, elements.escola].forEach(select => {
        select.addEventListener('change', function() {
            if (this.value === '') {
                resetDependentFilters(this.id);
            }
        });
    });
}

// Resetar filtros dependentes quando um filtro pai é limpo
function resetDependentFilters(changedFilterId) {
    if (changedFilterId === 'ano-escolar') {
        // Se o ano foi limpo, restaurar todas as escolas e resetar anos
        populateEscolasComplete();
        enableAllAnoOptions();
        resetFilterLabels();
    } else if (changedFilterId === 'escola') {
        // Se a escola foi limpa, habilitar todos os anos
        enableAllAnoOptions();
        resetFilterLabels();
    }
}

// Popular escolas completas (restaurar estado inicial)
function populateEscolasComplete() {
    const escolaSelect = elements.escola;
    const currentValue = escolaSelect.value;
    
    // Preservar as duas primeiras opções
    const defaultOptions = Array.from(escolaSelect.children).slice(0, 2);
    
    // Limpar e restaurar
    escolaSelect.innerHTML = '';
    defaultOptions.forEach(option => {
        escolaSelect.appendChild(option.cloneNode(true));
    });
    
    // Adicionar todas as escolas
    if (AppState.escolasData && AppState.escolasData.escolas) {
        AppState.escolasData.escolas.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            option.textContent = escola.nome;
            escolaSelect.appendChild(option);
        });
    }
    
    // Restaurar valor selecionado se ainda válido
    if (currentValue && Array.from(escolaSelect.options).some(opt => opt.value === currentValue)) {
        escolaSelect.value = currentValue;
    }
}

// Habilitar todas as opções de ano
function enableAllAnoOptions() {
    Array.from(elements.anoEscolar.options).forEach(option => {
        option.disabled = false;
        option.style.opacity = '1';
    });
}

// Popular anos escolares disponíveis
function populateAnosEscolares() {
    const anoSelect = elements.anoEscolar;
    const anos = ['2º Ano', '5º Ano', '9º Ano'];
    anos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano.charAt(0); // '2', '5', '9'
        option.textContent = ano;
        anoSelect.appendChild(option);
    });
}

// Popular componentes curriculares
function populateComponentesCurriculares() {
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
}

// Popular escolas baseado nos dados reais (inicialmente todas)
function populateEscolas() {
    const escolaSelect = elements.escola;
    
    if (AppState.escolasData && AppState.escolasData.escolas) {
        AppState.escolasData.escolas.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            option.textContent = escola.nome;
            escolaSelect.appendChild(option);
        });
    }
}

// Obter escolas disponíveis para um ano específico
function getEscolasForAno(anoEscolar) {
    if (!AppState.escolasData || !AppState.escolasData.escolas) {
        return [];
    }
    
    const anoTexto = `${anoEscolar}º Ano`;
    return AppState.escolasData.escolas.filter(escola => 
        escola.anos && escola.anos.some(ano => ano.ano_escolar === anoTexto)
    );
}

// Obter anos disponíveis para uma escola específica
function getAnosForEscola(escolaValue) {
    if (!AppState.escolasData || !AppState.escolasData.escolas || escolaValue === 'geral') {
        return ['2', '5', '9']; // Para média geral, todos os anos estão disponíveis
    }
    
    const escola = findEscolaByValue(escolaValue);
    if (!escola || !escola.anos) return [];
    
    // Extrair os números dos anos (2, 5, 9)
    return escola.anos.map(ano => ano.ano_escolar.charAt(0)).filter(Boolean);
}

// Atualizar opções de ano quando a escola for selecionada
function updateAnosForSelectedEscola() {
    const escolaValue = AppState.filters.escola;
    const anoSelect = elements.anoEscolar;
    
    // Se "Média Geral" ou nenhuma escola selecionada, mostrar todos os anos
    if (!escolaValue || escolaValue === 'geral') {
        return; // Manter todos os anos disponíveis
    }
    
    const anosDisponiveis = getAnosForEscola(escolaValue);
    const anoAtualSelecionado = AppState.filters.anoEscolar;
    
    // Verificar se o ano atualmente selecionado ainda é válido
    if (anoAtualSelecionado && !anosDisponiveis.includes(anoAtualSelecionado)) {
        // Resetar ano se não estiver disponível na escola selecionada
        AppState.filters.anoEscolar = '';
        anoSelect.value = '';
        announceToScreenReader('Ano escolar resetado - não disponível na escola selecionada');
    }
    
    // Atualizar visual dos options (desabilitar os não disponíveis)
    Array.from(anoSelect.options).forEach(option => {
        if (option.value && option.value !== '') {
            const isAvailable = anosDisponiveis.includes(option.value);
            option.disabled = !isAvailable;
            option.style.opacity = isAvailable ? '1' : '0.5';
            
            if (!isAvailable && option.selected) {
                option.selected = false;
            }
        }
    });
    
    if (anosDisponiveis.length > 0) {
        updateFilterLabel('ano', anosDisponiveis.length);
        announceToScreenReader(`Anos disponíveis na escola selecionada: ${anosDisponiveis.map(a => a + 'º').join(', ')}`);
    }
}

// Atualizar opções de escola quando o ano for selecionado
function updateEscolasForSelectedAno() {
    const anoEscolar = AppState.filters.anoEscolar;
    const escolaSelect = elements.escola;
    
    // Preservar as duas primeiras opções (placeholder e "Média Geral")
    const defaultOptions = Array.from(escolaSelect.children).slice(0, 2);
    
    // Limpar todas as opções
    escolaSelect.innerHTML = '';
    
    // Restaurar opções padrão
    defaultOptions.forEach(option => {
        escolaSelect.appendChild(option.cloneNode(true));
    });
    
    if (anoEscolar) {
        // Filtrar escolas que têm o ano selecionado
        const escolasDisponiveis = getEscolasForAno(anoEscolar);
        
        if (escolasDisponiveis.length > 0) {
            escolasDisponiveis.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                option.textContent = escola.nome;
                escolaSelect.appendChild(option);
            });
            
            // Atualizar label com contador
            updateFilterLabel('escola', escolasDisponiveis.length);
            announceToScreenReader(`${escolasDisponiveis.length} escolas disponíveis para o ${anoEscolar}º ano`);
        } else {
            // Se não há escolas para o ano selecionado
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Nenhuma escola disponível para este ano';
            option.disabled = true;
            escolaSelect.appendChild(option);
            
            announceToScreenReader('Nenhuma escola disponível para o ano selecionado');
        }
    } else {
        // Se nenhum ano selecionado, mostrar todas as escolas
        if (AppState.escolasData && AppState.escolasData.escolas) {
            AppState.escolasData.escolas.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                option.textContent = escola.nome;
                escolaSelect.appendChild(option);
            });
        }
    }
}

// Manipulador de mudanças de filtro
function handleFilterChange(event) {
    // Converter ID do elemento para camelCase
    const elementId = event.target.id;
    let filterId;
    
    if (elementId === 'ano-escolar') {
        filterId = 'anoEscolar';
    } else if (elementId === 'performance-range') {
        filterId = 'performanceRange';
    } else {
        filterId = elementId;
    }
    
    const oldValue = AppState.filters[filterId];
    AppState.filters[filterId] = event.target.value;
    
    // Se o ano escolar mudou, atualizar as opções de escola
    if (filterId === 'anoEscolar' && oldValue !== event.target.value) {
        AppState.filters.escola = ''; // Resetar escola selecionada
        elements.escola.value = '';
        updateEscolasForSelectedAno();
    }
    
    // Se a escola mudou, atualizar as opções de ano (se necessário)
    if (filterId === 'escola' && oldValue !== event.target.value) {
        updateAnosForSelectedEscola();
    }
    
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
    
    // Adicionar APENAS percentuais reais do Excel
    const skillsWithPercentage = componentData
        .map(skill => {
            const realPercentage = getOnlyRealPercentage(skill.code, escola, anoEscolar, componente);
            
            // Se não há dados reais, retornar null para filtrar depois
            if (realPercentage === null) {
                return null;
            }
            
            const performance = getPerformanceLevel(realPercentage);
            
            return {
                ...skill,
                percentage: realPercentage,
                performance: performance,
                students: getStudentCount(escola, anoEscolar),
                year: anoEscolar,
                school: escola,
                isRealData: true // Todos os dados são reais agora
            };
        })
        .filter(skill => skill !== null); // Remove habilidades sem dados reais
    
    // Filtrar por faixa de desempenho se selecionado
    if (performanceRange !== 'todas') {
        return skillsWithPercentage.filter(skill => skill.performance === performanceRange);
    }
    
    return skillsWithPercentage;
}

// Obter apenas percentual real do Excel (sem fallback simulado)
function getOnlyRealPercentage(skillCode, school, ano, componente) {
    const percentualReal = getPercentualReal(skillCode, school, ano, componente);
    
    if (percentualReal !== null && !isNaN(percentualReal)) {
        console.log(`Percentual real encontrado para ${skillCode}: ${percentualReal}%`);
        return percentualReal;
    }
    
    console.log(`Nenhum dado real encontrado para ${skillCode} - habilidade será omitida`);
    return null; // Retorna null se não houver dados reais
}

// Determinar nível de performance baseado no percentual
function getPerformanceLevel(percentage) {
    if (percentage <= 40) return 'baixo';
    if (percentage <= 60) return 'medio-baixo';
    if (percentage <= 80) return 'medio-alto';
    return 'alto';
}

// Obter número de estudantes baseado na escola e ano
function getStudentCount(school, anoEscolar) {
    if (school === 'geral') {
        // Calcular total geral baseado em todas as escolas
        return calculateTotalStudents(anoEscolar);
    }
    
    // Encontrar escola específica e calcular estudantes baseado nas turmas
    const escola = findEscolaByValue(school);
    if (escola) {
        return calculateStudentsForEscola(escola, anoEscolar);
    }
    
    return 25; // Fallback
}

// Calcular total de estudantes para média geral
function calculateTotalStudents(anoEscolar) {
    if (!AppState.escolasData || !AppState.escolasData.escolas) return 500;
    
    let total = 0;
    const anoTexto = `${anoEscolar}º Ano`;
    
    AppState.escolasData.escolas.forEach(escola => {
        const ano = escola.anos?.find(a => a.ano_escolar === anoTexto);
        if (ano && ano.turmas) {
            // Estimar ~25 alunos por turma
            total += ano.turmas.length * 25;
        }
    });
    
    return total || 500;
}

// Calcular estudantes para uma escola específica
function calculateStudentsForEscola(escola, anoEscolar) {
    const anoTexto = `${anoEscolar}º Ano`;
    const ano = escola.anos?.find(a => a.ano_escolar === anoTexto);
    
    if (ano && ano.turmas) {
        // Estimar ~25 alunos por turma
        return ano.turmas.length * 25;
    }
    
    return 25;
}

// Encontrar escola pelo valor do select
function findEscolaByValue(schoolValue) {
    if (!AppState.escolasData || !AppState.escolasData.escolas) return null;
    
    return AppState.escolasData.escolas.find(escola => {
        const escolaValue = escola.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return escolaValue === schoolValue;
    });
}



// Exibir cards de habilidades
function displaySkillsCards(skills) {
    elements.loading.style.display = 'none';
    
    if (skills.length === 0) {
        // Mostrar mensagem específica para falta de dados reais
        showNoRealDataMessage();
        return;
    }
    
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

// Mostrar mensagem quando não há dados reais disponíveis
function showNoRealDataMessage() {
    const noDataTitle = document.getElementById('no-data-title');
    const noDataMessage = document.getElementById('no-data-message');
    
    noDataTitle.textContent = '📊 Nenhum dado real encontrado';
    noDataMessage.textContent = 'Não foram encontrados dados reais no arquivo Excel para a combinação de filtros selecionada. Verifique se os dados existem no arquivo "codigos_com_percentuais_preenchidos.xlsx" para esta escola, ano e componente.';
    
    elements.noData.style.display = 'flex';
    elements.cardsContainer.style.display = 'none';
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
                    <span class="data-badge real">📊 Dados Reais</span>
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
                <strong>Escola:</strong> 
                <span>${getEscolaDisplayName(skill.school)}</span>
            </div>
            <div class="stat-item">
                <strong>Percentual de Acerto:</strong> 
                <span class="performance-${skill.performance} highlight">${skill.percentage}%</span>
                <span class="data-source real">📊 Dados do Excel</span>
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
    // Restaurar mensagem padrão
    const noDataTitle = document.getElementById('no-data-title');
    const noDataMessage = document.getElementById('no-data-message');
    
    noDataTitle.textContent = 'Selecione todos os filtros para visualizar as habilidades';
    noDataMessage.textContent = 'Use os filtros na barra lateral para exibir os dados reais de percentual de acerto por habilidade.';
    
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

// Obter nome de exibição da escola
function getEscolaDisplayName(schoolValue) {
    if (schoolValue === 'geral') return 'Média Geral - Todas as Escolas';
    
    const escola = findEscolaByValue(schoolValue);
    return escola ? escola.nome : 'Escola não identificada';
}

// Atualizar label dos filtros com contador de opções disponíveis
function updateFilterLabel(filterId, count) {
    const labelMap = {
        'escola': 'escola',
        'ano': 'ano-escolar'
    };
    
    const targetId = labelMap[filterId] || filterId;
    const label = document.querySelector(`label[for="${targetId}"]`);
    
    if (label) {
        const originalText = label.textContent.split('(')[0].trim(); // Remove contador anterior
        if (count !== undefined) {
            label.textContent = `${originalText} (${count} disponível${count !== 1 ? 'is' : ''})`;
        } else {
            label.textContent = originalText;
        }
    }
}

// Resetar labels dos filtros
function resetFilterLabels() {
    updateFilterLabel('escola');
    updateFilterLabel('ano');
}

// Funcões globais para o HTML
window.closeModal = closeModal;
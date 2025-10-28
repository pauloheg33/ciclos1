// Correlações adicionais baseadas na Matriz SPAECE 2024
const matrizSpaece2024 = {
    // 2º Ano - Língua Portuguesa
    "leitura_2ano": {
        "D01": "Relacionar elementos sonoros das palavras com sua representação escrita.",
        "D02": "Ler palavras.",
        "D03": "Ler frases.",
        "D04": "Localizar informações explícitas em textos.",
        "D05": "Reconhecer a finalidade de um texto.",
        "D06": "Inferir o assunto de um texto.",
        "D07": "Inferir informações em textos verbais.",
        "D08": "Inferir informações em textos que articulam linguagem verbal e não verbal."
    },
    
    // 2º Ano - Matemática
    "matematica_2ano": {
        "D01": "Reconhecer o que os números naturais indicam em diferentes situações: quantidade, ordem, medida ou código de identificação.",
        "D02": "Identificar a posição ordinal de um objeto ou termo em uma sequência (1°, 2° etc.).",
        "D03": "Escrever números naturais de até 3 ordens em sua representação por algarismos ou em língua materna OU associar o registro numérico de números naturais de até 3 ordens ao registro em língua materna.",
        "D04": "Comparar OU ordenar quantidades de objetos (até 2 ordens).",
        "D05": "Comparar OU ordenar números naturais de até 3 ordens com ou sem suporte da reta numérica.",
        "D06": "Identificar a ordem ocupada por um algarismo OU seu valor posicional (ou valor relativo) em um número natural de até 3 ordens.",
        "D07": "Calcular o resultado de adições ou subtrações, envolvendo números naturais de até 3 ordens.",
        "D08": "Compor OU decompor números naturais de até 3 ordens por meio de diferentes adições.",
        "D09": "Resolver problemas de adição ou de subtração, envolvendo números naturais de até 3 ordens, com os significados de juntar, acrescentar, separar ou retirar.",
        "D10": "Resolver problemas de multiplicação ou de divisão (por 2, 3, 4 ou 5), envolvendo números naturais, com os significados de formação de grupos iguais ou proporcionalidade (incluindo dobro, metade, triplo ou terça parte)."
    },
    
    // 5º Ano - Língua Portuguesa
    "leitura_5ano": {
        "D01": "Localizar informações explícitas em um texto.",
        "D03": "Inferir o sentido de uma palavra ou expressão.",
        "D04": "Inferir uma informação implícita em um texto.",
        "D06": "Identificar o tema de um texto.",
        "D11": "Distinguir um fato da opinião relativa a esse fato.",
        "D05": "Interpretar texto com auxílio de material gráfico diverso (propagandas, quadrinhos, foto, etc.).",
        "D09": "Identificar a finalidade de textos de diferentes gêneros.",
        "D15": "Reconhecer diferentes formas de tratar uma informação na comparação de textos que tratam do mesmo tema, em função das condições em que ele foi produzido e daquelas em que será recebido."
    },
    
    // 5º Ano - Matemática
    "matematica_5ano": {
        "D13": "Reconhecer e utilizar características do sistema de numeração decimal, tais como agrupamentos e trocas na base 10 e princípio do valor posicional.",
        "D14": "Identificar a localização de números naturais na reta numérica.",
        "D15": "Reconhecer a decomposição de números naturais nas suas diversas ordens.",
        "D16": "Reconhecer a composição e a decomposição de números naturais em sua forma polinomial.",
        "D17": "Calcular o resultado de uma adição ou subtração de números naturais.",
        "D18": "Calcular o resultado de uma multiplicação ou divisão de números naturais.",
        "D19": "Resolver problema com números naturais, envolvendo diferentes significados da adição ou subtração: juntar, alteração de um estado inicial (positiva ou negativa), comparação e mais de uma transformação (positiva ou negativa).",
        "D20": "Resolver problema com números naturais, envolvendo diferentes significados da multiplicação ou divisão: multiplicação comparativa, ideia de proporcionalidade, configuração retangular e combinatória."
    },
    
    // 9º Ano - Língua Portuguesa
    "leitura_9ano": {
        "D01": "Localizar informações explícitas em um texto.",
        "D03": "Inferir o sentido de uma palavra ou expressão.",
        "D04": "Inferir uma informação implícita em um texto.",
        "D06": "Identificar o tema de um texto.",
        "D14": "Distinuir um fato da opinião relativa a esse fato.",
        "D07": "Identificar a tese de um texto.",
        "D08": "Estabelecer relação entre a tese e os argumentos oferecidos para sustentá-la.",
        "D16": "Identificar efeitos de ironia ou humor em textos variados.",
        "D17": "Reconhecer o efeito de sentido decorrente do uso da pontuação e de outras notações."
    },
    
    // 9º Ano - Matemática
    "matematica_9ano": {
        "D18": "Efetuar cálculos com números inteiros, envolvendo as operações (adição, subtração, multiplicação, divisão, potenciação).",
        "D19": "Resolver problema com números naturais, envolvendo diferentes significados das operações (adição, subtração, multiplicação, divisão, potenciação).",
        "D21": "Reconhecer as diferentes representações de um número racional.",
        "D28": "Resolver problema que envolva porcentagem.",
        "D29": "Resolver problema que envolva variação proporcional, direta ou inversa, entre grandezas.",
        "D31": "Resolver problema que envolva equação do 2º grau.",
        "D33": "Identificar uma equação ou inequação do 1º grau que expressa um problema."
    }
};

// Função para encontrar correlações baseadas em palavras-chave
function findSpaeceCorrelation(cncanHabilidade, componente, ano) {
    const descricao = cncanHabilidade.descricao_habilidade?.toLowerCase() || '';
    let matrizKey = '';
    
    // Determinar a chave da matriz baseada no componente e ano
    if (componente === 'Leitura') {
        if (ano === '2º Ano') matrizKey = 'leitura_2ano';
        else if (ano === '5º Ano') matrizKey = 'leitura_5ano';
        else if (ano === '9º Ano') matrizKey = 'leitura_9ano';
    } else if (componente === 'Matemática') {
        if (ano === '2º Ano') matrizKey = 'matematica_2ano';
        else if (ano === '5º Ano') matrizKey = 'matematica_5ano';
        else if (ano === '9º Ano') matrizKey = 'matematica_9ano';
    }
    
    if (!matrizKey || !matrizSpaece2024[matrizKey]) return null;
    
    const descritores = matrizSpaece2024[matrizKey];
    
    // Palavras-chave para diferentes tipos de habilidades
    const palavrasChave = {
        // Leitura
        'localizar': ['D01', 'D04'],
        'identificar': ['D01', 'D02', 'D05', 'D06', 'D07', 'D08', 'D09'],
        'reconhecer': ['D01', 'D02', 'D05', 'D15'],
        'inferir': ['D03', 'D04', 'D06', 'D07', 'D08'],
        'ler': ['D02', 'D03'],
        'palavra': ['D01', 'D02', 'D03'],
        'frase': ['D03'],
        'texto': ['D04', 'D05', 'D06', 'D07', 'D08', 'D15'],
        'assunto': ['D06'],
        'finalidade': ['D05', 'D09'],
        'opinião': ['D11', 'D14'],
        'tese': ['D07', 'D08'],
        'ironia': ['D16'],
        'humor': ['D16'],
        'pontuação': ['D17'],
        
        // Matemática
        'número': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D13', 'D14', 'D15', 'D16'],
        'quantidade': ['D01', 'D04'],
        'ordem': ['D02', 'D06', 'D15'],
        'posição': ['D02', 'D06'],
        'comparar': ['D04', 'D05'],
        'ordenar': ['D04', 'D05'],
        'adição': ['D07', 'D08', 'D09', 'D17', 'D19'],
        'subtração': ['D07', 'D09', 'D17', 'D19'],
        'multiplicação': ['D10', 'D18', 'D19', 'D20'],
        'divisão': ['D10', 'D18', 'D19', 'D20'],
        'problema': ['D09', 'D10', 'D19', 'D20', 'D28', 'D29', 'D31'],
        'resolver': ['D09', 'D10', 'D19', 'D20', 'D28', 'D29', 'D31'],
        'calcular': ['D07', 'D17', 'D18'],
        'decomposição': ['D08', 'D15', 'D16'],
        'composição': ['D16'],
        'porcentagem': ['D28'],
        'equação': ['D31', 'D33'],
        'proporcional': ['D29'],
        'reta numérica': ['D05', 'D14']
    };
    
    // Encontrar correspondências
    let melhorCorrelacao = null;
    let maiorPontuacao = 0;
    
    for (const [descritor, descricaoSpaece] of Object.entries(descritores)) {
        let pontuacao = 0;
        
        // Verificar palavras-chave na descrição CNCA
        for (const [palavra, descritoresRelacionados] of Object.entries(palavrasChave)) {
            if (descricao.includes(palavra) && descritoresRelacionados.includes(descritor)) {
                pontuacao += 2;
            }
        }
        
        // Verificar similaridade direta nas descrições
        const descricaoSpaeceNormalizada = descricaoSpaece.toLowerCase();
        const palavrasComuns = descricao.split(' ').filter(palavra => 
            palavra.length > 3 && descricaoSpaeceNormalizada.includes(palavra)
        );
        pontuacao += palavrasComuns.length;
        
        if (pontuacao > maiorPontuacao) {
            maiorPontuacao = pontuacao;
            melhorCorrelacao = {
                descritor: descritor,
                descricao: descricaoSpaece,
                pontuacao: pontuacao
            };
        }
    }
    
    // Retornar apenas se tiver uma pontuação mínima
    return maiorPontuacao >= 2 ? melhorCorrelacao : null;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.matrizSpaece2024 = matrizSpaece2024;
    window.findSpaeceCorrelation = findSpaeceCorrelation;
}
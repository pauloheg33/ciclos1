# 📊 Pacote Análise Nova - CICLOS

Este pacote contém todos os arquivos necessários para executar a página de análise avançada dos indicadores educacionais.

## 📁 Arquivos Incluídos

### 🎯 Arquivos Principais
- **`analise-nova.html`** - Página principal da análise
- **`analytics.js`** - Script com toda a lógica da aplicação
- **`styles.css`** - Estilos CSS para a interface

### 📊 Arquivos de Dados
- **`CICLO_III_2025.yaml`** - Dados principais dos ciclos educacionais
- **`CICLOS_I_II_III_2025_percentual_CORRIGIDO.txt`** - Dados para auto-sync
- **`favicon.svg`** - Ícone da página

## 🚀 Como Usar

### 1. **Instalação Simples**
```bash
# Copie todos os arquivos para a pasta do seu projeto
# Certifique-se de que todos os arquivos estão no mesmo diretório
```

### 2. **Executar Localmente**
- Abra o arquivo `analise-nova.html` em qualquer navegador moderno
- Ou use um servidor local (recomendado):
  ```bash
  # Com Python
  python -m http.server 8000
  
  # Com Node.js (http-server)
  npx http-server
  
  # Com PHP
  php -S localhost:8000
  ```

### 3. **Deploy em Servidor Web**
- Faça upload de todos os arquivos para seu servidor
- Acesse via navegador: `https://seusite.com/analise-nova.html`

## ⚙️ Dependências Externas

A aplicação usa a biblioteca **js-yaml** carregada via CDN:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
```

**Nota:** É necessário conexão com internet para carregar esta biblioteca.

## 🔧 Funcionalidades

### 📈 Análise de Dados
- Visualização de indicadores educacionais por ciclo
- Filtros dinâmicos (Avaliação, Ano, Componente, Rede, Escola)
- Distribuição por níveis de aprendizagem
- Faixas de desempenho personalizáveis

### 🔄 Auto Sync
- Monitoramento automático de mudanças nos dados
- Atualização em tempo real dos indicadores
- Status visual de sincronização

### 📊 Visualizações
- Cards interativos por ciclo
- Barras de progresso horizontais
- Legendas com percentuais
- Interface responsiva

## 🎨 Personalização

### Cores e Estilos
Edite o arquivo `styles.css` para personalizar:
- Cores dos níveis de aprendizagem
- Layout dos cards
- Tipografia e espaçamentos

### Dados
- **YAML:** Edite `CICLO_III_2025.yaml` para alterar os dados principais
- **TXT:** Modifique o arquivo `.txt` para o auto-sync

## 🛠️ Solução de Problemas

### Dados não carregam
1. Verifique se todos os arquivos estão no mesmo diretório
2. Confirme conexão com internet (para js-yaml)
3. Use servidor local em vez de abrir arquivo diretamente

### Filtros não funcionam
1. Verifique console do navegador para erros JavaScript
2. Confirme que `analytics.js` foi carregado corretamente

### Auto-sync não atualiza
1. Verifique se o arquivo `.txt` existe e tem permissões de leitura
2. Confirme que está executando em servidor (não file://)

## 📞 Suporte

Para problemas técnicos, verifique:
1. Console do navegador (F12)
2. Rede de internet ativa
3. Todos os arquivos presentes

---

**Desenvolvido por:** Paulo  
**Versão:** 2025 - Ciclos I, II e III  
**Data:** Outubro 2025
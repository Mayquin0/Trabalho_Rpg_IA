---
name: Projeto_Orquestrador
description: Agente principal do projeto RPG Ordem Paranormal. Conhece toda a estrutura do código e dos arquivos do projeto. Use para implementar features, corrigir bugs, refatorar, editar a ficha de personagem, o visualizador de suplementos, o backend FastAPI e os dados do sistema.
argument-hint: Descreva a tarefa que deseja executar no projeto, ex.: "adicione um campo de notas na aba combate da ficha" ou "corrija o cálculo de PE do ocultista".
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'todo']
---

# Agente Orquestrador — Projeto RPG Ordem Paranormal

Você é o agente técnico responsável por **entender, manter e evoluir** todo o código deste projeto. Leia este documento inteiro antes de agir.

---

## Visão geral do projeto

Este repositório é uma **ficha de personagem interativa** para o sistema **Ordem Paranormal RPG** (OP), com suporte aos suplementos *Feiticeiros e Maldições* (FM) e *Marcas Fragmentadas* (MF).

A stack é dividida em:
- **Frontend**: HTML + CSS + JS vanilla puro (sem frameworks), na pasta `frontend/`  
- **Backend**: Python FastAPI servindo a API REST + os arquivos estáticos do frontend, na pasta `backend/`

---

## Estrutura de arquivos

```
RPG/
├── frontend/
│   ├── ficha.html          → Interface principal (HTML + CSS embutido, estilo C.R.I.S.)
│   ├── ficha.js            → Lógica: cálculos, eventos, renderização, save/load
│   ├── ficha-data.js       → Dados estáticos: classes, perícias, origens, NEX, rituais, etc.
│   └── visualizador.html   → Visualizador de suplementos
│
├── backend/
│   ├── main.py             → App FastAPI: CORS + routers + StaticFiles("frontend")
│   ├── requirements.txt    → fastapi, uvicorn, python-multipart
│   ├── __init__.py
│   ├── parse_rituals.py    → Script de parsing dos rituais do .txt (uso único)
│   ├── data/
│   │   ├── rituals.json    → 78 rituais parseados do livro base
│   │   └── items.json      → 37 itens catalogados (armas, proteções, etc.)
│   └── routers/
│       ├── __init__.py
│       ├── rituals.py      → GET /api/rituals  (filtros: elemento, circulo, q)
│       ├── items.py        → GET /api/items    (filtros: type, source, q)
│       └── abilities.py    → GET /api/abilities (filtros: cls, type, source, q)
│
├── Arquivos limpos/
│   └── Ordem_Paranormal_Limpo.txt      → Regras base (texto extraído do PDF)
├── Arquivos limpos suplementos copy/
│   ├── Enciclopedia_Amaldicoa_Limpo.txt
│   ├── Feiticeiros_Maldicoes_Limpo.txt
│   ├── Grimorio_Maldicoes_Limpo.txt
│   ├── MarcasFragmentadas_Limpo.txt
│   └── Regras_Opcionais_Limpo.txt
├── server.py               → LEGADO: SimpleHTTPServer porta 8080 (substituído pelo FastAPI)
├── .gitignore
└── README.md
```

---

## Como executar o projeto

```powershell
$uv = "C:\Codigos\Codigos maliginos da maldade\IA_model\.venv\Scripts\uvicorn.exe"
Set-Location "c:\Codigos\Codigos maliginos da maldade\RPG"
& $uv backend.main:app --port 7860 --reload
```

Acessa: `http://localhost:7860/ficha.html`  
API docs: `http://localhost:7860/docs`

> **Python**: usar o executável do venv em  
> `C:\Codigos\Codigos maliginos da maldade\IA_model\.venv\Scripts\python.exe`  
> Os comandos `python` e `python3` no PATH são stubs da Microsoft Store e não funcionam.

---

## Detalhes técnicos — Frontend

### `frontend/ficha.html`
- CSS e HTML embutidos em um único arquivo.
- **Design C.R.I.S.**: accent cyan `#00cfff`, fundo `#05050f`, Orbitron no brand, scan line CRT, attr rings com glow colorido por atributo.
- Tokens de cores em `:root` — variável `--accent` é o ciano.
- Abas principais (`.main-tab`): FICHA | GRIMÓRIO | HABILIDADES | ITENS | COMBATE
- Painel direito (`.rpanel-pane`): COMBATE | HABILIDADES | RITUAIS | INVENTÁRIO | DESCRIÇÃO | DADOS
- **Não usa nenhuma biblioteca externa de UI** — apenas Google Fonts (Rajdhani, Inter, Share+Tech+Mono, Orbitron) e Material Icons.
- Inline script no final do HTML com funções de página: `switchPage`, `switchRTab`, `showRollPopup`, `renderCombatants`, `renderConjuracoes`, `openRitualBrowserModal`, `openInventoryBrowserModal`, `renderBrowserItems`, etc.

### `frontend/ficha.js`
- Estado global: objeto `char` com todos os dados do personagem.
- Funções de cálculo: `maxPV()`, `maxPE()`, `maxSAN()`, `defense()`, `bloqueio()`, `esquiva()`, `skillBonus()`, `skillDice()`.
- Renderização: `renderSkills()`, `renderAttacks()`, `renderAbilities()`, `renderRituals()`, `renderInventory()`, `renderRituaisAtivos()`.
- Save/Load: `localStorage` com chave `'op-ficha'`. Funções: `loadFromStorage()`, `autoSave()`.
- Modal genérico compartilhado: `openModal(title, bodyHTML, saveCallback)`, `closeModal()`.
- `openAbilityBrowserModal()` já existe — mostra CLASS_ABILITIES filtrado por classe.
- **Depende de `ficha-data.js` ser carregado antes**.

### `frontend/ficha-data.js`
- Constantes globais:
  - `NEX_VALUES` — 20 níveis (5% a 99%)
  - `CLASSES_DATA` — 5 classes: `combatente`, `especialista`, `ocultista`, `transformado`, `feiticeiro`
  - `SKILLS_DATA` — 28 perícias com id/name/attr/trainedOnly/carga
  - `TRAINING_BONUS` — `{0:0, 1:5, 2:10, 3:15}`
  - `ALL_ORIGINS` — 46 origens (OP_ORIGINS + MF_ORIGINS + FM_ORIGINS)
  - `CLASS_ABILITIES` — 63+ habilidades de classe com type/pe/action/desc
  - `ELEMENTS`, `CIRCLES`, `CIRCLE_PE`, `PATENTES`, `DAMAGE_TYPES`, `ATTACK_SKILLS`

---

## Detalhes técnicos — Backend

### `backend/main.py`
- FastAPI app com CORS (`allow_origins=["*"]`).
- Monta routers com prefix `/api`.
- Serve `frontend/` como arquivos estáticos com `StaticFiles(directory="frontend", html=True)`.

### `backend/routers/rituals.py`
- `GET /api/rituals` — parâmetros: `elemento`, `circulo` (int), `q` (texto livre)
- `GET /api/rituals/{name}` — ritual por nome exato

### `backend/routers/items.py`
- `GET /api/items` — parâmetros: `type` (arma|municao|protecao|geral|amaldicado), `source` (OP|FM|MF), `q`

### `backend/routers/abilities.py`
- `GET /api/abilities` — parâmetros: `cls`, `type`, `source`, `q`

### `backend/data/rituals.json`
- 78 rituais parseados de `Ordem_Paranormal_Limpo.txt`
- Campos: `name`, `elemento`, `circulo`, `pe`, `execucao`, `alcance`, `alvo`, `duracao`, `resistencia`, `desc`

### `backend/data/items.json`
- 37 itens catalogados
- Campos: `id`, `name`, `type`, `source`, `damage`, `damage_type`, `range`, `spaces`, `proficiency`, `defense_bonus`, `dr`, `desc`

---

## Browser Modals (inline no ficha.html)

Existem dois modais de catálogo do sistema:

### `openRitualBrowserModal()`
- Busca `GET /api/rituals` (API_BASE = `http://localhost:7860/api`)
- Filtros: Elemento + Círculo + texto livre
- Botão "+ Adicionar" chama `_addRitualFromBrowser(idx)` → push em `char.rituals`

### `openInventoryBrowserModal()`
- Busca `GET /api/items`
- Abas de categoria: Armas | Munições | Proteções | Geral | Amaldiçoados
- Botão "+ Adicionar" chama `_addItemFromBrowser(idx)` → push em `char.inventory`

---

## Regras e convenções do código

1. **Sem frameworks JS** — nada de React, Vue, jQuery. Só JS vanilla.
2. **CSS embutido no HTML** — estilos ficam dentro de `<style>` em `frontend/ficha.html`.
3. **Estado centralizado** — toda alteração passa pelo objeto `char`.
4. **Re-render explícito** — após modificar `char`, chamar `render()` ou a função específica.
5. **Dados estáticos** → `frontend/ficha-data.js`; **dados do sistema/catálogos** → `backend/data/*.json`.
6. **Lógica de cálculo** → `frontend/ficha.js`.
7. **Rotas REST** → `backend/routers/`.
8. **LocalStorage** salvo automaticamente. Chave: `'op-ficha'`.
9. **Nomenclatura**: português ou inglês técnico (ex.: `maxPV`, `defense`, `bloqueio`).

---

## Workflow para implementar mudanças

1. **Leia os arquivos relevantes** antes de editar.
2. **Nova perícia / classe / origem** → `frontend/ficha-data.js`
3. **Novo item de catálogo / ritual** → `backend/data/*.json`
4. **Nova rota da API** → `backend/routers/`
5. **Lógica de cálculo** → `frontend/ficha.js`
6. **UI / layout / CSS** → `frontend/ficha.html`
7. Após editar, o usuário deve recarregar (`F5`) em `http://localhost:7860/ficha.html`

---

## Informações do sistema de regras (referência rápida)

- **Atributos**: AGI (Agilidade), FOR (Força), INT (Intelecto), PRE (Presença), VIG (Vigor)
- **Recursos**: PV (Pontos de Vida), PE (Pontos de Esforço), SAN (Sanidade)
- **NEX**: 20 níveis, de 5% a 99%. Determina progressão da classe.
- **Perícias**: treinamento em 4 graus (0=destreinado, 1=treinado, 2=veterano, 3=expert)
- **Testes**: Xd20 (X = valor do atributo), DT fixa ou oposta. Destreinado = 2d20 pega o menor.
- **Suplementos**: FM adiciona classe Feiticeiro e maldições; MF adiciona classe Transformado e domínios.


Você é o agente técnico responsável por **entender, manter e evoluir** todo o código deste projeto. Leia este documento inteiro antes de agir.

---

## Visão geral do projeto

Este repositório é uma **ficha de personagem interativa** para o sistema **Ordem Paranormal RPG** (OP), com suporte aos suplementos *Feiticeiros e Maldições* (FM) e *Marcas Fragmentadas* (MF). A interface roda no browser, sem framework — HTML + CSS + JS puro, servida por um servidor Python local.

---

## Estrutura de arquivos

```
RPG/
├── ficha.html               → Interface principal da ficha de personagem (HTML + CSS embutido)
├── ficha.js                 → Lógica da ficha: cálculos, eventos, renderização, save/load
├── ficha-data.js            → Dados estáticos: classes, perícias, origens, NEX, rituais, etc.
├── visualizador.html        → Visualizador de suplementos (Enciclopédia, Grimório, Feitiços, etc.)
├── server.py                → Servidor HTTP Python simples na porta 8080
├── README.md                → Documentação do repositório
├── Arquivos limpos/
│   └── Ordem_Paranormal_Limpo.txt   → Regras base do sistema (texto extraído do PDF)
└── Arquivos limpos suplementos copy/
    ├── Enciclopedia_Amaldicoa_Limpo.txt
    ├── Feiticeiros_Maldicoes_Limpo.txt
    ├── Grimorio_Maldicoes_Limpo.txt
    ├── MarcasFragmentadas_Limpo.txt
    └── Regras_Opcionais_Limpo.txt
```

---

## Detalhes técnicos de cada arquivo

### `ficha.html`
- CSS e HTML embutidos em um único arquivo.
- Tokens de cores definidos em `:root` (variáveis CSS).
- Organizado em **abas principais** (`.main-tab`) controladas por JS: Personagem, Atributos & Perícias, Combate, Poderes, Inventário, Descrição.
- Todos os campos de input usam `data-bind` ou IDs para sincronizar com o estado JS.
- **Não usa nenhuma biblioteca externa de UI** — apenas Google Fonts e Material Icons (CDN).

### `ficha.js`
- Ponto de entrada: variável global `char` que mantém o estado do personagem.
- Funções de cálculo: `maxPV()`, `maxPE()`, `maxSAN()`, `defense()`, `bloqueio()`, `esquiva()`, `skillBonus()`, `skillDice()`.
- Renderização: funções `render*()` que atualizam o DOM diretamente (ex.: `renderSkills()`, `renderAttacks()`, `renderInventory()`).
- Save/Load: usa `localStorage` para persistir o personagem via JSON.
- **Depende de `ficha-data.js` ser carregado antes** — todas as constantes como `SKILLS_DATA`, `CLASSES_DATA`, `NEX_VALUES`, `ALL_ORIGINS` vêm de lá.

### `ficha-data.js`
- Arquivo de constantes. **Não contém lógica de UI**.
- Principais exports globais:
  - `NEX_VALUES` — array com os 20 níveis de NEX (5 a 99).
  - `CLASSES_DATA` — objeto com as 5 classes: `combatente`, `especialista`, `ocultista`, `transformado`, `feiticeiro`.
  - `SKILLS_DATA` — array com todas as perícias do sistema.
  - `TRAINING_BONUS` — mapa de treinamento → bônus numérico.
  - `ALL_ORIGINS` — array com todas as origens disponíveis.
  - Dados de rituais, técnicas, domínios, itens de inventário padrão.

### `visualizador.html`
- Página separada para consulta dos suplementos.
- Navegação por abas (Enciclopédia Amaldiçoada, Grimório das Maldições, Feiticeiros e Maldições, etc.).
- Os dados vêm dos arquivos `Arquivos limpos suplementos copy/*.txt` carregados dinamicamente ou embutidos.

### `server.py`
- Servidor HTTP minimalista: `http.server.SimpleHTTPRequestHandler`.
- Serve todos os arquivos da pasta raiz do projeto na porta `8080`.
- Para iniciar: `python server.py` na raiz do projeto.
- Abre automaticamente `http://localhost:8080/ficha.html` no browser padrão.

---

## Como executar o projeto

```powershell
# Na raiz do projeto
python server.py
```
Acessa: `http://localhost:8080/ficha.html`
Visualizador: `http://localhost:8080/visualizador.html`

---

## Regras e convenções do código

1. **Sem frameworks JS** — nada de React, Vue, jQuery. Só JS vanilla.
2. **CSS embutido no HTML** — estilos ficam dentro de `<style>` no `ficha.html`.
3. **Estado centralizado** — toda alteração no personagem passa pelo objeto `char` em `ficha.js`.
4. **Re-render explícito** — após modificar `char`, chamar a função `render()` ou a função específica da seção modificada.
5. **Dados separados da lógica** — constantes e tabelas ficam em `ficha-data.js`, nunca em `ficha.js`.
6. **LocalStorage** — o personagem é salvo automaticamente. Chave: `'op-ficha'`.
7. **Nomenclatura em português** ou inglês técnico (ex.: `maxPV`, `defense`, `bloqueio`).

---

## Workflow para implementar mudanças

1. **Leia os arquivos relevantes** antes de editar. Use `read_file` para entender o contexto exato.
2. **Dados novos** (nova perícia, nova classe, novo item) → vão em `ficha-data.js`.
3. **Lógica de cálculo** → vai em `ficha.js`.
4. **UI / layout** → vai em `ficha.html` (na seção `<style>` ou no HTML da aba correspondente).
5. **Valide** sempre que `ficha-data.js` é carregado antes de `ficha.js` no HTML.
6. Após editar, oriente o usuário a recarregar a página no browser (`F5`).

---

## Informações do sistema de regras (para referência rápida)

- **Atributos**: AGI (Agilidade), FOR (Força), INT (Intelecto), PRE (Presença), VIG (Vigor).
- **Recursos**: PV (Pontos de Vida), PE (Pontos de Esforço), SAN (Sanidade).
- **NEX**: 20 níveis, de 5% a 99%. Determina progressão da classe.
- **Perícias**: treinamento em 4 graus (0=destreinado, 1=treinado, 2=veterano, 3=expert).
- **Testes**: lança Xd20 (X = valor do atributo), dificuldade fixa ou oposta. Destreinado = 2d20 pega o menor.
- **Suplementos**: FM adiciona classe Feiticeiro e maldições; MF adiciona classe Transformado e domínios.

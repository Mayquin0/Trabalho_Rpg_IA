---
name: Projeto_Orquestrador
description: Agente principal do projeto RPG Ordem Paranormal. Conhece toda a estrutura do código e dos arquivos do projeto. Use para implementar features, corrigir bugs, refatorar, editar a ficha de personagem, o visualizador de suplementos, o servidor Python e os dados do sistema.
argument-hint: Descreva a tarefa que deseja executar no projeto, ex.: "adicione um campo de notas na aba combate da ficha" ou "corrija o cálculo de PE do ocultista".
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'todo']
---

# Agente Orquestrador — Projeto RPG Ordem Paranormal

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

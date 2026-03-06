# RPG — Ordem Paranormal

Repositório de materiais e agentes de IA para o sistema **Ordem Paranormal RPG**.

## Estrutura de pastas

```
RPG/
├── Arquivos limpos/           → Textos extraídos e limpos dos PDFs principais
├── Arquivos limpos suplementos/  → Textos extraídos e limpos dos PDFs suplementares
├── PDF/                       → PDFs originais dos livros principais (não versionados)
├── PDF Suplementos/           → PDFs dos suplementos e sistemas secundários (não versionados)
└── .github/
    └── agents/
        └── RPG_Healper.md     → Agente especialista em Ordem Paranormal
```

## Como funciona

| Pasta | Conteúdo | Prioridade |
|---|---|---|
| `Arquivos limpos/` | Regras base do sistema | **Principal** |
| `Arquivos limpos suplementos/` | Expansões — novos monstros, itens, rituais | Secundária |
| `PDF/` | PDFs originais dos livros principais | Referência |
| `PDF Suplementos/` | PDFs dos suplementos | Referência |

## Agente

O agente **RPG_Healper** (em `.github/agents/RPG_Healper.md`) usa os arquivos limpos como base de conhecimento para criar rituais, armas, inimigos e responder perguntas sobre as regras de Ordem Paranormal.

# Acessa Tarefas

Gerenciador de tarefas web projetado do zero segundo a **WCAG 2.2 (nível AA)** e o **eMAG 3.1**.
Projeto Final da disciplina **Tecnologias Assistivas** – Engenharia de Software – UEPG, 2026.

**Autor:** Hendryus Kawan Matos da Silva

## O que a aplicação faz

- Cadastrar, editar, concluir e excluir tarefas (título, prioridade, prazo e descrição).
- Filtrar tarefas: todas, pendentes ou concluídas.
- Salvar as tarefas e as preferências no próprio navegador (`localStorage`).

## Recursos de acessibilidade

| Recurso | Como foi feito | Critério WCAG |
|---|---|---|
| Leitor de tela (NVDA, TalkBack, VoiceOver) | HTML semântico, landmarks, `label` em todos os campos, `aria-label` nos botões de cada tarefa, `aria-describedby` com dicas e erros | 1.3.1, 4.1.2 |
| Anúncios de ações | Regiões `role="status"` e `role="alert"` anunciam "tarefa adicionada", "concluída", "excluída", erros | 4.1.3 |
| Navegação só por teclado | Todos os controles nativos, ordem lógica, links de salto, filtros por setas, `Esc` fecha o diálogo | 2.1.1, 2.4.1, 2.4.3 |
| Foco visível e gerenciado | Contorno amarelo/preto de 3px; foco volta para o lugar certo após editar/excluir; diálogo nativo prende o foco | 2.4.7, 2.4.11 |
| Contraste configurável | Tema padrão (AA), tema escuro e **alto contraste** (AAA, 7:1) | 1.4.3, 1.4.6, 1.4.11 |
| Tamanho do texto | Botões A− / A+ de 80% a 200% sem quebrar o layout | 1.4.4 |
| Espaçamento de texto | Botão "Espaçamento amplo" (entrelinha 2, espaço entre letras e palavras) | 1.4.12 |
| Reflow | Funciona em 320px de largura sem rolagem horizontal | 1.4.10 |
| Não depender só de cor | Prioridade mostrada com cor **e** texto **e** borda | 1.4.1 |
| Erros acessíveis | Resumo de erros com links, `aria-invalid`, mensagem ao lado do campo | 3.3.1, 3.3.3 |
| Alvos grandes | Botões e campos com no mínimo 44×44px | 2.5.8 |
| Movimento reduzido / Alto contraste do Windows | `prefers-reduced-motion` e `forced-colors` | 2.3.3 |
| Idioma | `lang="pt-BR"` para o leitor usar a voz correta | 3.1.1 |

## Como rodar

Não precisa instalar nada: abra o arquivo `index.html` no navegador.

## Testes automatizados de acessibilidade

Usa **Playwright** + **axe-core** (regras WCAG 2.0/2.1/2.2 A e AA).

```bash
npm install
npx playwright install chromium
npx playwright test
```

Os testes também rodam no **GitHub Actions** a cada push (`.github/workflows/acessibilidade.yml`).

Resultado atual: **9 de 9 testes passando, 0 violações** no axe-core 4.14 (48 regras aprovadas).

## Estrutura

```
index.html                  Estrutura semântica da página
styles.css                  Temas, contraste, foco, tamanho e espaçamento
app.js                      Lógica, anúncios aria-live e gerenciamento de foco
tests/                      Testes Playwright + axe-core
docs/DOCUMENTACAO.md        Requisitos, arquitetura e relatório de conformidade
docs/ROTEIRO-VIDEO.md       Roteiro do vídeo de demonstração
```

# Acessa Tarefas – Documentação Técnica

**Disciplina:** Tecnologias Assistivas – Bacharelado em Engenharia de Software – UEPG
**Professor:** Dierone Cesar Foltran Junior
**Aluno:** Hendryus Kawan Matos da Silva
**Proposta escolhida:** Desenvolvimento de Software Acessível

---

## 1. Visão geral

O **Acessa Tarefas** é uma aplicação web de lista de tarefas criada desde o início com acessibilidade como requisito, e não como ajuste final. O objetivo é que uma pessoa cega (com leitor de tela), com baixa visão, com limitação motora (só teclado ou switch control) ou com dificuldade cognitiva consiga usar todas as funções sem ajuda.

### Público-alvo e necessidades

| Perfil | Tecnologia assistiva | Necessidade principal |
|---|---|---|
| Pessoa cega | NVDA, JAWS, TalkBack, VoiceOver | Nomes claros para cada controle e aviso falado após cada ação |
| Baixa visão | Ampliação, alto contraste | Texto grande sem quebrar a tela, contraste forte |
| Limitação motora | Teclado, switch control, acionador | Tudo acessível por Tab/Enter/Espaço, alvos grandes |
| Deficiência cognitiva / dislexia | — | Linguagem simples, espaçamento maior, mensagens de erro claras |
| Daltonismo | — | Informação nunca transmitida só por cor |

## 2. Especificação de requisitos

### 2.1 Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Cadastrar tarefa com título (obrigatório), prioridade, prazo e descrição |
| RF02 | Editar tarefa existente |
| RF03 | Marcar/desmarcar tarefa como concluída |
| RF04 | Excluir tarefa com confirmação |
| RF05 | Filtrar por todas, pendentes ou concluídas |
| RF06 | Mostrar contador "X de Y tarefas concluídas" |
| RF07 | Guardar tarefas e preferências entre visitas |

### 2.2 Requisitos de acessibilidade (não funcionais)

| ID | Requisito | WCAG 2.2 | eMAG 3.1 |
|---|---|---|---|
| RA01 | Todos os controles devem ter nome acessível | 1.3.1, 4.1.2 | 3.6, 6.2 |
| RA02 | Toda ação deve ser anunciada ao leitor de tela | 4.1.3 | 6.7 |
| RA03 | Toda função deve funcionar só com teclado | 2.1.1, 2.1.2 | 1.5 |
| RA04 | O foco deve ser sempre visível e ir para um lugar lógico após cada ação | 2.4.3, 2.4.7, 2.4.11 | 1.5 |
| RA05 | Links para saltar direto ao conteúdo | 2.4.1 | 1.5 |
| RA06 | Contraste mínimo 4,5:1 no padrão e 7:1 no modo alto contraste | 1.4.3, 1.4.6, 1.4.11 | 4.1 |
| RA07 | Texto ampliável até 200% sem perda de conteúdo | 1.4.4, 1.4.10 | 4.2 |
| RA08 | Espaçamento de texto ajustável | 1.4.12 | — |
| RA09 | Informação não pode depender só de cor | 1.4.1 | 4.1 |
| RA10 | Erros identificados em texto, com sugestão de correção | 3.3.1, 3.3.3 | 6.5 |
| RA11 | Alvos de clique de no mínimo 24px (meta: 44px) | 2.5.8 | — |
| RA12 | Idioma da página declarado | 3.1.1 | 3.2 |
| RA13 | Respeitar preferência de movimento reduzido e cores forçadas do sistema | 2.3.3 | — |

## 3. Arquitetura da solução

Aplicação **front-end estática**, sem servidor e sem framework, para que o HTML gerado seja simples e previsível para as tecnologias assistivas.

```
┌────────────────────────── Navegador ──────────────────────────┐
│                                                               │
│  index.html  ── estrutura semântica (header, nav, main,       │
│                 section, form, fieldset, ul, dialog)          │
│                                                               │
│  styles.css  ── variáveis CSS para 3 temas (padrão, escuro,   │
│                 alto contraste), escala de fonte, espaçamento │
│                                                               │
│  app.js      ── Estado ─► Renderização ─► Anúncio + Foco      │
│                  │                                            │
│                  └─► localStorage (tarefas, preferências)     │
│                                                               │
│  Árvore de acessibilidade ──► API do SO ──► NVDA / TalkBack   │
└───────────────────────────────────────────────────────────────┘
```

### Decisões de projeto

1. **Elementos nativos primeiro.** Checkbox, radio, `button`, `select` e `dialog` nativos já trazem papel, estado e teclado corretos. ARIA só onde o HTML não basta (`aria-pressed`, `aria-live`, `aria-invalid`, `aria-describedby`).
2. **Fluxo "ação → anúncio → foco".** Toda ação do usuário passa por três passos: atualiza o estado, anuncia o resultado numa região viva e coloca o foco no próximo ponto lógico. Ex.: ao excluir, o foco vai para a tarefa seguinte; ao cancelar, volta para o botão "Excluir".
3. **Temas por variáveis CSS.** Uma classe no `<html>` troca todas as cores de uma vez, o que garante que nenhum componente fique com contraste errado.
4. **Escala em `rem`.** O botão A+ muda só a variável `--escala`; todo o layout acompanha.
5. **Diálogo nativo.** `<dialog>.showModal()` prende o foco, fecha com `Esc` e deixa o resto da página inerte para o leitor de tela. O foco inicial fica em "Cancelar" (opção segura).
6. **Resumo de erros.** Ao enviar com erro, o foco vai para um resumo com links que levam direto ao campo errado, padrão recomendado pelo GOV.UK Design System.

## 4. Relatório de conformidade

### 4.1 Testes automatizados

Ferramenta: **Playwright 1.65.1 + axe-core 4.14** com as regras WCAG 2.0, 2.1 e 2.2 (A e AA) e boas práticas.

| Teste | Resultado |
|---|---|
| Página inicial – axe | ✅ 0 violações (48 regras aprovadas) |
| Modo alto contraste – axe | ✅ 0 violações |
| Tema escuro – axe | ✅ 0 violações |
| Texto em 200% + espaçamento amplo – axe | ✅ 0 violações |
| Formulário com erro (foco, `aria-invalid`, alerta) – axe | ✅ 0 violações |
| Fluxo completo só com teclado (adicionar, concluir, excluir, Esc) | ✅ Passou |
| Diálogo aberto – axe | ✅ 0 violações |
| Filtros pelas setas | ✅ Passou |
| Preferências salvas após recarregar | ✅ Passou |
| Reflow em 320px sem rolagem horizontal | ✅ Passou |

**Total: 9 de 9 testes passando.** Os testes rodam automaticamente no GitHub Actions a cada push, impedindo regressões de acessibilidade.

### 4.2 Testes manuais com tecnologia assistiva

| Cenário | Tecnologia | O que verificar | Resultado |
|---|---|---|---|
| Adicionar tarefa | NVDA + Chrome | Campo lido como "Título da tarefa, editar, obrigatório"; após Enter, NVDA fala "Tarefa ... adicionada" | ☐ |
| Concluir tarefa | NVDA | "caixa de seleção, não marcada" → Espaço → "Tarefa ... marcada como concluída" | ☐ |
| Excluir tarefa | NVDA | Diálogo anunciado com título e texto; Esc devolve o foco | ☐ |
| Erro no formulário | NVDA | Alerta falado imediatamente com a mensagem | ☐ |
| Navegação | Só teclado | Link de salto aparece no primeiro Tab; foco sempre visível | ☐ |
| Celular | TalkBack (Android) | Deslizar passa por todos os itens na ordem certa | ☐ |
| Zoom | Navegador em 200% | Nenhum conteúdo cortado | ☐ |

> Marcar ☑ após gravar o vídeo de demonstração.

### 4.3 Checklist WCAG 2.2 AA (resumo)

| Princípio | Critérios atendidos |
|---|---|
| **Perceptível** | 1.3.1, 1.3.2, 1.3.5, 1.4.1, 1.4.3, 1.4.4, 1.4.6 (AAA, modo alto contraste), 1.4.10, 1.4.11, 1.4.12, 1.4.13 |
| **Operável** | 2.1.1, 2.1.2, 2.3.3, 2.4.1, 2.4.2, 2.4.3, 2.4.6, 2.4.7, 2.4.11, 2.5.3, 2.5.8 |
| **Compreensível** | 3.1.1, 3.2.1, 3.2.2, 3.3.1, 3.3.2, 3.3.3 |
| **Robusto** | 4.1.2, 4.1.3 |

### 4.4 Limitações conhecidas

- Os dados ficam só no navegador; não há sincronização entre dispositivos.
- O seletor de data é o nativo do navegador, cuja acessibilidade varia entre navegadores.
- Os testes manuais com usuários reais com deficiência são recomendados como próximo passo.

## 5. Conclusão

O projeto mostra que acessibilidade pode ser tratada como requisito de engenharia desde o início: os requisitos RA01–RA13 foram rastreados até o código e verificados por testes automatizados que rodam a cada alteração, além de roteiro de testes manuais com leitor de tela.

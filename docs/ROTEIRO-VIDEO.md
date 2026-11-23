# Roteiro do vídeo (3 a 5 minutos)

**Antes de gravar**
- Instale o NVDA (grátis): nvaccess.org
- Grave a tela com som: `Win + Alt + R` (Xbox Game Bar) ou OBS.
- Ative as legendas automáticas ao subir no YouTube/Drive (o enunciado pede legenda ou audiodescrição).
- Abra o `index.html` no Chrome.

---

### 1. Abertura (0:00 – 0:30)
> "Olá, sou o Hendryus. Este é o Acessa Tarefas, um gerenciador de tarefas feito do zero seguindo a WCAG 2.2 nível AA e o eMAG. Vou mostrar o uso com o leitor de tela NVDA e só com o teclado."

### 2. Teclado e link de salto (0:30 – 1:00)
- Aperte **Tab** uma vez → aparece "Ir para o conteúdo principal".
> "O primeiro Tab mostra os links de salto, para quem usa teclado não precisar passar por tudo."
- Continue com Tab e mostre o **contorno amarelo** do foco.

### 3. NVDA – adicionar tarefa (1:00 – 2:00)
- Ligue o NVDA (`Ctrl + Alt + N`).
- Vá até "Título da tarefa" → NVDA lê o nome, "obrigatório" e a dica.
- Aperte **Enter** com o campo vazio → NVDA fala o **erro**.
> "O erro é anunciado na hora, e o resumo tem um link que leva direto ao campo."
- Digite "Entregar projeto final", Enter → NVDA: "Tarefa adicionada".

### 4. NVDA – concluir e excluir (2:00 – 3:00)
- Tab até a caixa da tarefa → **Espaço** → NVDA: "marcada como concluída".
- Tab até "Excluir" → NVDA lê "Excluir tarefa: Entregar projeto final" (o botão diz qual tarefa).
- Enter → diálogo abre, foco em "Cancelar". Aperte **Esc** → foco volta para o botão.
- Repita e confirme a exclusão → NVDA: "Tarefa excluída".
- Use as **setas** no filtro → NVDA: "Mostrando pendentes: 1 tarefa".

### 5. Baixa visão (3:00 – 3:45)
- Desligue o NVDA (`Insert + Q`).
- Clique em **Alto contraste**, depois **Tema escuro**.
- Clique **A+** várias vezes até 200% → nada quebra.
- Clique **Espaçamento amplo**.
> "Esses ajustes ajudam pessoas com baixa visão e dislexia, e ficam salvos para a próxima visita."

### 6. Testes automáticos (3:45 – 4:30)
- No terminal: `npx playwright test` → 9 testes passando.
- Mostre o GitHub Actions rodando.
> "Usei Playwright com axe-core para testar as regras WCAG automaticamente. Se alguém quebrar a acessibilidade, o pipeline falha."

### 7. Encerramento (4:30 – 5:00)
> "Assim o Acessa Tarefas atende pessoas cegas, com baixa visão, com limitação motora e com dificuldades cognitivas. O código e a documentação estão no GitHub. Obrigado."

/* =========================================================
   Acessa Tarefas – lógica da aplicação
   Foco em: anúncios para leitor de tela (aria-live),
   gerenciamento de foco, validação acessível e preferências
   de leitura persistentes.
   ========================================================= */
(function () {
  'use strict';

  // ---------- Armazenamento seguro ----------
  const store = {
    get(chave, padrao) {
      try {
        const v = localStorage.getItem(chave);
        return v === null ? padrao : JSON.parse(v);
      } catch (e) { return padrao; }
    },
    set(chave, valor) {
      try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento: segue em memória */ }
    }
  };

  // ---------- Elementos ----------
  const $ = (id) => document.getElementById(id);
  const html = document.documentElement;
  const form = $('form-tarefa');
  const campoTitulo = $('titulo');
  const campoPrioridade = $('prioridade');
  const campoPrazo = $('prazo');
  const campoDescricao = $('descricao');
  const lista = $('lista');
  const contador = $('contador');
  const listaVazia = $('lista-vazia');
  const aviso = $('aviso');
  const alerta = $('alerta');
  const dialogo = $('dialogo-excluir');
  const btnSalvar = $('btn-salvar');
  const btnCancelarEdicao = $('btn-cancelar-edicao');
  const resumoErros = $('resumo-erros');
  const resumoErrosLista = $('resumo-erros-lista');

  const NOMES_PRIORIDADE = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  // ---------- Estado ----------
  let tarefas = store.get('at-tarefas', []);
  let filtro = 'todas';
  let editandoId = null;
  let excluirId = null;
  let prefs = Object.assign(
    { contraste: false, escuro: false, escala: 1, espaco: false },
    store.get('at-prefs', {})
  );

  // ---------- Anúncios para leitores de tela ----------
  function anunciar(msg) {
    aviso.textContent = '';
    // pequeno atraso garante que o leitor perceba a mudança
    setTimeout(() => { aviso.textContent = msg; }, 50);
  }
  function alertar(msg) {
    alerta.textContent = '';
    setTimeout(() => { alerta.textContent = msg; }, 50);
  }

  // ---------- Utilidades de data ----------
  function hojeISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function dataPorExtenso(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // =========================================================
  // Preferências de acessibilidade
  // =========================================================
  function aplicarPrefs() {
    html.classList.toggle('alto-contraste', prefs.contraste);
    html.classList.toggle('tema-escuro', prefs.escuro && !prefs.contraste);
    html.classList.toggle('espaco-amplo', prefs.espaco);
    html.style.setProperty('--escala', prefs.escala);

    $('btn-contraste').setAttribute('aria-pressed', String(prefs.contraste));
    $('btn-tema').setAttribute('aria-pressed', String(prefs.escuro));
    $('btn-espaco').setAttribute('aria-pressed', String(prefs.espaco));
    $('tamanho-valor').textContent = Math.round(prefs.escala * 100) + '%';
    $('btn-diminuir').disabled = prefs.escala <= 0.8;
    $('btn-aumentar').disabled = prefs.escala >= 2;
    store.set('at-prefs', prefs);
  }

  $('btn-contraste').addEventListener('click', () => {
    prefs.contraste = !prefs.contraste;
    aplicarPrefs();
    anunciar(prefs.contraste ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
  });
  $('btn-tema').addEventListener('click', () => {
    prefs.escuro = !prefs.escuro;
    aplicarPrefs();
    anunciar(prefs.escuro ? 'Tema escuro ativado.' : 'Tema claro ativado.');
  });
  $('btn-espaco').addEventListener('click', () => {
    prefs.espaco = !prefs.espaco;
    aplicarPrefs();
    anunciar(prefs.espaco ? 'Espaçamento amplo ativado.' : 'Espaçamento normal.');
  });
  $('btn-aumentar').addEventListener('click', () => {
    prefs.escala = Math.min(2, +(prefs.escala + 0.1).toFixed(1));
    aplicarPrefs();
    anunciar('Texto em ' + Math.round(prefs.escala * 100) + ' por cento.');
  });
  $('btn-diminuir').addEventListener('click', () => {
    prefs.escala = Math.max(0.8, +(prefs.escala - 0.1).toFixed(1));
    aplicarPrefs();
    anunciar('Texto em ' + Math.round(prefs.escala * 100) + ' por cento.');
  });
  $('btn-restaurar').addEventListener('click', () => {
    prefs = { contraste: false, escuro: false, escala: 1, espaco: false };
    aplicarPrefs();
    anunciar('Preferências de leitura restauradas para o padrão.');
  });

  // =========================================================
  // Formulário com validação acessível
  // =========================================================
  campoPrazo.min = hojeISO();

  campoDescricao.addEventListener('input', () => {
    $('descricao-contador').textContent = campoDescricao.value.length + ' de 300 caracteres usados.';
  });

  function mostrarErro(campo, idErro, msg) {
    const p = $(idErro);
    p.textContent = msg;
    p.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
  }
  function limparErro(campo, idErro) {
    const p = $(idErro);
    p.textContent = '';
    p.hidden = true;
    campo.removeAttribute('aria-invalid');
  }

  function validar() {
    const erros = [];
    limparErro(campoTitulo, 'titulo-erro');
    limparErro(campoPrazo, 'prazo-erro');

    if (!campoTitulo.value.trim()) {
      const m = 'Informe o título da tarefa.';
      mostrarErro(campoTitulo, 'titulo-erro', m);
      erros.push({ campo: campoTitulo, msg: m });
    }
    if (campoPrazo.value && campoPrazo.value < hojeISO()) {
      const m = 'O prazo não pode ser uma data que já passou.';
      mostrarErro(campoPrazo, 'prazo-erro', m);
      erros.push({ campo: campoPrazo, msg: m });
    }

    // Resumo de erros no topo do formulário (WCAG 3.3.1 / 3.3.3)
    resumoErrosLista.innerHTML = '';
    if (erros.length) {
      erros.forEach(({ campo, msg }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + campo.id;
        a.textContent = msg;
        a.addEventListener('click', (ev) => { ev.preventDefault(); campo.focus(); });
        li.appendChild(a);
        resumoErrosLista.appendChild(li);
      });
      resumoErros.hidden = false;
      resumoErros.setAttribute('aria-labelledby', 'resumo-erros-titulo');
      resumoErros.focus();
      alertar('O formulário tem ' + erros.length + (erros.length > 1 ? ' erros.' : ' erro.') + ' ' + erros.map(e => e.msg).join(' '));
    } else {
      resumoErros.hidden = true;
    }
    return erros.length === 0;
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!validar()) return;

    const dados = {
      titulo: campoTitulo.value.trim(),
      prioridade: campoPrioridade.value,
      prazo: campoPrazo.value,
      descricao: campoDescricao.value.trim()
    };

    if (editandoId) {
      const t = tarefas.find(x => x.id === editandoId);
      Object.assign(t, dados);
      const id = editandoId;
      sairDoModoEdicao();
      salvarERenderizar();
      anunciar('Tarefa "' + dados.titulo + '" atualizada.');
      focarItem(id);
    } else {
      tarefas.unshift(Object.assign({ id: String(Date.now()), concluida: false }, dados));
      form.reset();
      campoPrioridade.value = 'media';
      $('descricao-contador').textContent = '0 de 300 caracteres usados.';
      salvarERenderizar();
      anunciar('Tarefa "' + dados.titulo + '" adicionada. Total: ' + tarefas.length + '.');
      campoTitulo.focus();
    }
  });

  function entrarNoModoEdicao(id) {
    const t = tarefas.find(x => x.id === id);
    if (!t) return;
    editandoId = id;
    campoTitulo.value = t.titulo;
    campoPrioridade.value = t.prioridade;
    campoPrazo.value = t.prazo || '';
    campoDescricao.value = t.descricao || '';
    $('descricao-contador').textContent = campoDescricao.value.length + ' de 300 caracteres usados.';
    $('nova-tarefa-titulo').textContent = 'Editar tarefa';
    btnSalvar.textContent = 'Salvar alterações';
    btnCancelarEdicao.hidden = false;
    campoTitulo.focus();
    anunciar('Editando a tarefa "' + t.titulo + '".');
  }

  function sairDoModoEdicao() {
    editandoId = null;
    form.reset();
    campoPrioridade.value = 'media';
    limparErro(campoTitulo, 'titulo-erro');
    limparErro(campoPrazo, 'prazo-erro');
    resumoErros.hidden = true;
    $('descricao-contador').textContent = '0 de 300 caracteres usados.';
    $('nova-tarefa-titulo').textContent = 'Nova tarefa';
    btnSalvar.textContent = 'Adicionar tarefa';
    btnCancelarEdicao.hidden = true;
  }

  btnCancelarEdicao.addEventListener('click', () => {
    const id = editandoId;
    sairDoModoEdicao();
    anunciar('Edição cancelada.');
    focarItem(id);
  });

  // =========================================================
  // Lista
  // =========================================================
  document.querySelectorAll('input[name="filtro"]').forEach((r) => {
    r.addEventListener('change', () => {
      filtro = r.value;
      renderizar();
      const visiveis = lista.children.length;
      anunciar('Mostrando ' + r.parentElement.textContent.trim().toLowerCase() + ': ' + visiveis + (visiveis === 1 ? ' tarefa.' : ' tarefas.'));
    });
  });

  function salvarERenderizar() {
    store.set('at-tarefas', tarefas);
    renderizar();
  }

  function tarefasFiltradas() {
    if (filtro === 'pendentes') return tarefas.filter(t => !t.concluida);
    if (filtro === 'concluidas') return tarefas.filter(t => t.concluida);
    return tarefas;
  }

  function renderizar() {
    lista.innerHTML = '';
    const hoje = hojeISO();

    tarefasFiltradas().forEach((t) => {
      const li = document.createElement('li');
      li.className = 'item' + (t.concluida ? ' concluida' : '');
      li.dataset.id = t.id;

      const idCheck = 'chk-' + t.id;
      const idMeta = 'meta-' + t.id;

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.id = idCheck;
      chk.checked = t.concluida;
      chk.setAttribute('aria-describedby', idMeta);
      chk.addEventListener('change', () => alternar(t.id));

      const corpo = document.createElement('div');
      corpo.className = 'item-corpo';

      const label = document.createElement('label');
      label.htmlFor = idCheck;
      label.className = 'item-titulo';
      label.textContent = t.titulo;

      const meta = document.createElement('p');
      meta.className = 'item-meta';
      meta.id = idMeta;

      const selo = document.createElement('span');
      selo.className = 'selo ' + t.prioridade;
      selo.textContent = 'Prioridade ' + NOMES_PRIORIDADE[t.prioridade].toLowerCase();
      meta.appendChild(selo);

      if (t.prazo) {
        const prazo = document.createElement('span');
        const atrasada = !t.concluida && t.prazo < hoje;
        prazo.textContent = ' · Prazo: ' + dataPorExtenso(t.prazo) + (atrasada ? ' (atrasada)' : '');
        if (atrasada) prazo.className = 'atrasada';
        meta.appendChild(prazo);
      }
      const estado = document.createElement('span');
      estado.textContent = t.concluida ? ' · Concluída' : ' · Pendente';
      meta.appendChild(estado);

      corpo.appendChild(label);
      corpo.appendChild(meta);
      if (t.descricao) {
        const d = document.createElement('p');
        d.className = 'item-desc';
        d.textContent = t.descricao;
        corpo.appendChild(d);
      }

      const acoes = document.createElement('div');
      acoes.className = 'item-acoes';

      const bEditar = document.createElement('button');
      bEditar.type = 'button';
      bEditar.textContent = 'Editar';
      bEditar.setAttribute('aria-label', 'Editar tarefa: ' + t.titulo);
      bEditar.addEventListener('click', () => entrarNoModoEdicao(t.id));

      const bExcluir = document.createElement('button');
      bExcluir.type = 'button';
      bExcluir.textContent = 'Excluir';
      bExcluir.setAttribute('aria-label', 'Excluir tarefa: ' + t.titulo);
      bExcluir.addEventListener('click', () => pedirExclusao(t.id));

      acoes.appendChild(bEditar);
      acoes.appendChild(bExcluir);

      li.appendChild(chk);
      li.appendChild(corpo);
      li.appendChild(acoes);
      lista.appendChild(li);
    });

    const total = tarefas.length;
    const feitas = tarefas.filter(t => t.concluida).length;
    contador.textContent = total === 0
      ? 'Nenhuma tarefa cadastrada.'
      : feitas + ' de ' + total + (total === 1 ? ' tarefa concluída.' : ' tarefas concluídas.');
    listaVazia.hidden = lista.children.length > 0;
    lista.hidden = lista.children.length === 0;
  }

  function alternar(id) {
    const t = tarefas.find(x => x.id === id);
    t.concluida = !t.concluida;
    salvarERenderizar();
    anunciar('Tarefa "' + t.titulo + '" marcada como ' + (t.concluida ? 'concluída.' : 'pendente.'));
    // Mantém o foco no mesmo item (se ainda visível no filtro)
    const chk = $('chk-' + id);
    if (chk) chk.focus(); else $('lista-titulo').focus();
  }

  function focarItem(id) {
    const chk = id && $('chk-' + id);
    if (chk) chk.focus(); else $('lista-titulo').focus();
  }

  // ---------- Exclusão com diálogo ----------
  function pedirExclusao(id) {
    const t = tarefas.find(x => x.id === id);
    excluirId = id;
    $('dialogo-texto').textContent = 'A tarefa "' + t.titulo + '" será removida. Esta ação não pode ser desfeita.';
    dialogo.showModal();
    $('btn-cancelar-exclusao').focus(); // foco na opção segura
  }

  let focoAposFechar = null;

  $('btn-confirmar-exclusao').addEventListener('click', () => {
    const visiveis = tarefasFiltradas();
    const idx = visiveis.findIndex(x => x.id === excluirId);
    const t = tarefas.find(x => x.id === excluirId);
    tarefas = tarefas.filter(x => x.id !== excluirId);
    salvarERenderizar();
    const restantes = tarefasFiltradas();
    const proximo = restantes[Math.min(idx, restantes.length - 1)];
    focoAposFechar = proximo ? proximo.id : null;
    dialogo.close('excluida');
    anunciar('Tarefa "' + t.titulo + '" excluída. Restam ' + tarefas.length + '.');
  });

  $('btn-cancelar-exclusao').addEventListener('click', () => dialogo.close('cancelada'));

  dialogo.addEventListener('close', () => {
    if (dialogo.returnValue === 'excluida') {
      focarItem(focoAposFechar);
    } else {
      // Esc ou Cancelar: devolve o foco ao botão que abriu o diálogo
      const item = lista.querySelector('[data-id="' + excluirId + '"] button[aria-label^="Excluir"]');
      if (item) item.focus();
      anunciar('Exclusão cancelada.');
    }
    excluirId = null;
    dialogo.returnValue = '';
  });

  // ---------- Links de salto: move o foco de verdade ----------
  document.querySelectorAll('.skip-links a').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (alvo) { ev.preventDefault(); alvo.focus(); alvo.scrollIntoView(); }
    });
  });

  // ---------- Dados de exemplo na primeira visita ----------
  if (!store.get('at-iniciado', false) && tarefas.length === 0) {
    const amanha = new Date(Date.now() + 86400000);
    amanha.setMinutes(amanha.getMinutes() - amanha.getTimezoneOffset());
    tarefas = [
      { id: '1', titulo: 'Estudar para a prova do concurso', prioridade: 'alta', prazo: amanha.toISOString().slice(0, 10), descricao: 'Revisar redes e segurança da informação.', concluida: false },
      { id: '2', titulo: 'Comprar pão', prioridade: 'baixa', prazo: '', descricao: '', concluida: true }
    ];
    store.set('at-iniciado', true);
    store.set('at-tarefas', tarefas);
  }

  aplicarPrefs();
  renderizar();
})();

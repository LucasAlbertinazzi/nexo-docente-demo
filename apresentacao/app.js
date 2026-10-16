import { initialDraft, distributeTime, validateDraft, createPlan, revisePlan, makeTemplate, filterPlans, escapeHtml as html, exampleMaterials } from './demo.mjs';

const panel = document.querySelector('#demo-panel');
const status = document.querySelector('#demo-status');
let state;

function resetDemo() {
  document.querySelector('#print-document').replaceChildren();
  const draft = initialDraft();
  const reading = { ...draft, topic: 'Leitura compartilhada', objective: 'Identificar a ideia principal de um texto e compartilhar interpretações.', subject: 'Língua Portuguesa', year: '3º ano' };
  state = { view: 'planner', draft, step: 0, result: null, editing: false, plans: [createPlan(draft, 1)], templates: [makeTemplate(reading, 1), makeTemplate(draft, 2)], nextPlan: 2, nextTemplate: 3, historySearch: '', materialSearch: '' };
  render();
}

function announce(message) { status.textContent = message; }

function showView(view, focus = false) {
  state.view = view;
  state.editing = false;
  if (view === 'planner') state.result = null;
  render();
  if (focus) panel.focus({ preventScroll: true });
}

function button(label, action, value = '', outline = false) {
  return `<button class="button${outline ? ' button-outline' : ''}" type="button" data-action="${action}" data-value="${html(value)}">${label}</button>`;
}

function field(label, name, value, options = {}) {
  const id = `demo-${name}`;
  const common = `id="${id}" name="${name}"`;
  let input;
  if (options.choices) {
    input = `<select ${common}>${options.choices.map(choice => { const [key, text] = Array.isArray(choice) ? choice : [choice, choice]; return `<option value="${html(key)}"${String(value) === String(key) ? ' selected' : ''}>${html(text)}</option>`; }).join('')}</select>`;
  } else if (options.textarea) {
    input = `<textarea ${common} required maxlength="${options.max || 600}" rows="3">${html(value)}</textarea>`;
  } else {
    input = `<input ${common} value="${html(value)}" ${options.number ? 'type="number" min="5" max="180" step="1"' : 'type="text" maxlength="120"'} required>`;
  }
  return `<label class="field" for="${id}"><span>${label}</span>${input}</label>`;
}

function planner() {
  const { draft, step } = state;
  const steps = ['Conteúdo', 'Turma e tempo', 'Condução'];
  let content = '';
  if (step === 0) content = field('Conteúdo proposto', 'topic', draft.topic) + field('Objetivo pedagógico', 'objective', draft.objective, { textarea: true }) + field('Componente curricular', 'subject', draft.subject, { choices: ['Matemática', 'Língua Portuguesa', 'Ciências', 'História', 'Geografia', 'Arte', 'Educação Física'] });
  if (step === 1) content = field('Ano / série', 'year', draft.year, { choices: ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano', 'Ensino Médio'] }) + `<div class="field-grid">${field('Duração total (min)', 'duration', draft.duration, { number: true })}${field('Reserva para acolhimento', 'reserve', draft.reserve, { choices: [[0, 'Usar todo o tempo'], [5, '5 minutos'], [10, '10 minutos'], [15, '15 minutos']] })}</div><div id="timing-preview" class="timing-note" aria-live="polite">${timingText()}</div>`;
  if (step === 2) content = field('Organização da turma', 'organization', draft.organization, { choices: ['Duplas', 'Grupos', 'Individual'] }) + `<label class="check-label"><input type="checkbox" name="material"${draft.material ? ' checked' : ''}><span>Vincular material de exemplo: <strong>Cartões de frações</strong></span></label><p class="small">No aplicativo, você escolhe materiais da sua biblioteca e pode consultar referências BNCC. Esta prévia não lê arquivos nem confere habilidades.</p><p class="timing-note">${timingText()}</p>`;
  return `<form id="planner-form" novalidate><h3>Planejar aula</h3><ol class="steps" aria-label="Etapas do planejamento">${steps.map((title, index) => `<li${index === step ? ' aria-current="step"' : ''}><span>${index + 1}</span>${title}</li>`).join('')}</ol>${content}<p id="form-error" class="form-error" role="alert"></p><div class="actions">${step ? button('Voltar', 'back', '', true) : ''}<button class="button" type="submit">${step === 2 ? 'Montar roteiro de exemplo' : 'Continuar'}</button></div><p class="small">Simulação local, sem IA e sem consumo de cotas. Revise e adapte o resultado à sua turma.</p></form>`;
}

function timingText() {
  try {
    const timing = distributeTime(state.draft.duration, state.draft.reserve);
    return `${timing.available} min para atividades · ${timing.opening} de abertura + ${timing.development} de desenvolvimento + ${timing.closing} de fechamento.`;
  } catch (error) { return html(error.message); }
}

function planResult() {
  const plan = state.result;
  if (state.editing) return `<form id="edit-form" novalidate><h3>Editar roteiro</h3><p class="small">Você está editando a versão ${plan.version}. Salvar cria uma nova versão nesta demonstração.</p>${plan.sections.map((section, index) => field(`${section.title} · ${section.minutes} min`, `section-${index}`, section.text, { textarea: true, max: 3000 })).join('')}<p id="form-error" class="form-error" role="alert"></p><div class="actions"><button class="button" type="submit">Salvar revisão</button>${button('Cancelar edição', 'cancel-edit', '', true)}</div></form>`;
  return `<article class="result-document"><h3>${html(plan.draft.topic)}</h3><p class="result-meta">${html(plan.draft.subject)} · ${html(plan.draft.year)} · ${plan.draft.duration} min<br>${plan.timing.available} min de atividades · ${plan.draft.reserve} min de acolhimento · Versão ${plan.version}</p><h4>Objetivo pedagógico</h4><p>${html(plan.draft.objective)}</p>${plan.sections.map(section => `<section><h4>${section.title} <span class="small">· ${section.minutes} min</span></h4><p>${html(section.text)}</p></section>`).join('')}<p class="small">Roteiro demonstrativo. Sem conferência curricular. A avaliação acontece durante as etapas.</p></article><div class="actions">${button('Editar roteiro', 'edit')}${button('Salvar como modelo', 'save-template', '', true)}${button('Imprimir / salvar PDF', 'print', '', true)}${button('Novo planejamento', 'new', '', true)}</div>`;
}

function planItems(plans) {
  if (!plans.length) return '<li class="empty-state">Nenhum planejamento encontrado. Experimente outra busca ou prepare uma aula.</li>';
  return plans.map(plan => `<li><h4>${html(plan.draft.topic)}</h4><p>${html(plan.draft.subject)} · ${html(plan.draft.year)} · ${plan.draft.duration} min · Versão ${plan.version}</p>${button('Abrir roteiro', 'open-plan', `${plan.id}:${plan.version}`, true)}</li>`).join('');
}

function home() {
  return `<h3>Meu espaço</h3><div class="home-highlight"><h4>Planeje sua próxima aula</h4><p class="small">Comece com uma ideia e organize o seu roteiro.</p>${button('Preparar uma aula', 'new')}</div><h3>Planos recentes</h3><ul class="demo-list">${planItems(state.plans.slice().reverse().slice(0, 3))}</ul><div class="actions">${button('Meus modelos', 'view', 'templates', true)}${button('Ver histórico', 'view', 'history', true)}</div>`;
}

function templates() {
  return `<h3>Modelos pessoais</h3><p class="small">Reutilize uma configuração. Os modelos criados aqui desaparecem ao reiniciar a demonstração.</p><ul class="demo-list">${state.templates.length ? state.templates.map(template => `<li><h4>${html(template.name)}</h4><p>${html(template.draft.subject)} · ${html(template.draft.year)} · ${template.draft.duration} min</p><div class="actions">${button('Usar modelo', 'use-template', template.id)}${button('Remover exemplo', 'remove-template', template.id, true)}</div></li>`).join('') : '<li class="empty-state">Nenhum modelo nesta demonstração. Salve um roteiro como modelo para reutilizar.</li>'}</ul>`;
}

function materialItems() {
  const query = state.materialSearch.toLocaleLowerCase('pt-BR').trim();
  const materials = exampleMaterials.filter(item => `${item.name} ${item.subject} ${item.year}`.toLocaleLowerCase('pt-BR').includes(query));
  return materials.length ? materials.map(item => `<li><h4>${html(item.name)}</h4><p>${html(item.subject)} · ${html(item.year)}<br>${item.kind}; nenhum arquivo é enviado.</p>${item.id === 'fractions' ? `<div class="actions">${button(state.draft.material ? 'Desvincular do próximo plano' : 'Vincular ao próximo plano', 'link-material', '', true)}</div>` : ''}</li>`).join('') : '<li class="empty-state">Nenhum material encontrado. Busque por nome, matéria ou ano.</li>';
}

function materials() {
  return `<h3>Biblioteca de materiais</h3><p class="small">Explore referências fictícias. Os arquivos e a leitura de materiais estão disponíveis no aplicativo, conforme o recurso utilizado.</p><label class="field" for="material-search"><span>Buscar material de exemplo</span><input type="search" id="material-search" value="${html(state.materialSearch)}" maxlength="120" placeholder="Nome, matéria ou ano"></label><ul class="demo-list" id="material-list">${materialItems()}</ul>`;
}

function history() {
  return `<h3>Histórico e versões</h3><p class="small">Abra um roteiro ou consulte as revisões que você salvou nesta página.</p><label class="field" for="history-search"><span>Buscar planejamento</span><input type="search" id="history-search" value="${html(state.historySearch)}" maxlength="120" placeholder="Conteúdo, matéria ou ano"></label><ul class="demo-list" id="history-list">${planItems(filterPlans(state.plans.slice().reverse(), state.historySearch))}</ul>`;
}

function render() {
  for (const tab of document.querySelectorAll('[data-view]')) {
    const selected = tab.dataset.view === state.view;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  panel.setAttribute('aria-labelledby', `tab-${state.view}`);
  const views = { home, planner: () => state.result ? planResult() : planner(), templates, materials, history };
  panel.innerHTML = views[state.view]();
}

function updateDraft(target) {
  if (!(target.name in state.draft)) return;
  state.draft[target.name] = target.type === 'checkbox' ? target.checked : ['duration', 'reserve'].includes(target.name) ? Number(target.value) : target.value;
  const timing = document.querySelector('#timing-preview');
  if (timing) timing.textContent = timingText();
}

panel.addEventListener('input', event => {
  if (event.target.closest('#planner-form')) updateDraft(event.target);
  if (event.target.id === 'history-search') {
    state.historySearch = event.target.value;
    document.querySelector('#history-list').innerHTML = planItems(filterPlans(state.plans.slice().reverse(), state.historySearch));
  }
  if (event.target.id === 'material-search') {
    state.materialSearch = event.target.value;
    document.querySelector('#material-list').innerHTML = materialItems();
  }
});
panel.addEventListener('change', event => { if (event.target.closest('#planner-form')) updateDraft(event.target); });

panel.addEventListener('submit', event => {
  event.preventDefault();
  const errorElement = document.querySelector('#form-error');
  if (event.target.id === 'planner-form') {
    const error = validateDraft(state.draft, state.step);
    if (error) { errorElement.textContent = error; return; }
    if (state.step < 2) state.step += 1;
    else {
      state.result = createPlan(state.draft, state.nextPlan++);
      state.plans.push(state.result);
      announce('Roteiro de exemplo criado. Edite uma etapa ou salve como modelo.');
    }
  } else if (event.target.id === 'edit-form') {
    try {
      const form = new FormData(event.target);
      state.result = revisePlan(state.result, [0, 1, 2].map(index => String(form.get(`section-${index}`) || '')), state.plans);
      state.plans.push(state.result);
      state.editing = false;
      announce(`Revisão salva como versão ${state.result.version}. A versão anterior continua no histórico.`);
    } catch (error) { errorElement.textContent = error.message; return; }
  }
  render();
  panel.focus({ preventScroll: true });
});

document.querySelector('#demo-shell').addEventListener('click', event => {
  const tab = event.target.closest('[data-view]');
  if (tab) { showView(tab.dataset.view); return; }
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const { action, value } = control.dataset;
  if (action === 'back') state.step = Math.max(0, state.step - 1);
  if (action === 'view') { showView(value, true); return; }
  if (action === 'new') { state.draft = initialDraft(); state.step = 0; state.result = null; state.view = 'planner'; state.editing = false; }
  if (action === 'edit') state.editing = true;
  if (action === 'cancel-edit') state.editing = false;
  if (action === 'open-plan') {
    const [id, version] = value.split(':').map(Number);
    state.result = state.plans.find(plan => plan.id === id && plan.version === version);
    state.view = 'planner';
    state.editing = false;
  }
  if (action === 'save-template') {
    const existing = state.templates.find(template => JSON.stringify(template.draft) === JSON.stringify(state.result.draft));
    if (existing) announce('Essa configuração já está nos modelos da demonstração. Abra Modelos para reutilizar.');
    else { state.templates.push(makeTemplate(state.result.draft, state.nextTemplate++)); announce('Modelo salvo nesta demonstração. Abra Modelos para reutilizar.'); }
    return;
  }
  if (action === 'use-template') {
    state.draft = { ...state.templates.find(template => template.id === Number(value)).draft };
    state.view = 'planner'; state.step = 0; state.result = null;
    announce('Modelo carregado. Você pode editar todos os campos antes de montar o roteiro.');
  }
  if (action === 'remove-template') { state.templates = state.templates.filter(template => template.id !== Number(value)); announce('Modelo removido apenas desta demonstração.'); }
  if (action === 'link-material') { state.draft.material = !state.draft.material; announce(state.draft.material ? 'Material de exemplo vinculado ao próximo planejamento.' : 'Material de exemplo desvinculado.'); }
  if (action === 'print') { printPlan(); return; }
  render();
  panel.focus({ preventScroll: true });
});

function printPlan() {
  const plan = state.result;
  document.querySelector('#print-document').innerHTML = `<h1>${html(plan.draft.topic)}</h1><p class="print-meta">Nexo Docente · Demonstração pública · Versão ${plan.version}<br>${html(plan.draft.subject)} · ${html(plan.draft.year)} · ${plan.draft.duration} min<br>${plan.draft.reserve} min de acolhimento · ${plan.timing.available} min de atividades</p><h2>Objetivo pedagógico</h2><p>${html(plan.draft.objective)}</p>${plan.sections.map(section => `<section><h2>${section.title} · ${section.minutes} min</h2><p>${html(section.text)}</p></section>`).join('')}<footer>Roteiro de exemplo montado localmente, sem IA e sem conferência curricular. Revise e adapte antes de usar. appnexodocente.com.br/apresentacao/</footer>`;
  window.print();
}

document.querySelector('#demo-reset').addEventListener('click', () => { resetDemo(); announce('Demonstração reiniciada. Os exemplos originais foram restaurados.'); });

const screens = {
  home: { image: 'meu-espaco', title: 'Seu ponto de partida.', text: 'Acesse planos recentes, modelos e o diário de classe.', label: 'Meu espaço' },
  planner: { image: 'planejar', title: 'Uma aula, passo a passo.', text: 'Defina o conteúdo, a turma e os recursos em três etapas. Depois revise e adapte o roteiro.', label: 'Planejar' },
  history: { image: 'historico', title: 'Seu trabalho tem história.', text: 'Encontre planejamentos anteriores e acompanhe as versões salvas de cada aula.', label: 'Histórico' },
  materials: { image: 'materiais', title: 'Referências sempre à mão.', text: 'Reúna seus materiais por ano e componente curricular e vincule-os ao planejamento.', label: 'Materiais' },
};

document.querySelector('.gallery-tabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-screen]');
  if (!tab) return;
  const screen = screens[tab.dataset.screen];
  for (const item of document.querySelectorAll('[data-screen]')) { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; }
  document.querySelector('#screen-panel').setAttribute('aria-labelledby', tab.id);
  const image = document.querySelector('#screen-image');
  image.src = `./assets/${screen.image}.png`;
  image.alt = `Captura real da tela ${screen.label} no aplicativo Android do Nexo Docente.`;
  document.querySelector('#screen-title').textContent = screen.title;
  document.querySelector('#screen-description').textContent = screen.text;
  document.querySelector('#screen-explore').dataset.explore = tab.dataset.screen;
});

// Roving focus allows both horizontal and vertical tab layouts to use arrows.
for (const tablist of document.querySelectorAll('[role="tablist"]')) tablist.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const index = tabs.indexOf(event.target);
  if (index < 0) return;
  event.preventDefault();
  event.stopPropagation();
  let next = index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1);
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  const tab = tabs[(next + tabs.length) % tabs.length];
  tab.click(); tab.focus();
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  const toggle = document.querySelector('#theme-toggle');
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
  document.querySelector('#theme-label').textContent = dark ? 'Claro' : 'Escuro';
}
try { setTheme(localStorage.getItem('nexo.presentation.theme') === 'dark' ? 'dark' : 'light'); } catch { setTheme('light'); }
document.querySelector('#theme-toggle').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('nexo.presentation.theme', theme); } catch { /* Storage is optional. */ }
});

const slides = [...document.querySelectorAll('[data-slide]')];
let presenting = false;
let slideIndex = 0;
function updatePresentation() {
  document.body.classList.toggle('presenting', presenting);
  document.querySelector('#presentation-controls').hidden = !presenting;
  const toggle = document.querySelector('#presentation-toggle');
  toggle.setAttribute('aria-pressed', String(presenting));
  toggle.querySelector('span').textContent = presenting ? 'Sair da apresentação' : 'Modo apresentação';
  slides.forEach((slide, index) => { slide.hidden = presenting && index !== slideIndex; });
  document.querySelector('#slide-status').textContent = `${slideIndex + 1} / ${slides.length} · ${slides[slideIndex].dataset.title}`;
  document.querySelector('#slide-previous').disabled = slideIndex === 0;
  document.querySelector('#slide-next').disabled = slideIndex === slides.length - 1;
}
function moveSlide(delta) {
  slideIndex = Math.max(0, Math.min(slides.length - 1, slideIndex + delta));
  updatePresentation();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function exitPresentation() {
  presenting = false;
  updatePresentation();
  slides[slideIndex].scrollIntoView({ behavior: 'instant' });
  document.querySelector('#presentation-toggle').focus({ preventScroll: true });
}
document.querySelector('#presentation-toggle').addEventListener('click', () => {
  if (presenting) { exitPresentation(); return; }
  slideIndex = Math.max(0, slides.findIndex(slide => slide.id === location.hash.slice(1)));
  presenting = true; updatePresentation(); window.scrollTo({ top: 0, behavior: 'instant' });
});
document.querySelector('#slide-previous').addEventListener('click', () => moveSlide(-1));
document.querySelector('#slide-next').addEventListener('click', () => moveSlide(1));
document.querySelector('#presentation-exit').addEventListener('click', exitPresentation);
document.addEventListener('keydown', event => {
  if (!presenting) return;
  if (event.key === 'Escape') { exitPresentation(); return; }
  if (event.target.closest('input,select,textarea,[contenteditable], [role="tablist"]')) return;
  if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); moveSlide(['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1); }
});
document.addEventListener('click', event => {
  const explore = event.target.closest('[data-explore]');
  if (explore) { showView(explore.dataset.explore); announce('Fluxo selecionado na demonstração.'); }
  const link = event.target.closest('a[href^="#"]');
  if (presenting && link) {
    const target = slides.findIndex(slide => slide.id === link.hash.slice(1));
    if (target >= 0) { event.preventDefault(); slideIndex = target; updatePresentation(); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
});

resetDemo();

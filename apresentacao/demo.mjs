// Pure, local examples. This module never reads storage or contacts a service.
export const exampleMaterials = Object.freeze([
  { id: 'fractions', name: 'Cartões de frações', subject: 'Matemática', year: '5º ano', kind: 'Material de exemplo' },
  { id: 'reading', name: 'Roda de leitura', subject: 'Língua Portuguesa', year: '3º ano', kind: 'Material de exemplo' },
  { id: 'observation', name: 'Registro de observação', subject: 'Ciências', year: '4º ano', kind: 'Material de exemplo' },
]);

export function initialDraft() {
  return { topic: 'Frações no cotidiano', objective: 'Reconhecer e comparar frações em situações do dia a dia.', subject: 'Matemática', year: '5º ano', duration: 50, reserve: 15, organization: 'Duplas', material: false };
}

export function distributeTime(duration, reserve) {
  if (!Number.isInteger(duration) || !Number.isInteger(reserve) || duration < 5 || duration > 180 || reserve < 0 || duration - reserve < 5) {
    throw new RangeError('Mantenha de 5 a 180 minutos de aula e pelo menos 5 minutos para atividades.');
  }
  const available = duration - reserve;
  const opening = Math.floor(available / 5);
  return { available, opening, development: available - 2 * opening, closing: opening };
}

export function validateDraft(draft, step = 2) {
  if (!draft.topic.trim() || !draft.objective.trim()) return 'Preencha o conteúdo e o objetivo pedagógico.';
  if (draft.topic.length > 120 || draft.objective.length > 600) return 'Use até 120 caracteres no conteúdo e 600 no objetivo.';
  if (step >= 1) {
    try { distributeTime(draft.duration, draft.reserve); }
    catch (error) { return error.message; }
  }
  return '';
}

export function createPlan(draft, id) {
  const error = validateDraft(draft);
  if (error) throw new RangeError(error);
  const timing = distributeTime(draft.duration, draft.reserve);
  return {
    id, draft: { ...draft }, version: 1, timing,
    sections: [
      { title: 'Abertura', minutes: timing.opening, text: `Apresente o tema “${draft.topic.trim()}” e convide a turma a compartilhar o que já conhece. Registre uma pergunta para orientar a aula.` },
      { title: 'Desenvolvimento', minutes: timing.development, text: `Organize a turma em ${draft.organization.toLowerCase()} para explorar “${draft.topic.trim()}”. Proponha uma situação relacionada ao objetivo: ${draft.objective.trim()}${draft.material ? '\nUse o material de exemplo vinculado como ponto de partida para a proposta.' : ''}\nAcompanhe as estratégias e faça perguntas para apoiar a discussão.` },
      { title: 'Fechamento', minutes: timing.closing, text: 'Retome a pergunta inicial. Convide a turma a explicar o que aprendeu e registre o que precisa ser retomado. Observe a participação ao longo das etapas, sem acrescentar tempo ao roteiro.' },
    ],
  };
}

export function revisePlan(plan, texts, history = []) {
  if (texts.length !== 3 || texts.some(text => !text.trim() || text.length > 3000)) throw new RangeError('Preencha as três etapas, com até 3.000 caracteres em cada uma.');
  const latestVersion = Math.max(plan.version, ...history.filter(item => item.id === plan.id).map(item => item.version));
  return { ...plan, draft: { ...plan.draft }, version: latestVersion + 1, sections: plan.sections.map((section, index) => ({ ...section, text: texts[index].trim() })) };
}

export function makeTemplate(draft, id) {
  return { id, name: `Modelo · ${draft.topic.trim() || 'Minha aula'}`, draft: { ...draft } };
}

export function filterPlans(plans, search) {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normalize(search.trim());
  return plans.filter(plan => normalize(`${plan.draft.topic} ${plan.draft.subject} ${plan.draft.year}`).includes(query));
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

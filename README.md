# Nexo Docente — demonstração para professores

Versão experimental, somente para testes e coleta de sugestões.

Este repositório contém apenas a distribuição web compilada. O projeto Flutter
e seu histórico de desenvolvimento permanecem em um repositório privado.
Os arquivos JavaScript do site são públicos, como em qualquer aplicação web.

## O que testar

- Planejamento de aulas com reserva de tempo para organização da turma.
- Componentes curriculares personalizados.
- Modelos pessoais editáveis e histórico de versões.
- Biblioteca privada por conta, com vínculos de referências BNCC.
- Busca de habilidades BNCC por código, assunto, etapa, componente e ano.
- Cadastro, login e acesso com Google conectados ao Supabase, com CPF obrigatório.

## Limitações importantes

- O roteiro demonstrativo não usa IA. A opção "Gerar com IA — piloto" é separada
  e consome a cota de planejamentos quando conclui a geração. Ela aceita até
  2 PDFs selecionados (5 MB somados) e exige consentimento para envio do
  conteúdo à OpenAI.
- A autenticação usa contas reais do Supabase. E-mail/senha exige confirmação de
  e-mail; Google depende da configuração de público-alvo do projeto. O fluxo
  completo de entrada e validação de CPF ainda precisa ser homologado pelo responsável.
- O CPF tem seus dígitos validados no servidor; são persistidos uma impressão
  HMAC e os últimos quatro dígitos. Isso não comprova a titularidade do documento.
- Recuperação de senha com nova senha e confirmação após o link do e-mail.
  Abra o link no mesmo navegador em que solicitou a recuperação.
- O SMTP do projeto está configurado; a recuperação de senha foi validada pelo
  responsável. O e-mail de recuperação está em português e usa o visual Nexo Docente.
- A consulta BNCC usa o serviço independente bncc.dev, não é uma certificação do MEC.
- Planos, modelos e anexos novos são salvos na conta e exigem internet. Use
  Atualizar para buscar alterações de outro dispositivo. Arquivos são privados,
  com limites por plano: teste 2 arquivos de até 5 MB (10 MB no total); Gold
  20 de até 10 MB (100 MB); Premium 50 de até 20 MB (250 MB). Pacote extra ainda
  indisponível. PDFs selecionados podem ser enviados à IA com consentimento;
  não são usados para treinamento pelo aplicativo. Dados antigos da demonstração
  local não são importados. A busca BNCC envia código ou termo e filtros à API.
- Assinaturas e validade do teste agora ficam na conta Supabase. O teste começa
  ao ativar: 15 dias ou 5 planejamentos com IA, uma única vez por CPF.
  Use Atualizar assinatura para consultar em outro dispositivo.
- O registro protegido de utilização do teste é mantido mesmo após exclusão da
  conta, para impedir repetição. Ele não contém o CPF em texto.
- Gold/Premium estão em breve, sem cobrança ou ativação paga. Rascunhos atuais e
  edição manual não consomem saldo. Futuras gerações com IA usam a cota da conta.
- Utilize conteúdos fictícios nos testes. Não anexe informações pessoais de alunos.
- A revisão do professor é necessária antes de aplicar qualquer roteiro.

## Sugestões de feedback

Ao compartilhar comentários com a pessoa que convidou você, informe o dispositivo,
navegador, passos realizados, resultado esperado e o que aconteceu. Capturas de
tela devem omitir dados pessoais.

Distribuição de testes atualizada em 22/09/2026.

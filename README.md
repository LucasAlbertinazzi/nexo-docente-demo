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
- Cadastro, login e acesso com Google conectados ao Supabase, com CPF obrigatório.

## Limitações importantes

- A geração de roteiros é demonstrativa: a IA ainda não está conectada.
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
  com limite de 20 MB por arquivo e 100 MB por conta. Não são lidos pela IA nem
  usados para treinamento. Dados antigos da demonstração local não são importados.
  Somente códigos BNCC são enviados à API de consulta.
- Assinaturas e validade do teste agora ficam na conta Supabase. O teste começa
  ao ativar: 15 dias ou 5 planejamentos com IA, uma única vez por CPF.
  Use Atualizar assinatura para consultar em outro dispositivo.
- O registro protegido de utilização do teste é mantido mesmo após exclusão da
  conta, para impedir repetição. Ele não contém o CPF em texto.
- Gold/Premium estão em breve, sem cobrança ou ativação paga. Rascunhos atuais e
  edição manual não consomem saldo porque a IA ainda não está conectada.
- Utilize conteúdos fictícios nos testes. Não anexe informações pessoais de alunos.
- A revisão do professor é necessária antes de aplicar qualquer roteiro.

## Sugestões de feedback

Ao compartilhar comentários com a pessoa que convidou você, informe o dispositivo,
navegador, passos realizados, resultado esperado e o que aconteceu. Capturas de
tela devem omitir dados pessoais.

Distribuição de testes atualizada em 22/09/2026.

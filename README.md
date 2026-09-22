# Nexo Docente — demonstração para professores

Versão experimental, somente para testes e coleta de sugestões.

Este repositório contém apenas a distribuição web compilada. O projeto Flutter
e seu histórico de desenvolvimento permanecem em um repositório privado.
Os arquivos JavaScript do site são públicos, como em qualquer aplicação web.

## O que testar

- Planejamento de aulas com reserva de tempo para organização da turma.
- Componentes curriculares personalizados.
- Modelos pessoais editáveis e histórico de versões.
- Biblioteca local de materiais e vínculos de referências BNCC.
- Cadastro, login e acesso com Google conectados ao Supabase, com CPF obrigatório.

## Limitações importantes

- A geração de roteiros é demonstrativa: a IA ainda não está conectada.
- A autenticação usa contas reais do Supabase. E-mail/senha exige confirmação de
  e-mail; Google depende da configuração de público-alvo do projeto. O fluxo
  completo de entrada e validação de CPF ainda precisa ser homologado pelo responsável.
- O CPF tem seus dígitos validados no servidor; são persistidos uma impressão
  HMAC e os últimos quatro dígitos. Isso não comprova a titularidade do documento.
- Recuperação de senha ainda precisa da tela para definir a nova senha.
- A consulta BNCC usa o serviço independente bncc.dev, não é uma certificação do MEC.
- Planos, modelos e anexos ficam no navegador/dispositivo utilizado; não há
  sincronização ou separação desses conteúdos por conta. Use um perfil de navegador
  separado por professor. Não há envio automático de arquivos. Limpar os dados do navegador
  pode apagar o conteúdo salvo. Somente códigos BNCC são enviados à API de consulta.
- Assinaturas, teste gratuito e cotas ainda são demonstrativos; não há cobrança real.
- Utilize conteúdos fictícios nos testes. Não anexe informações pessoais de alunos.
- A revisão do professor é necessária antes de aplicar qualquer roteiro.

## Sugestões de feedback

Ao compartilhar comentários com a pessoa que convidou você, informe o dispositivo,
navegador, passos realizados, resultado esperado e o que aconteceu. Capturas de
tela devem omitir dados pessoais.

Distribuição de testes atualizada em 22/09/2026.

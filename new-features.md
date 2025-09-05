## Features Implementadas

- **Husky:** integração com Git para garantir qualidade de código durante os commits e pushs, para manter a consistência do código.
- **Commitlint:** validação de mensagens de commit.
- **Lint Staged:** execução de linters apenas nos arquivos alterados.
- **Prettier:** formatação de código consistente.
- **Pino Logger:** integração com o Pino para logging eficiente.
- **Class Validator + ZOD:** validação de dados de entrada na API e validação de da estrutura de ENVs da aplicação.
- **Prisma:** ORM para facilitar a interação com o banco de dados, com suporte a migrations e geração de client.
- **Test Container:** utilização de containers Docker para isolar e testar serviços de forma eficiente. subindo serviços como PostgreSQL e RabbitMQ.
- **Testes unitários:** implementação de testes para garantir a qualidade do código.
- **Testes de integração:** garantir que os diferentes módulos da aplicação funcionem corretamente juntos.
- **Testes end-to-end:** simular o comportamento do usuário para garantir que a aplicação funcione como um todo.
- **Autenticação/Refresh Token:** implementação de autenticação baseada em tokens JWT, com suporte a refresh tokens.
- **Criação de link curto:** o usuário pode criar um link curto a partir de uma URL longa.
- **Redirecionamento:** o link curto redireciona para a URL original.
- **Criação de usuário:** o usuário pode se cadastrar na plataforma.
- **Login de usuário:** o usuário pode fazer login na plataforma.
- **Update de URL:** o usuário pode atualizar suas URLs.
- **Delete de URL:** o usuário pode deletar suas URLs.
- **Alias customizado (vanity URL):** o dono escolhe o `code` (6 chars) se disponível, com filtro de palavrões.

## Features a Implementar

- **GitHub Actions:** integração com GitHub Actions para automação de testes e deploy.

## Quick wins (alto valor, baixo esforço)

- **Expiração de link (`expiresAt`) e desativação manual (`disabledAt`):** sem apagar o histórico.
- **Proteção por senha (hash no banco):** pede senha antes do redirect.
- **QR Code do shortlink:** endpoint que serve PNG com cache.
- **Tags nas URLs + listagem por tags:** organização simples para o usuário.
- **Analytics básico:** cliques por dia, origem (`referer`) e device (mobile/desktop).

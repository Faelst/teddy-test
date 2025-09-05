# 🚀 URL Shortener API (NestJS + Prisma + RabbitMQ)

Este projeto é uma API para encurtamento de URLs construída com **NestJS**, utilizando **Prisma** como ORM, **RabbitMQ** para contagem assíncrona de acessos e **JWT** para autenticação segura.  
Foi desenvolvido com foco em **qualidade de código**, **testabilidade** e **boas práticas de arquitetura**.

---

## ✅ Features Implementadas

- **Husky:** integração com Git para garantir qualidade de código durante os commits e pushs.
- **Commitlint:** validação de mensagens de commit para seguir padrão _Conventional Commits_.
- **Lint Staged:** execução de linters apenas nos arquivos alterados.
- **Prettier:** formatação de código consistente.
- **Pino Logger:** integração com o **Pino** para logging eficiente e estruturado.
- **Class Validator + ZOD:**
  - `class-validator`: validação de dados recebidos pela API.
  - `zod`: validação da estrutura de variáveis de ambiente (ENVs).
- **Prisma:** ORM moderno com suporte a migrations, geração de client e tipagem completa.
- **Test Containers:** uso de containers Docker para subir serviços isolados em testes (PostgreSQL e RabbitMQ).
- **Testes unitários:** cobertura de regras de negócio e helpers.
- **Testes de integração:** validação da comunicação entre módulos.
- **Testes end-to-end:** simulação do fluxo real da aplicação.
- **Autenticação/Refresh Token:** autenticação com **JWT** (access + refresh tokens).
- **Criação de link curto:** encurtamento de URLs longas em códigos de até 6 caracteres.
- **Redirecionamento:** acesso ao código redireciona para a URL original.
- **Criação de usuário:** registro de novos usuários na plataforma.
- **Login de usuário:** autenticação e emissão de tokens JWT.
- **Update de URL:** usuário autenticado pode atualizar a URL de destino de seus links.
- **Delete de URL:** exclusão lógica (soft delete) das URLs pelo dono.
- **Alias customizado (vanity URL):** escolha de alias de até 6 caracteres (se disponível), com filtro de palavrões.
- **GitHub Actions:** automação de testes e deploy.

---

## 💡 Quick Wins (alto valor, baixo esforço)

- **Expiração de link (`expiresAt`) e desativação manual (`disabledAt`):** manter histórico sem excluir registros.
- **Proteção por senha:** armazenamento hash no banco; senha exigida antes do redirecionamento.
- **QR Code do shortlink:** endpoint que retorna PNG com cache do link encurtado.
- **Tags nas URLs + listagem por tags:** organização simples dos links do usuário.
- **Analytics básico:**
  - contagem de cliques por dia,
  - origem (`referer`),
  - tipo de dispositivo (mobile/desktop).

---

## 🛠️ Tecnologias principais

- **Node.js (NestJS)**
- **Prisma (PostgreSQL)**
- **RabbitMQ**
- **JWT (access + refresh)**
- **Docker / Testcontainers**
- **Husky + Commitlint + Lint Staged**
- **Prettier / ESLint**
- **Jest (unit, integration, e2e tests)**
- **Pino Logger**

---

## 📄 Licença

Este projeto é disponibilizado exclusivamente para **avaliação técnica**.

📺 Vídeo explicativo de como rodar a aplicação e as tecnologias utilizadas:   
[Assistir no OneDrive](https://1drv.ms/v/c/9f356062bdc96f9f/EfLiVSxSdf1FubS6RskMhgwBNPcZcjPj0XmVQm9WN7ES5Q)

# 🚀 Como iniciar o projeto (Docker)

> Pré-requisitos: **Docker** e **Docker Compose** instalados.

## 1) Clonar o repositório

```bash
git clone https://github.com/Faelst/teddy-test.git
cd teddy-test
```

## 2) Subir os serviços com Docker

```bash
docker-compose up -d
```

## 3) Verificar se está rodando

API: http://localhost:3000/app-info
(A porta pode ser alterada via variável PORT no .env.)

Ira exibir algo como:

```json
{
  "name": "teddy-test",
  "version": "0.0.0",
  "env": "development",
  "node": "v20.14.0",
  "pid": 1,
  "hostname": "localhost",
  "startedAt": "2025-09-05T17:44:51.241Z",
  "now": "2025-09-05T17:45:00.121Z",
  "uptimeSec": 9,
  "memoryMB": {
    "rss": 112.9,
    "heapTotal": 26.5,
    "heapUsed": 21.9,
    "external": 2.3
  },
  "http": {
    "baseUrl": "http://localhost:3000",
    "port": 3000
  },
  "observability": {
    "metrics": {
      "enabled": true,
      "path": "/metrics"
    },
    "tracing": {
      "enabled": true
    },
    "sentry": {
      "enabled": true
    }
  },
  "health": "ok"
}
```

Seria uma rota de healthcheck, retornando informações básicas da aplicação.

## 4) Arquivos para API Client (Postman/Insomnia)

Na pasta raiz do projeto, há um arquivo `teddy-test-postman.json` que pode ser importado no Postman ou Insomnia

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
- **GitHub Actions:** integração com GitHub Actions para automação de testes e deploy.

## Features a Implementar

## Quick wins (alto valor, baixo esforço)

- **Expiração de link (`expiresAt`) e desativação manual (`disabledAt`):** sem apagar o histórico.
- **Proteção por senha (hash no banco):** pede senha antes do redirect.
- **QR Code do shortlink:** endpoint que serve PNG com cache.
- **Tags nas URLs + listagem por tags:** organização simples para o usuário.
- **Analytics básico:** cliques por dia, origem (`referer`) e device (mobile/desktop).

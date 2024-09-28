# Shopper Backend (Teste Técnico)

## Visão Geral

Este projeto de teste técnico é destinado ao gerenciamento de dados de medições de hidrômetros e gasômetros. Ele permite o upload e a validação de imagens das medições, integrando-se com Google Generative AI para análise de imagens e Prisma para gerenciamento de banco de dados.

## Funcionalidades

- **Upload de Medições**: Envio de imagens e metadados de medições.
- **Confirmação de Medições**: Validação e atualização dos valores das medições.
- **Listagem de Medições**: Consulta de medições associadas a um cliente específico.

## Tecnologias Utilizadas

- **NestJS**: Framework para desenvolvimento de aplicações server-side escaláveis.
- **Google Generative AI**: Ferramenta para análise e extração de valores de medições a partir de imagens.
- **Prisma**: ORM para gerenciamento e consulta de banco de dados PostgreSQL.
- **Express**: Middleware para processamento de dados JSON e URL-encoded.
- **Swagger UI**: Documentação da API (disponivel em: [docs](http://localhost:3000/docs)).
- **Swagger JSON**: Documentação da API em formato JSON (disponivel em: [docs-json](http://localhost:3000/docs-json)).
- **Git Flow**: Utilização de branches de develop, feature, release e hotfix para controle de versão.

## Configuração

### Pré-requisitos

- Node.js (testado com a versão v22.6.0)
- PostgreSQL
- Chave de API do Google Generative AI

### Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/thainanluiz/shopper-backend teste-shopper-backend
   cd teste-shopper-backend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` no diretório raiz e adicione as seguintes variáveis:

   ```bash
   PORT=3000
   DATABASE_URL=postgresql://postgres:IlHDCDdQAMbcLFAUqBMbaMsKoaoAryng@junction.proxy.rlwy.net:31347/railway
   GEMINI_API_KEY=sua-chave-de-api-do-google-generative-ai
   ```

   Se desejar usar outro banco de dados, ajuste a string de conexão no `.env`, execute o passo 4 para criar as tabelas ou prossiga diretamente para o passo 5.

4. **Execute as migrações do banco de dados:**

   ```bash
   npx prisma migrate dev
   ```

5. **Inicie a aplicação:**

   ```bash
   npm run start:dev
   ```

## Endpoints da API

### 1. **Upload de Medição**

- **Endpoint:** `POST /api/v1/measurement/upload`
- **Descrição:** Envia uma imagem e metadados de medição para o servidor.
- **Corpo da Requisição:**

  ```json
  {
    "image": "imagem_base64",
    "customer_code": "cm0e613fv000008job2i8dnn0",
    "measure_datetime": "2024-08-29T00:00:00Z",
    "measure_type": "WATER"
  }
  ```

- **Resposta:**

  ```json
  {
    "image_url": "...",
    "measure_value": 200,
    "measure_uuid": "cm..."
  }
  ```

### 2. **Confirmar Medição**

- **Endpoint:** `PATCH /api/v1/measurement/confirm`
- **Descrição:** Confirma e atualiza o valor de uma medição existente.
- **Corpo da Requisição:**

  ```json
  {
    "measure_uuid": "cm...",
    "confirmed_value": 250
  }
  ```

- **Resposta:**

  ```json
  {
    "success": true
  }
  ```

### 3. **Listar Medições**

- **Endpoint:** `GET /api/v1/measurement/:customer_code/list`
- **Descrição:** Recupera uma lista de medições para um cliente específico.
- **Parâmetros de Consulta:**

  - `measure_type` (opcional): Filtra medições por tipo (e.g. `WATER` ou `GAS`).

- **Resposta:**

  ```json
  {
    "customer_code": "cm...",
    "measures": [
      {
        "measure_uuid": "cm...",
        "measure_datetime": "2024-08-29T00:00:00Z",
        "measure_type": "WATER",
        "measure_value": 250,
        "has_confirmed": true,
        "image_url": "..."
      }
    ]
  }
  ```
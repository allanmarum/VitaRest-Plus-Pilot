# VitaRest Plus Pilot

Aplicação preparada para deploy **plug and play no Railway**, sem necessidade de ajustes manuais após o deploy.

## O que foi configurado

- **Start automático com `npm start`** usando servidor Node nativo.
- **Compatibilidade com `PORT` dinâmico** fornecido pelo Railway.
- **Health checks** em `/health` e `/ready`.
- **Logs claros de startup e shutdown**.
- **Fallback SPA** para rotas internas da interface.
- **Compatível com build padrão do Railway (Nixpacks)** e também com execução via **Dockerfile**.
- **Sem dependências externas**, reduzindo risco de falha no build.

## Variáveis de ambiente suportadas

Todas são opcionais, exceto `PORT` quando fornecida pela plataforma:

- `PORT`: porta HTTP da aplicação. No Railway, é injetada automaticamente.
- `HOST`: host de bind do servidor. Padrão: `0.0.0.0`.
- `NODE_ENV`: ambiente de execução. Padrão: `production`.
- `APP_BASE_URL`: URL pública da aplicação, caso deseje expor isso ao front-end via `/config.js`.
- `LOG_LEVEL`: `debug`, `info`, `warn` ou `error`. Padrão: `info`.
- `STARTUP_TIMEOUT_MS`: timeout máximo para conclusão da inicialização. Padrão: `15000`.

## Execução local

```bash
npm start
```

A aplicação ficará disponível em `http://localhost:3000` por padrão.

## Deploy no Railway

Basta conectar o repositório e fazer o deploy:

- O Railway detecta o projeto Node.
- O comando de start já está definido em `railway.json`.
- A aplicação sobe automaticamente usando a porta dinâmica da plataforma.
- Não há etapa manual obrigatória de pós-deploy.

## Endpoints operacionais

- `GET /health`
- `GET /ready`
- `GET /config.js`

## Execução via container

Também é possível executar com Docker:

```bash
docker build -t vitarest-plus-pilot .
docker run -p 3000:3000 vitarest-plus-pilot
```

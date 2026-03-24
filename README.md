# VitaRest Plus Pilot

Aplicação web estática + servidor Node.js para um protocolo de reflexão sobre trauma vicário.

## Base única de dados

O front-end foi reestruturado para girar 100% em torno de um único dataset com os campos:

- `Phase`
- `Guideline`
- `Reflection Prompt`
- `Personalised Response`

A interface exibe o JSON oficial e organiza o fluxo por fase:

- Before Exposure
- During Exposure
- After Exposure
- Organisation Role

## Executar localmente

```bash
npm install
npm start
```

Acesse: `http://localhost:3000`

## Teste rápido

```bash
npm test
```

## Endpoints operacionais

- `GET /health`
- `GET /ready`
- `GET /config.js`

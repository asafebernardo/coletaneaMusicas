# Coletânea de Louvor

App web de músicas cristãs, no formato de um aplicativo de celular. Ele abre no navegador e, no futuro, entra no site da igreja sem instalação à parte.

Este repositório é independente de [icer](https://github.com/asafebernardo/icer). Nada aqui chama a API, o banco ou o código daquele site.

## Stack

- React 18 e Vite na interface
- Node.js e Express na API
- Catálogo em `data/songs.json`

Cada música tem `id`, `numero`, `titulo` e `letra`. É o mesmo formato de `MusicaLetra` do hinário do ICER (`/Apps/musicas`), para a integração futura copiar os dados sem traduzir o modelo.

## Desenvolvimento

Requisitos: Node.js 22.

```bash
npm install
npm run dev:all
```

- Interface: http://127.0.0.1:5174
- API: http://127.0.0.1:3002 (`/api/health` e `/api/songs`)

`npm run dev` sobe só o Vite. `npm run dev:server` sobe só a API. As portas ficam fora das do ICER (5173 e 3001) para os dois poderem rodar ao mesmo tempo.

## Produção local

```bash
npm run build
set NODE_ENV=production
npm start
```

No PowerShell: `$env:NODE_ENV="production"; npm start`. O Node serve a API e a interface em http://127.0.0.1:3002.

## Integração futura

Quando for a hora de colocar a coletânea dentro do ICER, o encaixe previsto é a rota do hinário que já existe lá. Até lá, este app guarda e edita o próprio catálogo.

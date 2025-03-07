# Mercado Bitcoin Trader Bot

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

Bot automatizado para negociação na Mercado Bitcoin com monitoramento em tempo real, autenticação segura e execução de ordens via API.

## 📋 Pré-requisitos

- Conta na [Mercado Bitcoin](https://www.mercadobitcoin.com.br/) com:
  - API Key e Secret configurados (permissões de negociação)
  - 2FA habilitado
  - Saldo suficiente para operações
- [Node.js](https://nodejs.org/) (v18.x ou superior)
- [npm](https://www.npmjs.com/) (v9.x ou superior)

## 🚀 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/katvta/mercado-bitcoin-trader-bot.git
   cd mercado-bitcoin-trader-bot
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o `.env` (veja instruções abaixo)

## 📂 Estrutura do Projeto

```
mercado-bitcoin-trader-bot/
├── .env                # Configurações sensíveis
├── index.js            # Lógica principal do bot
├── package.json        # Dependências e scripts
└── README.md           # Documentação
```

## 🔧 Configuração (.env)

| Variável         | Descrição                                                                 |
|------------------|---------------------------------------------------------------------------|
| `API_KEY`        | Chave de API (API Key ID) da Mercado Bitcoin                             |
| `API_SECRET`     | Segredo da API (API Key Secret)                                          |
| `ACCOUNT_ID`     | ID da conta (obtido via `npm run get-account-id`)                        |
| `SYMBOL`         | Par de negociação (ex: `BTC-BRL`)                                        |
| `STREAM_ID`      | ID do stream (ex: `BRLBTC` para Bitcoin/Real)                            |
| `BUY_PRICE`      | Preço alvo para compra (ex: `150000`)                                    |
| `BUY_QTY`        | Quantidade a negociar (ex: `0.001` BTC)                                  |
| `PROFITABILITY`  | Margem de lucro (ex: `1.05` = 5%)                                        |

**⚠️ ATENÇÃO:** Mantenha este arquivo seguro! Nunca compartilhe suas credenciais.

## 🤖 Funcionalidades

1. **Autenticação Segura**  
   - Renova token automaticamente
   - Verifica expiração do token

2. **Monitoramento em Tempo Real**  
   - Conecta via WebSocket
   - Atualiza preços a cada tick (~1s)

3. **Execução Automática de Ordens**  
   - Compra quando preço ≤ `BUY_PRICE`
   - Vende quando preço ≥ `BUY_PRICE * PROFITABILITY`
   - Previne ordens simultâneas

4. **Logs Detalhados**  
   - Registra todas as operações
   - Exibe status em tempo real

## ▶️ Como Usar

1. **Obter Account ID** (executar uma vez):
   ```bash
   npm run get-account-id
   ```

2. **Iniciar o bot**:
   ```bash
   npm start
   ```

3. **Exemplo de logs**:
   ```
   [AUTH] Sucesso! Token válido até: 2023-10-01T15:30:00Z
   [MARKET] Preço atual: R$ 148,500.00
   [STRATEGY] Condição de compra atingida! (R$ 148,500.00 ≤ R$ 150,000.00)
   [ORDER] BUY executado! Detalhes: { order_id: '123456' }
   [STRATEGY] Novo preço alvo de venda: R$ 155,925.00
   ```

## 🛠️ Comandos Especiais

| Comando                     | Descrição                          |
|-----------------------------|------------------------------------|
| `npm start`                 | Inicia o bot                       |
| `npm run get-account-id`    | Obtém o ACCOUNT_ID via API         |

## 🧩 Funcionamento do Código

### 1. Autenticação
```javascript
async function login() {
  // Obtém token de acesso via API
  // Renova automaticamente antes da expiração
}
```

### 2. WebSocket
```javascript
ws.onmessage = (event) => {
  // Processa dados em tempo real
  // Verifica condições de compra/venda
}
```

### 3. Execução de Ordens
```javascript
async function newOrder(side) {
  // Envia ordens MARKET via API REST
  // Atualiza preço de venda após compra
}
```

## 🔍 Melhorias Possíveis

- Adicionar stop loss
- Implementar notificações por Telegram
- Adicionar histórico de operações
- Suporte a múltiplos pares
- Interface web para monitoramento

## ⚠️ Aviso Legal

Este projeto é **EXCLUSIVAMENTE EDUCACIONAL**. Operações no mercado de criptomoedas envolvem riscos financeiros significativos. O autor não se responsabiliza por quaisquer perdas ou danos resultantes do uso deste código.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

**Desenvolvido com ❤️ por Katriel Amorim**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/katriel-amorim-a330b4322/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/katvta)

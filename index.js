// Carrega variáveis de ambiente do .env
require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');

// Variáveis de configuração (carregadas do .env)
const {
  API_KEY,
  API_SECRET,
  ACCOUNT_ID,
  SYMBOL,
  STREAM_ID,
  BUY_PRICE,
  BUY_QTY,
  PROFITABILITY
} = process.env;

// Variáveis de estado do bot
let accessToken = '';    // Token de acesso da API
let sellPrice = 0;       // Preço alvo para venda
let isOrderInProgress = false; // Controla requisições simultâneas

// Configura WebSocket para stream de preços
const ws = new WebSocket('wss://ws.mercadobitcoin.net/ws');

// 1. Autenticação na API da Mercado Bitcoin
async function login() {
  try {
    console.log('[AUTH] Iniciando autenticação...');
    
    const response = await axios.post('https://api.mercadobitcoin.net/api/v4/authorize/', {
      login: API_KEY,
      password: API_SECRET
    });
    
    accessToken = response.data.access_token;
    console.log(`[AUTH] Sucesso! Token válido até: ${new Date(response.data.expiration * 1000)}`);
    
    // Agenda renovação do token 1 minuto antes do expiração
    setTimeout(login, (response.data.expiration * 1000 - Date.now()) - 60000);
    
  } catch (error) {
    console.error('[AUTH] Falha na autenticação:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 2. Obtém Account ID (executar uma vez para configurar)
async function getAccountId() {
  try {
    console.log('[ACCOUNT] Buscando Account ID...');
    
    const response = await axios.get('https://api.mercadobitcoin.net/api/v4/accounts/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    console.log('[ACCOUNT] Account ID encontrado:', response.data[0].id);
    process.exit(0); // Encerra após exibir o ID
    
  } catch (error) {
    console.error('[ACCOUNT] Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 3. Função para enviar ordens
async function newOrder(side) {
  if (isOrderInProgress) return;
  isOrderInProgress = true;
  
  try {
    console.log(`[ORDER] Enviando ordem ${side.toUpperCase()} de ${BUY_QTY} ${SYMBOL.split('-')[0]}`);
    
    const response = await axios.post(
      `https://api.mercadobitcoin.net/api/v4/accounts/${ACCOUNT_ID}/${SYMBOL}/orders`,
      {
        qty: BUY_QTY,
        side: side,
        type: 'market'
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    console.log(`[ORDER] Sucesso! ${side.toUpperCase()} executado. Detalhes:`, response.data);
    
    // Atualiza preço de venda após compra bem-sucedida
    if (side === 'buy') {
      sellPrice = currentPrice * PROFITABILITY;
      console.log(`[STRATEGY] Novo preço alvo de venda: ${sellPrice.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error(`[ORDER] Falha na ordem ${side}:`, error.response?.data || error.message);
    
  } finally {
    isOrderInProgress = false;
  }
}

// 4. Lógica principal do WebSocket
ws.onopen = () => {
  console.log('[WS] Conectado ao stream de preços');
  
  // Inscreve-se no ticker do par configurado
  ws.send(JSON.stringify({
    type: 'subscribe',
    subscription: {
      name: 'ticker',
      id: STREAM_ID
    }
  }));
  
  console.log(`[WS] Inscrito no ticker ${STREAM_ID}`);
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    
    // Verifica se é um dado de ticker válido
    if (data.type !== 'ticker') return;
    
    const currentPrice = parseFloat(data.data.sell);
    console.log('\n[MARKET] Preço atual:', currentPrice.toFixed(2));
    console.log('[STATUS] Próximo preço de venda:', sellPrice ? sellPrice.toFixed(2) : 'N/D');
    
    // Lógica de compra
    if (!sellPrice && currentPrice <= BUY_PRICE) {
      console.log(`[STRATEGY] Condição de compra atingida! (${currentPrice} <= ${BUY_PRICE})`);
      newOrder('buy');
      
    // Lógica de venda
    } else if (sellPrice && currentPrice >= sellPrice) {
      console.log(`[STRATEGY] Condição de venda atingida! (${currentPrice} >= ${sellPrice})`);
      newOrder('sell');
      sellPrice = 0; // Reseta após venda
    }
    
  } catch (error) {
    console.error('[WS] Erro ao processar mensagem:', error.message);
  }
};

ws.onerror = (error) => {
  console.error('[WS] Erro na conexão:', error.message);
};

ws.onclose = () => {
  console.log('[WS] Conexão fechada. Tentando reconectar em 5s...');
  setTimeout(() => ws.reconnect(), 5000);
};

// Inicialização do bot
async function init() {
  console.log('--- Iniciando Bot Mercado Bitcoin ---');
  
  // Valida configurações críticas
  if (!API_KEY || !API_SECRET) {
    throw new Error('API_KEY e API_SECRET são obrigatórios!');
  }
  
  // Inicia autenticação
  await login();
  
  // Descomente para obter Account ID (execute uma vez)
  // await getAccountId();
}

init().catch(err => {
  console.error('[INIT] Falha na inicialização:', err.message);
  process.exit(1);
});
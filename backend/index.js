import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import seedRoutes from './routes/seedRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import categoryRouter from './routes/categoryRoutes.js';
import path from 'path';
import provinceRoutes from './routes/provinceRoutes.js';
import documentTypeRoutes from './routes/documentTypeRoutes.js';
import qualityTypeRouter from './routes/qualityTypeRoutes.js';
import conditionStatusRouter from './routes/conditionStatusRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import sizeRoutes from './routes/sizeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { requestDeliverRouter as requestDeliverRoutes } from './routes/requestDeliverRoutes.js';
import bodyParser from 'body-parser';
import cartRoutes from './routes/cartRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';
import './firebase.js';

// **Nova importação**
import tipoEstabelecimentoRoutes from './routes/tipoEstabelecimentoRoutes.js';

import mpesa from 'mpesa-node-api';

import Payment from './models/PaymentModel.js'
import config from './config.js';
import Order from './models/OrderModel.js';
import cron from 'node-cron';
import notificationRouter from './routes/notificationRoutes.js';
import paymentRouterEmola from './routes/paymentEmolaRoutes.js';
import walletRouter from './routes/walletRoutes.js';
import subcategoryRouter from './routes/subcategoryRoutes.js';
import priceComparisonRouter from './routes/priceComparisonRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js';


// Carregando variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // ✅ 30 segundos timeout
    socketTimeoutMS: 45000, // ✅ 45 segundos socket
    maxPoolSize: 10, // ✅ Limite de conexões
    minPoolSize: 5, // ✅ Mínimo de conexões
    retryWrites: true, // ✅ Re-tentar escritas
    w: 'majority' // ✅ Write concern
  })
  .then(() => {
    console.log('Conectei me ao MongoDB com SUCESSO');
  })
  .catch((err) => {
    console.log('❌ ERRO MongoDB:', err.message);
    console.log('🔧 Dica: Verifique:');
    console.log('   - String de conexão no .env');
    console.log('   - MongoDB Atlas online');
    console.log('   - Internet estável');
  });

// **Inicializando Express**
const app = express();
app.use(express.json());
app.use(cors());

// Configuração de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.urlencoded({ extended: true }));

// **Adicionando sua nova rota aqui**
app.use('/api/tipoestabelecimentos', tipoEstabelecimentoRoutes);

// Configuração das demais rotas
app.use('/api/seed', seedRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/subcategories', subcategoryRouter);

app.use('/api/provinces', provinceRoutes);
app.use('/api/documents', documentTypeRoutes);
app.use('/api/qualitytype', qualityTypeRouter);
app.use('/api/conditionstatus', conditionStatusRouter);
app.use('/api/colors', colorRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/paymentsemola', paymentRouterEmola);

app.use('/api/requestdeliver', requestDeliverRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/notifications', notificationRouter);

app.use('/api/wallet', walletRouter);
app.use('/api/comparisons', priceComparisonRouter);
app.use('/api/favorites', favoriteRouter);


// **Configuração do diretório e frontend**
const __dirname = path.resolve();
// const rootDir = path.join(__dirname, '..');

// Servir arquivos estáticos da pasta images (para compatibilidade com URLs relativas)
app.use('/images', express.static(path.join(__dirname, '../visacasaweb/public/images')));

app.use(express.static(path.join(__dirname, '/frontend/build')));

// **Rota de Status da API - Premium**
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = new Date(uptime * 1000).toISOString().substr(11, 8);
  const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';

  res.send(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Visacasa API - Status</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .logo {
          font-size: 42px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: #718096;
          font-size: 16px;
          font-weight: 400;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 14px;
          margin: 24px 0;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }
        
        .pulse {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        
        .info-grid {
          display: grid;
          gap: 16px;
          margin-top: 32px;
        }
        
        .info-card {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }
        
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
        }
        
        .info-label {
          color: #718096;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .info-value {
          color: #2d3748;
          font-size: 24px;
          font-weight: 700;
        }
        
        .db-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .db-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${dbStatus === 'Conectado' ? '#10b981' : '#ef4444'};
          box-shadow: 0 0 12px ${dbStatus === 'Conectado' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'};
        }
        
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(102, 126, 234, 0.1);
          color: #718096;
          font-size: 14px;
        }
        
        .footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .footer a:hover {
          color: #764ba2;
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 32px 24px;
          }
          
          .logo {
            font-size: 32px;
          }
          
          .info-value {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Visacasa API</div>
          <div class="subtitle">Sistema de Gestão e Comparação de Preços</div>
          <div class="status-badge">
            <span class="pulse"></span>
            API Online
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Tempo Ativo</div>
            <div class="info-value">${uptimeFormatted}</div>
          </div>
          
          <div class="info-card">
            <div class="info-label">Base de Dados</div>
            <div class="info-value">
              <div class="db-status">
                <span class="db-indicator"></span>
                ${dbStatus}
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-label">Versão</div>
            <div class="info-value">v2.0.0</div>
          </div>
          
          <div class="info-card">
            <div class="info-label">Ambiente</div>
            <div class="info-value">${process.env.NODE_ENV || 'Desenvolvimento'}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Desenvolvido por <a href="#">Nhiquela Serviços e Consultoria, LDA</a></p>
          <p style="margin-top: 8px; font-size: 12px;">© ${new Date().getFullYear()} Visacasa. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/frontend/build/index.html'));
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: err.message });
});

// Configuração do servidor HTTP e WebSocket
const port = process.env.PORT || 5000;
const httpServer = http.Server(app);
const users = [];

const io = new Server(httpServer, { cors: { origin: '*' } });



io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log('Offline', user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit('updateUser', user);
      }
    }
  });

  socket.on('onLogin', (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    const existUser = users.find((x) => x._id === updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    console.log('Online', user.name);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      io.to(admin.socketId).emit('updateUser', updatedUser);
    }
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit('listUsers', users);
    }
  });

  socket.on('onUserSelected', (user) => {
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      io.to(admin.socketId).emit('selectUser', existUser);
    }
  });

  socket.on('onMessage', (message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        io.to(user.socketId).emit('message', message);
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit('message', message);
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      } else {
        io.to(socket.id).emit('message', {
          name: 'Admin',
          body: 'Me desculpe. Neste momento não me encontro disponível',
        });
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

app.set('io', io);


// Executa a cada 1 minutos
// cron.schedule('*/1 * * * *', async () => {
//   const start = Date.now();
//   console.log(`🚀 Início da execução do cron às ${new Date().toISOString()}`);

//   try {
//     const orders = await Order.aggregate([
//       { $match: { isPaid: true, isSupplierPaid: false } },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'seller',
//           foreignField: '_id',
//           as: 'seller'
//         }
//       },
//       { $unwind: "$seller" },
//       { $project: { "seller.password": 0 } }
//     ]);

//     await Promise.allSettled(orders.map(async (order) => {
//       try {
//         const orderToProcess = await Order.findOneAndUpdate(
//           { _id: order._id, isSupplierPaid: false },
//           { $set: { isSupplierPaid: true } },
//           { new: true }
//         );

//         if (!orderToProcess) return;

//         const numbrSeller = order.seller?.seller?.phoneNumberAccount;
//         const sellerNumber =
//           numbrSeller?.toString().length === 9
//             ? Number('258' + numbrSeller)
//             : numbrSeller;

//         const priceForSeller = order.itemsPriceForSeller;

//         if (sellerNumber && priceForSeller) {
//           const supplier = await paySupplier(sellerNumber, priceForSeller, orderToProcess);

//           await salvarPagamento({
//             senderNumber: sellerNumber,
//             amount: priceForSeller,
//             code: 'INS-0',
//             description: `Pagamento realizado ao Fornecedor pelo pedido ${orderToProcess?.code}`,
//             transaction: supplier.transactionId,
//             conversationId: supplier.conversationId,
//             reference: supplier.reference,
//             paid: true,
//             receiverNumber: process.env.MPESA_SERVICE_PROVIDER_CODE,
//           });

//           console.log(`✅ Pagamento realizado para o pedido ${orderToProcess.code}`);
//         }
//       } catch (err) {
//         console.error(`❌ Erro no pagamento do pedido ${order.code}: ${err.message}`);
//         await Order.findByIdAndUpdate(order._id, { $set: { isSupplierPaid: false } });
//       }
//     }));
//   } catch (err) {
//     console.error('Erro ao verificar pedidos pagos pelo comprador!', err?.message);
//   } finally {
//     const duration = Date.now() - start;
//     console.log(`✅ Fim da execução do cron. Duração: ${duration}ms`);
//   }
// });



async function paySupplier(sellerNumber, priceForSeller, order, maxAttempts = 2, delay = 5000) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const referenceCode = randomString(5);
      mpesa.initializeApi({
        baseUrl: config.MPESA_API_HOST,
        apiKey: config.MPESA_API_KEY,
        publicKey: config.MPESA_PUBLIC_KEY,
        origin: config.MPESA_ORIGIN,
        serviceProviderCode: config.MPESA_SERVICE_PROVIDER_CODE,
      });


      const response = await mpesa.initiate_b2c(priceForSeller, sellerNumber, referenceCode, referenceCode);

      if (response?.data?.output_ResponseCode === 'INS-0') {
        return {
          transactionId: response.data.output_TransactionID,
          conversationId: response.data.output_ConversationID,
          reference: response.data.output_ThirdPartyReference,
        };
      } else {
        lastError = new Error(response?.data);
        console.log(`Tentativa ${attempt} Pedido: ${order.code} falhou: ${lastError}`);

        await new Promise(r => setTimeout(r, delay));
      }
    } catch (err) {
      lastError = err;
      console.log(lastError)
      console.log(`Tentativa ${attempt} Pedido: ${order.code} deu erro: ${lastError.output_ResponseDesc}`);

      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}


async function salvarPagamento(data) {
  const pagamento = new Payment(data);
  return await pagamento.save();
}

function randomString(codeLength) {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: codeLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
}

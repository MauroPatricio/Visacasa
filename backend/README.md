# Visacasa Backend API

API backend Node.js + Express + MongoDB para o ecossistema Visacasa (marketplace, delivery e serviços).

## 🚀 Tecnologias

- **Node.js** ≥20 (LTS)
- **Express** 4.21+
- **MongoDB** com Mongoose 8.8+
- **Socket.IO** para comunicação real-time
- **Firebase Admin** para notificações push
- **Cloudinary** para upload de imagens
- **M-Pesa API** para pagamentos

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- MongoDB 6.0+ rodando localmente ou Atlas
- Conta Cloudinary (para upload de imagens)
- Conta Firebase (para notificações push)
- Credenciais M-Pesa (opcional, para pagamentos)

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

**Variáveis obrigatórias**:
- `MONGODB_URI` - String de conexão MongoDB
- `JWT_SECRET` - Secret para tokens JWT (use string aleatória forte)
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Credenciais Firebase Admin
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary

### 3. Executar

**Modo desenvolvimento** (com nodemon):
```bash
npm start
# ou
npm run dev
```

**Modo produção**:
```bash
NODE_ENV=production node index.js
```

A API estará disponível em `http://localhost:5000` (ou porta definida em `PORT`).

## 📁 Estrutura

```
backend/
├── controllers/     # Lógica de negócio
├── models/         # Schemas Mongoose
├── routes/         # Definições de rotas
├── utils/          # Funções utilitárias
├── config.js       # Configurações
├── index.js        # Entry point
└── .env            # Variáveis de ambiente (não commitado)
```

## 🔌 Principais Endpoints

### Autenticação
- `POST /api/users/register` - Criar novo usuário
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Obter perfil (autenticado)

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Detalhes do produto
- `POST /api/products` - Criar produto (seller)
- `PUT /api/products/:id` - Atualizar produto

### Pedidos
- `GET /api/orders` - Listar pedidos do usuário
- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Detalhes do pedido
- `PUT /api/orders/:id/status` - Atualizar status

### Pagamentos
- `POST /api/payments/mpesa` - Iniciar pagamento M-Pesa

### Real-time (Socket.IO)
- `connection` - Conectar ao servidor Socket.IO
- `order:update` - Receber atualizações de pedidos
- `location:update` - Atualizar localização do motorista

## 🧪 Testes

```bash
npm test
```

*Nota: Testes ainda não implementados (TODO)*

## 🔒 Segurança

- JWT para autenticação
- Senhas hasheadas com bcryptjs
- CORS configurado
- Validação de inputs
- Rate limiting (TODO)

## 📝 Notas de Atualização

**Versão atual**: 1.0.0

**Últimas mudanças** (v1.0.0):
- ✅ Atualizado para Node.js 20+
- ✅ Mongoose 7.0 → 8.8
- ✅ Express 4.18 → 4.21
- ✅ Firebase Admin 12.7 → 13.0
- ✅ Removidas dependências mobile (`@notifee/react-native`, `expo`)
- ✅ Socket.IO 4.6 → 4.8

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📄 Licença

ISC

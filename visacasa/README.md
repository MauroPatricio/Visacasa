# Visacasa Mobile App

Aplicação móvel principal para clientes do ecossistema Visacasa.

## 🚀 Tecnologias

- **React Native** (Expo)
- **Redux Toolkit** para gerenciamento de estado
- **React Navigation v6**
- **Tailwind CSS** (Nativewind)
- **Google Maps Integration**
- **Firebase Push Notifications**

## 📋 Pré-requisitos

- Node.js 18.16.0 (recomendado)
- Expo Go instalado no dispositivo móvel
- Conexão com o backend configurada no arquivo `.env`

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
API_URL=http://your-api-url:5000
```

### 3. Executar

```bash
npx expo start
```

## 📁 Estrutura de Pastas

- `/components`: Componentes reutilizáveis
- `/screens`: Telas da aplicação
- `/navigation`: Configurações de rotas (Tab e Stack)
- `/store.js`: Configuração do Redux
- `/features`: Slices do Redux
- `/hooks`: Custom hooks e conexão com a API
- `/assets`: Imagens e fontes

## 📱 Funcionalidades

- Busca de produtos e estabelecimentos
- Carrinho de compras e checkout
- Pagamentos via M-Pesa
- Rastreamento de pedidos em tempo real
- Notificações push de atualizações de status
- Comparação de preços
- Favoritos

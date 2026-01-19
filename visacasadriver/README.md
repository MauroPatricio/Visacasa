# Visacasa Driver App

Aplicação móvel para motoristas e estafetas do ecossistema Visacasa.

## 🚀 Tecnologias

- **React Native** (CLI / Expo)
- **Geolocalização em Tempo Real**
- **Google Maps & Directions**
- **Socket.io-client** para atualizações de trajeto
- **Firebase Push Notifications**

## 📋 Pré-requisitos

- Node.js 18.16.0
- Expo Go ou Ambiente Android/iOS configurado
- Backend configurado

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` (se necessário) com a URL da API.

### 3. Executar

```bash
npx expo start
```

## 📁 Estrutura de Pastas

- `/src/screens`: Telas de aceitação de pedidos e navegação
- `/src/components`: Componentes de mapas e status
- `/src/services`: Conexão com a API e Sockets
- `/android`: Configurações nativas Android

## 🛵 Funcionalidades para Motoristas

- Recebimento de pedidos de entrega/transporte
- Navegação via Google Maps integrada
- Atualização de status de entrega (Recolhido, A caminho, Entregue)
- Histórico de ganhos e corridas
- Comunicação em tempo real com o backend sobre localização

# Visacasa PRO

Aplicação móvel para vendedores e parceiros do ecossistema Visacasa.

## 🚀 Tecnologias

- **React Native** (Expo)
- **Redux Toolkit**
- **React Navigation v7**
- **Tailwind CSS**
- **Câmera e upload de imagens**

## 📋 Pré-requisitos

- Node.js 18.16.0
- Expo Go
- Backend configurado

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

- `/components`: Componentes específicos de vendedor
- `/screens`: Gestão de produtos, pedidos e carteira
- `/navigation`: Navegação protegida para profissionais
- `/store.js`: Estado global da app PRO
- `/utils`: Utilitários de faturamento e gestão

## 🛠️ Funcionalidades Pro

- Gestão de Catálogo (Criar/Editar/Remover produtos)
- Monitoramento de pedidos recebidos
- Gestão de Carteira e Solicitação de Levantamentos
- Visualização de Histórico de Pagamentos
- Configurações de Perfil de Vendedor

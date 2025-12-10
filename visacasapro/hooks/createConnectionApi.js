import axios from 'axios';

let baseURL = '';

if (process.env.NODE_ENV === 'development') {
  baseURL = 'http://192.168.226.176:5000/api'; // ou localhost se estiver no navegador
} else {
  baseURL = 'https://visacasa-3a2ff6784f00.herokuapp.com/api';
}

const api = axios.create({ baseURL });

export default api;
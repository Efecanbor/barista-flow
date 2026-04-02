import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api; // BU SATIR ÇOK ÖNEMLİ
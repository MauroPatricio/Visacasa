import axios from 'axios'

const instance = axios.create({baseURL: 'https://visacasa-3a2ff6784f00.herokuapp.com/api'})
//const instance = axios.create({baseURL: 'http://localhost:5000/api'})

export default instance;
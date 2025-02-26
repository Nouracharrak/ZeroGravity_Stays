import axios from 'axios'

const API_URL = process.env.NODE_ENV === "development"
? "http:localhost:3001"
: "https://zero-gravity-stays.vercel.app"

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "content_Type": "application/json"
    
    }
})
export default axiosInstance;
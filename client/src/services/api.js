import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if it exists
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const errorMessage = error.response.data?.message?.toLowerCase() || "";
      
      // If the error message mentions suspension, wipe the session
      if (errorMessage.includes("suspendu")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // Clear user info if you store it
        window.location.href = "/login"; // Force redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
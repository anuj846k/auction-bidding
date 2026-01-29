import app from './app.js';
import { initializeSocket } from './config/socket.js';
const PORT = process.env.PORT || 3000;

const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

initializeSocket(httpServer);

export default httpServer;

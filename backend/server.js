const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/users', require('./routes/users'));
apiRouter.use('/lookbooks', require('./routes/lookbooks'));
apiRouter.use('/wardrobe', require('./routes/wardrobe'));
apiRouter.use('/collections', require('./routes/collections'));
apiRouter.use('/ai', require('./routes/ai'));
apiRouter.use('/trends', require('./routes/trends'));
apiRouter.use('/recommendations', require('./routes/recommendations'));

// Apply routes to both /api and root (for Vercel)
app.use('/api', apiRouter);
app.use('/', apiRouter);


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;

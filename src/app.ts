import express from 'express';
import router from './routes';

const app = express();

app.use(express.json());
app.set('trust proxy', true);

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

app.use(router);

export default app;

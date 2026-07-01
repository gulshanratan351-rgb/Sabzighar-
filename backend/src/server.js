import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import ensureOwnerAdmin from './utils/ensureOwner.js';

const start = async () => {
  try {
    await connectDB();
    await ensureOwnerAdmin();
    app.listen(env.port, () => {
      console.log(`🥬 SabziGhar API running on http://localhost:${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

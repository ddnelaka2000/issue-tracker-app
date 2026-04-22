const { createApp } = require('../dist/app');
const { connectDatabase } = require('../dist/config/database');

let app = null;
let connected = false;

module.exports = async function handler(req, res) {
  try {
    if (!app) {
      app = createApp();
    }
    if (!connected) {
      await connectDatabase();
      connected = true;
    }
    await new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (err) {
    console.error('[handler error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: String(err?.message ?? err) } });
    }
  }
};

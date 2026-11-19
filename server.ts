import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, 'uploads', 'product-images');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Serve uploaded product images publicly from /product-images
  app.use(
    '/product-images',
    express.static(UPLOAD_DIR, {
      maxAge: '7d',
      immutable: false,
    })
  );

  // Public image upload endpoint for product-images bucket fallback
  app.post('/api/product-images', (req, res) => {
    try {
      const { dataUrl, filename } = req.body as {
        dataUrl?: string;
        filename?: string;
      };

      if (!dataUrl || typeof dataUrl !== 'string') {
        res.status(400).json({ error: '이미지 데이터가 비어 있습니다.' });
        return;
      }

      const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: '지원하지 않는 이미지 형식입니다.' });
        return;
      }

      const mime = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 10 * 1024 * 1024) {
        res.status(413).json({ error: '이미지 크기는 10MB 이하만 가능합니다.' });
        return;
      }

      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      const safeBase = (filename || 'photo')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 24);
      const uniqueName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}_${safeBase || 'img'}.${ext}`;
      const targetPath = path.join(UPLOAD_DIR, uniqueName);

      fs.writeFileSync(targetPath, buffer);

      res.json({
        url: `/product-images/${uniqueName}`,
        bucket: 'product-images',
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: '이미지 업로드 중 오류가 발생했습니다.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`캠퍼스마켓 server running on http://localhost:${PORT}`);
  });
}

startServer();

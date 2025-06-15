import express from 'express';
import archiver from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get('/api/backup', (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="backup.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => {
    console.error('Archive error:', err);
    res.status(500).end();
  });

  archive.pipe(res);

  archive.glob('**/*', {
    cwd: __dirname,
    ignore: ['node_modules/**', 'dist/**', '*.zip']
  });

  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`Backup server running on port ${PORT}`);
});

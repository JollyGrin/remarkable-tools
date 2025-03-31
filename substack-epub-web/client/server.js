import sirv from 'sirv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const staticPath = join(__dirname, 'build');
const assets = sirv(staticPath, {
  maxAge: 31536000, // 1Y
  immutable: true,
  dev
});

// Start sirv server
assets.listen(port, err => {
  if (err) console.log('Error:', err);
  console.log(`Server started on port ${port}`);
});

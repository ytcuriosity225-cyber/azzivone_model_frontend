const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const productsDir = path.join(root, 'public', 'products');
const productsJsonPath = path.join(root, 'public', 'products.json');

async function convertAll() {
  console.log('Scanning for images to convert...');
  const patterns = ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.avif'];
  const entries = await fg(patterns, { cwd: root, absolute: true, ignore: ['node_modules/**', '.next/**', 'public/products/**/*.webp'] });

  for (const src of entries) {
    try {
      const ext = path.extname(src).toLowerCase();
      const base = path.basename(src, ext);
      const destName = `${base}.webp`;
      const destPath = path.join(productsDir, destName);

      // ensure productsDir exists
      fs.mkdirSync(productsDir, { recursive: true });

      if (fs.existsSync(destPath)) {
        console.log(`Skipping conversion for ${src} — ${destName} already exists.`);
      } else {
        console.log(`Converting ${src} -> ${destPath}`);
        await sharp(src).webp({ quality: 85 }).toFile(destPath);
        console.log(`Created ${destPath}`);
      }

      // If the source is not the same as dest (i.e., not already inside products and webp), delete original
      const inProducts = path.dirname(src).toLowerCase().includes(path.join('public', 'products').toLowerCase());
      if (!inProducts) {
        // remove original after conversion
        try { fs.unlinkSync(src); console.log(`Deleted original ${src}`); } catch (e) { /*ignore*/ }
      } else {
        // If source is inside products but not webp and webp was created, delete original
        if (src !== destPath) {
          try { fs.unlinkSync(src); console.log(`Deleted original ${src}`); } catch (e) { /*ignore*/ }
        }
      }
    } catch (err) {
      console.error('Failed converting', src, err.message || err);
    }
  }

  // Update products.json entries to .webp where possible
  if (!fs.existsSync(productsJsonPath)) {
    console.warn('No products.json found at', productsJsonPath);
    return;
  }

  const raw = fs.readFileSync(productsJsonPath, 'utf8');
  const products = JSON.parse(raw);
  const files = fs.readdirSync(productsDir);

  const findWebpFor = (origPath) => {
    if (!origPath) return null;
    const origBase = path.basename(origPath, path.extname(origPath));
    // find exact or case-insensitive match
    const found = files.find(f => path.basename(f, path.extname(f)).toLowerCase() === origBase.toLowerCase());
    return found || null;
  }

  let updated = false;
  for (const p of products) {
    const webp = findWebpFor(p.imageUrl);
    if (webp) {
      const newPath = `/products/${webp}`;
      if (p.imageUrl !== newPath) {
        console.log(`Updating product ${p.id} imageUrl: ${p.imageUrl} -> ${newPath}`);
        p.imageUrl = newPath;
        updated = true;
      }
    }
  }

  if (updated) {
    fs.writeFileSync(productsJsonPath, JSON.stringify(products, null, 2), 'utf8');
    console.log('Updated products.json with .webp image paths.');
  } else {
    console.log('No updates required for products.json');
  }
}

convertAll().then(() => console.log('Done')).catch((e)=>{console.error(e); process.exit(1);});

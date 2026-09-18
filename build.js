/**
 * STATIC BUNDLER / BUILD SCRIPT
 * Dash Katalog — Amanah Safar
 * 
 * Script ini menggabungkan template modular Views/ menjadi satu file HTML
 * mandiri di frontend/dist/index.html yang siap dideploy ke platform hosting statis.
 * Tidak mengubah 1 byte pun styling CSS, Tailwind, script, ataupun struktur layout!
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIEWS_DIR = path.join(ROOT_DIR, 'Views');
const DIST_DIR = path.join(__dirname, 'dist');

function resolveIncludePath(filename) {
  // Bersihkan path
  let cleanName = filename.replace(/['"\s]/g, '');
  if (!cleanName.endsWith('.html')) {
    cleanName += '.html';
  }

  // Coba beberapa kemungkinan path relatif
  const candidates = [
    path.join(ROOT_DIR, cleanName),
    path.join(VIEWS_DIR, cleanName),
    path.join(VIEWS_DIR, cleanName.replace(/^Views\//, ''))
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      return cand;
    }
  }

  throw new Error(`File include tidak ditemukan: ${filename}`);
}

function processIncludes(content, depth = 0) {
  if (depth > 10) {
    throw new Error('Terdeteksi kemungkinan circular include.');
  }

  // Cocokkan tag <?!= include('...'); ?> atau <?= include('...'); ?> atau <?! include('...'); ?>
  const includeRegex = /<\?[!=\s]*include\(([^)]+)\);?\s*\?>/g;
  return content.replace(includeRegex, (match, param) => {
    const filePath = resolveIncludePath(param);
    let includedContent = fs.readFileSync(filePath, 'utf8');
    // Proses include bersarang secara rekursif
    return processIncludes(includedContent, depth + 1);
  });
}

function build() {
  console.log('=== MEMULAI BUILD FRONTEND STATIS ===');
  
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const indexTemplatePath = path.join(VIEWS_DIR, 'index.html');
  if (!fs.existsSync(indexTemplatePath)) {
    throw new Error(`index.html tidak ditemukan di ${indexTemplatePath}`);
  }

  console.log('Membaca template Views/index.html...');
  let html = fs.readFileSync(indexTemplatePath, 'utf8');

  console.log('Memproses tag <?!= include(...) ?> secara rekursif...');
  let bundledHtml = processIncludes(html);

  // Pastikan tidak ada tag include yang tersisa
  const lingeringMatch = bundledHtml.match(/<\?[!=\s]*include/);
  if (lingeringMatch) {
    throw new Error('Masih terdapat tag include yang tidak terselesaikan: ' + lingeringMatch[0]);
  }

  // Menyisipkan config.js dan gasAdapter.js tepat sebelum modular scripts
  const adapterScripts = `
  <!-- GOOGLE APPS SCRIPT EXTERNAL ADAPTER & CONFIG -->
  <script src="./config.js"></script>
  <script src="./gasAdapter.js"></script>
`;

  if (bundledHtml.includes('<!-- Include Modular Scripts -->')) {
    bundledHtml = bundledHtml.replace(
      '<!-- Include Modular Scripts -->',
      `${adapterScripts}\n  <!-- Include Modular Scripts -->`
    );
  } else {
    bundledHtml = bundledHtml.replace('</head>', `${adapterScripts}\n</head>`);
  }

  // Tulis hasil build ke dist/index.html
  const distIndexPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(distIndexPath, bundledHtml, 'utf8');
  const sizeKb = (fs.statSync(distIndexPath).size / 1024).toFixed(2);
  console.log(`Berhasil membuat: ${distIndexPath} (${sizeKb} KB)`);

  // Salin config.js dan gasAdapter.js ke folder dist
  const srcConfig = path.join(__dirname, 'config.js');
  const distConfig = path.join(DIST_DIR, 'config.js');
  fs.copyFileSync(srcConfig, distConfig);
  console.log(`Disalin: ${distConfig}`);

  const srcAdapter = path.join(__dirname, 'src', 'api', 'gasAdapter.js');
  const distAdapter = path.join(DIST_DIR, 'gasAdapter.js');
  fs.copyFileSync(srcAdapter, distAdapter);
  console.log(`Disalin: ${distAdapter}`);

  console.log('=== BUILD SELESAI DENGAN SUKSES ===');
}

build();

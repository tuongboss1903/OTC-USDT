// build.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chokidar = require('chokidar');
const http = require('http');
const url = require('url');

// -----------------------------------------------------------
// Global dependency mapping:
// - dependencyGraph: key = đường dẫn (absolute) của file phụ thuộc
//                     value = Set các file HTML chính sử dụng file đó
// - mainDependencies: key = file HTML chính (absolute) được build từ src,
//                     value = Set các dependency mà file này sử dụng
// -----------------------------------------------------------
const dependencyGraph = new Map();   // Map<string, Set<string>>
const mainDependencies = new Map();    // Map<string, Set<string>>

// Cập nhật dependency cho một file HTML chính
function updateDependencies(mainHtmlPath, newDeps) {
  if (mainDependencies.has(mainHtmlPath)) {
    const oldDeps = mainDependencies.get(mainHtmlPath);
    for (let dep of oldDeps) {
      if (dependencyGraph.has(dep)) {
        dependencyGraph.get(dep).delete(mainHtmlPath);
        if (dependencyGraph.get(dep).size === 0) {
          dependencyGraph.delete(dep);
        }
      }
    }
  }
  mainDependencies.set(mainHtmlPath, newDeps);
  for (let dep of newDeps) {
    if (!dependencyGraph.has(dep)) {
      dependencyGraph.set(dep, new Set());
    }
    dependencyGraph.get(dep).add(mainHtmlPath);
  }
}

// -----------------------------------------------------------
// Hàm xử lý include (đệ quy)
function processIncludes(content, baseDir, dependencySet) {
  return content.replace(/<!--\s*include:\s*(.+?)\s*-->/g, (match, includePath) => {
    const resolvedPath = path.resolve(baseDir, includePath.trim());
    dependencySet.add(resolvedPath);
    if (fs.existsSync(resolvedPath)) {
      const includedContent = fs.readFileSync(resolvedPath, 'utf-8');
      return processIncludes(includedContent, path.dirname(resolvedPath), dependencySet);
    } else {
      console.error(`Không tìm thấy file include: ${resolvedPath}`);
      return '';
    }
  });
}

// -----------------------------------------------------------
// Hàm xử lý asset references trong HTML
// Copy file asset từ src sang dist và ghi nhận dependency.
// Xử lý cả CSS và JS, loại trừ các URL ngoài (//, http://, https://)
function processAssetReferences(content, htmlFilePath, dependencySet) {
  const htmlBase = path.basename(htmlFilePath, '.html');
  return content.replace(
    /((?:href|src)=["'])(?!(?:\/\/|https?:\/\/))([^"']+\.(?:css|js))(["'])/gi,
    (match, prefix, assetRelPath, suffix) => {
      const assetDir = path.dirname(assetRelPath);
      const assetFile = path.basename(assetRelPath);
      var newAssetFile, newAssetPath;
      if (assetFile.indexOf('.css') !== -1){
        newAssetFile = `${htmlBase}_${assetFile}`; // đổi tên theo tiền tố của file HTML
        newAssetPath = path.join(assetDir, newAssetFile).replace(/\\/g, '/');
      }else{
        newAssetFile = assetFile;
        newAssetPath = assetRelPath;
      }
      

      const srcAssetPath = path.join('src', assetRelPath);
      const distAssetPath = path.join('dist', newAssetPath);
      fs.mkdirSync(path.dirname(distAssetPath), { recursive: true });
      if (fs.existsSync(srcAssetPath)) {
        fs.copyFileSync(srcAssetPath, distAssetPath);
        dependencySet.add(path.resolve(srcAssetPath));
      } else {
        console.error(`Không tìm thấy file asset: ${srcAssetPath}`);
      }
      return `${prefix}${newAssetPath}${suffix}`;
    }
  );
}

// -----------------------------------------------------------
// Hàm chạy PurgeCSS để loại bỏ CSS không dùng (không minify)
function purgeCSSFile(cssFilePath, htmlFilePath) {
  // Lấy đường dẫn tương đối của cssFilePath từ thư mục làm việc hiện hành
  const absHtmlPath = path.resolve(htmlFilePath);
  const outputDir = process.cwd() //path.dirname(relCssPath);
  try {
    // Sử dụng output là thư mục của file CSS tương đối
    execSync(
      `npx purgecss --css "${cssFilePath}" --content "${absHtmlPath}" --output "${outputDir}"`,
      { stdio: 'inherit' }
    );
    console.log(`Purged unused CSS in: ${cssFilePath}`);
  } catch (err) {
    console.error(`Error during PurgeCSS for ${cssFilePath}: ${err}`);
  }
}
// -----------------------------------------------------------
// Hàm xử lý CSS với Tailwind:
// Sử dụng file CSS gốc từ src (nơi có @import "all.css" v.v)
// và output kết quả vào dist.
function processCSSWithTailwind(srcCssFilePath, distCssFilePath, htmlFilePath) {
  try {
    const absSrcCssPath = path.resolve(srcCssFilePath);
    const absDistCssPath = path.resolve(distCssFilePath);
    const absHtmlPath = path.resolve(htmlFilePath);
    fs.mkdirSync(path.dirname(absDistCssPath), { recursive: true });
    const minifyArg = process.env.MINIFY_TW ? ' --minify' : '';
    execSync(
      `npx tailwindcss -c tailwind.config.js -i "${absSrcCssPath}" -o "${absDistCssPath}"${minifyArg}`,
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          TAILWIND_CONTENT: absHtmlPath
        }
      }
    );
    console.log(`Processed Tailwind HTML: ${absHtmlPath}`);
    console.log(`Processed Tailwind CSS: ${absDistCssPath} using content ${absHtmlPath}`);
    //purgeCSSFile(absDistCssPath, absHtmlPath);
  } catch (err) {
    console.error(`Lỗi khi chạy Tailwind cho ${srcCssFilePath}: ${err}`);
  }
}

// -----------------------------------------------------------
// Hàm xử lý asset files (CSS và JS) cho file HTML vừa build
// Sử dụng nội dung HTML để tìm các thẻ <link> và <script>
// Thu thập đệ quy các file CSS được import từ một file CSS gốc (@import)
function collectCssImports(entryCssPath, collected = new Set()) {
  if (collected.has(entryCssPath)) return collected;
  collected.add(entryCssPath);
  let cssContent = '';
  try {
    cssContent = fs.readFileSync(entryCssPath, 'utf-8');
  } catch (_) {
    return collected;
  }
  // Bắt các dạng: @import "./file.css"; @import './file.css'; @import url(./file.css);
  const importRegex = /@import\s+(?:url\()?['"]?([^'"\)]+)['"]?\)?\s*;/g;
  let m;
  while ((m = importRegex.exec(cssContent)) !== null) {
    const importPath = m[1].trim();
    // Bỏ qua URL ngoài và các import của tailwindcss (tailwindcss/base, components, utilities)
    if (/^(?:https?:)?\/\//i.test(importPath)) continue;
    if (importPath.startsWith('tailwindcss/')) continue;
    const resolvedImport = path.resolve(path.dirname(entryCssPath), importPath);
    if (fs.existsSync(resolvedImport)) {
      collectCssImports(resolvedImport, collected);
    }
  }
  return collected;
}

function processAssetFiles(originalContent, finalContent, distHtmlFilePath, dependencySet, options = { copyJs: true }) {
  const htmlBase = path.basename(distHtmlFilePath, '.html');
  // Xử lý CSS: tìm các thẻ link có đường dẫn assets/css/<htmlBase>_*.css
  const cssRegex = /href=["'](assets\/css\/([^"']+))["']/gi;
  let match;
  while ((match = cssRegex.exec(finalContent)) !== null) {
    const assetPath = match[1]; // Ví dụ: assets/css/authorize_styles.css (đã được đổi tên thành htmlBase_authorize_styles.css)
    if (assetPath.startsWith(`assets/css/${htmlBase}_`)) {
      const assetFileWithPrefix = path.basename(assetPath);
      const parts = assetFileWithPrefix.split('_');
      parts.shift(); // Loại bỏ tiền tố htmlBase
      const originalCssFile = parts.join('_');
      const srcCssPath = path.join('src', 'assets', 'css', originalCssFile);
      const distCssPath = path.join('dist', assetPath);

      console.log('Script asset tim thay: ', srcCssPath," -> ", distCssPath);
      if (fs.existsSync(srcCssPath)) {
        // Ghi nhận dependency CSS gốc và toàn bộ chuỗi @import của nó
        const absSrcCssPath = path.resolve(srcCssPath);
        const cssDeps = collectCssImports(absSrcCssPath);
        cssDeps.forEach(dep => dependencySet.add(dep));

        processCSSWithTailwind(srcCssPath, distCssPath, distHtmlFilePath);
      } else {
        console.error(`Không tìm thấy file CSS gốc: ${srcCssPath}`);
      }
    }
  }
  // Xử lý JS: tìm các thẻ script với đường dẫn assets/js/... (có thể tắt khi watch HTML)
  if (options.copyJs) {
    const jsRegex = /src=["'](assets\/js\/([^"']+))["']/gi;
    while ((match = jsRegex.exec(finalContent)) !== null) {
      const assetPath = match[1]; // Ví dụ: assets/js/app.js
      const srcJsPath = path.join('src', assetPath);
      const distJsPath = path.join('dist', assetPath);
      fs.mkdirSync(path.dirname(distJsPath), { recursive: true });
      if (fs.existsSync(srcJsPath)) {
        fs.copyFileSync(srcJsPath, distJsPath);
        console.log(`Copied JS asset: ${srcJsPath} -> ${distJsPath}`);
        if (dependencySet) {
          dependencySet.add(path.resolve(srcJsPath));
        }
      } else {
        console.error(`Không tìm thấy file JS: ${srcJsPath}`);
      }
    }
  }
}

// -----------------------------------------------------------
// Hàm build icons (Lucide) sau khi đã build HTML/CSS/JS vào dist
function buildIcons() {
  try {
    execSync('node build-icons.js', { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error building Lucide icons: ${err && err.message ? err.message : err}`);
  }
}

// -----------------------------------------------------------
// Copy all images and videos from src/assets/images -> dist/assets/images
function copyAllImages() {
  const srcDir = path.join('src', 'assets', 'images');
  const destDir = path.join('dist', 'assets', 'images');
  if (!fs.existsSync(srcDir)) return;
  function copyDir(from, to) {
    fs.mkdirSync(to, { recursive: true });
    const entries = fs.readdirSync(from, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(from, entry.name);
      const destPath = path.join(to, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  copyDir(srcDir, destDir);
  console.log(`Copied images and videos: ${srcDir} -> ${destDir}`);
}

// -----------------------------------------------------------
// Rebuild only CSS for a given main HTML (used in watch mode on CSS changes)
function rebuildCssForHtml(mainHtmlAbsPath) {
  try {
    const relativePath = path.relative(path.resolve('src'), mainHtmlAbsPath);
    const distHtmlPath = path.join('dist', relativePath);
    if (!fs.existsSync(distHtmlPath)) {
      // If HTML hasn't been built yet, build it once
      buildHTMLFile(mainHtmlAbsPath);
    }
    if (!fs.existsSync(distHtmlPath)) return;
    const htmlBase = path.basename(distHtmlPath, '.html');
    const finalContent = fs.readFileSync(distHtmlPath, 'utf-8');
    const cssRegex = /href=["'](assets\/css\/([^"']+))["']/gi;
    let match;
    while ((match = cssRegex.exec(finalContent)) !== null) {
      const assetPath = match[1];
      if (!assetPath.startsWith(`assets/css/${htmlBase}_`)) continue;
      const assetFileWithPrefix = path.basename(assetPath);
      const parts = assetFileWithPrefix.split('_');
      parts.shift();
      const originalCssFile = parts.join('_');
      const srcCssPath = path.join('src', 'assets', 'css', originalCssFile);
      const distCssPath = path.join('dist', assetPath);
      if (fs.existsSync(srcCssPath)) {
        // Re-run tailwind for this CSS only
        processCSSWithTailwind(srcCssPath, distCssPath, distHtmlPath);
      }
    }
  } catch (err) {
    console.error(`Error rebuilding CSS for ${mainHtmlAbsPath}: ${err}`);
  }
}

// -----------------------------------------------------------
// Hàm buildHTMLFile: Build 1 file HTML từ src -> dist, xử lý include, asset, dependency mapping, và CSS
function buildHTMLFile(srcFilePath, options = { copyJs: true }) {
  try {
    const dependencySet = new Set();
    const content = fs.readFileSync(srcFilePath, 'utf-8');
    const contentWithIncludes = processIncludes(content, path.dirname(srcFilePath), dependencySet);
    const finalContent = processAssetReferences(contentWithIncludes, srcFilePath, dependencySet);

    const relativePath = path.relative('src', srcFilePath);
    const distFilePath = path.join('dist', relativePath);
    fs.mkdirSync(path.dirname(distFilePath), { recursive: true });
    fs.writeFileSync(distFilePath, finalContent, 'utf-8');
    console.log(`Built HTML: ${distFilePath}`);

    dependencySet.add(path.resolve(srcFilePath));

    // Sau khi build HTML, xử lý asset files (CSS & JS)
    processAssetFiles(content, finalContent, distFilePath, dependencySet, options);

    // Cập nhật dependency graph sau khi đã thu thập đầy đủ dependencies (bao gồm chuỗi @import CSS)
    updateDependencies(path.resolve(srcFilePath), dependencySet);
  } catch (err) {
    console.error(`Error building file ${srcFilePath}: ${err}`);
  }
}

// -----------------------------------------------------------
// Hàm buildAll: Duyệt đệ quy thư mục src và build tất cả các file .html
function buildAll() {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  dependencyGraph.clear();
  mainDependencies.clear();

  function walkDir(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        walkDir(fullPath);
      } else if (dirent.isFile() && fullPath.endsWith('.html')) {
        buildHTMLFile(fullPath);
      }
    });
  }
  walkDir('src');
  // Copy all images once on initial build
  copyAllImages();
  // Sau khi build toàn bộ, build Lucide icons dựa trên các HTML trong dist
  buildIcons();
}

// -----------------------------------------------------------
// Start HTTP server to serve dist folder
function startServer(port = 3000) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
  };

  const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
      pathname = '/index.html';
    }

    const filePath = path.join(__dirname, 'dist', pathname);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Try .html extension if file not found
        const htmlPath = filePath + '.html';
        fs.readFile(htmlPath, (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        });
        return;
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`\n🚀 Server is running at http://localhost:${port}`);
    console.log(`📂 Serving files from: dist/`);
    console.log(`\n👉 Open http://localhost:${port} in your browser\n`);
  });

  return server;
}

// -----------------------------------------------------------
// Watch mode: Sử dụng chokidar để lắng nghe thay đổi và rebuild các file HTML bị ảnh hưởng
function startWatch() {
  const watcher = chokidar.watch('src', { ignoreInitial: true });

  function handleFileEvent(event, filePath) {
    const ext = path.extname(filePath);
    const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico']);
    const videoExts = new Set(['.mp4', '.webm', '.ogg']);
    if (!['.html', '.css', '.js'].includes(ext) && !imageExts.has(ext) && !videoExts.has(ext)) return;
    const absPath = path.resolve(filePath);
    console.log(`[${event}] ${filePath}`);

    // Targeted behavior by file type
    if (ext === '.css') {
      const affected = new Set();
      if (dependencyGraph.has(absPath)) {
        for (let mainHtml of dependencyGraph.get(absPath)) {
          affected.add(mainHtml);
        }
      }
      affected.forEach(mainHtml => {
        console.log(`Rebuilding CSS only for: ${mainHtml}`);
        rebuildCssForHtml(mainHtml);
      });
      return;
    }

    if (ext === '.js') {
      // Only copy the changed js file
      const relFromSrc = path.relative(path.resolve('src'), absPath);
      if (!relFromSrc.startsWith('..')) {
        const distJsPath = path.join('dist', relFromSrc);
        fs.mkdirSync(path.dirname(distJsPath), { recursive: true });
        try {
          fs.copyFileSync(absPath, distJsPath);
          console.log(`Copied JS: ${absPath} -> ${distJsPath}`);
        } catch (e) {
          console.error(`Failed to copy JS: ${e}`);
        }
      }
      return;
    }

    if (imageExts.has(ext)) {
      // Copy changed image to dist keeping relative path
      const relFromSrc = path.relative(path.resolve('src'), absPath);
      if (!relFromSrc.startsWith('..')) {
        const distImgPath = path.join('dist', relFromSrc);
        fs.mkdirSync(path.dirname(distImgPath), { recursive: true });
        try {
          fs.copyFileSync(absPath, distImgPath);
          console.log(`Copied Image: ${absPath} -> ${distImgPath}`);
        } catch (e) {
          console.error(`Failed to copy image: ${e}`);
        }
      }
      return;
    }

    if (videoExts.has(ext)) {
      // Copy changed video to dist keeping relative path
      const relFromSrc = path.relative(path.resolve('src'), absPath);
      if (!relFromSrc.startsWith('..')) {
        const distVideoPath = path.join('dist', relFromSrc);
        fs.mkdirSync(path.dirname(distVideoPath), { recursive: true });
        try {
          fs.copyFileSync(absPath, distVideoPath);
          console.log(`Copied Video: ${absPath} -> ${distVideoPath}`);
        } catch (e) {
          console.error(`Failed to copy video: ${e}`);
        }
      }
      return;
    }

    // HTML path or default: rebuild affected HTML and its CSS only (no JS copy)
    const affected = new Set();
    if (mainDependencies.has(absPath)) {
      affected.add(absPath);
    }
    if (dependencyGraph.has(absPath)) {
      for (let mainHtml of dependencyGraph.get(absPath)) {
        affected.add(mainHtml);
      }
    }
    if (affected.size === 0 && filePath.endsWith('.html') && filePath.startsWith('src')) {
      affected.add(absPath);
    }
    affected.forEach(mainHtml => {
      console.log(`Rebuilding: ${mainHtml}`);
      buildHTMLFile(mainHtml, { copyJs: false });
    });
    buildIcons();
  }

  watcher.on('change', filePath => handleFileEvent('change', filePath));
  watcher.on('add', filePath => handleFileEvent('add', filePath));
  watcher.on('unlink', filePath => {
    const absPath = path.resolve(filePath);
    console.log(`[unlink] ${filePath}`);
    if (dependencyGraph.has(absPath)) {
      const affected = dependencyGraph.get(absPath);
      dependencyGraph.delete(absPath);
      affected.forEach(mainHtml => {
        if (mainDependencies.has(mainHtml)) {
          mainDependencies.get(mainHtml).delete(absPath);
          console.log(`Rebuilding due to deletion: ${mainHtml}`);
          buildHTMLFile(mainHtml);
        }
      });
    }
    if (mainDependencies.has(absPath)) {
      mainDependencies.delete(absPath);
    }
  });

  console.log('Watching for changes in src...');
}

// -----------------------------------------------------------
// Main execution: Nếu truyền "--watch" thì buildAll() và startWatch(), ngược lại chỉ buildAll()
const args = process.argv.slice(2);
if (args.includes('--watch')) {
  buildAll();
  startWatch();
  // Start local server on port 3000 (or custom port via --port=XXXX)
  const portArg = args.find(arg => arg.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1]) : 3000;
  startServer(port);
} else {
  buildAll();
}

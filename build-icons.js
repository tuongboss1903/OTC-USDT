#!/usr/bin/env node

/**
 * Lucide Icons Builder
 * Tự động tạo file JS tùy chỉnh chỉ chứa các icon đã sử dụng
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Thư mục cần scan (chỉ cấp hiện tại, không scan folder con)
const distDir = './dist';

console.log(`📁 Scan: ${distDir} and Create Lucide JS icon`);

try {
    // Bước 1: Extract icons từ tất cả file .html trong dist (không đệ quy)
    //console.log('1️⃣ Extracting icons from HTML files in dist/...');

    if (!fs.existsSync(distDir)) {
        throw new Error(`Directory not found: ${distDir}`);
    }

    const entries = fs.readdirSync(distDir, { withFileTypes: true });
    const htmlFiles = entries
        .filter((ent) => ent.isFile() && ent.name.toLowerCase().endsWith('.html'))
        .map((ent) => path.join(distDir, ent.name));

    const iconSet = new Set();
    const iconRegex = /data-lucide=["']([^"']+)["']/g; // hỗ trợ cả " và '

    htmlFiles.forEach((filePath) => {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        let match;
        while ((match = iconRegex.exec(htmlContent)) !== null) {
            iconSet.add(match[1]);
        }
    });

    const icons = Array.from(iconSet);
    fs.writeFileSync('icons-used.txt', icons.join('\n'));

    console.log(`✅ Found ${icons.length} unique icons`);
    
    // Bước 2: Tạo file JS tùy chỉnh + SVG sprite
    execSync('node create-custom-lucide.js', { stdio: 'inherit' });
    
    // Bước 3: Hiển thị kết quả
    const customFile = './dist/assets/js/lucide-custom.js';
    const minifiedFile = './dist/assets/js/lucide-custom.min.js';
    const spriteFile = './dist/assets/icons/lucide-custom.svg';
    
    if (fs.existsSync(customFile)) {
        const minifiedStats = fs.existsSync(minifiedFile) ? fs.statSync(minifiedFile) : null;
        
        //console.log(`✅ Custom file created: ${customFile}`);        
        if (minifiedStats) {
            //console.log(`✅ Minified file created: ${minifiedFile}`);
        }
        if (fs.existsSync(spriteFile)) {
            //console.log(`✅ SVG sprite created: ${spriteFile}`);
        }
    }
    
    console.log('\n🎉 Build completed successfully!');
} catch (error) {
    //console.error('❌ Error:', error.message);
    process.exit(1);
}

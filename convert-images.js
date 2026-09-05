/**
 * LuhCandy — Conversor de Imagens para WebP
 * Converte todas as imagens usadas no site para WebP otimizado.
 * Salva na pasta images/webp/ preservando os originais.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_DIR = path.join(__dirname, 'images', 'webp');

// Imagens usadas no site (do index.html)
const SITE_IMAGES = [
    // Hero e logo — alta prioridade, não usar WebP para PNGs com transparência (usar source separado)
    { file: 'hero_bg_new.png',                      maxWidth: 1920, quality: 82, isHero: true },
    { file: 'logohero.png',                         maxWidth: 400,  quality: 90, keepPng: true },
    { file: 'logo_2.png',                           maxWidth: 400,  quality: 90, keepPng: true },
    { file: '09_Ornamento_Inferior_Transparente.png', maxWidth: 120, quality: 90, keepPng: true },
    { file: '06_Selo_Circular_Rosa_Transparente.png', maxWidth: 300, quality: 90, keepPng: true },
    { file: '05_Selo_Circular_Marrom_Transparente.png', maxWidth: 300, quality: 90, keepPng: true },
    { file: '04_Wordmark_LuhCandy_Rosa_Transparente.png', maxWidth: 400, quality: 90, keepPng: true },

    // Slideshow (nossas delícias)
    { file: 'IMG_0573.jpg.jpeg',       maxWidth: 1280, quality: 80 },
    { file: 'IMG_0325.jpg.jpeg',       maxWidth: 1280, quality: 80 },
    { file: 'IMG_0348.jpg.jpeg',       maxWidth: 1280, quality: 80 },
    { file: '20241215_143639.jpg.jpeg',maxWidth: 1280, quality: 80 },
    { file: 'IMG_1194.jpg.jpeg',       maxWidth: 1280, quality: 80 },
    { file: 'IMG_0574.jpg.jpeg',       maxWidth: 1280, quality: 80 },

    // Galeria principal
    { file: 'IMG_1242.jpg.jpeg',       maxWidth: 900,  quality: 78 },
    { file: 'IMG_1197.jpg.jpeg',       maxWidth: 900,  quality: 78 },
    { file: 'IMG_1240.jpg.jpeg',       maxWidth: 900,  quality: 78 },
    { file: 'IMG_0336.jpg.jpeg',       maxWidth: 900,  quality: 78 },
    { file: 'IMG_0301.jpg.jpeg',       maxWidth: 900,  quality: 78 },
    { file: 'IMG_9205.jpg.jpeg',       maxWidth: 900,  quality: 78 },

    // Seção "Celebramos com Você"
    { file: 'simulacao_ambiente.jpeg', maxWidth: 700,  quality: 82 },

    // Imagens de depoimentos/calendário (selos já cobertos acima)
];

// Criar pasta de saída
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function convertImage(config) {
    const inputPath = path.join(IMAGES_DIR, config.file);
    
    if (!fs.existsSync(inputPath)) {
        console.log(`  ⚠️  Não encontrado: ${config.file}`);
        return;
    }

    const originalSize = fs.statSync(inputPath).size;
    const baseName = path.parse(config.file).name.replace(/\.jpg$/, '');

    try {
        let pipeline = sharp(inputPath)
            .resize({ width: config.maxWidth, withoutEnlargement: true });

        let outputExt, outputPath;

        if (config.keepPng) {
            // Manter PNG para transparência, mas otimizar
            outputExt = '.png';
            outputPath = path.join(OUTPUT_DIR, baseName + outputExt);
            await pipeline
                .png({ compressionLevel: 9, adaptiveFiltering: true })
                .toFile(outputPath);
        } else {
            // Converter para WebP
            outputExt = '.webp';
            outputPath = path.join(OUTPUT_DIR, baseName + outputExt);
            await pipeline
                .webp({ quality: config.quality, effort: 6 })
                .toFile(outputPath);
        }

        const newSize = fs.statSync(outputPath).size;
        const reduction = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
        const origKB = (originalSize / 1024).toFixed(0);
        const newKB = (newSize / 1024).toFixed(0);

        console.log(`  ✅ ${config.file}`);
        console.log(`     ${origKB}KB → ${newKB}KB (${reduction}% menor)`);
    } catch (err) {
        console.error(`  ❌ Erro em ${config.file}: ${err.message}`);
    }
}

async function main() {
    console.log('🚀 LuhCandy — Conversão de Imagens para WebP\n');
    console.log(`📁 Saída: ${OUTPUT_DIR}\n`);

    let totalOriginal = 0;
    let totalNew = 0;

    for (const config of SITE_IMAGES) {
        await convertImage(config);
    }

    // Calcular totais
    SITE_IMAGES.forEach(config => {
        const inputPath = path.join(IMAGES_DIR, config.file);
        if (fs.existsSync(inputPath)) {
            totalOriginal += fs.statSync(inputPath).size;
        }
    });

    if (fs.existsSync(OUTPUT_DIR)) {
        fs.readdirSync(OUTPUT_DIR).forEach(f => {
            totalNew += fs.statSync(path.join(OUTPUT_DIR, f)).size;
        });
    }

    const totalOrigMB = (totalOriginal / 1024 / 1024).toFixed(1);
    const totalNewMB = (totalNew / 1024 / 1024).toFixed(1);
    const totalReduction = (((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(1);

    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESULTADO TOTAL:`);
    console.log(`   Original: ${totalOrigMB} MB`);
    console.log(`   Otimizado: ${totalNewMB} MB`);
    console.log(`   Redução: ${totalReduction}%`);
    console.log('='.repeat(50));
    console.log('\n✅ Conversão concluída! Imagens salvas em images/webp/');
}

main().catch(console.error);

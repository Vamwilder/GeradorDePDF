const fs = require('fs');                           // Biblioteca para manipular arquivos
const path = require('path');                       // Manipular caminho de arquivos
const { PDFDocument, rgb } = require('pdf-lib');    // Criação e manipulação de PDFs
const sharp = require('sharp');                     // Processamento de imagens

async function imageToPDF(imagePath, outputPath) {
  const pdfDoc = await PDFDocument.create();                        // Cria um novo documento PDF
  const imageBuffer = await sharp(imagePath).png().toBuffer();      // Lê a imagem e converte para PNG
  const image = await pdfDoc.embedPng(imageBuffer);                 // Adiciona a imagem ao PDF
  const page = pdfDoc.addPage([image.width, image.height + 30]);    // Adiciona uma página ao PDF
  page.drawImage(image, {                                           
    x: 0,
    y: 30,
    width: image.width,
    height: image.height,
  });

  // Adiciona o nome da imagem na página do PDF
  const imageName = path.basename(imagePath, '.png');
  page.drawText(imageName, {
    x: 10,
    y: 10,
    size: 24,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF criado com sucesso para ${imageName}!`);
}

async function processImagesInFolder(folderPath, outputFolder) {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const imagePath = path.join(folderPath, file);
    const outputPath = path.join(outputFolder, `${path.basename(file, '.png')}.pdf`);
    await imageToPDF(imagePath, outputPath).catch((error) => {
      console.error(`Erro ao criar o PDF para ${file}:`, error);
    });
  }
}

// Caminho da pasta de imagens e pasta de saída dos PDFs
const folderPath = 'convert';
const outputFolder = 'Converted';

// Cria a pasta de saída se não existir
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Processa todas as imagens na pasta
processImagesInFolder(folderPath, outputFolder).catch((error) => {
  console.error('Erro ao processar as imagens:', error);
});
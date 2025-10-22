// Generate all placeholder SVGs
const fs = require('fs');
const path = require('path');

const images = [
  'sate-daging',
  'sate-ayam', 
  'bebek-sinjay',
  'monstera',
  'brown-sugar-milktea',
  'ganti-oli',
  'tuku-latte',
  'boba-original',
  'cuci-kering',
  'servis-rutin',
  'facial-treatment',
  'internet-unlimited',
  'sansevieria',
  'americano',
  'es-teh-poci',
  'laundry-kiloan',
  'mesin-turun',
  'hair-treatment',
  'print-dokumen'
];

const createSVG = (name, displayName) => {
  const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
    ${displayName}
  </text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
    Image Placeholder
  </text>
</svg>`;
  
  const filePath = path.join('public', 'img', 'produk', `${name}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created: ${filePath}`);
};

// Buat semua placeholder
images.forEach(imageName => {
  const displayName = imageName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  createSVG(imageName, displayName);
});

console.log('All placeholder images created!');
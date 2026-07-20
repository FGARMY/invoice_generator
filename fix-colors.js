const fs = require('fs');
const files = [
  'src/components/preview/themes/MinimalMono.tsx',
  'src/components/preview/themes/CorporateBlue.tsx',
  'src/components/preview/themes/BoldModern.tsx'
];
const replacements = {
  'bg-white': 'bg-[#ffffff]',
  'text-white': 'text-[#ffffff]',
  'text-gray-900': 'text-[#111827]',
  'text-gray-800': 'text-[#1f2937]',
  'text-gray-700': 'text-[#374151]',
  'text-gray-600': 'text-[#4b5563]',
  'text-gray-500': 'text-[#6b7280]',
  'text-gray-400': 'text-[#9ca3af]',
  'text-gray-300': 'text-[#d1d5db]',
  'text-gray-200': 'text-[#e5e7eb]',
  'bg-gray-100': 'bg-[#f3f4f6]',
  'text-red-600': 'text-[#dc2626]',
  'text-red-500': 'text-[#ef4444]',
  'border-gray-100': 'border-[#f3f4f6]',
  'border-gray-200': 'border-[#e5e7eb]',
  'border-gray-300': 'border-[#d1d5db]'
};

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp('\\\\b' + key + '\\\\b', 'g'), value);
  }
  
  if (file.includes('MinimalMono')) {
    content = content.replace('className="bg-[#ffffff] text-[#111827]', `style={{ backgroundColor: '#ffffff', color: '#111827' }} className="bg-[#ffffff] text-[#111827]`);
  } else if (file.includes('BoldModern')) {
    content = content.replace('className="bg-[#ffffff] text-[#111827]', `style={{ backgroundColor: '#ffffff', color: '#111827' }} className="bg-[#ffffff] text-[#111827]`);
  } else if (file.includes('CorporateBlue')) {
    content = content.replace('style={{ backgroundColor: bgCream }}', `style={{ backgroundColor: bgCream, color: '#1f2937' }}`);
  }
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}

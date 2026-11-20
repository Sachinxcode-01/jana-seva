import fs from 'fs';

// Helper to extract an array variable from a file
function extractArray(content, varName) {
  const startMarker = `const ${varName} = [`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Could not find ${varName}`);
  
  let openCount = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;
  let endIdx = -1;

  for (let i = startIdx + startMarker.length - 1; i < content.length; i++) {
    const ch = content[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '[') openCount++;
    if (ch === ']') {
      openCount--;
      if (openCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  const arrayJsonStr = content.substring(startIdx + startMarker.length - 1, endIdx + 1);
  return eval('(' + arrayJsonStr + ')');
}

const updateFile = fs.readFileSync('scripts/update_schemes.mjs', 'utf8');
const addMoreFile = fs.readFileSync('scripts/add_more_schemes.mjs', 'utf8');

const newSchemes = extractArray(updateFile, 'newSchemes');
const additionalSchemes = extractArray(addMoreFile, 'additionalSchemes');

const base10Schemes = JSON.parse(fs.readFileSync('janaseva_db.json', 'utf8')).schemes.slice(0, 10).map(s => {
  if (s.id === 'scheme-gruha-lakshmi') return { ...s, deadline: 'Active - Open Year-Round / Monthly DBT on 20th' };
  if (s.id === 'scheme-shakti-karnataka') return { ...s, deadline: 'Permanent Active Scheme / No Deadline' };
  if (s.id === 'scheme-karnataka-ssp') return { ...s, deadline: 'Annual Academic Cycle: 31st December 2026' };
  if (s.id === 'scheme-national-scholarship-portal') return { ...s, deadline: 'Pre-Matric: 30 Nov 2026 | Post-Matric: 31 Dec 2026' };
  if (s.id === 'scheme-pm-kisan') return { ...s, deadline: 'Open Year-Round (Tranches: April, August, December)' };
  if (s.id === 'scheme-pm-fasal-bima') return { ...s, deadline: 'Kharif Cutoff: 31 July 2026 | Rabi Cutoff: 31 Dec 2026' };
  if (s.id === 'scheme-ayushman-bharat') return { ...s, deadline: 'Open Year-Round / Lifelong Coverage with ABHA e-KYC' };
  if (s.id === 'scheme-pm-svanidhi') return { ...s, deadline: 'Active through 31st December 2026 / Rolling Credit' };
  if (s.id === 'scheme-yuva-nidhi') return { ...s, deadline: 'Continuous Registration for 2023-2026 Batches' };
  if (s.id === 'scheme-mudra-yojana') return { ...s, deadline: 'Open Year-Round via all Member Lending Institutions' };
  return s;
});

const all61Schemes = [...base10Schemes, ...newSchemes, ...additionalSchemes];
console.log(`Total authentic schemes gathered: ${all61Schemes.length}`);

// 1. Write janaseva_db.json
const db = JSON.parse(fs.readFileSync('janaseva_db.json', 'utf8'));
db.schemes = all61Schemes;
if (!db.savedEligibilityRecords) db.savedEligibilityRecords = [];
fs.writeFileSync('janaseva_db.json', JSON.stringify(db, null, 2), 'utf8');
console.log('Saved 61 schemes to janaseva_db.json');

// 2. Write backend/src/database/schemesData.ts
const backendSchemesDataCode = `import { Scheme } from '../types.js';

export const ALL_VERIFIED_SCHEMES: Scheme[] = ${JSON.stringify(all61Schemes, null, 2)};
`;
fs.writeFileSync('backend/src/database/schemesData.ts', backendSchemesDataCode, 'utf8');
console.log('Generated backend/src/database/schemesData.ts');

// 3. Write frontend/src/services/schemesData.ts
const frontendSchemesDataCode = `import { Scheme } from '../types';

export const ALL_VERIFIED_SCHEMES: Scheme[] = ${JSON.stringify(all61Schemes, null, 2)};
`;
fs.writeFileSync('frontend/src/services/schemesData.ts', frontendSchemesDataCode, 'utf8');
console.log('Generated frontend/src/services/schemesData.ts');

// 4. Update frontend/src/services/api.ts
let apiFile = fs.readFileSync('frontend/src/services/api.ts', 'utf8');
if (!apiFile.includes("import { ALL_VERIFIED_SCHEMES } from './schemesData';")) {
  apiFile = `import { ALL_VERIFIED_SCHEMES } from './schemesData';\n` + apiFile;
}

// Replace FALLBACK_SCHEMES definition
const exportPrefix = 'export const FALLBACK_SCHEMES: Scheme[] = ';
const exportIdx = apiFile.indexOf(exportPrefix);
if (exportIdx !== -1) {
  // Find where the array ends
  const arrayStart = exportIdx + exportPrefix.length;
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < apiFile.length; i++) {
    if (apiFile[i] === '[') depth++;
    else if (apiFile[i] === ']') {
      depth--;
      if (depth === 0) {
        // Find next semicolon
        const semi = apiFile.indexOf(';', i);
        arrayEnd = semi !== -1 ? semi + 1 : i + 1;
        break;
      }
    }
  }
  if (arrayEnd !== -1) {
    apiFile = apiFile.substring(0, exportIdx) + 'export const FALLBACK_SCHEMES: Scheme[] = ALL_VERIFIED_SCHEMES;' + apiFile.substring(arrayEnd);
  }
}
fs.writeFileSync('frontend/src/services/api.ts', apiFile, 'utf8');
console.log('Updated frontend/src/services/api.ts');

import fs from 'fs';

const db = JSON.parse(fs.readFileSync('janaseva_db.json', 'utf8'));
const apiFile = fs.readFileSync('frontend/src/services/api.ts', 'utf8');

// Find where FALLBACK_SCHEMES starts and ends
const startIdx = apiFile.indexOf('export const FALLBACK_SCHEMES: Scheme[] = [');
if (startIdx === -1) {
  console.error('Could not find FALLBACK_SCHEMES in api.ts');
  process.exit(1);
}

// Find the semicolon or array end
const endMatch = apiFile.substring(startIdx).match(/\n\];/);
if (!endMatch) {
  console.error('Could not find end of FALLBACK_SCHEMES');
  process.exit(1);
}
const endIdx = startIdx + endMatch.index + 3;

const newFallbackCode = `export const FALLBACK_SCHEMES: Scheme[] = ${JSON.stringify(db.schemes, null, 2)};`;

const updatedApiFile = apiFile.substring(0, startIdx) + newFallbackCode + apiFile.substring(endIdx);
fs.writeFileSync('frontend/src/services/api.ts', updatedApiFile, 'utf8');
console.log('Successfully updated FALLBACK_SCHEMES in frontend/src/services/api.ts with 48 schemes!');

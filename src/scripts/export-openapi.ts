// יוצר את הקובץ docs/openapi.json מתוך התיעוד שבקוד
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openApiDocument } from '../docs/openapi';

const outDir = join(__dirname, '..', '..', 'docs');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'openapi.json'), `${JSON.stringify(openApiDocument, null, 2)}\n`);
console.log('✅ docs/openapi.json נוצר');

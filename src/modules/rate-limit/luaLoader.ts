import fs from 'fs';
import path from 'path';

export function loadLuaScript(filename: string): string {
  const filePath = path.join(__dirname, 'scripts', filename);

  return fs.readFileSync(filePath, 'utf-8');
}

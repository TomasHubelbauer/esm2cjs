#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import walk from './walk.js';

export default async function esm2cjs(directoryPath = '.') {
  for await (const { filePath, fileName } of walk(directoryPath)) {
    // Remove `type: module` in `package.json` if present
    if (fileName === 'package.json') {
      const data = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
      if (data.type === 'module') {
        delete data.type;
      }

      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
      continue;
    }

    if (path.extname(filePath) !== '.js') {
      continue;
    }

    // TODO: Skip binary files by text/blob detection or CLI ignore list or both
    const text = await fs.promises.readFile(filePath, 'utf-8');
    const lines = text.split('\n');
    for (let index = 0; index < lines.length; index++) {
      // TODO: Preserve the leading whitespace in lines
      const line = lines[index].trim();

      if (line.startsWith('export default')) {
        lines[index] = 'module.exports =' + line.slice('export default'.length);
      }
    }

    await fs.promises.writeFile(filePath, lines.join('\n'));
    console.log('Transpiled', filePath);
  }
}

// TODO: Extract out to a `node-cli-call` module for reuse
void async function () {
  const url = import.meta.url;
  const argv1 = process.argv[1];

  // Uncomment these values to test whether calling as an executable works
  // const url = 'file:///C:/Users/TomasHubelbauer/AppData/Roaming/npm-cache/_npx/14128/node_modules/todo/index.js';
  // const argv1 = 'C:\\Users\\TomasHubelbauer\\AppData\\Roaming\\npm-cache\\_npx\\14128\\node_modules\\todo\\index.js';

  const normalizedFileName = path.normalize(url.slice('file:///'.length));
  const normalizedDirectoryName = path.dirname(normalizedFileName);

  if (normalizedDirectoryName === argv1 || normalizedFileName === argv1) {
    await esm2cjs(process.argv[2]);
  }
}()

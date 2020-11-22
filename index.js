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
      console.log('Demodulated', filePath);
      continue;
    }

    if (path.extname(filePath) !== '.js') {
      continue;
    }

    // TODO: Skip binary files by text/blob detection or CLI ignore list or both
    const text = await fs.promises.readFile(filePath, 'utf-8');
    const lines = text.split(/\r?\n/g);
    for (let index = 0; index < lines.length; index++) {
      // TODO: Support affecting multiple different changes within a single line
      const line = lines[index];

      // Convert `import dep from 'dep';` into `const dep = require('dep');`
      const importFromMatch = line.match(/^import (?<_import>.*?) from (?<_from>.*?);?$/);
      if (importFromMatch) {
        const { _import, _from } = importFromMatch.groups;
        lines[index] = `const ${_import} = require(${_from});`;
        continue;
      }

      // Convert `const { default: dep } = await import('dep?' + cachebuster);` into `const dep = require('dep');`
      const constDefaultAwaitImportMatch = line.match(/^(?<space>\s*)const \{ default: (?<_default>.*?) \} = await import\((?<_import>('|").*?\?('|")).*?\);?$/);
      if (constDefaultAwaitImportMatch) {
        const { space, _default, _import } = constDefaultAwaitImportMatch.groups;
        lines[index] = `${space}const ${_default} = require(${_import.replace('?', '')});`;
        continue;
      }

      // Replace instances of `import.meta.url` with `'file:///' + __filename`
      const importMetaUrlRegex = /import.meta.url/g;
      let importMetaUrlMatch;
      while (importMetaUrlMatch = importMetaUrlRegex.exec(lines[index])) {
        lines[index] = `${lines[index].slice(0, importMetaUrlMatch.index)}'file:///' + __filename${lines[index].slice(importMetaUrlMatch.index + importMetaUrlMatch[0].length)}`;
      }

      // Convert `export default` into `module.exports =`
      const exportDefaultRegex = line.match(/^export default /);
      if (exportDefaultRegex) {
        lines[index] = 'module.exports = ' + line.slice(exportDefaultRegex[0].length);
        continue;
      }
    }

    await fs.promises.writeFile(filePath, lines.join('\n'));
    console.log('Transpiled', filePath);
  }
}

// TODO: Extract out to a `node-cli-call` module for reuse - related: https://stackoverflow.com/a/60309682/2715716
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

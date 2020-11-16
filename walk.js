import fs from 'fs';
import path from 'path';

// TODO: Allow configuring this through the CLI
const ignoredDirectoryNames = ['.git', 'node_modules'];

export default async function* walk(/** @type {string} */ directoryPath) {
  for (const entry of await fs.promises.readdir(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isFile()) {
      yield { filePath: entryPath, fileName: entry.name };
    }
    else if (entry.isDirectory()) {
      if (ignoredDirectoryNames.includes(entry.name)) {
        continue;
      }

      yield* walk(entryPath);
    }
  }
}

import os from 'os';
import path from 'path';
import dep from './dep.js';

void async function () {
  const url = import.meta.url;
  const filePath = url.slice('file:///'.length);
  const baseName = path.basename(filePath);
  const dirName = path.normalize(path.dirname(path.dirname(filePath)));
  const tempName = path.normalize(os.tmpdir());
  const dep1 = await dep();
  const { default: _dep } = await import('./dep.js?' + new Date().valueOf());
  const dep2 = await _dep();
  if (dep1 !== dep2) {
    throw new Error(`Dep mismatch: ${dep1} vs. ${dep2}.`);
  }

  console.log({ baseName, dirName, tempName });
}()

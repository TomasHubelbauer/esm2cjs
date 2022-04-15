const os = require('os');
const path = require('path');
const dep = require('./dep.js');

void async function () {
  const url = 'file://' + __filename;
  const filePath = url.slice('file://'.length);
  const baseName = path.basename(filePath);
  const dirName = path.normalize(path.dirname(path.dirname(filePath)));
  const tempName = path.normalize(os.tmpdir());
  const dep1 = await dep();
  const _dep = require('./dep.js');
  const dep2 = await _dep();
  if (dep1 !== dep2) {
    throw new Error(`Dep mismatch: ${dep1} vs. ${dep2}.`);
  }

  console.log({ baseName, dirName, tempName });
}()

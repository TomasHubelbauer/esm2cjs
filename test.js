import fs from 'fs';
import path from 'path';
import util from 'util';
import child_process from 'child_process';
import walk from './walk.js';
import esm2cjs from './index.js';

void async function () {
  // Delete the `actual` directory if it still exists to ensure a clean test run
  try {
    await fs.promises.rm('actual', { recursive: true });
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Ensure the `test` directory runs fine with no runtime errors
  const test = await util.promisify(child_process.exec)('node test/index.js');
  if (test.stderr) {
    throw new Error('`test` ran into an error');
  }

  // Ensure the `expected` directory runs with zero exit code with `node .`
  const expected = await util.promisify(child_process.exec)('node expected');
  if (expected.stderr) {
    throw new Error('`expected` ran into an error');
  }

  if (expected.stdout !== test.stdout) {
    throw new Error('Expected stdout did not match test stdout.');
  }

  // Create the `actual` directory and copy `test` directory files into it
  await fs.promises.mkdir('actual');
  for await (const { filePath, fileName } of walk('test')) {
    await fs.promises.copyFile(filePath, path.join('actual', fileName));
    console.log('Copied', fileName);
  }

  // Run the transpilation on the `actual` directory
  await esm2cjs('actual');

  // TODO: Compare `actual` and `expected` directories
  for await (const { filePath, fileName } of walk('actual')) {
    const actual = await fs.promises.readFile(filePath, 'utf-8');
    const expected = await fs.promises.readFile(path.join('expected', fileName), 'utf-8');

    // TODO: Provide better handling of CRLF/LF and EOF
    if (actual.replace(/\r/g, '').trim() !== expected.replace(/\r/g, '').trim()) {
      throw new Error(`${fileName} differs between actual and expected directories`);
    }

    console.log('Verified', fileName);
  }

  // Ensure the `actual` directory runs with zero exit code with `node .`
  const actual = await util.promisify(child_process.exec)('node actual');
  if (actual.stderr) {
    throw new Error('`actual` ran into an error');
  }

  if (actual.stdout !== expected.stdout) {
    throw new Error('Actual stdout did not match expected stdout.');
  }

  // Remove the `actual` directory to leave the state clean for the next run
  await fs.promises.rm('actual', { recursive: true });
}()

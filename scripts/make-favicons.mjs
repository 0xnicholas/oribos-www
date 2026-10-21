import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import sharp from 'sharp';

const root = new URL('../', import.meta.url).pathname;
const source = await readFile(join(root, 'public/favicon.svg'));
const outputs = [
  { file: 'public/favicon-16.png', size: 16 },
  { file: 'public/favicon-32.png', size: 32 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

for (const output of outputs) {
  const destination = join(root, output.file);
  const image = sharp(source, { density: Math.ceil((output.size / 32) * 72) })
    .resize(output.size, output.size, { fit: 'fill' })
    .removeAlpha();

  await image.png({ compressionLevel: 9 }).toFile(destination);

  const metadata = await sharp(destination).metadata();

  if (metadata.width !== output.size || metadata.height !== output.size) {
    throw new Error(`${output.file} rendered at ${metadata.width}x${metadata.height}`);
  }

  if (metadata.channels !== 3) {
    throw new Error(`${output.file} has ${metadata.channels} channels, expected RGB`);
  }

  console.log(`${output.file}: ${metadata.width}x${metadata.height}, ${metadata.channels} channels`);
}

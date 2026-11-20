#!/usr/bin/env node
// Builds dist/ui-builder.css from styles/standalone.css with Tailwind's own compiler and scanner.
import { compile, optimize } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const input = join(here, '../styles/standalone.css');
const output = join(here, '../dist/ui-builder.css');

const compiler = await compile(readFileSync(input, 'utf8'), { base: dirname(input), onDependency: () => {} });
const scanner = new Scanner({ sources: compiler.sources });
const css = compiler.build(scanner.scan());
const { code } = optimize(css, { minify: true });

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, code);
console.log(`dist/ui-builder.css: ${(code.length / 1024).toFixed(1)} KB, ${scanner.files.length} source files scanned.`);

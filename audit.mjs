import fs from 'node:fs';
import path from 'node:path';

const patterns = [
  /createOpenDuty\(/,
  /dutyService\.getCurrentDutyId\(/,
  /dutyService\.isCurrentDutyClosed\(/,
  /currentDuty\./,
];
const labels = [
  'createOpenDuty(',
  'dutyService.getCurrentDutyId(',
  'dutyService.isCurrentDutyClosed(',
  'currentDuty.',
];
const exts = ['.ts', '.tsx', '.js', '.jsx'];
const skip = new Set(['node_modules', '.git', 'dist', 'build', '.next']);
const hits = patterns.map(() => []);

(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!skip.has(e.name)) walk(p);
    } else if (exts.some((x) => e.name.endsWith(x))) {
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
      lines.forEach((l, i) =>
        patterns.forEach((r, k) => {
          if (r.test(l)) hits[k].push(`${p}:${i + 1}:  ${l.trim()}`);
        }),
      );
    }
  }
})('src');

labels.forEach((lbl, k) => {
  console.log(`\n── ${lbl} ──`);
  console.log(hits[k].length ? hits[k].join('\n') : '  (no matches)');
});
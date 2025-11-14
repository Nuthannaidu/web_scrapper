import fs from 'fs';
const STATE = './output/state.json';

export function loadState() {
  if (fs.existsSync(STATE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE, 'utf8'));
    } catch (e) {
      console.error('Could not parse state file, starting fresh.');
      return null;
    }
  }
  return null;
}

export function saveState(obj) {
  fs.writeFileSync(STATE, JSON.stringify(obj, null, 2));
}
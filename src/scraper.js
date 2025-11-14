import axios from 'axios';
import fs from 'fs-extra';
import config from '../config.js';
import { saveState, loadState } from './state.js';

const RAW_DIR = './output/raw';
await fs.ensureDir(RAW_DIR);
await fs.ensureDir('./output/jsonl');

const DEFAULT_TIMEOUT = 15000;

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeGet(url, opts = {}, maxAttempts = 6) {
  let attempt = 0;
  let backoff = 1000;
  while (attempt < maxAttempts) {
    try {
      const res = await axios.get(url, { timeout: DEFAULT_TIMEOUT, headers: { 'User-Agent': config.userAgent }, ...opts });
      return res;
    } catch (err) {
      attempt++;
      const status = err.response?.status;
      if (status === 404) throw err;
      if (status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after']) || (backoff / 1000);
        await wait((retryAfter + 1) * 1000);
      } else if (status >= 500 || !status) {
        await wait(backoff);
        backoff *= 2;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded for ' + url);
}

async function fetchIssuesForProject(project, startAt=0) {
  const maxResults = config.batchSize || 50;
  const fields = encodeURIComponent('summary,status,description,reporter,created,comment,labels,priority,assignee,components');
  const url = `${config.baseUrl}/search?jql=project=${project}&startAt=${startAt}&maxResults=${maxResults}&fields=${fields}`;
  const res = await safeGet(url);
  return res.data;
}

async function scrapeProject(project) {
  let state = loadState() || { projects: {} };
  if (!state.projects) state.projects = {};
  if (!state.projects[project]) state.projects[project] = { startAt: 0, done: false, batches: 0 };
  const pstate = state.projects[project];

  while (!pstate.done) {
    try {
      const data = await fetchIssuesForProject(project, pstate.startAt);
      const issues = data.issues || [];
      if (issues.length === 0) {
        pstate.done = true;
        saveState(state);
        await wait(1500);
        console.log(`[${project}] done — no more issues.`);
        break;
      }
      const file = `${RAW_DIR}/${project}_batch_${pstate.startAt}.json`;
      await fs.writeJson(file, issues, { spaces: 2 });
      console.log(`Saved: ${file} (count=${issues.length})`);
      pstate.startAt += issues.length;
      pstate.batches += 1;
      saveState(state);

      await wait(1500);

      if (pstate.batches % 20 === 0) {
        console.log(`[${project}] cooldown`);
        await wait(10000);
      }

    } catch (err) {
      console.error(`[${project}] Error fetching issues:`, err.message);
      if (err.message && err.message.includes('Max retries')) {
        console.error(`[${project}] Max retries exceeded. Pausing scraping for this project.`);
        break;
      }
      await wait(2000);
    }
  }
}

async function scrapeAll() {
  for (const project of (config.projects || [])) {
    console.log('Starting project:', project);
    await scrapeProject(project);
  }
  console.log('All projects processed.');
}

scrapeAll().catch(e => { console.error('Fatal error:', e); process.exit(1); });

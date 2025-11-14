import fs from 'fs-extra';

async function transform() {
  const rawDir = './output/raw';
  const out = './output/jsonl/all_projects.jsonl';
  await fs.ensureFile(out);
  const files = await fs.readdir(rawDir);
  const ws = fs.createWriteStream(out, { flags: 'w' });

  for (const f of files) {
    try {
      const issues = await fs.readJson(`${rawDir}/${f}`);

      const project = f.split('_batch_')[0];
      for (const issue of issues) {
        const item = {
          project,
          key: issue.key,
          title: issue.fields?.summary || '',
          status: issue.fields?.status?.name || '',
          description: (issue.fields?.description && issue.fields.description) || '',
          reporter: issue.fields?.reporter?.displayName || '',
          created: issue.fields?.created || '',
          labels: issue.fields?.labels || [],
          priority: issue.fields?.priority?.name || null,
          assignee: issue.fields?.assignee?.displayName || null,
          components: (issue.fields?.components || []).map(c => c.name),
          comments: issue.fields?.comment?.comments?.map(c => c.body) || [],
  
          task_summary: `Summarize the issue ${issue.key}: ${issue.fields?.summary || ''}`,
          task_classification: `Label the issue ${issue.key} with categories like Bug/Task/Improvement`,
          task_qna: `Create 3 QnA pairs from the issue ${issue.key}`
        };
        ws.write(JSON.stringify(item) + "\n");
      }
    } catch (err) {
      console.error('Failed to transform file', f, err.message);
    }
  }
  ws.end();
  console.log('Transformation complete:', out);
}

transform().catch(e => { console.error(e); process.exit(1); });
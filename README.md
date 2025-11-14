# Apache Jira Multi‑Project Web Scraper

This project is a complete web‑scraping pipeline built with Node.js to collect issue data from multiple Apache Jira projects (HADOOP, HIVE, SPARK). It includes scraping, automatic resume on failure, rate‑limit handling, batch storage, and a final transformation step that produces a consolidated JSONL dataset ready for ML / analysis.

---

## 🚀 Features

* Scrapes **HADOOP**, **HIVE**, and **SPARK** Jira projects
* Fetches issues in **50‑item batches** with automatic pagination
* **Automatic resume** using `state.json` (no progress loss)
* **Robust rate‑limit handling** (429, network backoff, cooldown mode)
* Saves raw batches as JSON
* Produces a final **all_projects.jsonl** dataset
* JSONL format is ML‑ready

---

## 📂 Folder Structure

```
web_scrapper/
│
├── src/
│   ├── scraper.js        # Scrapes Jira issues in batches
│   ├── transform.js      # Converts raw issue batches → JSONL
│   └── state.js          # Saves scraping progress
│
├── output/
│   ├── raw/              # Raw scraped JSON batches
│   └── jsonl/            # Final JSONL dataset
│
├── config.js             # Configurable settings
├── package.json
├── README.md
```
Note:
Full output dataset was removed from GitHub due to size limits.
The scraper automatically regenerates it when running `npm run scrape`.

## 📸 Output Preview

Below is a preview of the extracted JSONL data:

![JSONL Preview](all_projects_preview.png)

---

## ⚙️ Installation

### 1. Clone or download the project

```
git clone <repo-url>
cd web_scrapper
```

### 2. Install dependencies

```
npm install
```

---

## 🧹 Cleaning Previous Output (Optional)

If you want a fresh scrape:

```
rmdir /s /q output
mkdir output
```

---

## 🕸️ Running the Scraper

Start scraping all three Jira projects:

```
npm run scrape
```

### What you will see:

```
Starting project: HADOOP
Saved: ./output/raw/HADOOP_batch_0.json (count=50)
...
Starting project: HIVE
...
Starting project: SPARK
...
All projects processed.
```

### Resume Behavior

If the scraper stops due to:

* Rate limits
* Network errors
* Jira outages
* Lost internet

Just run again:

```
npm run scrape
```

It resumes automatically from the last successful batch using `output/state.json`.

---

## 🔄 Transforming Raw Data Into JSONL

After scraping finishes:

```
npm run transform
```

This generates:

```
output/jsonl/all_projects.jsonl
```

A single JSONL file containing **every scraped issue**, one JSON object per line.

---

## 🧪 Testing the Output

### View first 5 lines (PowerShell):

```
Get-Content output/jsonl/all_projects.jsonl -TotalCount 5
```

### Count total issues:

```
node -e "let c=0; const rl=require('readline').createInterface({input:require('fs').createReadStream('output/jsonl/all_projects.jsonl')}); rl.on('line',()=>c++); rl.on('close',()=>console.log('Total issues:',c));"
```

---

## 📊 Dataset Contents

Each JSONL line contains:

```
{
  "project": "HIVE",
  "key": "HIVE-12345",
  "title": "Issue title",
  "status": "Open",
  "description": "Issue body",
  "reporter": "User",
  "created": "2024-09-12T14:33:22.000+0000",
  "comments": [...],
  "task_summary": "Summarize issue HIVE-12345",
  "task_classification": "Classify issue HIVE-12345",
  "task_qna": "Generate QnA for issue HIVE-12345"
}
```

---

## 🛡️ Rate Limit Protection

The scraper includes:

* Automatic exponential backoff
* Cooldown every 20 batches
* Retry on 429 responses
* Protection against 5xx server errors

This ensures the scraper runs safely without overloading Apache Jira.

---

## 📌 Configuration (config.js)

```
export default {
  baseUrl: "https://issues.apache.org/jira/rest/api/2",
  projects: ["HADOOP", "HIVE", "SPARK"],
  batchSize: 50,
  userAgent: "Mozilla/5.0 (compatible; ProjectScraper/1.0)"
};
```

You can add/remove Jira projects here.

---

## 🧾 Submission Notes

* All raw files are stored in `output/raw/`
* Final merged dataset is in `output/jsonl/all_projects.jsonl`
* The scraper is resumable and fault‑tolerant
* Rate limiting handled properly
* Project is fully production‑ready

---

## 👤 Author

NUTHAN SAGAR

---

## 📈 Project Statistics

* **HADOOP Issues:** 17,419
* **HIVE Issues:** 29,190
* **SPARK Issues:** 53,941

## ✅ Status

✔ Scraping complete
✔ Transformation complete
✔ JSONL dataset generated
✔ Project ready for submission

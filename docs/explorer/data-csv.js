// docs/explorer/data-csv.js

const DEFAULT_CSV = `candidate_id,candidate_name,assurance_level,privacy_exposure,data_retention,centralization,user_burden,reusability,notes
c_001,Self Declaration,none,none,none,local,low,none,Simple but weak
c_002,Document Upload,high,high,persistent,platform,high,single_platform,Strong assurance but intrusive
c_003,Third-Party Age Token,medium,minimal,session,third_party,medium,multi_platform,Balanced token model
c_004,Device-Based Estimation,medium,minimal,none,local,low,none,Lower disclosure if truly local
c_005,Government Digital ID,high,moderate,persistent,government,medium,multi_platform,High assurance with serious surveillance concerns
`;


function parseCsv(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] ?? '');
    return obj;
  });
}


function serializeCsv(candidates) {
  if (!candidates.length) return "";

  const headers = [
    "candidate_id",
    "candidate_name",
    "assurance_level",
    "privacy_exposure",
    "data_retention",
    "centralization",
    "user_burden",
    "reusability",
    "notes",
  ];

  const lines = [headers.join(",")];

  for (const candidate of candidates) {
    lines.push(headers.map((key) => String(candidate[key] ?? "")).join(","));
  }

  return lines.join("\n");
}

function getCsvHeadersAndRows(text) {
  const lines = text.split('\n');
  const nonEmpty = lines.filter(line => line.trim());
  if (nonEmpty.length < 2) {
    throw new Error('CSV needs a header row and at least one data row');
  }

  const headers = nonEmpty[0].split(',').map(h => h.trim());
  const rows = nonEmpty.slice(1).map(line => line.split(',').map(v => v.trim()));

  return { headers, rows };
}

function parseCsvWithHeaders(text) {
  const { headers, rows } = getCsvHeadersAndRows(text);
  return rows.map(vals => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] ?? '';
    });
    return obj;
  });
}

function updateCsvRow(text, rowIndex, updatedRow) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV needs a header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1);

  if (rowIndex < 0 || rowIndex >= dataRows.length) {
    throw new Error('Row index out of range');
  }

  dataRows[rowIndex] = headers.map(header => String(updatedRow[header] ?? '')).join(',');

  return [lines[0], ...dataRows].join('\n');
}

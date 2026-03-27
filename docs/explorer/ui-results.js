// docs/explorer/ui-results.js

function runAndGoResults() {
  state.csv = document.getElementById("csv-editor").value || state.csv || DEFAULT_CSV;
  state.toml = document.getElementById("toml-editor").value || state.toml || DEFAULT_TOML;
  switchTab("results");
}

function renderResults() {
  const container = document.getElementById("results-content");

  if (!state.csv || !state.toml) {
    container.innerHTML =
      '<p style="color:var(--text-faint);font-family:var(--mono);font-size:12px">Load data first (Load tab) or use example data.</p>';
    return;
  }

  let candidates;
  let policy;

  try {
    candidates = parseCsv(state.csv);
  } catch (e) {
    container.innerHTML =
      '<div class="parse-err">CSV parse error: ' + e.message + "</div>";
    return;
  }

  try {
    policy = parseToml(state.toml);
  } catch (e) {
    container.innerHTML =
      '<div class="parse-err">TOML parse error: ' + e.message + "</div>";
    return;
  }

  const results = candidates.map((candidate) => ({
    ...candidate,
    ...evaluate(candidate, policy),
  }));

  const total = results.length;
  const detailId = selectedCandidate;
  const detailCandidate = results.find((r) => r.candidate_id === detailId);

  container.innerHTML = `
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-label">Candidates</div>
        <div class="stat-val val-neutral">${total}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><span class="card-title">Candidates</span></div>
        <div class="card-body" style="padding:0">
          <table class="candidate-table">
            <thead>
              <tr><th>ID</th><th>Candidate</th><th>Scores</th></tr>
            </thead>
<tbody>
  ${results
      .map(
        (r) => `
        <tr class="${r.candidate_id === detailId ? "selected" : ""}" onclick="selectCandidate('${r.candidate_id}')">
          <td style="font-family:var(--mono);font-size:12px;color:var(--text-faint)">${r.candidate_id}</td>
          <td>${r.candidate_name}</td>
          <td>
            <div class="dots">
              ${Object.entries(r.levels)
            .map(
              ([k, level]) =>
                `<div class="dot dot-${level}" title="${k.replace(/_/g, " ")}: ${level}"></div>`
            )
            .join("")}
            </div>
          </td>
        </tr>
      `
      )
      .join("")}
</tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="card-title">
            ${detailCandidate
      ? detailCandidate.candidate_name + " — " + detailCandidate.candidate_id
      : "Score detail"
    }
          </span>
        </div>
        <div class="card-body">
          ${detailCandidate
      ? Object.entries(detailCandidate.scores)
        .map(
          ([k, v]) => `
                      <div class="crit-row">
                        <div class="crit-icon">${detailCandidate.levels[k]}</div>
                        <div>
                          <div class="crit-key">${k.replace(/_/g, " ")}</div>
                          <div class="crit-msg">Score: ${v.toFixed(2)}</div>
                        </div>
                      </div>
                    `
        )
        .join("")
      : '<p style="color:var(--text-faint);font-size:12px;font-family:var(--mono)">← Select a candidate to see scores</p>'
    }
        </div>
      </div>
    </div>
  `;
}

function selectCandidate(id) {
  selectedCandidate = selectedCandidate === id ? null : id;
  renderResults();
}

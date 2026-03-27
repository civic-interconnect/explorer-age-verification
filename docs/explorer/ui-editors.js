// docs/explorer/ui-editors.js

function syncEditors() {
  document.getElementById("csv-editor").value = state.csv || DEFAULT_CSV;
  document.getElementById("toml-editor").value = state.toml || DEFAULT_TOML;
  if (!state.csv) state.csv = DEFAULT_CSV;
  if (!state.toml) state.toml = DEFAULT_TOML;
  updateCsvRowLabel();
  refreshCsvRowHelper();

  const csvEditor = document.getElementById("csv-editor");
  const csvToggleBtn = document.getElementById("csv-toggle-btn");
  const csvNote = document.getElementById("csv-readonly-note");

  if (csvEditor) {
    csvEditor.setAttribute("readonly", "");
    csvEditor.classList.add("editor-ghosted");
  }
  if (csvToggleBtn) {
    csvToggleBtn.textContent = "Unlock Raw CSV";
  }
  if (csvNote) {
    csvNote.textContent =
      "Raw CSV is shown for transparency. Use the site helper above to edit safely.";
  }
}

function updateCsvRowLabel() {
  try {
    const rows = parseCsv(state.csv || "");
    document.getElementById("csv-rows-label").textContent =
      rows.length + " candidate" + (rows.length !== 1 ? "s" : "");
    document.getElementById("csv-parse-err").innerHTML = "";
  } catch (e) {
    document.getElementById("csv-parse-err").innerHTML =
      '<div class="parse-err">CSV error: ' + e.message + "</div>";
  }
}

function onEditorChange(type) {
  state[type] = document.getElementById(type + "-editor").value;
  if (type === "csv") {
    updateCsvRowLabel();
    refreshCsvRowHelper();
  }
  if (type === "toml") {
    document.getElementById("toml-parse-err").innerHTML = "";
  }
}

function addCsvRow() {
  const lines = (state.csv || "").split("\n").filter((l) => l.trim());
  if (!lines.length) return;
  const headers = lines[0].split(",").map((h) => h.trim());
  const newRow = headers
    .map((h, i) => {
      if (h === "candidate_id")
        return "c_" + String(lines.length).padStart(3, "0");
      if (h === "candidate_name") return "New Candidate";
      if (h === "assurance_level") return "low";
      if (h === "privacy_exposure") return "minimal";
      if (h === "data_retention") return "none";
      if (h === "centralization") return "local";
      if (h === "user_burden") return "low";
      if (h === "reusability") return "none";
      return "";
    })
    .join(",");
  const newText = lines.join("\n") + "\n" + newRow;
  state.csv = newText;
  document.getElementById("csv-editor").value = newText;
  updateCsvRowLabel();
  selectedCsvRowIndex = parseCsv(state.csv).length - 1;
  refreshCsvRowHelper();
}

function downloadFile(type) {
  const content = state[type] || "";
  const ext = type === "csv" ? "csv" : "toml";
  const fname = "candidates." + ext;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  a.click();
}

function getCurrentCsvRows() {
  const text = document.getElementById("csv-editor").value || state.csv || "";
  return parseCsvWithHeaders(text);
}

function refreshCsvRowHelper() {
  const select = document.getElementById("csv-row-select");
  const form = document.getElementById("csv-row-form");

  if (!select || !form) return;

  let rows;
  try {
    rows = getCurrentCsvRows();
  } catch (e) {
    select.innerHTML = "";
    form.innerHTML =
      '<div class="parse-err">CSV error: ' + e.message + "</div>";
    return;
  }

  if (!rows.length) {
    select.innerHTML = "";
    form.innerHTML =
      '<p style="color:var(--text-faint);font-family:var(--mono);font-size:12px">No rows available.</p>';
    return;
  }

  if (selectedCsvRowIndex >= rows.length) {
    selectedCsvRowIndex = rows.length - 1;
  }
  if (selectedCsvRowIndex < 0) {
    selectedCsvRowIndex = 0;
  }

  select.innerHTML = rows
    .map((row, idx) => {
      const label =
        (row.candidate_id || "Row " + (idx + 1)) +
        " — " +
        (row.candidate_name || "Unnamed Candidate");
      return (
        '<option value="' +
        idx +
        '"' +
        (idx === selectedCsvRowIndex ? " selected" : "") +
        ">" +
        label +
        "</option>"
      );
    })
    .join("");

  renderCsvRowForm(rows[selectedCsvRowIndex]);
}

function renderCsvRowForm(row) {
  const form = document.getElementById("csv-row-form");
  if (!form) return;

  form.innerHTML = `
    ${renderTextField("candidate_id", "Candidate ID", row.candidate_id)}
    ${renderTextField("candidate_name", "Candidate Name", row.candidate_name)}
    ${renderTextField("assurance_level", "Assurance Level", row.assurance_level)}
    ${renderTextField("privacy_exposure", "Privacy Exposure", row.privacy_exposure)}
    ${renderTextField("data_retention", "Data Retention", row.data_retention)}
    ${renderTextField("centralization", "Centralization", row.centralization)}
    ${renderTextField("user_burden", "User Burden", row.user_burden)}
    ${renderTextField("reusability", "Reusability", row.reusability)}
    ${renderTextField("notes", "Notes", row.notes)}
  `;

  form.querySelectorAll("input").forEach((el) => {
    el.addEventListener("input", onCsvRowFormInput);
    el.addEventListener("change", onCsvRowFormInput);
  });
}

function renderTextField(name, label, value) {
  return `
    <div class="form-field">
      <label for="field-${name}">${label}</label>
      <input type="text" id="field-${name}" name="${name}" value="${escapeHtml(value ?? "")}">
    </div>
  `;
}

function renderNumberField(name, label, value) {
  return `
    <div class="form-field">
      <label for="field-${name}">${label}</label>
      <input type="number" step="0.1" id="field-${name}" name="${name}" value="${escapeHtml(value ?? "")}">
    </div>
  `;
}

function renderBoolField(name, label, value) {
  const normalized = String(value).toLowerCase() === "true" ? "true" : "false";
  return `
    <div class="form-field">
      <label>${label}</label>
      <div class="bool-pair">
        <label><input type="radio" name="${name}" value="true" ${normalized === "true" ? "checked" : ""}> Yes</label>
        <label><input type="radio" name="${name}" value="false" ${normalized === "false" ? "checked" : ""}> No</label>
      </div>
    </div>
  `;
}

function onCsvRowSelectChange() {
  const select = document.getElementById("csv-row-select");
  selectedCsvRowIndex = Number(select.value);
  refreshCsvRowHelper();
}

function onCsvRowFormInput() {
  const editor = document.getElementById("csv-editor");
  const rows = getCurrentCsvRows();
  const current = { ...rows[selectedCsvRowIndex] };

  const form = document.getElementById("csv-row-form");
  const fields = form.querySelectorAll("input");

  fields.forEach((field) => {
    if (field.type === "radio") {
      if (field.checked) {
        current[field.name] = field.value;
      }
    } else {
      current[field.name] = field.value;
    }
  });

  const updatedText = updateCsvRow(editor.value, selectedCsvRowIndex, current);
  editor.value = updatedText;
  state.csv = updatedText;
  updateCsvRowLabel();
  refreshCsvRowHelper();
}

function selectPrevCsvRow() {
  const rows = getCurrentCsvRows();
  if (!rows.length) return;
  selectedCsvRowIndex = Math.max(0, selectedCsvRowIndex - 1);
  refreshCsvRowHelper();
}

function selectNextCsvRow() {
  const rows = getCurrentCsvRows();
  if (!rows.length) return;
  selectedCsvRowIndex = Math.min(rows.length - 1, selectedCsvRowIndex + 1);
  refreshCsvRowHelper();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toggleRawCsvEdit() {
  const editor = document.getElementById("csv-editor");
  const button = document.getElementById("csv-toggle-btn");
  const note = document.getElementById("csv-readonly-note");

  const isReadOnly = editor.hasAttribute("readonly");

  if (isReadOnly) {
    editor.removeAttribute("readonly");
    editor.classList.remove("editor-ghosted");
    button.textContent = "Lock Raw CSV";
    if (note) {
      note.textContent =
        "Raw CSV editing is unlocked. Changes here affect evaluation directly.";
    }
  } else {
    editor.setAttribute("readonly", "");
    editor.classList.add("editor-ghosted");
    button.textContent = "Unlock Raw CSV";
    if (note) {
      note.textContent =
        "Raw CSV is shown for transparency. Use the candidate helper above to edit safely.";
    }
  }
}

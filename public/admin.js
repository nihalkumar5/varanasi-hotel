const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");
const clearFiltersButton = document.getElementById("clearFiltersButton");
const logoutButton = document.getElementById("logoutButton");
const searchInput = document.getElementById("searchInput");
const ratingFilter = document.getElementById("ratingFilter");
const syncMessage = document.getElementById("syncMessage");
const totalLeadsValue = document.getElementById("totalLeadsValue");
const averageScoreValue = document.getElementById("averageScoreValue");
const futureReadyValue = document.getElementById("futureReadyValue");
const latestLeadValue = document.getElementById("latestLeadValue");
const leadCountLabel = document.getElementById("leadCountLabel");
const leadTableBody = document.getElementById("leadTableBody");
const tableEmptyState = document.getElementById("tableEmptyState");
const detailEmptyState = document.getElementById("detailEmptyState");
const detailContent = document.getElementById("detailContent");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailRating = document.getElementById("detailRating");
const detailScore = document.getElementById("detailScore");
const detailPercent = document.getElementById("detailPercent");
const detailScoreValue = document.getElementById("detailScoreValue");
const detailReceivedAt = document.getElementById("detailReceivedAt");
const detailSubmittedAt = document.getElementById("detailSubmittedAt");
const detailPhone = document.getElementById("detailPhone");
const detailEmail = document.getElementById("detailEmail");
const detailDemoLink = document.getElementById("detailDemoLink");
const detailSource = document.getElementById("detailSource");
const detailContactEmail = document.getElementById("detailContactEmail");
const detailContactPhone = document.getElementById("detailContactPhone");
const detailSummary = document.getElementById("detailSummary");
const copySummaryButton = document.getElementById("copySummaryButton");
const openDemoButton = document.getElementById("openDemoButton");
const openWhatsAppButton = document.getElementById("openWhatsAppButton");
const openEmailButton = document.getElementById("openEmailButton");

const state = {
  leads: [],
  filteredLeads: [],
  selectedLeadId: "",
  query: "",
  rating: "all",
  loading: false,
  error: "",
  lastUpdated: null
};

bindEvents();
loadLeads();

function bindEvents() {
  refreshButton?.addEventListener("click", () => {
    loadLeads();
  });

  exportButton?.addEventListener("click", () => {
    downloadCsv();
  });

  clearFiltersButton?.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
    }
    if (ratingFilter) {
      ratingFilter.value = "all";
    }
    state.query = "";
    state.rating = "all";
    applyFilters();
  });

  logoutButton?.addEventListener("click", async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin"
      });
    } catch (error) {
      // Ignore logout network failures and continue to the login screen.
    } finally {
      window.location.assign("/admin");
    }
  });

  searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value || "";
    applyFilters();
  });

  ratingFilter?.addEventListener("change", (event) => {
    state.rating = event.target.value || "all";
    applyFilters();
  });

  leadTableBody?.addEventListener("click", (event) => {
    const row = event.target.closest("[data-lead-id]");
    if (!row) {
      return;
    }

    state.selectedLeadId = row.dataset.leadId || "";
    render();
  });

  leadTableBody?.addEventListener("keydown", (event) => {
    const row = event.target.closest("[data-lead-id]");
    if (!row) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      state.selectedLeadId = row.dataset.leadId || "";
      render();
    }
  });

  copySummaryButton?.addEventListener("click", async () => {
    const selectedLead = getSelectedLead();
    if (!selectedLead) {
      setSyncMessage("Select a lead first so there is a summary to copy.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(buildLeadSummary(selectedLead));
      setSyncMessage("Lead summary copied for manual follow-up.", "success");
    } catch (error) {
      setSyncMessage("Clipboard access was blocked. Use the visible summary field.", "error");
    }
  });
}

async function loadLeads() {
  state.loading = true;
  render();

  try {
    const response = await fetch("/api/leads", {
      credentials: "same-origin"
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 401) {
      window.location.assign("/admin");
      return;
    }

    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `Lead feed returned ${response.status}.`);
    }

    state.leads = (payload.leads || []).map((lead, index) => normalizeLead(lead, index));
    state.error = "";
    state.lastUpdated = new Date();
    applyFilters({ preserveSelection: false });
    setSyncMessage(
      state.leads.length
        ? `Loaded ${state.leads.length} lead${state.leads.length === 1 ? "" : "s"} from the feed.`
        : "Lead feed loaded, but no submissions were found.",
      state.leads.length ? "success" : "error"
    );
  } catch (error) {
    state.error = error?.message || "Could not load the lead feed.";
    state.leads = [];
    state.filteredLeads = [];
    state.selectedLeadId = "";
    state.lastUpdated = null;
    render();
    setSyncMessage(
      `${state.error} Check the webhook connection and refresh the page.`,
      "error"
    );
  } finally {
    state.loading = false;
    render();
  }
}

function applyFilters(options = {}) {
  const query = state.query.trim().toLowerCase();
  const rating = state.rating;

  state.filteredLeads = state.leads
    .filter((lead) => {
      const matchesQuery =
        !query || lead.searchText.includes(query) || lead.ratingText.includes(query);
      const matchesRating = rating === "all" || lead.ratingTone === rating;
      return matchesQuery && matchesRating;
    })
    .sort((a, b) => b.sortValue - a.sortValue);

  if (state.filteredLeads.length === 0) {
    state.selectedLeadId = "";
  } else if (
    !options.preserveSelection ||
    !state.filteredLeads.some((lead) => lead.id === state.selectedLeadId)
  ) {
    state.selectedLeadId = state.filteredLeads[0].id;
  }

  render();
}

function render() {
  renderMetrics();
  renderTable();
  renderDetail();
  renderLoadingState();
}

function renderMetrics() {
  if (totalLeadsValue) {
    totalLeadsValue.textContent = String(state.leads.length);
  }

  if (averageScoreValue) {
    averageScoreValue.textContent = `${calculateAverageScore()}%`;
  }

  if (futureReadyValue) {
    futureReadyValue.textContent = String(
      state.leads.filter((lead) => lead.ratingTone === "future").length
    );
  }

  if (latestLeadValue) {
    latestLeadValue.textContent = state.lastUpdated
      ? new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(state.lastUpdated)
      : "-";
  }

  if (leadCountLabel) {
    leadCountLabel.textContent = `${state.filteredLeads.length} shown`;
  }
}

function renderTable() {
  if (!leadTableBody || !tableEmptyState) {
    return;
  }

  if (state.loading) {
    leadTableBody.innerHTML = "";
    tableEmptyState.textContent = "Loading leads...";
    tableEmptyState.classList.remove("hidden");
    return;
  }

  if (!state.filteredLeads.length) {
    leadTableBody.innerHTML = "";
    tableEmptyState.textContent = state.leads.length
      ? "No leads match the current filters."
      : "No submissions have been saved yet.";
    tableEmptyState.classList.remove("hidden");
    return;
  }

  tableEmptyState.classList.add("hidden");
  leadTableBody.innerHTML = state.filteredLeads.map((lead) => {
    const isSelected = lead.id === state.selectedLeadId;
    const scoreText = `${lead.totalScore}/${lead.maxScore}`;

    return `
      <tr
        data-lead-id="${escapeHtml(lead.id)}"
        class="${isSelected ? "is-selected" : ""}"
        tabindex="0"
        role="button"
        aria-selected="${isSelected ? "true" : "false"}"
      >
        <td>${escapeHtml(lead.receivedLabel)}</td>
        <td>
          <strong>${escapeHtml(lead.hotelName || "-")}</strong>
          <div class="table-subtle">${escapeHtml(lead.email || "-")}</div>
        </td>
        <td>
          <strong>${escapeHtml(lead.phone || "-")}</strong>
          <div class="table-subtle">${escapeHtml(lead.contactEmail || "-")}</div>
        </td>
        <td>${escapeHtml(scoreText)}<div class="table-subtle">${escapeHtml(String(lead.percentage))}%</div></td>
        <td><span class="status-chip ${lead.ratingClass}">${escapeHtml(lead.ratingLabel)}</span></td>
        <td>${escapeHtml(lead.source || "-")}</td>
      </tr>
    `;
  }).join("");
}

function renderDetail() {
  const lead = getSelectedLead();

  if (!detailEmptyState || !detailContent) {
    return;
  }

  if (!lead) {
    detailEmptyState.classList.remove("hidden");
    detailContent.classList.add("hidden");
    if (detailTitle) {
      detailTitle.textContent = "No lead selected";
    }
    if (detailSubtitle) {
      detailSubtitle.textContent =
        "Choose a row from the table to inspect the hotel, score band, and contact actions.";
    }
    if (detailRating) {
      detailRating.textContent = "Waiting";
      detailRating.className = "status-chip";
    }
    return;
  }

  detailEmptyState.classList.add("hidden");
  detailContent.classList.remove("hidden");

  if (detailTitle) {
    detailTitle.textContent = lead.hotelName || "Unnamed hotel";
  }

  if (detailSubtitle) {
    detailSubtitle.textContent =
      "Use the contact links, open the demo link, or copy the follow-up note for manual outreach.";
  }

  if (detailRating) {
    detailRating.textContent = lead.ratingLabel;
    detailRating.className = `status-chip ${lead.ratingClass}`;
  }

  if (detailScore) {
    detailScore.style.setProperty("--score", String(lead.percentage));
  }

  if (detailPercent) {
    detailPercent.textContent = `${lead.percentage}%`;
  }

  if (detailScoreValue) {
    detailScoreValue.textContent = `${lead.totalScore}/${lead.maxScore}`;
  }

  if (detailReceivedAt) {
    detailReceivedAt.textContent = lead.receivedLabel;
  }

  if (detailSubmittedAt) {
    detailSubmittedAt.textContent = lead.submittedLabel;
  }

  if (detailPhone) {
    detailPhone.textContent = lead.phone || "-";
  }

  if (detailEmail) {
    detailEmail.textContent = lead.email || "-";
  }

  if (detailDemoLink) {
    detailDemoLink.textContent = lead.demoLink || "-";
  }

  if (detailSource) {
    detailSource.textContent = lead.source || "-";
  }

  if (detailContactEmail) {
    detailContactEmail.textContent = lead.contactEmail || "-";
  }

  if (detailContactPhone) {
    detailContactPhone.textContent = lead.contactPhone || "-";
  }

  if (detailSummary) {
    detailSummary.value = buildLeadSummary(lead);
  }

  if (openDemoButton) {
    if (lead.demoLink) {
      openDemoButton.href = lead.demoLink;
      openDemoButton.classList.remove("is-disabled");
      openDemoButton.setAttribute("aria-disabled", "false");
    } else {
      openDemoButton.href = "#";
      openDemoButton.classList.add("is-disabled");
      openDemoButton.setAttribute("aria-disabled", "true");
    }
  }

  if (openWhatsAppButton) {
    if (lead.whatsAppUrl) {
      openWhatsAppButton.href = lead.whatsAppUrl;
      openWhatsAppButton.classList.remove("is-disabled");
      openWhatsAppButton.setAttribute("aria-disabled", "false");
      openWhatsAppButton.title = "Open WhatsApp with a prefilled follow-up message";
    } else {
      openWhatsAppButton.href = "#";
      openWhatsAppButton.classList.add("is-disabled");
      openWhatsAppButton.setAttribute("aria-disabled", "true");
      openWhatsAppButton.removeAttribute("title");
    }
  }

  if (openEmailButton) {
    if (lead.email) {
      openEmailButton.href = `mailto:${encodeURIComponent(lead.email)}`;
      openEmailButton.classList.remove("is-disabled");
      openEmailButton.setAttribute("aria-disabled", "false");
    } else {
      openEmailButton.href = "#";
      openEmailButton.classList.add("is-disabled");
      openEmailButton.setAttribute("aria-disabled", "true");
    }
  }
}

function renderLoadingState() {
  if (!refreshButton) {
    return;
  }

  refreshButton.disabled = state.loading;
  refreshButton.textContent = state.loading ? "Refreshing..." : "Refresh leads";
}

function calculateAverageScore() {
  if (!state.leads.length) {
    return 0;
  }

  const total = state.leads.reduce((sum, lead) => sum + lead.percentage, 0);
  return Math.round(total / state.leads.length);
}

function getSelectedLead() {
  return state.filteredLeads.find((lead) => lead.id === state.selectedLeadId) || null;
}

function normalizeLead(lead, index) {
  const totalScore = toNumber(lead.totalScore);
  const maxScore = toNumber(lead.maxScore) || 80;
  const percentage = lead.percentage !== undefined && lead.percentage !== ""
    ? toNumber(lead.percentage)
    : (maxScore ? Math.round((totalScore / maxScore) * 100) : 0);
  const ratingLabel = String(lead.rating || ratingFromPercentage(percentage)).trim();
  const ratingTone = getRatingTone(ratingLabel, percentage);
  const receivedDate = parseDate(lead.receivedAt || lead.submittedAt);
  const submittedDate = parseDate(lead.submittedAt || lead.receivedAt);
  const sortValue = receivedDate?.getTime() || submittedDate?.getTime() || index;
  const receivedLabel = formatDateTime(receivedDate || lead.receivedAt);
  const submittedLabel = formatDateTime(submittedDate || lead.submittedAt);
  const demoLink = lead.demoLink || "";
  const phone = String(lead.phone || "").trim();
  const normalizedPhone = normalizePhone(phone);
  const whatsAppMessage = buildWhatsAppMessage({
    hotelName: lead.hotelName,
    ratingLabel,
    percentage,
    totalScore,
    maxScore,
    contactEmail: lead.contactEmail,
    contactPhone: lead.contactPhone
  });
  const whatsAppUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsAppMessage)}`
    : "";

  return {
    ...lead,
    id: `${lead.receivedAt || lead.submittedAt || index}-${index}`,
    totalScore,
    maxScore,
    percentage,
    ratingLabel,
    ratingTone,
    ratingClass: `tone-${ratingTone}`,
    ratingText: ratingLabel.toLowerCase(),
    receivedLabel,
    submittedLabel,
    sortValue,
    demoLink,
    phone,
    whatsAppUrl,
    whatsAppMessage,
    searchText: [
      lead.hotelName,
      phone,
      lead.email,
      ratingLabel,
      lead.source,
      lead.contactEmail,
      lead.contactPhone
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
  };
}

function buildLeadSummary(lead) {
  return [
    "VNEXORA HOTEL LEAD",
    "",
    `Hotel: ${lead.hotelName || "-"}`,
    `Score: ${lead.totalScore}/${lead.maxScore} (${lead.percentage}%)`,
    `Rating: ${lead.ratingLabel || "-"}`,
    `Received: ${lead.receivedLabel || "-"}`,
    `Submitted: ${lead.submittedLabel || "-"}`,
    `Phone: ${lead.phone || "-"}`,
    `Email: ${lead.email || "-"}`,
    `Demo link: ${lead.demoLink || "-"}`,
    "",
    "Follow up manually from the admin portal."
  ].join("\n");
}

function buildWhatsAppMessage(lead) {
  const hotelName = lead.hotelName || "there";
  const scoreText = `${lead.totalScore}/${lead.maxScore}`;
  const supportText = lead.contactEmail || lead.contactPhone ? "Reply here if you’d like a quick next-step call." : "Reply here if you’d like next steps.";

  return [
    `Hi ${hotelName},`,
    "",
    `Thanks for completing the Vnexora hotel audit.`,
    `Your score is ${scoreText} (${lead.ratingLabel}, ${lead.percentage}%).`,
    "",
    supportText,
    "Best regards,",
    "Vnexora team"
  ].join("\n");
}

function downloadCsv() {
  const isFiltered = Boolean(state.query.trim()) || state.rating !== "all";
  const rows = isFiltered ? state.filteredLeads : state.leads;

  if (!rows.length) {
    setSyncMessage(
      isFiltered ? "No rows match the current filters." : "No rows are available to export.",
      "error"
    );
    return;
  }

  const headers = [
    "Received At",
    "Hotel Name",
    "Phone",
    "Email",
    "Total Score",
    "Max Score",
    "Percentage",
    "Rating",
    "Demo Link",
    "Contact Email",
    "Contact Phone",
    "Source",
    "Submitted At"
  ];

  const csv = [
    headers.join(","),
    ...rows.map((lead) =>
      [
        lead.receivedLabel,
        lead.hotelName,
        lead.phone,
        lead.email,
        lead.totalScore,
        lead.maxScore,
        lead.percentage,
        lead.ratingLabel,
        lead.demoLink,
        lead.contactEmail,
        lead.contactPhone,
        lead.source,
        lead.submittedLabel
      ]
        .map((value) => csvCell(value))
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vnexora-leads.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setSyncMessage(`Exported ${rows.length} lead${rows.length === 1 ? "" : "s"} to CSV.`, "success");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function ratingFromPercentage(percentage) {
  if (percentage >= 70) {
    return "Future Ready";
  }
  if (percentage >= 30) {
    return "Growing Hotel";
  }
  return "Traditional Hotel";
}

function getRatingTone(label, percentage) {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("future") || percentage >= 70) {
    return "future";
  }
  if (normalized.includes("growing") || percentage >= 30) {
    return "growing";
  }
  return "traditional";
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : "";
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setSyncMessage(message, tone) {
  if (!syncMessage) {
    return;
  }

  syncMessage.textContent = message;
  syncMessage.className = `helper-text ${tone}`;
}

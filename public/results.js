const resultHotelName = document.getElementById("resultHotelName");
const resultSummary = document.getElementById("resultSummary");
const ratingLabel = document.getElementById("ratingLabel");
const percentageValue = document.getElementById("percentageValue");
const reportEmail = document.getElementById("reportEmail");
const reportPhone = document.getElementById("reportPhone");
const totalScoreValue = document.getElementById("totalScoreValue");
const generatedDate = document.getElementById("generatedDate");
const performanceTitle = document.getElementById("performanceTitle");
const performanceNote = document.getElementById("performanceNote");
const categoryBreakdown = document.getElementById("categoryBreakdown");
const strengthList = document.getElementById("strengthList");
const suggestionList = document.getElementById("suggestionList");
const draftBox = document.getElementById("whatsAppDraft");
const copyButton = document.getElementById("copyButton");
const openWhatsAppButton = document.getElementById("openWhatsAppButton");
const printButton = document.getElementById("printButton");
const statusMessage = document.getElementById("statusMessage");
const scoreChip = document.querySelector(".score-ring");

const storedReport = sessionStorage.getItem("vnexoraAuditReport");
const saveStatus = sessionStorage.getItem("vnexoraAuditSaveStatus");
const saveMessage = sessionStorage.getItem("vnexoraAuditSaveMessage");
let latestReport = null;

if (storedReport) {
  try {
    latestReport = JSON.parse(storedReport);
  } catch (error) {
    latestReport = null;
  }
}

if (latestReport) {
  renderReport(latestReport);
} else {
  renderEmptyState();
}

if (saveStatus === "success" && statusMessage) {
  statusMessage.textContent = "Saved to Google Sheets successfully.";
  statusMessage.className = "helper-text success";
}

if (saveStatus === "error" && statusMessage) {
  statusMessage.textContent = saveMessage || "Report generated, but Google Sheets save failed.";
  statusMessage.className = "helper-text error";
}

sessionStorage.removeItem("vnexoraAuditSaveStatus");
sessionStorage.removeItem("vnexoraAuditSaveMessage");

copyButton?.addEventListener("click", async () => {
  if (!latestReport) {
    setStatus("Complete the form first so there is a WhatsApp summary to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(latestReport.whatsAppMessage);
    setStatus("WhatsApp summary copied. The admin can paste and send it manually.", "success");
  } catch (error) {
    draftBox?.focus();
    draftBox?.select();
    setStatus("Clipboard access was blocked. The draft has been selected for manual copy.", "error");
  }
});

openWhatsAppButton?.addEventListener("click", () => {
  if (!latestReport) {
    setStatus("Complete the form first so WhatsApp can be opened with a draft.", "error");
    return;
  }

  if (!latestReport.phoneForWhatsApp) {
    setStatus("Add a valid WhatsApp number with country code to open the draft link.", "error");
    return;
  }

  const url = `https://wa.me/${latestReport.phoneForWhatsApp}?text=${encodeURIComponent(
    latestReport.whatsAppMessage
  )}`;
  window.open(url, "_blank", "noopener,noreferrer");
  setStatus("WhatsApp draft opened in a new tab for manual review and sending.", "success");
});

printButton?.addEventListener("click", () => {
  if (!latestReport) {
    setStatus("Complete the form first before printing or saving the report as PDF.", "error");
    return;
  }

  window.print();
});

function renderReport(report) {
  if (resultHotelName) {
    resultHotelName.textContent = report.hotelName;
  }

  if (resultSummary) {
    resultSummary.textContent = `Completed assessment across ${report.answers.length} questions. ${report.rating.note}`;
  }

  if (ratingLabel) {
    ratingLabel.textContent = report.rating.label;
  }

  if (percentageValue) {
    percentageValue.textContent = `${report.percentage}%`;
  }

  if (reportEmail) {
    reportEmail.textContent = report.email;
  }

  if (reportPhone) {
    reportPhone.textContent = report.phone;
  }

  if (totalScoreValue) {
    totalScoreValue.textContent = `${report.totalScore}/${report.maxScore}`;
  }

  if (generatedDate) {
    generatedDate.textContent = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(report.generatedAt));
  }

  if (performanceTitle) {
    performanceTitle.textContent = report.rating.label;
  }

  if (performanceNote) {
    performanceNote.textContent = report.rating.note;
  }

  if (draftBox) {
    draftBox.value = report.whatsAppMessage;
  }

  if (categoryBreakdown) {
    categoryBreakdown.innerHTML = report.breakdown
      .map(
        (item) => `
          <div class="breakdown-item">
            <div>
              <strong>${item.label}</strong>
            </div>
            <div class="breakdown-meta">
              <div class="progress-track">
                <div class="progress-fill" style="width: ${item.percentage}%"></div>
              </div>
              <span>${item.score}/8</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  if (strengthList) {
    strengthList.innerHTML = (report.strengths.length ? report.strengths : ["No category is above 4/8 yet."])
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  if (suggestionList) {
    suggestionList.innerHTML = report.suggestions.map((item) => `<li>${item}</li>`).join("");
  }

  if (statusMessage) {
    statusMessage.textContent = "Report loaded from the last completed assessment.";
    statusMessage.className = "helper-text success";
  }

  if (scoreChip) {
    scoreChip.style.setProperty("--score", String(report.percentage));
  }
}

function renderEmptyState() {
  if (resultHotelName) {
    resultHotelName.textContent = "Your score is ready.";
  }

  if (resultSummary) {
    resultSummary.textContent = "No saved report was found. Please complete the form first.";
  }

  if (performanceTitle) {
    performanceTitle.textContent = "Needs scoring";
  }

  if (performanceNote) {
    performanceNote.textContent = "Complete the form to view the hotel's current quality band.";
  }

  if (draftBox) {
    draftBox.value = "";
  }

  if (scoreChip) {
    scoreChip.style.setProperty("--score", "0");
  }

  if (statusMessage) {
    statusMessage.textContent = "No saved report found in this browser session.";
    statusMessage.className = "helper-text error";
  }
}

function setStatus(message, tone) {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;
  statusMessage.className = `helper-text ${tone}`;
}

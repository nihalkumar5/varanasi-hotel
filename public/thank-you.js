const submissionStatus = document.getElementById("submissionStatus");
const saveMessage = document.getElementById("saveMessage");

const saveStatus = sessionStorage.getItem("vnexoraAuditSaveStatus");
const saveStatusMessage = sessionStorage.getItem("vnexoraAuditSaveMessage");

if (saveMessage) {
  if (saveStatus === "success") {
    saveMessage.textContent = "Saved to Google Sheets successfully.";
    saveMessage.className = "helper-text success";
  } else if (saveStatus === "error") {
    saveMessage.textContent =
      saveStatusMessage || "The report was generated, but Google Sheets save failed.";
    saveMessage.className = "helper-text error";
  } else {
    saveMessage.textContent = "The latest submission is ready for the admin team.";
    saveMessage.className = "helper-text";
  }
}

if (submissionStatus) {
  submissionStatus.textContent =
    "We have saved your submission and notified the admin workflow. You can close this tab or start another audit.";
}

sessionStorage.removeItem("vnexoraAuditSaveStatus");
sessionStorage.removeItem("vnexoraAuditSaveMessage");
sessionStorage.removeItem("vnexoraAuditReport");

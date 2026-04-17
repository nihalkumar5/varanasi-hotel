const SHEET_NAME = "Leads";

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "list";

    if (action !== "list") {
      return jsonResponse({
        ok: false,
        error: "Unsupported action."
      }, 400);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet || sheet.getLastRow() < 2) {
      return jsonResponse({
        ok: true,
        leads: []
      });
    }

    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const headerIndex = {};

    headers.forEach((header, index) => {
      headerIndex[normalizeHeader(header)] = index;
    });

    const leads = values.slice(1).map((row) => {
      return {
        receivedAt: row[headerIndex.receivedat] || "",
        hotelName: row[headerIndex.hotelname] || "",
        phone: row[headerIndex.phone] || "",
        email: row[headerIndex.email] || "",
        totalScore: row[headerIndex.totalscore] || "",
        maxScore: row[headerIndex.maxscore] || "",
        percentage: row[headerIndex.percentage] || "",
        rating: row[headerIndex.rating] || "",
        demoLink: row[headerIndex.demolink] || "",
        contactEmail: row[headerIndex.contactemail] || "",
        contactPhone: row[headerIndex.contactphone] || "",
        source: row[headerIndex.source] || "",
        submittedAt: row[headerIndex.submittedat] || ""
      };
    });

    return jsonResponse({
      ok: true,
      leads
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message || "Unable to load leads."
    }, 500);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");

    if (!body.hotelName || !body.phone || !body.email) {
      return jsonResponse({
        ok: false,
        error: "hotelName, phone, and email are required."
      }, 400);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    ensureHeaderRow(sheet);

    sheet.appendRow([
      new Date(),
      body.hotelName,
      body.phone,
      body.email,
      body.totalScore || "",
      body.maxScore || "",
      body.percentage || "",
      body.rating || "",
      body.demoLink || "",
      body.contactEmail || "",
      body.contactPhone || "",
      body.source || "",
      body.submittedAt || ""
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message || "Unable to save row."
    }, 500);
  }
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
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
  ]);
}

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function jsonResponse(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  if (statusCode && statusCode >= 400) {
    return output;
  }
  return output;
}

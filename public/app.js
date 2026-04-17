const questions = [
  {
    id: "serviceRequests",
    category: "Service requests",
    prompt: "How do guests currently request services in your hotel?",
    recommendation:
      "Create one consistent service channel so requests are visible, tracked, and never lost in handoff.",
    options: [
      {
        key: "A",
        label: "Manual requests",
        description: "Manual requests",
        value: 2
      },
      {
        key: "B",
        label: "Basic digital support",
        description: "WhatsApp or basic digital support",
        value: 5
      },
      {
        key: "C",
        label: "AI instant service",
        description: "Fully automated AI-based instant service",
        value: 8
      }
    ]
  },
  {
    id: "responseTime",
    category: "Response speed",
    prompt: "How fast is your average guest response time?",
    recommendation:
      "Shorten response loops with ticket routing, escalation rules, and faster ownership at the front desk.",
    options: [
      {
        key: "A",
        label: "5–15 minutes",
        description: "Guests wait 5–15 minutes for a reply",
        value: 2
      },
      {
        key: "B",
        label: "2–5 minutes",
        description: "Typical response is 2–5 minutes",
        value: 5
      },
      {
        key: "C",
        label: "Instant",
        description: "Instant response within seconds via automation",
        value: 8
      }
    ]
  },
  {
    id: "bookingSource",
    category: "Booking mix",
    prompt: "What is your primary source of bookings?",
    recommendation:
      "Build a stronger direct-booking path so the hotel relies less on marketplace commissions and third-party traffic.",
    options: [
      {
        key: "A",
        label: "Mostly OTAs",
        description: "Mostly OTAs such as Booking or MakeMyTrip",
        value: 2
      },
      {
        key: "B",
        label: "Mixed channels",
        description: "Mix of OTA and direct bookings",
        value: 5
      },
      {
        key: "C",
        label: "Strong direct engine",
        description: "Strong direct booking ecosystem",
        value: 8
      }
    ]
  },
  {
    id: "automationUse",
    category: "Automation",
    prompt: "Do you use any AI or automation in operations?",
    recommendation:
      "Start by automating repetitive service tasks, guest messaging, and reporting before expanding to larger workflows.",
    options: [
      {
        key: "A",
        label: "No automation",
        description: "No automation in the current operation",
        value: 2
      },
      {
        key: "B",
        label: "Limited tools",
        description: "Limited tools such as PMS or CRM only",
        value: 5
      },
      {
        key: "C",
        label: "AI-driven operations",
        description: "Fully integrated AI-driven operations",
        value: 8
      }
    ]
  },
  {
    id: "guestCommunication",
    category: "Guest communication",
    prompt: "How do you handle guest communication, especially for foreign guests in Varanasi?",
    recommendation:
      "Add multilingual support so foreign guests can ask, confirm, and resolve issues without language friction.",
    options: [
      {
        key: "A",
        label: "Staff dependent",
        description: "Staff-dependent with limited language support",
        value: 2
      },
      {
        key: "B",
        label: "Basic translation",
        description: "Basic translation tools",
        value: 5
      },
      {
        key: "C",
        label: "Multi-language AI",
        description: "Multi-language AI communication for 100+ languages",
        value: 8
      }
    ]
  },
  {
    id: "upselling",
    category: "Upselling",
    prompt: "How do you manage upselling for rooms, food, and experiences?",
    recommendation:
      "Move upselling into a structured system so offers happen consistently instead of only when staff remember to ask.",
    options: [
      {
        key: "A",
        label: "No structure",
        description: "No structured upselling",
        value: 2
      },
      {
        key: "B",
        label: "Manual upselling",
        description: "Manual upselling by staff",
        value: 5
      },
      {
        key: "C",
        label: "AI automated upsells",
        description: "AI-driven automated upselling",
        value: 8
      }
    ]
  },
  {
    id: "costEfficiency",
    category: "Cost efficiency",
    prompt: "What is your operational cost efficiency?",
    recommendation:
      "Cut avoidable labour dependency by automating repetitive tasks and tracking cost per guest more closely.",
    options: [
      {
        key: "A",
        label: "High manpower dependency",
        description: "High manpower dependency",
        value: 2
      },
      {
        key: "B",
        label: "Moderately optimized",
        description: "Moderately optimized operations",
        value: 5
      },
      {
        key: "C",
        label: "Lean with automation",
        description: "Lean operations with automation",
        value: 8
      }
    ]
  },
  {
    id: "serviceAccess",
    category: "Service access",
    prompt: "Do guests need to download an app or call for basic services?",
    recommendation:
      "Remove app friction and create seamless instant access so guests can act without extra steps.",
    options: [
      {
        key: "A",
        label: "Mostly dependent",
        description: "Yes, mostly dependent on calls or an app",
        value: 2
      },
      {
        key: "B",
        label: "Partial convenience",
        description: "Partial digital convenience",
        value: 5
      },
      {
        key: "C",
        label: "Seamless access",
        description: "No app, seamless instant access system",
        value: 8
      }
    ]
  },
  {
    id: "checkInOut",
    category: "Check-in/out",
    prompt: "How do you manage check-in and check-out?",
    recommendation:
      "Reduce waiting time by moving more of the arrival and departure process into digital pre-check steps.",
    options: [
      {
        key: "A",
        label: "Fully manual",
        description: "Fully manual check-in and check-out",
        value: 2
      },
      {
        key: "B",
        label: "Semi-digital",
        description: "Semi-digital process",
        value: 5
      },
      {
        key: "C",
        label: "Digital / contactless",
        description: "Digital or contactless process",
        value: 8
      }
    ]
  },
  {
    id: "liveDashboards",
    category: "Live dashboards",
    prompt: "Do you have real-time performance dashboards?",
    recommendation:
      "Give management live dashboards so operations, guest issues, and revenue signals are visible in one place.",
    options: [
      {
        key: "A",
        label: "No dashboards",
        description: "No real-time dashboards",
        value: 2
      },
      {
        key: "B",
        label: "Limited reports",
        description: "Limited reports and delayed visibility",
        value: 5
      },
      {
        key: "C",
        label: "Live dashboards",
        description: "Live dashboards for decision-making",
        value: 8
      }
    ]
  }
];

const ratingBands = [
  {
    min: 70,
    label: "Future Ready",
    note: "The hotel is operating with modern service, automation, and decision systems."
  },
  {
    min: 30,
    label: "Growing Hotel",
    note: "The property has useful digital foundations, but key workflows still need modernization."
  },
  {
    min: 0,
    label: "Traditional Hotel",
    note: "Most guest and operational processes are still manual and should be digitized step by step."
  }
];

const form = document.getElementById("auditForm");
const questionsContainer = document.getElementById("questionsContainer");
const resetButton = document.getElementById("resetButton");
const statusMessage = document.getElementById("statusMessage");
const supportContact = {
  email: "connect@vnexora.com",
  phone: "+917980829403"
};

if (form && questionsContainer) {
  renderQuestions();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus(
        "Please complete the hotel details and answer every assessment question.",
        "error"
      );
      return;
    }

    const formData = new FormData(form);
    const submission = buildSubmission(formData);
    const report = calculateReport(submission);
    sessionStorage.setItem("vnexoraAuditReport", JSON.stringify(report));

    try {
      await saveLeadToSheet(submission, report);
      sessionStorage.setItem("vnexoraAuditSaveStatus", "success");
      sessionStorage.removeItem("vnexoraAuditSaveMessage");
    } catch (error) {
      sessionStorage.setItem("vnexoraAuditSaveStatus", "error");
      sessionStorage.setItem(
        "vnexoraAuditSaveMessage",
        error instanceof Error ? error.message : "Could not save to Google Sheets."
      );
    }
    window.location.assign("/thank-you.html");
  });
}

if (resetButton && form) {
  resetButton.addEventListener("click", () => {
    form.reset();
    sessionStorage.removeItem("vnexoraAuditReport");
    sessionStorage.removeItem("vnexoraAuditSaveStatus");
    sessionStorage.removeItem("vnexoraAuditSaveMessage");
    if (statusMessage) {
      statusMessage.textContent = "";
      statusMessage.className = "helper-text";
    }
  });
}

function renderQuestions() {
  const questionMarkup = questions
    .map((question, index) => {
      const options = question.options
        .map(
          (option) => `
            <label class="option-card">
              <input
                type="radio"
                name="${question.id}"
                value="${option.value}"
                required
              />
              <span class="option-surface">
                <span class="option-key">${option.key}</span>
                <span class="option-label">${option.label}</span>
              </span>
            </label>
          `
        )
        .join("");

      return `
        <fieldset class="question-card" style="--delay: ${index * 45}ms">
          <div class="question-card-header">
            <div class="question-card-titlewrap">
              <span class="question-index">Q${String(index + 1).padStart(2, "0")}</span>
              <h3 class="question-title">${question.prompt}</h3>
            </div>
            <span class="score-hint">${question.category}</span>
          </div>
          <p class="question-support">
            Select the option that best matches the current guest experience.
          </p>
          <div class="option-grid">
            ${options}
          </div>
        </fieldset>
      `;
    })
    .join("");

  questionsContainer.innerHTML = questionMarkup;
}

function buildSubmission(formData) {
  return {
    hotelName: String(formData.get("hotelName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    answers: questions.map((question) => ({
      ...question,
      score: Number(formData.get(question.id))
    }))
  };
}

function calculateReport(submission) {
  const totalScore = submission.answers.reduce((sum, answer) => sum + answer.score, 0);
  const maxScore = submission.answers.length * 8;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const rating = ratingBands.find((band) => totalScore >= band.min) || ratingBands[ratingBands.length - 1];

  const sortedByStrength = [...submission.answers].sort((a, b) => b.score - a.score);
  const strengths = sortedByStrength
    .filter((answer) => answer.score >= 4)
    .slice(0, 3)
    .map((answer) => `${answer.category}: ${answer.score}/8`);

  const improvementAreas = [...submission.answers]
    .filter((answer) => answer.score <= 3)
    .sort((a, b) => a.score - b.score);

  const suggestions = (improvementAreas.length ? improvementAreas : sortedByStrength.slice(-3))
    .slice(0, 4)
    .map((answer) => answer.recommendation);

  const phoneForWhatsApp = normalizePhone(submission.phone);
  const generatedAt = new Date();
  const demoLink = `${window.location.origin}/assessment.html`;
  const breakdown = submission.answers.map((answer) => ({
    label: answer.category,
    score: answer.score,
    percentage: Math.round((answer.score / 8) * 100)
  }));

  const whatsAppMessage = [
    "VNEXORA FUTURE-READY HOTEL AUDIT",
    "",
    `Hotel: ${submission.hotelName}`,
    `Score: ${totalScore}/${maxScore}`,
    `Rating: ${rating.label}`,
    "",
    "Category Breakdown:",
    ...breakdown.map((item) => `- ${item.label}: ${item.score}/8`),
    "",
    "Suggestions:",
    ...suggestions.map((item) => `- ${item}`),
    "",
    "Upgrade your hotel. Book a free demo:",
    demoLink,
    "",
    `Contact: ${supportContact.email} | ${supportContact.phone}`
  ].join("\n");

  return {
    ...submission,
    totalScore,
    maxScore,
    percentage,
    rating,
    strengths,
    suggestions,
    breakdown,
    generatedAt,
    whatsAppMessage,
    phoneForWhatsApp
  };
}

function normalizePhone(phone) {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 ? digitsOnly : "";
}

async function saveLeadToSheet(submission, report) {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      hotelName: submission.hotelName,
      phone: submission.phone,
      email: submission.email,
      totalScore: report.totalScore,
      maxScore: report.maxScore,
      percentage: report.percentage,
      rating: report.rating.label,
      generatedAt: report.generatedAt,
      contactEmail: supportContact.email,
      contactPhone: supportContact.phone,
      demoLink: `${window.location.origin}/assessment.html`
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Could not save to Google Sheets.");
  }
}

function setStatus(message, tone) {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;
  statusMessage.className = `helper-text ${tone}`;
}

const form = document.querySelector("#travel-form");
const checklist = document.querySelector("#checklist");
const resultTitle = document.querySelector("#result-title");
const copyButton = document.querySelector("#copy-result");
const copyStatus = document.querySelector("#copy-status");
const previewDocument = document.querySelector("#preview-document");
const previewHealth = document.querySelector("#preview-health");

const documentRules = {
  "us-citizen": "Carry a valid U.S. passport, passport card, NEXUS card, or other accepted border document. A visa or eTA is usually not needed for short visits.",
  canadian: "Use your Canadian passport or permanent resident travel document. Dual Canadian citizens usually need a Canadian passport for air travel.",
  "visa-exempt": "You may need an eTA if you fly to or transit through a Canadian airport. Land and marine entries usually do not use eTA.",
  "visa-required": "You likely need a visitor visa or transit visa before travel. Confirm with the official Canada checker.",
  unknown: "Use the official Canada visa/eTA checker before booking. Passport, status, and route change the answer."
};

function getAffectedCountries() {
  return [...document.querySelectorAll("input[name='affected']:checked")].map((input) => input.value);
}

function buildChecklist() {
  const status = document.querySelector("#traveler-status").value;
  const entry = document.querySelector("#entry-method").value;
  const destination = document.querySelector("#destination").value;
  const timing = document.querySelector("#timing").value;
  const affected = getAffectedCountries();
  const items = [
    { text: documentRules[status], warning: status === "unknown" || status === "visa-required" },
    {
      text:
        entry === "air"
          ? "Because you are flying, confirm airline boarding rules and whether your status requires an eTA before check-in."
          : "Because you are not flying directly into Canada, confirm the accepted border document for your entry method.",
      warning: entry === "air"
    },
    {
      text: "Check the official Canada visa/eTA tool and save the result with your travel documents.",
      warning: true
    }
  ];

  if (destination === "us-via-canada") {
    items.push({
      text: "Your final destination is the United States. Check CDC and DHS rules for U.S.-bound travelers, not only Canada entry rules.",
      warning: true
    });
  }

  if (affected.length > 0) {
    items.push({
      text: "Recent presence in DRC, Uganda, or South Sudan can trigger current U.S. Ebola-related screening or entry restrictions. Contact the airline before departure.",
      warning: true
    });
  } else {
    items.push({
      text: "You did not select recent travel to currently flagged Ebola-affected countries. Still verify current public-health guidance before departure.",
      warning: false
    });
  }

  if (timing === "today") {
    items.push({
      text: "Traveling immediately: verify official sources today, then call the airline or border office if anything is unclear.",
      warning: true
    });
  } else if (timing === "week") {
    items.push({
      text: "Traveling within a week: re-check official sources 24 hours before departure because advisories can change quickly.",
      warning: true
    });
  } else {
    items.push({
      text: "Traveling later: set a reminder to re-check the official pages before buying non-refundable tickets.",
      warning: false
    });
  }

  return items;
}

function renderChecklist(event) {
  if (event) event.preventDefault();
  const items = buildChecklist();
  const hasWarnings = items.some((item) => item.warning);
  const affected = getAffectedCountries();

  resultTitle.textContent = hasWarnings ? "Verify these points before travel" : "Your route looks straightforward";
  previewDocument.textContent = document.querySelector("#traveler-status").value === "visa-exempt" ? "eTA likely" : "Check";
  previewHealth.textContent = affected.length > 0 ? "High priority" : "Monitor";

  checklist.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item.text;
      if (item.warning) li.classList.add("warning");
      return li;
    })
  );
}

async function copyChecklist() {
  const text = [...checklist.querySelectorAll("li")]
    .map((item, index) => `${index + 1}. ${item.textContent}`)
    .join("\n");

  try {
    await navigator.clipboard.writeText(`Travel restrictions to Canada checklist\n\n${text}`);
    copyStatus.textContent = "Copied";
  } catch {
    copyStatus.textContent = "Copy failed";
  }
}

form.addEventListener("submit", renderChecklist);
form.addEventListener("change", renderChecklist);
copyButton.addEventListener("click", copyChecklist);
renderChecklist();

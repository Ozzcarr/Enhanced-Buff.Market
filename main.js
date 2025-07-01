const skipKeywords = ["sticker", "charm", "music kit", "graffiti", "patch", "pin", "pass", "name tag", "swap tool"];

function shouldSkipItem(lowerName) {
  return skipKeywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    return regex.test(lowerName);
  });
}

function detectItemType(lowerName) {
  if (lowerName.includes("gloves") || lowerName.includes("wraps")) return "glove";
  for (const weapon of weaponList) {
    if (lowerName.includes(weapon)) return "skin";
  }
  return "agent";
}

function createItemSlug(itemName) {
  return itemName
    .toLowerCase()
    .replace(/\s*\|\s*/g, " ")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function getItemWearSuffix(tagsDiv) {
  if (!tagsDiv) return "";
  const spans = tagsDiv.querySelectorAll("span");
  if (spans.length === 0) return "";

  const wearMap = {
    FN: "factory-new",
    MW: "minimal-wear",
    FT: "field-tested",
    WW: "well-worn",
    BS: "battle-scarred",
  };
  const wearText = spans[0].textContent?.trim();
  let stattrak = false;
  let souvenir = false;
  for (let i = 1; i < spans.length; i++) {
    const spanText = spans[i].textContent?.trim().toUpperCase() || "";
    if (spanText.includes("ST")) stattrak = true;
    if (spanText.includes("SVN")) souvenir = true;
  }
  let prefix = "";
  if (souvenir) prefix = "souvenir-";
  else if (stattrak) prefix = "stattrak-";
  if (wearText && wearMap[wearText]) {
    return "/" + prefix + wearMap[wearText];
  }
  return "";
}

function insertLookButton(item) {
  if (item.querySelector(".buff-look-btn")) return;

  const nameElem = item.querySelector("h3");
  if (!nameElem) return;

  const itemName = nameElem.textContent?.trim() || "";
  const lowerName = itemName.toLowerCase();

  if (shouldSkipItem(lowerName)) return;

  const type = detectItemType(lowerName);
  const itemLink = createItemSlug(itemName);
  const wearSuffix = getItemWearSuffix(item.querySelector(".goods-card-tags"));

  const targetUrl = `https://pricempire.com/cs2-items/${type}/${encodeURIComponent(itemLink)}${wearSuffix}`;

  const btn = document.createElement("a");
  btn.textContent = "Look";
  btn.className = "buff-look-btn";
  btn.href = targetUrl;
  btn.target = "_blank";
  btn.rel = "noopener noreferrer";
  item.style.position = item.style.position || "relative";
  item.appendChild(btn);
}

function insertLookButtonsForAllItems() {
  const items = document.querySelectorAll(".goods-item");
  const matchingItems = Array.from(items).filter((item) => {
    const link = item.querySelector('a[href^="/market/goods/"]');
    return !!link;
  });

  // Always try to add the button to each matching item
  matchingItems.forEach(insertLookButton);
}

// Run once immediately
insertLookButtonsForAllItems();

// Observe for dynamically added goods-item elements
const observer = new MutationObserver(() => {
  insertLookButtonsForAllItems();
});

observer.observe(document.body, { childList: true, subtree: true });

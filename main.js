let lastCount = 0;

// Weapon list for CS2
const weaponList = [
  // Rifles
  "ak-47",
  "m4a4",
  "m4a1-s",
  "famas",
  "galil ar",
  "aug",
  "sg 553",

  // Sniper Rifles
  "awp",
  "ssg 08",
  "scar-20",
  "g3sg1",

  // SMGs
  "mac-10",
  "mp9",
  "mp7",
  "mp5-sd",
  "ump-45",
  "p90",
  "bizon",

  // Shotguns
  "mag-7",
  "nova",
  "xm1014",
  "sawed-off",

  // Machine Guns
  "m249",
  "negev",

  // Pistols
  "usp-s",
  "glock-18",
  "p250",
  "p2000",
  "deagle",
  "r8 revolver",
  "five-seven",
  "tec-9",
  "cz75-auto",
  "dual berettas",

  // Knives
  "knife",
  "bayonet",
  "karambit",
  "shadow daggers",
];

const skipKeywords = ["sticker", "charm", "music kit", "graffiti", "patch", "pin", "pass", "name tag", "swap tool"];

function shouldSkip(lowerName) {
  return skipKeywords.some((keyword) => lowerName.includes(keyword));
}

function detectType(lowerName) {
  if (lowerName.includes("gloves") || lowerName.includes("wraps")) return "glove";
  for (const weapon of weaponList) {
    if (lowerName.includes(weapon)) return "skin";
  }
  return "agent";
}

function formatItemLink(itemName) {
  return itemName
    .toLowerCase()
    .replace(/\s*\|\s*/g, " ")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function getWearSuffix(tagsDiv) {
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

function addLookButton(item) {
  if (item.querySelector(".buff-look-btn")) return;

  const nameElem = item.querySelector("h3");
  if (!nameElem) return;

  const itemName = nameElem.textContent?.trim() || "";
  const lowerName = itemName.toLowerCase();

  if (shouldSkip(lowerName)) return;

  const type = detectType(lowerName);
  const itemLink = formatItemLink(itemName);
  const wearSuffix = getWearSuffix(item.querySelector(".goods-card-tags"));

  const targetUrl = `https://pricempire.com/cs2-items/${type}/${encodeURIComponent(itemLink)}${wearSuffix}`;

  const btn = document.createElement("a");
  btn.textContent = "Look";
  btn.className = "buff-look-btn";
  btn.href = targetUrl;
  btn.target = "_blank";
  btn.rel = "noopener noreferrer";
  btn.style.position = "absolute";
  btn.style.top = "8px";
  btn.style.right = "8px";
  btn.style.zIndex = "10";
  btn.style.padding = "4px 10px";
  btn.style.background = "#1976d2";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "4px";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "12px";
  btn.style.textDecoration = "none";
  btn.style.display = "inline-block";
  btn.style.textAlign = "center";
  item.style.position = item.style.position || "relative";
  item.appendChild(btn);
}

function getGoodsItems() {
  const items = document.querySelectorAll(".goods-item");
  let matchingItems = [];
  if (items.length !== lastCount && items.length > 0) {
    matchingItems = Array.from(items).filter((item) => {
      const link = item.querySelector('a[href^="/market/goods/"]');
      return !!link;
    });
    lastCount = items.length;

    // Add Look button to each matching item
    matchingItems.forEach(addLookButton);
  }
  return matchingItems;
}

// Run once immediately
getGoodsItems();

// Observe for dynamically added goods-item elements
const observer = new MutationObserver(() => {
  getGoodsItems();
});

observer.observe(document.body, { childList: true, subtree: true });

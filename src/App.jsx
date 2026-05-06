import { useState } from "react";

// Mirrors the Naan & Curry order sheet app — RD tab ordered by physical store layout
const TABS = [
  {
    key: "rd",
    label: "Restaurant Depot",
    emoji: "🏪",
    categories: [
      {
        key: "produce", label: "Produce", emoji: "🥦",
        items: ["Yellow Onions","Red Onions","Potato","Garlic","Ginger","Paneer","Flowers (garnish)","Cauliflower","Green Onions","Carrots","Fresh Spinach","Green Bell Pepper","Lemon","Mint","Cilantro","Green Chilies","Cucumber","All Purpose Flour"]
      },
      {
        key: "dairy", label: "Dairy", emoji: "🥛",
        items: ["Heavy Cream","Milk"]
      },
      {
        key: "proteins", label: "Proteins", emoji: "🍗",
        items: ["Chicken Breast","Chicken Leg Quarters","Chicken Wings","Chicken Leg Meat","Lamb Leg Boneless"]
      },
      {
        // Physically located after proteins at the butcher/deli counter
        key: "goat_dairy", label: "Goat / Cheese / Yogurt", emoji: "🐐",
        items: ["Goat Cubes","Goat Meat","Cheese Blend","Yogurt"]
      },
      {
        // Outside freezer area
        key: "freezer", label: "Freezer Area (Outside)", emoji: "🧊",
        items: ["Shrimp 16-18","Shrimp","Fish (Tilapia)","Frozen Spinach","Chopped Spinach","Frozen Green Peas","Frozen Broccoli","Frozen 4-Way Mix"]
      },
      {
        key: "dry_goods", label: "Dry Goods", emoji: "🌾",
        items: ["Roti Atta","Baking Powder","Corn Starch","Rice","Garbanzo","Red Kidney","Salt","Sugar","Tomato Puree","Tomato Sauce","Petite Tomato","Ketchup"]
      },
      {
        key: "oils", label: "Oils, Sauces & Liquids", emoji: "🫙",
        items: ["White Vinegar","Liquid Butter","Cooking Oil","Fryer Oil","Lemon Juice","Sambal Chili Jar"]
      },
      {
        key: "beverages", label: "Beverages", emoji: "🥤",
        items: ["Water","Coca-Cola","Diet Coca-Cola","Sprite","Fanta"]
      },
      {
        key: "misc", label: "Misc & Supplies", emoji: "🗂️",
        items: ["Red Food Color","Egg Yellow Color","Smiley To-Go Bags","Printer Paper Roll"]
      },
    ]
  },
  {
    key: "indian",
    label: "Indian Store",
    emoji: "🌶️",
    categories: [
      {
        key: "indian_store", label: "Indian Store Items", emoji: "🌶️",
        items: [
          "Bombay Biryani Mix","Curry Leaves","Pilau Biryani Mix","Rogan Josh Masala",
          "Madras Curry Powder","Garam Masala","Tandoori Masala","Cumin Powder","Cumin Seeds",
          "Coriander Powder","Turmeric Powder","Chili Powder","Kashmiri Chili Powder",
          "Fenugreek (Methi)","Chaat Masala","Cardamom","Cloves","Cinnamon Sticks","Bay Leaves",
          "Ghee","Rose Water","Mango Pulp","Tamarind Block","Paprika","Besan","Papad",
          "Mustard Oil","Amchoor Powder","Black Cardamom","Mace (Javitri)",
          // Indian beverages — always Indian Store, never RD
          "Limca","Thumbs Up","Mazaa Mango","Mazaa Lychee"
        ]
      },
    ]
  },
  {
    key: "kitchen",
    label: "Main Kitchen",
    emoji: "👨‍🍳",
    categories: [
      {
        key: "kitchen_prep", label: "Main Kitchen Prep", emoji: "👨‍🍳",
        items: ["Makhani Sauce","Onion Gravy","Chicken Curry","Lamb Curry","Onion Tadka"]
      },
    ]
  },
  {
    key: "disposables",
    label: "Disposables",
    emoji: "📦",
    categories: [
      { key: "bags",       label: "Bags & Liners",        emoji: "🛍️", items: ["Brown Paper Bags Large","Small Paper Bags","Medium Paper Bags","13 Gal Clear Liners","Black Trash Liners"] },
      { key: "containers", label: "Containers & Cups",    emoji: "🥡", items: ["24oz Round Container","16oz Deli Containers","8oz Deli Containers","4oz Portion Cups","2oz Portion Cups","4oz Cup Lids","2oz Cup Lids","Large 3-Comp Foam","Medium 1-Comp Foam"] },
      { key: "cleaning",   label: "Cleaning & Janitorial",emoji: "🧴", items: ["Sanitizer","Dish Soap","Multifold Paper Towels","Toilet Paper Rolls"] },
      { key: "service",    label: "Service Supplies",     emoji: "🧤", items: ["Cutlery Kits","Drinking Black Straws","Gloves Large","Gloves Medium","Plastic Film Roll","Aluminum Foil"] },
    ]
  },
];

const SYSTEM_PROMPT = `You are an assistant for Naan & Curry restaurant. Parse a chef's raw order list and categorize each item.

IMPORTANT: The RD tab is ordered by physical store layout. Assign categories exactly as below.

TAB: rd (Restaurant Depot) — in this exact order:
  produce: all vegetables, herbs, AP flour, all purpose flour, green chilies, mint, garlic, onions, ginger, lemon, paneer, cauliflower, spinach, cucumber, carrots, bell pepper, flowers
  dairy: Heavy Cream, Milk ONLY (not yogurt, not cheese — those go in goat_dairy)
  proteins: Chicken Breast, Chicken Leg Quarters, Chicken Wings, Chicken Leg Meat, Lamb Leg Boneless ONLY (not goat, not shrimp, not fish)
  goat_dairy: Goat Cubes/Goat Meat, Cheese Blend, Yogurt — these 3 come AFTER proteins, at the butcher/deli counter
  freezer: Shrimp (any size/pack), Fish (Tilapia), Frozen Spinach, Chopped Spinach, Frozen Green Peas, Frozen Broccoli, Frozen 4-Way Mix — outside freezer area, AFTER goat_dairy
  dry_goods: Rice, Roti Atta, Baking Powder, Corn Starch, Garbanzo, Red Kidney Beans, Salt, Sugar, Tomato Puree, Tomato Sauce, Petite Tomato Dice, Ketchup
  oils: Cooking Oil, Salad Oil, Frying Oil, Fryer Oil, Liquid Butter, White Vinegar, Lemon Juice, Sambal Chili Jar
  beverages: Water, Coca-Cola, Diet Coca-Cola, Sprite, Fanta — ONLY these 5 brands
  misc: Red Food Color, Egg Yellow Color, Smiley To-Go Bags, Printer Paper Roll

TAB: indian (Indian Store)
  indian_store: ALL spices and masalas, ghee, besan, papad, tamarind, mango pulp, curry leaves, biryani mix, rose water, amchoor, mustard oil, mace
  indian_store BEVERAGES — ALWAYS indian_store, NEVER rd/beverages: Limca, Thumbs Up, Mazaa Mango, Mazaa Lychee

TAB: kitchen (Main Kitchen)
  kitchen_prep: Makhani Sauce, Onion Gravy, Chicken Curry, Lamb Curry, Onion Tadka

TAB: disposables
  bags: paper bags, trash liners, clear liners
  containers: deli containers, portion cups, foam containers, lids, biryani containers
  cleaning: Sanitizer, Dish Soap, Paper Towels, Toilet Paper
  service: Cutlery Kits, Straws, Gloves, Plastic Film, Aluminum Foil

KEY RULES:
- "Yoghurt" or "Yogurt" → tab: rd, category: goat_dairy
- "Cheese" → tab: rd, category: goat_dairy
- "Goat" → tab: rd, category: goat_dairy
- "Shrimp" (any) → tab: rd, category: freezer
- "Fish" → tab: rd, category: freezer
- "Frozen" anything → tab: rd, category: freezer
- "Chopped Spinach" → tab: rd, category: freezer
- "A.P flour" / "AP Flour" → tab: rd, category: produce
- "Salad oil" / "Frying oil" / "Fryer oil" → tab: rd, category: oils
- "Cutlery kit" → tab: disposables, category: service
- "Limca" / "Thumbs Up" / "Mazaa" → tab: indian, category: indian_store
- "Chicken breast B/L" = Chicken Breast → tab: rd, category: proteins

Return ONLY a valid JSON array, no markdown, no explanation:
[{"name":"Yellow Onions","quantity":"14 bag","tab":"rd","category":"produce"}]`;

export default function OrderParser() {
  const [inputText, setInputText] = useState("");
  const [parsed, setParsed]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [copied, setCopied]       = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  async function parseList() {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setParsed(null);
    setActiveTab(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: `${SYSTEM_PROMPT}\n\nOrder list to parse:\n\n${inputText}` }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(`API error: ${data.error.message || JSON.stringify(data.error)}`);
        return;
      }
      if (!data.content || !Array.isArray(data.content)) {
        setError(`Unexpected response: ${JSON.stringify(data).slice(0, 300)}`);
        return;
      }

      const text = data.content.map(b => b.text || "").join("").trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        setError(`No JSON found. Raw: ${text.slice(0, 300)}`);
        return;
      }

      const items = JSON.parse(jsonMatch[0]);
      setParsed(items);
      const firstTab = TABS.find(t => items.some(i => i.tab === t.key));
      if (firstTab) setActiveTab(firstTab.key);
    } catch (e) {
      setError(`Error: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  function getTabItems(tabKey) {
    return parsed ? parsed.filter(i => i.tab === tabKey) : [];
  }

  function getGroupedForTab(tabKey) {
    const tab = TABS.find(t => t.key === tabKey);
    if (!tab || !parsed) return [];
    const items = getTabItems(tabKey);
    const groups = {};
    items.forEach(item => {
      const cat = item.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return tab.categories
      .filter(cat => groups[cat.key]?.length > 0)
      .map(cat => ({ ...cat, items: groups[cat.key] }));
  }

  function buildCopyText() {
    const lines = [];
    TABS.forEach(tab => {
      const groups = getGroupedForTab(tab.key);
      if (!groups.length) return;
      lines.push(`${tab.emoji} ${tab.label.toUpperCase()}`);
      groups.forEach(cat => {
        lines.push(`${cat.emoji} ${cat.label}`);
        cat.items.forEach(item =>
          lines.push(`• ${item.name}${item.quantity ? " – " + item.quantity : ""}`)
        );
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  function copyOutput() {
    navigator.clipboard.writeText(buildCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tabsWithItems = parsed ? TABS.filter(t => getTabItems(t.key).length > 0) : [];

  const s = {
    wrap:      { minHeight: "100vh", background: "#0f0e0c", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#f5ede0" },
    header:    { background: "linear-gradient(135deg,#8b2a00,#c8410b,#e8650a)", padding: "20px 18px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 16px rgba(0,0,0,0.5)" },
    hTitle:    { fontSize: "17px", fontWeight: "800", color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" },
    hSub:      { fontSize: "10px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "2px" },
    body:      { padding: "14px 13px 40px", maxWidth: "640px", margin: "0 auto" },
    inputCard: { background: "#1a1814", border: "1px solid #2e2a25", borderRadius: "12px", padding: "15px", marginBottom: "13px" },
    label:     { display: "block", fontSize: "10px", letterSpacing: "0.13em", textTransform: "uppercase", color: "#c8814e", marginBottom: "8px", fontWeight: "600" },
    textarea:  { width: "100%", minHeight: "155px", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: "8px", color: "#f0e8dc", fontSize: "13px", lineHeight: "1.75", padding: "11px", resize: "vertical", fontFamily: "monospace", outline: "none", boxSizing: "border-box" },
    btn:       { marginTop: "11px", width: "100%", padding: "13px", background: "linear-gradient(135deg,#c8410b,#e8650a)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" },
    btnOff:    { background: "#3a2010", opacity: 0.45, cursor: "not-allowed" },
    errBox:    { background: "#2a0e0e", border: "1px solid #7a1818", borderRadius: "8px", padding: "11px 13px", color: "#f08080", fontSize: "11px", marginBottom: "13px", lineHeight: "1.65", wordBreak: "break-all" },
    meta:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
    metaCount: { fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6858" },
    copyBtn:   (a) => ({ background: a ? "#1a3a1a" : "#1a1814", border: "1px solid "+(a?"#3a7a3a":"#2e2a25"), borderRadius: "6px", color: a?"#6acc6a":"#c8814e", padding: "6px 12px", fontSize: "11px", cursor: "pointer", letterSpacing: "0.06em" }),
    tabRow:    { display: "flex", gap: "6px", marginBottom: "13px", overflowX: "auto", paddingBottom: "2px" },
    tabBtn:    (a) => ({ padding: "7px 13px", borderRadius: "20px", border: "1.5px solid "+(a?"#c8410b":"#2e2a25"), background: a?"#c8410b":"#1a1814", color: a?"#fff":"#9a8070", fontSize: "11px", fontWeight: a?"700":"400", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }),
    secCard:   { background: "#1a1814", border: "1px solid #2a2520", borderRadius: "10px", marginBottom: "9px", overflow: "hidden" },
    secHead:   { background: "#231f1a", padding: "9px 13px", borderBottom: "1px solid #2a2520", display: "flex", alignItems: "center", gap: "7px" },
    secLabel:  { fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8a070", fontWeight: "700" },
    badge:     { marginLeft: "auto", background: "#2e2a25", borderRadius: "10px", padding: "2px 7px", fontSize: "10px", color: "#9a8070" },
    itemRow:   (last) => ({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 13px", borderBottom: last?"none":"1px solid #1e1b17" }),
    itemName:  { fontSize: "13px", color: "#f0e8dc" },
    qtyBadge:  { fontSize: "11px", color: "#c8814e", fontFamily: "monospace", background: "#231f1a", padding: "2px 7px", borderRadius: "4px" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={{ fontSize: "26px" }}>🍛</span>
        <div>
          <div style={s.hTitle}>Naan & Curry</div>
          <div style={s.hSub}>Order List Organizer</div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.inputCard}>
          <label style={s.label}>Paste Chef's Order List</label>
          <textarea
            style={s.textarea}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={"*Produce:\nYellow onion – 14 bag\nGreen chili – 1 case\n\n*Beverages:\nLimca – 1 case\n..."}
          />
          <button
            style={{ ...s.btn, ...(!inputText.trim() || loading ? s.btnOff : {}) }}
            onClick={parseList}
            disabled={loading || !inputText.trim()}
          >
            {loading ? "⏳ Organizing..." : "✦ Organize List"}
          </button>
        </div>

        {error && <div style={s.errBox}>{error}</div>}

        {tabsWithItems.length > 0 && (
          <>
            <div style={s.meta}>
              <span style={s.metaCount}>{parsed.length} items · {tabsWithItems.length} tab{tabsWithItems.length > 1 ? "s" : ""}</span>
              <button style={s.copyBtn(copied)} onClick={copyOutput}>
                {copied ? "✓ Copied" : "📋 Copy All"}
              </button>
            </div>

            <div style={s.tabRow}>
              {tabsWithItems.map(tab => (
                <button key={tab.key} style={s.tabBtn(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
                  {tab.emoji} {tab.label} ({getTabItems(tab.key).length})
                </button>
              ))}
            </div>

            {activeTab && getGroupedForTab(activeTab).map(cat => (
              <div key={cat.key} style={s.secCard}>
                <div style={s.secHead}>
                  <span style={{ fontSize: "13px" }}>{cat.emoji}</span>
                  <span style={s.secLabel}>{cat.label}</span>
                  <span style={s.badge}>{cat.items.length}</span>
                </div>
                {cat.items.map((item, i) => (
                  <div key={i} style={s.itemRow(i === cat.items.length - 1)}>
                    <span style={s.itemName}>{item.name}</span>
                    {item.quantity && <span style={s.qtyBadge}>{item.quantity}</span>}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

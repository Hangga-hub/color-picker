document.addEventListener("DOMContentLoaded", () => {
  // Inject shared navbar
  fetch("https://hangga-hub.github.io/components/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar").innerHTML = html;
      document.getElementById("menuToggle")?.addEventListener("click", () => {
        document.querySelector(".nav-links")?.classList.toggle("show");
      });
      document.querySelectorAll(".nav-links a").forEach(link => {
        if (window.location.href.includes(link.href)) {
          link.classList.add("active");
        }
      });
    });

  initColorPicker();
});

const history = [];

function initColorPicker() {
  const hexInput  = document.getElementById("hexInput");
  const rgbInput  = document.getElementById("rgbInput");
  const hslInput  = document.getElementById("hslInput");
  const randomBtn = document.getElementById("randomBtn");
  const copyBtn   = document.getElementById("copyBtn");
  const gradBtn   = document.getElementById("previewGradientBtn");

  // Live‐sync inputs
  hexInput.addEventListener("input", () => updatePreview(hexInput.value.trim()));
  rgbInput.addEventListener("input", () => updatePreview(rgbToHex(rgbInput.value.trim())));
  hslInput.addEventListener("input", () => updatePreview(hslToHex(hslInput.value.trim())));

  // Button actions
  randomBtn.addEventListener("click", generateRandomColor);
  copyBtn.addEventListener("click", copyToClipboard);
  gradBtn.addEventListener("click", previewGradient);

  // Initial state
  updatePreview("#ff00cc");
}

function updatePreview(hex) {
  if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) return;

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  document.getElementById("hexInput").value = hex;
  document.getElementById("rgbInput").value = 
    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  document.getElementById("hslInput").value = 
    `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

  const preview = document.getElementById("colorPreview");
  preview.textContent         = hex;
  preview.style.backgroundColor = hex;
  preview.style.border         = `2px solid ${hex}`;
  preview.style.boxShadow      = `0 0 20px ${hex}`;

  storeHistory(hex);
  showPalette(hex);
}

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  updatePreview(hslToHex(`hsl(${hue},100%,50%)`));
}

function copyToClipboard() {
  const hex = document.getElementById("hexInput").value;
  navigator.clipboard.writeText(hex)
    .then(() => alert(`Copied: ${hex}`));
}

function storeHistory(hex) {
  if (history[0] !== hex) history.unshift(hex);
  if (history.length > 5) history.pop();

  const container = document.getElementById("colorHistory");
  container.innerHTML = "";
  history.forEach(c => {
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.backgroundColor = c;
    sw.title = c;
    sw.addEventListener("click", () => updatePreview(c));
    container.appendChild(sw);
  });
}

function showPalette(hex) {
  const {h, s, l} = rgbToHsl(hexToRgb(hex));
  const variants = [
    {name: "Complementary", angle: (h + 180) % 360},
    {name: "Analogous +30", angle: (h + 30) % 360},
    {name: "Analogous -30", angle: (h + 330) % 360},
    {name: "Triadic",      angle: (h + 120) % 360}
  ];
  const grid = document.getElementById("paletteGrid");
  grid.innerHTML = "";
  variants.forEach(v => {
    const hx = hslToHex(`hsl(${v.angle},${Math.round(s)}%,${Math.round(l)}%)`);
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.backgroundColor = hx;
    sw.title = `${v.name}: ${hx}`;
    sw.addEventListener("click", () => updatePreview(hx));
    grid.appendChild(sw);
  });
}

function previewGradient() {
  const start = document.getElementById("gradientStart").value.trim();
  const end   = document.getElementById("gradientEnd").value.trim();
  if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(start)) return;
  if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(end))   return;

  const box = document.getElementById("gradientPreview");
  box.style.background = `linear-gradient(90deg, ${start}, ${end})`;
  box.style.border     = `2px solid ${start}`;

  document.getElementById("gradientCSS").textContent =
    `background: linear-gradient(90deg, ${start}, ${end});`;
}

// Utility conversions
function hexToRgb(hex) {
  hex = hex.replace("#","").split("");
  if (hex.length === 3) hex = hex.flatMap(h=>[h,h]);
  const val = parseInt(hex.join(""),16);
  return { r: (val>>16)&255, g: (val>>8)&255, b: val&255 };
}

function rgbToHex(rgbStr) {
  const nums = rgbStr.match(/\d+/g);
  if (!nums || nums.length<3) return "#000000";
  return "#" + nums.slice(0,3).map(n=>{
    const h = parseInt(n).toString(16);
    return h.length===1 ? "0"+h : h;
  }).join("");
}

function rgbToHsl({r,g,b}) {
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if (max!==min) {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0)); break;
      case g: h = ((b-r)/d + 2); break;
      case b: h = ((r-g)/d + 4); break;
    }
    h *= 60;
  }
  return { h, s: s*100, l: l*100 };
}

function hslToHex(hslStr) {
  const m = hslStr.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i);
  if (!m) return "#000000";
  let [h,s,l] = m.slice(1).map(Number);
  s/=100; l/=100;
  const c = (1 - Math.abs(2*l-1))*s;
  const x = c*(1 - Math.abs((h/60)%2 -1));
  const m2 = l - c/2;
  let [r,g,b] = [0,0,0];
  if      (h<60)  [r,g,b]=[c,x,0];
  else if (h<120) [r,g,b]=[x,c,0];
  else if (h<180) [r,g,b]=[0,c,x];
  else if (h<240) [r,g,b]=[0,x,c];
  else if (h<300) [r,g,b]=[x,0,c];
  else            [r,g,b]=[c,0,x];
  return rgbToHex(`rgb(${Math.round((r+m2)*255)},${Math.round((g+m2)*255)},${Math.round((b+m2)*255)})`);
}

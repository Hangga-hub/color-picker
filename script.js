document.addEventListener("DOMContentLoaded", () => {
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

  setupColorSync();
});

const history = [];

function setupColorSync() {
  const hexInput = document.getElementById("hexInput");
  const rgbInput = document.getElementById("rgbInput");
  const hslInput = document.getElementById("hslInput");

  hexInput.addEventListener("input", () => updatePreview(hexInput.value.trim()));
  rgbInput.addEventListener("input", () => updatePreview(rgbToHex(rgbInput.value.trim())));
  hslInput.addEventListener("input", () => updatePreview(hslToHex(hslInput.value.trim())));
}

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const hex = hslToHex(`hsl(${hue}, 100%, 50%)`);
  updatePreview(hex);
}

function updatePreview(hex) {
  if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(hex)) return;

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  document.getElementById("hexInput").value = hex;
  document.getElementById("rgbInput").value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  document.getElementById("hslInput").value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

  const preview = document.getElementById("colorPreview");
  preview.style.backgroundColor = hex;
  preview.style.color = "#000";
  preview.style.border = "2px solid " + hex;
  preview.style.boxShadow = `0 0 30px ${hex}`;

  storeHistory(hex);
  showPalette(hex);
}

function copyToClipboard() {
  const hex = document.getElementById("hexInput").value;
  navigator.clipboard.writeText(hex).then(() => {
    alert("Copied: " + hex);
  });
}

function storeHistory(hex) {
  if (history.includes(hex)) return;
  history.unshift(hex);
  if (history.length > 5) history.pop();

  const container = document.getElementById("colorHistory");
  container.innerHTML = '';
  history.forEach(c => {
    const box = document.createElement('div');
    box.className = 'swatch';
    box.style.backgroundColor = c;
    box.title = c;
    box.onclick = () => updatePreview(c);
    container.appendChild(box);
  });
}

function showPalette(hex) {
  const hsl = rgbToHsl(hexToRgb(hex));
  const variants = [
    { name: "Complementary", h: (hsl.h + 180) % 360 },
    { name: "Analogous +30", h: (hsl.h + 30) % 360 },
    { name: "Analogous -30", h: (hsl.h + 330) % 360 },
    { name: "Triadic", h: (hsl.h + 120) % 360 }
  ];

  const grid = document.getElementById("paletteGrid");
  grid.innerHTML = '';

  variants.forEach(v => {
    const variantHex = hslToHex(`hsl(${v.h}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`);
    const box = document.createElement('div');
    box.className = 'swatch';
    box.title = v.name + ': ' + variantHex;
    box.style.backgroundColor = variantHex;
    box.onclick = () => updatePreview(variantHex);
    grid.appendChild(box);
  });
}

// 🧪 Gradient Builder
function previewGradient() {
  const start = document.getElementById("gradientStart").value.trim();
  const end = document.getElementById("gradientEnd").value.trim();

  if (!isValidHex(start) || !isValidHex(end)) return;

  const gradientBox = document.getElementById("gradientPreview");
  gradientBox.style.background = `linear-gradient(90deg, ${start}, ${end})`;
  gradientBox.style.border = "2px solid " + start;

  const cssText = `background: linear-gradient(90deg, ${start}, ${end});`;
  document.getElementById("gradientCSS").textContent = cssText;
}

// 🧠 Color conversion helpers
function isValidHex(hex) {
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(hex);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
  const int = parseInt(hex, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  return '#' + match.slice(0, 3).map(n => {
    const val = parseInt(n).toString(16);
    return val.length === 1 ? '0' + val : val;
  }).join('');
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
    switch(max){
      case r: h = (g - b)/d + (g < b ? 6 : 0); break;

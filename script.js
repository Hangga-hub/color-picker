document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  setupListeners();
  updatePreview("#ff00cc"); // Initial color
});

function loadNavbar() {
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
}

function setupListeners() {
  document.getElementById("hexInput").addEventListener("input", e => updatePreview(e.target.value));
  document.getElementById("rgbInput").addEventListener("input", e => updatePreview(rgbToHex(e.target.value)));
  document.getElementById("hslInput").addEventListener("input", e => updatePreview(hslToHex(e.target.value)));

  document.getElementById("randomBtn").addEventListener("click", generateRandomColor);
  document.getElementById("copyBtn").addEventListener("click", copyToClipboard);
  document.getElementById("previewGradientBtn").addEventListener("click", previewGradient);
}

let history = [];

function updatePreview(hex) {
  if (!isValidHex(hex)) return;

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  document.getElementById("hexInput").value = hex;
  document.getElementById("rgbInput").value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  document.getElementById("hslInput").value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

  const preview = document.getElementById("colorPreview");
  preview.style.backgroundColor = hex;
  preview.textContent = hex;
  preview.style.border = `2px solid ${hex}`;
  preview.style.boxShadow = `0 0 20px ${hex}`;

  updateHistory(hex);
  showPalette(hex);
}

function generateRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const hex = hslToHex(`hsl(${h}, 100%, 50%)`);
  updatePreview(hex);
}

function copyToClipboard() {
  const hex = document.getElementById("hexInput").value;
  navigator.clipboard.writeText(hex).then(() => alert("Copied: " + hex));
}

function updateHistory(hex) {
  if (history.includes(hex)) return;
  history.unshift(hex);
  if (history.length > 5) history.pop();

  const container = document.getElementById("colorHistory");
  container.innerHTML = '';
  history.forEach(c => {
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundColor = c;
    swatch.title = c;
    swatch.onclick = () => updatePreview(c);
    container.appendChild(swatch);
  });
}

function showPalette(hex) {
  const hsl = rgbToHsl(hexToRgb(hex));
  const paletteGrid = document.getElementById("paletteGrid");
  paletteGrid.innerHTML = '';

  const harmonies = [
    { name: "Complementary", h: (hsl.h + 180) % 360 },
    { name: "Analogous +30", h: (hsl.h + 30) % 360 },
    { name: "Analogous -30", h: (hsl.h + 330) % 360 },
    { name: "Triadic", h: (hsl.h + 120) % 360 }
  ];

  harmonies.forEach(hue => {
    const color = hslToHex(`hsl(${hue.h}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`);
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.title = `${hue.name}: ${color}`;
    swatch.style.backgroundColor = color;
    swatch.onclick = () => updatePreview(color);
    paletteGrid.appendChild(swatch);
  });
}

function previewGradient() {
  const start = document.getElementById("gradientStart").value.trim();
  const end = document.getElementById("gradientEnd").value.trim();
  if (!isValidHex(start) || !isValidHex(end)) return;

  document.getElementById("gradientPreview").style.background = `linear-gradient(90deg, ${start}, ${end})`;
  document.getElementById("gradientPreview").style.border = `2px solid ${start}`;
  document.getElementById("gradientCSS").textContent = `background: linear-gradient(90deg, ${start}, ${end});`;
}

function isValidHex(hex) {
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(hex);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(rgbStr) {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  return '#' + match.slice(0, 3).map(n => {
    const hex = parseInt(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hslToHex(hslStr) {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i);
  if (!match) return '#000000';
  let [h, s, l] = match.slice(1).map(Number);
  s /= 100; l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s
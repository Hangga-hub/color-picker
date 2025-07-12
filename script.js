document.addEventListener("DOMContentLoaded", () => {
  // Load navbar
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

// 🔧 Live sync between fields
function setupColorSync() {
  const hexInput = document.getElementById("hexInput");
  const rgbInput = document.getElementById("rgbInput");
  const hslInput = document.getElementById("hslInput");

  hexInput.addEventListener("input", () => updatePreview(hexInput.value.trim()));
  rgbInput.addEventListener("input", () => {
    const hex = rgbToHex(rgbInput.value.trim());
    updatePreview(hex);
  });
  hslInput.addEventListener("input", () => {
    const hex = hslToHex(hslInput.value.trim());
    updatePreview(hex);
  });
}

// 🎲 Random color generator
function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const hex = hslToHex(`hsl(${hue}, 100%, 50%)`);
  updatePreview(hex);
}

// 🖼️ Preview + field sync
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
}

// 📋 Copy to clipboard
function copyToClipboard() {
  const hex = document.getElementById("hexInput").value;
  navigator.clipboard.writeText(hex).then(() => {
    alert("Copied: " + hex);
  });
}

// 🔧 Color conversions
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
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(hsl) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i);
  if (!match) return '#000000';
  let [h, s, l] = match.slice(1).map(Number);
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs((h/60)%2 - 1));
  const m = l - c/2;
  let r=0,g=0,b=0;

  if (0 <= h && h < 60) [r,g,b] = [c,x,0];
  else if (h < 120)     [r,g,b] = [x,c,0];
  else if (h < 180)     [r,g,b] = [0,c,x];
  else if (h < 240)     [r,g,b] = [0,x,c];
  else if (h < 300)     [r,g,b] = [x,0,c];
  else if (h < 360)     [r,g,b] = [c,0,x];

  r = Math.round((r + m)*255);
  g = Math.round((g + m)*255);
  b = Math.round((b + m)*255);

  return rgbToHex(`rgb(${r}, ${g}, ${b})`);
}

(function () {
  "use strict";

  const field = document.getElementById("petalField");
  if (!field) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = prefersReducedMotion ? 8 : 24;

  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement("span");
    petal.className = "falling-petal";

    const size = 7 + Math.random() * 10;
    const duration = prefersReducedMotion ? 0 : 11 + Math.random() * 13;
    const delay = prefersReducedMotion ? 0 : -Math.random() * duration;
    const drift = -55 + Math.random() * 110;
    const sway = 24 + Math.random() * 46;
    const opacity = 0.22 + Math.random() * 0.42;

    petal.style.setProperty("--left", `${Math.random() * 100}%`);
    petal.style.setProperty("--size", `${size}px`);
    petal.style.setProperty("--duration", `${duration}s`);
    petal.style.setProperty("--delay", `${delay}s`);
    petal.style.setProperty("--drift", `${drift}px`);
    petal.style.setProperty("--sway", `${sway}px`);
    petal.style.setProperty("--opacity", opacity.toFixed(2));
    petal.style.setProperty("--rotation", `${Math.floor(Math.random() * 360)}deg`);

    field.appendChild(petal);
  }
})();

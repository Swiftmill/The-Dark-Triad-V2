(function () {
  const GLYPH_RATE_MS = 80;
  const REVEAL_STEP_MS = 14;
  const REVERT_DELAY_MS = 500;

  const registry = new Map();
  const intervals = new Map();
  const revealTimers = new Map();
  const revertTimers = new Map();
  const startTimers = new Map();
  let reducedMotion = false;

  function applyGlyph(element, glyphs) {
    if (!glyphs.length) return;
    const state = registry.get(element);
    state.currentIndex = (state.currentIndex + 1) % glyphs.length;
    element.textContent = glyphs[state.currentIndex];
  }

  function cycleElement(element, rateMs) {
    const state = registry.get(element);
    if (!state) return;
    clearInterval(intervals.get(element));
    if (!state.glyphs.length) {
      element.textContent = state.real;
      return;
    }
    if (reducedMotion) {
      element.textContent = state.real;
      return;
    }
    const interval = window.setInterval(() => {
      applyGlyph(element, state.glyphs);
    }, Math.max(1, rateMs));
    intervals.set(element, interval);
  }

  function startGlyphCycle(rateMs = GLYPH_RATE_MS) {
    registry.forEach((state, element) => {
      const delay = state.seedOffset;
      window.clearInterval(intervals.get(element));
      window.clearTimeout(startTimers.get(element));
      if (reducedMotion) {
        element.textContent = state.real;
        return;
      }
      const effectiveRate = Math.max(1, state.rateMs || rateMs);
      const timerId = window.setTimeout(() => cycleElement(element, effectiveRate), delay);
      startTimers.set(element, timerId);
    });
  }

  function stopGlyphCycle() {
    intervals.forEach((intervalId) => window.clearInterval(intervalId));
    intervals.clear();
    startTimers.forEach((timeoutId) => window.clearTimeout(timeoutId));
    startTimers.clear();
  }

  function revealRealText(element, text, stepMs = REVEAL_STEP_MS) {
    const state = registry.get(element);
    if (!state) return;
    window.clearInterval(intervals.get(element));
    window.clearTimeout(revertTimers.get(element));
    window.clearTimeout(revealTimers.get(element));

    if (reducedMotion) {
      element.textContent = text;
      return;
    }

    const targetChars = text.split("");
    const currentChars = element.textContent.padEnd(targetChars.length, " ").split("");
    let index = 0;

    const tick = () => {
      if (index >= targetChars.length) {
        element.textContent = text;
        return;
      }
      currentChars[index] = targetChars[index];
      element.textContent = currentChars.join("");
      index += 1;
      revealTimers.set(element, window.setTimeout(tick, Math.max(1, stepMs)));
    };

    tick();
  }

  function scheduleRevert(element, rateMs) {
    const state = registry.get(element);
    if (!state) return;
    window.clearTimeout(revertTimers.get(element));
    if (reducedMotion) {
      element.textContent = state.real;
      return;
    }
    const effectiveRate = Math.max(1, state.rateMs || rateMs);
    revertTimers.set(
      element,
      window.setTimeout(() => {
        if (state.glyphs.length) {
          state.currentIndex = Math.floor(Math.random() * state.glyphs.length);
          applyGlyph(element, state.glyphs);
        }
        cycleElement(element, effectiveRate);
      }, REVERT_DELAY_MS)
    );
  }

  function attachGlyphInteraction(element, glyphData, options = {}) {
    const glyphs = Array.isArray(glyphData.glyphs) ? glyphData.glyphs.slice() : [];
    const real = glyphData.real || element.textContent;
    const rateMs = options.rateMs || GLYPH_RATE_MS;
    const stepMs = options.stepMs || REVEAL_STEP_MS;
    const poolLength = glyphs.length || real.length || 1;
    const seedOffset = Math.floor(Math.random() * poolLength * rateMs);
    registry.set(element, {
      glyphs,
      real,
      currentIndex: Math.floor(Math.random() * poolLength),
      seedOffset,
      rateMs,
    });

    element.setAttribute("aria-label", real);
    element.dataset.realText = real;

    const enterHandler = () => revealRealText(element, real, stepMs);
    const leaveHandler = () => scheduleRevert(element, rateMs);

    element.addEventListener("mouseenter", enterHandler);
    element.addEventListener("focus", enterHandler);
    element.addEventListener("mouseleave", leaveHandler);
    element.addEventListener("blur", leaveHandler);

    if (glyphs.length === 0) {
      element.textContent = real;
    } else {
      applyGlyph(element, glyphs);
    }
  }

  function setReducedMotion(value) {
    reducedMotion = Boolean(value);
    if (reducedMotion) {
      stopGlyphCycle();
      registry.forEach((state, element) => {
        element.textContent = state.real;
      });
    } else {
      startGlyphCycle();
    }
  }

  window.GlyphEngine = {
    attachGlyphInteraction,
    startGlyphCycle,
    revealRealText,
    setReducedMotion,
  };
})();

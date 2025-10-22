(function () {
  const GLYPH_SOURCE = "assets/data/glyphs.json";
  const GLYPH_RATE_MS = 80;
  const GLYPH_REVEAL_STEP = 16;
  const BACKGROUND_FADE_MS = 450;
  const BACKGROUNDS = [
    {
      type: "video",
      src: "assets/media/hero.mp4",
      poster: "assets/media/hero-fallback.jpg"
    },
    {
      type: "image",
      src: "assets/media/hero-fallback.jpg"
    }
  ];

  const boardFeed = [
    { stamp: "02:13 UTC", title: "TRIARCH SIGNAL", body: "Waveform sync achieved across western cluster." },
    { stamp: "04:56 UTC", title: "ARCHIVE DELTA", body: "Layered dossier unlocked – initiate silent review." },
    { stamp: "07:22 UTC", title: "COUNCIL ENTRY", body: "Three seats filled. Awaiting cipher to convene." }
  ];

  const tributeFeed = [
    { name: "Adept Nova", src: createGradientURI("#4d2c7a", "#d6a13b"), caption: "Decoded relic coordinates hidden in solar flare spectrums." },
    { name: "Cipher Vox", src: createGradientURI("#0b3a44", "#a7ffd6"), caption: "Interlaced dormant frequencies with the triad chorus." },
    { name: "Veil Hunter", src: createGradientURI("#381111", "#ff9090"), caption: "Recovered tablets from submerged vaults beneath the delta." },
    { name: "Katalyst", src: createGradientURI("#091b38", "#6bc7ff"), caption: "Amplified the glyph lattice for remote initiates." }
  ];

  let backgroundIndex = 0;
  let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.dataset.reducedMotion = prefersReducedMotion ? "true" : "false";
    initializeBackground();
    buildBoard();
    buildTributes();
    setupContactForm();
    setupHeroInteraction();
    observeSections();
    loadGlyphs();

    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", (event) => {
        prefersReducedMotion = event.matches;
        document.body.dataset.reducedMotion = prefersReducedMotion ? "true" : "false";
        GlyphEngine.setReducedMotion(prefersReducedMotion);
        initializeBackground();
      });
  });

  function loadGlyphs() {
    fetch(GLYPH_SOURCE)
      .then((response) => response.json())
      .then((data) => {
        const container = document.getElementById("glyph-buttons");
        container.innerHTML = "";
        data.forEach((glyph, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "glyph-button";
          button.dataset.anchor = `#${glyph.id}`;
          button.dataset.seed = index;
          button.textContent = glyph.glyphs[0] || glyph.real;
          container.appendChild(button);
          GlyphEngine.attachGlyphInteraction(button, glyph, {
            rateMs: GLYPH_RATE_MS,
            stepMs: GLYPH_REVEAL_STEP,
          });
          button.addEventListener("click", () => navigateToAnchor(glyph.id));
        });

        if (!prefersReducedMotion) {
          GlyphEngine.startGlyphCycle(GLYPH_RATE_MS);
        } else {
          GlyphEngine.setReducedMotion(true);
        }
      })
      .catch((error) => {
        console.error("Unable to load glyph data", error);
      });
  }

  function navigateToAnchor(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const motionEnabled = !prefersReducedMotion;
    const behavior = motionEnabled ? "smooth" : "auto";
    target.scrollIntoView({ behavior, block: "center" });
  }

  function setupHeroInteraction() {
    const heroTitle = document.getElementById("hero-title");
    heroTitle.addEventListener("click", cycleBackground);
    heroTitle.addEventListener("keypress", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cycleBackground();
      }
    });
  }

  function initializeBackground() {
    const stack = document.querySelector(".background-stack");
    stack.querySelectorAll(".media-layer").forEach((layer) => layer.remove());
    const initial = buildMediaLayer(BACKGROUNDS[backgroundIndex]);
    stack.insertBefore(initial, stack.firstChild);
    requestAnimationFrame(() => {
      initial.classList.add("active");
    });
  }

  function cycleBackground() {
    if (prefersReducedMotion) return;
    backgroundIndex = (backgroundIndex + 1) % BACKGROUNDS.length;
    swapBackground(BACKGROUNDS[backgroundIndex]);
  }

  function swapBackground(background) {
    const stack = document.querySelector(".background-stack");
    const current = stack.querySelector(".media-layer.active");
    const nextLayer = buildMediaLayer(background);
    stack.insertBefore(nextLayer, current || stack.firstChild);

    requestAnimationFrame(() => {
      nextLayer.classList.add("active");
      if (current) {
        current.classList.remove("active");
      }
    });

    window.setTimeout(() => {
      const layers = Array.from(stack.querySelectorAll(".media-layer"));
      layers.slice(2).forEach((layer) => layer.remove());
    }, BACKGROUND_FADE_MS + 100);
  }

  function buildMediaLayer(background) {
    const layer = document.createElement(background.type === "video" ? "video" : "img");
    layer.className = "background-layer media-layer";
    layer.setAttribute("aria-hidden", "true");
    if (background.type === "video") {
      layer.src = background.src;
      layer.autoplay = true;
      layer.muted = true;
      layer.loop = true;
      layer.playsInline = true;
      if (background.poster) {
        layer.poster = background.poster;
      }
    } else {
      layer.src = background.src;
      layer.alt = "";
    }
    if (background.type === "video" && background.poster && prefersReducedMotion) {
      const imageLayer = document.createElement("img");
      imageLayer.className = "background-layer media-layer active";
      imageLayer.src = background.poster;
      imageLayer.alt = "";
      return imageLayer;
    }
    return layer;
  }

  function buildBoard() {
    const list = document.getElementById("board-feed");
    boardFeed.forEach((item) => {
      const li = document.createElement("li");
      li.className = "board-item";
      const time = document.createElement("time");
      time.textContent = item.stamp;
      const title = document.createElement("strong");
      title.textContent = item.title;
      const body = document.createElement("p");
      body.textContent = item.body;
      li.append(time, title, body);
      list.appendChild(li);
    });
  }

  function buildTributes() {
    const grid = document.getElementById("tribute-grid");
    tributeFeed.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tribute-card";
      button.dataset.name = item.name;
      button.setAttribute("aria-label", `${item.name}. ${item.caption}`);
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.name;
      button.appendChild(img);
      button.addEventListener("click", () => openLightbox(item));
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(item);
        }
      });
      grid.appendChild(button);
    });
  }

  function openLightbox(item) {
    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-image");
    const caption = document.getElementById("lightbox-caption");
    image.src = item.src;
    image.alt = item.name;
    caption.textContent = item.caption;
    lightbox.hidden = false;
    lightbox.focus();
  }

  document.addEventListener("click", (event) => {
    if (event.target.matches(".lightbox-close")) {
      closeLightbox();
    }
    if (event.target.id === "lightbox") {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });

  function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox.hidden) return;
    lightbox.hidden = true;
  }

  function setupContactForm() {
    const form = document.getElementById("contact-form");
    const toast = document.getElementById("toast");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.reset();
      showToast(toast);
    });
  }

  function showToast(toast) {
    toast.hidden = false;
    toast.classList.remove("hide");
    toast.classList.add("show");
    window.setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hide");
      window.setTimeout(() => {
        toast.hidden = true;
        toast.classList.remove("hide");
      }, 300);
    }, 2500);
  }

  function observeSections() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll(".panel-inner").forEach((panel) => observer.observe(panel));
  }

  function createGradientURI(from, to) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/></linearGradient></defs><rect width='400' height='600' fill='url(%23g)'/><circle cx='280' cy='160' r='80' fill='rgba(255,255,255,0.2)'/><circle cx='120' cy='360' r='120' fill='rgba(0,0,0,0.25)'/></svg>`;
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
  }
})();

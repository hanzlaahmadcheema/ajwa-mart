/**
 * Minimal client-side behaviour for the Ajwa Mart site.
 * No frameworks, no libraries — just a few small enhancements.
 */

/* ---------- Mobile menu ---------- */

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');

function setMenu(open: boolean): void {
  mobileMenu?.classList.toggle('hidden', !open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  menuBtn?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  iconOpen?.classList.toggle('hidden', open);
  iconClose?.classList.toggle('hidden', !open);
}

menuBtn?.addEventListener('click', () => {
  setMenu(mobileMenu?.classList.contains('hidden') ?? false);
});
mobileMenu?.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => setMenu(false));
});

/* ---------- Open-now badge (Asia/Karachi time) ---------- */

function formatTime(totalMins: number): string {
  const h24 = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

function updateOpenBadge(): void {
  const el = document.getElementById('open-badge');
  if (!el) return;

  // Always evaluate in the store's timezone, wherever the visitor is.
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
  );
  const mins = now.getHours() * 60 + now.getMinutes();
  const isFriday = now.getDay() === 5;

  // Windows as [open, close] in minutes. Friday has a prayer break.
  const windows: Array<[number, number]> = isFriday
    ? [
        [360, 795], // 6:00 AM – 1:15 PM
        [855, 1380], // 2:15 PM – 11:00 PM
      ]
    : [[360, 1380]]; // 6:00 AM – 11:00 PM

  const current = windows.find(([open, close]) => mins >= open && mins < close);

  let label: string;
  let openNow: boolean;
  if (current) {
    openNow = true;
    label = `Open now · Closes ${formatTime(current[1])}`;
  } else {
    openNow = false;
    const upcoming = windows.find(([, close]) => mins < close);
    if (upcoming) {
      label = `Closed · Opens ${formatTime(upcoming[0])} today`;
    } else {
      label = `Closed · Opens ${formatTime(360)} tomorrow`;
    }
  }

  const dotClass = openNow ? 'bg-brand-green' : 'bg-brand-maroon';
  el.innerHTML =
    `<span class="h-2.5 w-2.5 rounded-full ${dotClass}" aria-hidden="true"></span>` +
    `<span>${label}</span>`;
  el.classList.toggle('bg-brand-green-soft', openNow);
  el.classList.toggle('bg-brand-yellow-soft', !openNow);
}

updateOpenBadge();
// Refresh once a minute so the badge stays accurate while the page is open.
window.setInterval(updateOpenBadge, 60_000);

/* ---------- Footer year ---------- */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ---------- Scroll reveal ---------- */

const revealEls = Array.from(
  document.querySelectorAll<HTMLElement>('[data-reveal]'),
);

if (revealEls.length > 0) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Very old browsers: show everything immediately.
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
}

/* ---------- Wandering star spark ---------- */
/*
 * ONE continuous, always-visible spark per patterned section. The spark
 * traces a small bright-headed streak along part of one background star's
 * edge (with a short diminishing trail and a tiny radiant glint riding at
 * the head), then glides — never vanishing — to another random star and
 * continues. The pattern itself is never animated.
 */

const STAR_TILE = 96;
const SVG_NS = 'http://www.w3.org/2000/svg';

const norm100 = (v: number): number => ((v % 100) + 100) % 100;
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

interface TrailSeg {
  len: number;
  gap: number;
  el: SVGPathElement;
}

class StarSpark {
  private svg: SVGSVGElement;
  private spark: SVGGElement;
  private edge: SVGGElement;
  private head: SVGPathElement;
  private trail: TrailSeg[];
  private glint: SVGGElement;
  private rays: SVGGElement;
  private totalLen = 1;
  private cols = 1;
  private rows = 1;
  private running = false;
  private session = 0;
  private rafId = 0;
  private waitId = 0;
  private headPos = { x: 0, y: 0 };
  private twPhase = 0;

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    const spark = svg.querySelector('.spark');
    const edge = svg.querySelector('.edge');
    const head = svg.querySelector('.edge-head');
    const t1 = svg.querySelector('.edge-t1');
    const t2 = svg.querySelector('.edge-t2');
    const t3 = svg.querySelector('.edge-t3');
    const glint = svg.querySelector('.glint');
    const rays = svg.querySelector('.rays');
    if (
      !(spark instanceof SVGGElement) ||
      !(edge instanceof SVGGElement) ||
      !(head instanceof SVGPathElement) ||
      !(t1 instanceof SVGPathElement) ||
      !(t2 instanceof SVGPathElement) ||
      !(t3 instanceof SVGPathElement) ||
      !(glint instanceof SVGGElement) ||
      !(rays instanceof SVGGElement)
    ) {
      return;
    }
    this.spark = spark;
    this.edge = edge;
    this.head = head;
    this.glint = glint;
    this.rays = rays;
    this.trail = [
      { len: 6, gap: 2.5, el: t1 },
      { len: 8, gap: 2, el: t2 },
      { len: 10, gap: 2, el: t3 },
    ];
    this.totalLen = head.getTotalLength() || 1;
    this.measure();
    window.addEventListener('resize', () => this.measure());
    // Only animate while the section is actually on screen.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) this.start();
        else this.stop();
      });
    });
    io.observe(svg);
  }

  private measure(): void {
    this.cols = Math.max(1, Math.ceil((this.svg.clientWidth || STAR_TILE) / STAR_TILE));
    this.rows = Math.max(1, Math.ceil((this.svg.clientHeight || STAR_TILE) / STAR_TILE));
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.session++;
    this.spark.setAttribute('opacity', '1');
    void this.loop(this.session);
  }

  private stop(): void {
    this.running = false;
    this.session++;
    cancelAnimationFrame(this.rafId);
    window.clearTimeout(this.waitId);
    this.spark.setAttribute('opacity', '0');
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.waitId = window.setTimeout(resolve, ms);
    });
  }

  private tileOf(index: number): { x: number; y: number } {
    return { x: (index % this.cols) * STAR_TILE, y: Math.floor(index / this.cols) * STAR_TILE };
  }

  /** Random star; usually a nearby one for an organic wander, sometimes far. */
  private pickStar(exclude: number, nearTo: number): number {
    const total = this.cols * this.rows;
    if (total <= 1) return 0;
    const ci = nearTo % this.cols;
    const cj = Math.floor(nearTo / this.cols);
    const useNear = nearTo >= 0 && Math.random() < 0.75;
    for (let tries = 0; tries < 12; tries++) {
      let idx: number;
      if (useNear) {
        const ni = Math.min(this.cols - 1, Math.max(0, ci + Math.floor(Math.random() * 5) - 2));
        const nj = Math.min(this.rows - 1, Math.max(0, cj + Math.floor(Math.random() * 5) - 2));
        idx = nj * this.cols + ni;
      } else {
        idx = Math.floor(Math.random() * total);
      }
      if (idx !== exclude) return idx;
    }
    return (exclude + 1) % total;
  }

  /** Draw the streak centered at path position p (0-100), heading dir. */
  private drawStreak(p: number, dir: 1 | -1): void {
    const HEAD_LEN = 5;
    this.head.setAttribute('stroke-dasharray', `${HEAD_LEN} ${100 - HEAD_LEN}`);
    this.head.setAttribute('stroke-dashoffset', norm100(HEAD_LEN / 2 - p).toFixed(2));
    let back = HEAD_LEN / 2;
    for (const seg of this.trail) {
      back += seg.gap;
      const c = p - dir * (back + seg.len / 2);
      back += seg.len;
      seg.el.setAttribute('stroke-dasharray', `${seg.len} ${100 - seg.len}`);
      seg.el.setAttribute('stroke-dashoffset', norm100(seg.len / 2 - c).toFixed(2));
    }
  }

  /** Local (0-96 box) coords of path position p (0-100). */
  private pointAt(p: number): { x: number; y: number } {
    const pt = this.head.getPointAtLength((norm100(p) / 100) * this.totalLen);
    return { x: pt.x, y: pt.y };
  }

  private placeGlint(x: number, y: number): void {
    this.headPos = { x, y };
    this.glint.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  }

  /** Subtle shimmer on the radiating rays. */
  private twinkle(): void {
    const t = performance.now() / 1000;
    const s = 1 + 0.1 * Math.sin(t * 3.1 + this.twPhase);
    const r = 7 * Math.sin(t * 1.7 + this.twPhase);
    this.rays.setAttribute('transform', `rotate(${r.toFixed(2)}) scale(${s.toFixed(3)})`);
  }

  /** Fresh random ray pattern for each star visit. */
  private buildRays(): void {
    while (this.rays.firstChild) this.rays.removeChild(this.rays.firstChild);
    this.twPhase = Math.random() * Math.PI * 2;
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const len = 4 + Math.random() * 5;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', (Math.cos(ang) * len).toFixed(2));
      line.setAttribute('y2', (Math.sin(ang) * len).toFixed(2));
      this.rays.appendChild(line);
    }
  }

  private enterStar(star: number): void {
    const t = this.tileOf(star);
    this.edge.setAttribute('transform', `translate(${t.x} ${t.y})`);
    this.edge.setAttribute('opacity', '1');
  }

  private async loop(session: number): Promise<void> {
    const alive = (): boolean => this.running && session === this.session;
    await this.wait(300 + Math.random() * 1400);
    if (!alive()) return;
    this.buildRays();
    let star = this.pickStar(-1, -1);
    let f0 = Math.random() * 100;
    let dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    while (alive()) {
      const arc = 14 + Math.random() * 20;
      const traceDur = 1300 + Math.random() * 900;
      this.enterStar(star);
      await this.animateTrace(star, f0, dir, arc, traceDur, session);
      if (!alive()) break;
      const next = this.pickStar(star, star);
      const nf0 = Math.random() * 100;
      const ndir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      await this.animateTravel(f0, dir, arc, next, nf0, ndir, session);
      if (!alive()) break;
      star = next;
      f0 = nf0;
      dir = ndir;
    }
  }

  /** Trace a small arc of one star's edge; the glint rides at the head. */
  private animateTrace(
    star: number,
    f0: number,
    dir: 1 | -1,
    arc: number,
    duration: number,
    session: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      const tile = this.tileOf(star);
      const t0 = performance.now();
      const tick = (now: number): void => {
        if (!this.running || session !== this.session) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - t0) / duration);
        const p = f0 + dir * arc * easeInOut(t);
        this.drawStreak(p, dir);
        const pt = this.pointAt(p);
        this.placeGlint(tile.x + pt.x, tile.y + pt.y);
        this.twinkle();
        if (t < 1) this.rafId = requestAnimationFrame(tick);
        else resolve();
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  /**
   * Glide to the next star along a gentle curve. The glint stays at full
   * brightness the whole way; only the edge streak crossfades.
   */
  private animateTravel(
    f0: number,
    dir: 1 | -1,
    arc: number,
    next: number,
    nf0: number,
    ndir: 1 | -1,
    session: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      const p0 = { ...this.headPos };
      const nt = this.tileOf(next);
      const entry = this.pointAt(nf0);
      const p1 = { x: nt.x + entry.x, y: nt.y + entry.y };
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy) || 1;
      const bow = (24 + Math.random() * 40) * (Math.random() < 0.5 ? -1 : 1);
      const ctrl = {
        x: (p0.x + p1.x) / 2 + (-dy / dist) * bow,
        y: (p0.y + p1.y) / 2 + (dx / dist) * bow,
      };
      const duration = 550 + Math.random() * 550;
      // Pre-position the edge streak on the next star (still invisible).
      this.edge.setAttribute('transform', `translate(${nt.x} ${nt.y})`);
      this.drawStreak(nf0, ndir);
      this.buildRays();
      const t0 = performance.now();
      const tick = (now: number): void => {
        if (!this.running || session !== this.session) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - t0) / duration);
        const e = easeInOut(t);
        const x = (1 - e) * (1 - e) * p0.x + 2 * (1 - e) * e * ctrl.x + e * e * p1.x;
        const y = (1 - e) * (1 - e) * p0.y + 2 * (1 - e) * e * ctrl.y + e * e * p1.y;
        this.placeGlint(x, y);
        this.twinkle();
        const op = t < 0.22 ? 1 - t / 0.22 : t > 0.78 ? (t - 0.78) / 0.22 : 0;
        this.edge.setAttribute('opacity', op.toFixed(3));
        if (t < 1) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.edge.setAttribute('opacity', '1');
          resolve();
        }
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<SVGSVGElement>('.spark-layer').forEach((svg) => {
    new StarSpark(svg);
  });
}

/* ---------- Active nav link highlighting ---------- */

const navAnchors = Array.from(
  document.querySelectorAll<HTMLAnchorElement>('[data-navlink]'),
);
const observed = navAnchors
  .map((a) => document.querySelector(a.hash))
  .filter((s): s is Element => s !== null);

if ('IntersectionObserver' in window && observed.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((a) => {
          const active = a.hash === `#${entry.target.id}`;
          a.classList.toggle('text-brand-maroon', active);
          if (active) {
            a.setAttribute('aria-current', 'true');
          } else {
            a.removeAttribute('aria-current');
          }
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  observed.forEach((s) => observer.observe(s));
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCart } from '@/context/CartContext';
import ClothesLoader from '@/components/ClothesLoader';

gsap.registerPlugin(useGSAP);

const TRENDING_ORDER_STORAGE_KEY = 'attire_trending_selection_order';
const ADMIN_TRENDING_ORDER_KEY = 'attire_admin_trending_order';
const TRENDING_POLL_MS = 5000;

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [copies, setCopies] = useState(4);

  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const hoverTimer = useRef(null);
  const hoverRail = useRef(false);
  const lastKey = useRef('');
  const swayRef = useRef([]);
  const activeRef = useRef(null);
  const touchHold = useRef(false);
  const prevOpen = useRef(null);
  const scrollTween = useRef(null);
  const lastOpen = useRef(-1);
  const downActive = useRef(false); // was this garment already open when the finger/mouse went down?
  const touchTimer = useRef(null);
  const lastSignature = useRef('');

  const categories = [
    { name: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', count: '12+ Items' },
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', count: '8+ Items' },
    { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', count: '15+ Items' },
    { name: 'Pants', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop', count: '10+ Items' },
  ];

  const loadTrending = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await fetch('/api/products', { cache: 'no-store' });
      // If the server answers with an HTML error page, skip this refresh instead of throwing
      const data = await res.json().catch(() => null);
      if (!data || !data.success) return;

      const rawProducts = data.products || [];

      let savedOrder = [];
      try {
        [TRENDING_ORDER_STORAGE_KEY, ADMIN_TRENDING_ORDER_KEY].forEach((key) => {
          const stored = localStorage.getItem(key);
          if (stored) savedOrder = [...savedOrder, ...JSON.parse(stored).map(String)];
        });
      } catch (e) {
        console.error('Failed to read trending order', e);
      }

      const featuredProducts = rawProducts.filter((p) => p.isFeatured === true);

      // Admin order: items with a server timestamp follow the order they were added;
      // older items (no timestamp) keep the saved/legacy order and come first.
      const timed = featuredProducts
        .filter((p) => p.trendingAt)
        .sort((a, b) => new Date(a.trendingAt) - new Date(b.trendingAt));
      const untimed = featuredProducts
        .filter((p) => !p.trendingAt)
        .sort((a, b) => {
          const ia = savedOrder.indexOf(String(a._id));
          const ib = savedOrder.indexOf(String(b._id));
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
      const orderedFeatured = [...untimed, ...timed];

      const nonFeatured = rawProducts
        .filter((p) => !p.isFeatured)
        .sort((a, b) => Number(b.offer || 0) - Number(a.offer || 0));

      const combined = orderedFeatured.length > 0 ? orderedFeatured.slice(0, 7) : nonFeatured;

      // Only update state when something visible changed (keeps the rail from restarting)
      const signature = JSON.stringify(
        combined.map((p) => [p._id, p.title, p.description, p.category, p.price, p.offer, p.images?.[0]])
      );
      if (signature !== lastSignature.current) {
        lastSignature.current = signature;
        setProducts(combined);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  // Initial load + real-time sync with the admin trending manager
  useEffect(() => {
    loadTrending(true);

    const refresh = () => {
      if (!document.hidden) loadTrending();
    };
    const poll = setInterval(refresh, TRENDING_POLL_MS);
    const onStorage = (e) => {
      // Admin portal open in another tab of this browser: refetch right after its save lands
      if (e.key === ADMIN_TRENDING_ORDER_KEY || e.key === TRENDING_ORDER_STORAGE_KEY) {
        setTimeout(refresh, 800);
      }
    };

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadTrending]);

  activeRef.current = activeIndex;

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // Touch / small screens have no hover, so the rail drifts by itself there
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px), (hover: none)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Enough repeated copies to fill the rail edge to edge while it drifts (1 when motion is reduced)
  useEffect(() => {
    const calc = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setCopies(1);
        return;
      }
      const small = window.innerWidth < 640;
      const slot = small ? 52 + 12 : 76 + 20;
      const setWidth = Math.max(1, products.length) * slot;
      setCopies(Math.min(12, Math.max(4, Math.ceil(window.innerWidth / setWidth) + 2)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [products.length]);

  // Mobile: an opened garment stays open ~3s (after its 0.9s turn), then closes so the drift resumes
  useEffect(() => {
    if (!isMobile || activeIndex === null) return;
    const t = setTimeout(() => setActiveIndex(null), 3900);
    return () => clearTimeout(t);
  }, [isMobile, activeIndex]);

  // Hover intent: avoids flicker while neighbours slide apart
  const openItem = (i) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveIndex(i), 50);
  };
  const closeRail = () => {
    clearTimeout(hoverTimer.current);
    setActiveIndex(null);
  };

  // Start a swing that fades out on its own after a few seconds
  const lastMove = useRef(0);
  const nudgeItem = (i, strength) => {
    const o = swayRef.current[i];
    if (!o) return;
    o.start = gsap.ticker.time;
    o.energy = Math.max(o.energy, strength);
    gsap.to(o, { energy: 0, duration: 3.2, ease: 'power2.out', overwrite: 'auto' });
  };

  // GSAP: garments hang edge-on; the hovered one swings round to face the shopper
  const trendingKey = products.map((p) => p._id).join(',') + (isMobile ? '|m' : '') + '|c' + copies;
  useGSAP(
    () => {
      if (loading || !trendingKey) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const small = window.innerWidth < 640;
      const collapsedW = small ? 52 : 76;
      const expandedW = small ? 256 : 296;
      const dur = reduce ? 0 : isMobile ? 0.9 : 0.65;
      const ease = isMobile ? 'power2.inOut' : 'power3.out';
      const items = gsap.utils.toArray('.rail-item');
      const isNewLineup = lastKey.current !== trendingKey;
      lastKey.current = trendingKey;

      const cardW = small ? 240 : 280;

      items.forEach((item, i) => {
        const active = i === activeIndex;
        const hasSide = item.dataset.side === '1';
        const card = item.querySelector('.rail-card');
        const hanger = item.querySelector('.rail-hanger');
        const info = item.querySelectorAll('.rail-info, .rail-badge');
        const front = item.querySelector('.rail-front');
        const side = item.querySelector('.rail-side');

        // [target, vars, extra tween options]
        const plan = [
          [item, { width: active ? expandedW : collapsedW }, {}],
          [hanger, { rotationY: active ? 0 : -84, transformPerspective: 1400, transformOrigin: '50% 0%' }, {}], // hanger also turns edge-on
          [
            info,
            { opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' },
            { dur: dur * 0.6, delay: active ? dur * 0.45 : 0 },
          ],
        ];

        if (hasSide) {
          // Uploaded side photo: slim garment showing the side view, opens to the front photo
          plan.push([card, { rotationY: 0, transformPerspective: 1600, width: active ? cardW : collapsedW }, {}]);
          if (front) plan.push([front, { opacity: active ? 1 : 0 }, { dur: dur * 0.7 }]);
          if (side) plan.push([side, { opacity: active ? 0 : 1 }, { dur: dur * 0.7 }]);
        } else {
          // No side photo: fall back to turning the front photo edge-on
          plan.push([
            card,
            { rotationY: active ? 0 : -72, transformPerspective: 1600, transformOrigin: '50% 50%' },
            {},
          ]);
        }

        plan.forEach(([target, vars, extra]) => {
          if (!target) return;
          if (isNewLineup) {
            gsap.set(target, vars);
          } else {
            gsap.to(target, {
              ...vars,
              duration: extra.dur ?? dur,
              delay: extra.delay ?? 0,
              ease,
              overwrite: 'auto',
            });
          }
        });

      });

      // Mobile: glide the rail in step with the width change, so the garment opens/closes
      // around the middle of the screen and its neighbours move smoothly (no jumps)
      const scroller = scrollRef.current;
      if (isMobile && scroller && !isNewLineup) {
        const rowsAll = scroller.querySelectorAll('.rail-item');
        const startScroll = scroller.scrollLeft;
        let endScroll = null;

        if (activeIndex !== null && rowsAll[activeIndex]) {
          // final position of the row once any garment that is closing has finished shrinking
          let left = rowsAll[activeIndex].offsetLeft;
          const prev = prevOpen.current;
          if (prev !== null && prev < activeIndex && rowsAll[prev]) {
            left -= Math.max(0, rowsAll[prev].offsetWidth - collapsedW);
          }
          endScroll = left + expandedW / 2 - scroller.clientWidth / 2;
        } else if (activeIndex === null && prevOpen.current !== null && rowsAll[prevOpen.current]) {
          // line the next garment up just before the middle so the showcase carries on
          const gap = parseFloat(getComputedStyle(rowsAll[0].parentElement).columnGap) || 12;
          const closedRow = rowsAll[prevOpen.current];
          endScroll = closedRow.offsetLeft + collapsedW + gap + collapsedW / 2 - 28 - scroller.clientWidth / 2;
        }

        scrollTween.current?.kill();
        if (endScroll !== null) {
          const target = Math.max(0, endScroll);
          const prog = { p: 0 };
          scrollTween.current = gsap.to(prog, {
            p: 1,
            duration: dur,
            ease,
            onUpdate: () => {
              scroller.scrollLeft = startScroll + (target - startScroll) * prog.p;
            },
          });
        }
      }
      prevOpen.current = activeIndex;

      // Real-hanging feel: the hovered garment starts swinging, neighbours get nudged
      if (!reduce && !isNewLineup && activeIndex !== null) {
        nudgeItem(activeIndex, 1);
        nudgeItem(activeIndex - 1, 0.45);
        nudgeItem(activeIndex + 1, 0.45);
      }

      if (isNewLineup && !reduce) {
        gsap.fromTo(
          items,
          { y: -40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.6)',
            stagger: 0.07,
            clearProps: 'transform,opacity',
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [activeIndex, trendingKey, loading] }
  );

  // GSAP: pendulum swing on each hook, driven only by hover energy (rests when energy is 0)
  useGSAP(
    () => {
      swayRef.current = [];
      if (loading || !trendingKey) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const state = gsap.utils.toArray('.rail-sway').map((el, i) => {
        gsap.set(el, { transformOrigin: '50% 0%' });
        return { el, energy: 0, start: 0, resting: true, speed: 4.2 + (i % 3) * 0.5 };
      });
      swayRef.current = state;

      const tick = (time) => {
        state.forEach((o) => {
          if (o.energy < 0.002) {
            if (!o.resting) {
              gsap.set(o.el, { rotation: 0 });
              o.resting = true;
            }
            return;
          }
          o.resting = false;
          gsap.set(o.el, { rotation: Math.sin((time - o.start) * o.speed) * 4 * o.energy });
        });
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        swayRef.current = [];
      };
    },
    { scope: sectionRef, dependencies: [trendingKey, loading] }
  );

  // GSAP: auto-drift right to left (all screens), looping seamlessly over repeated copies;
  // on desktop it pauses while the cursor is over the rail
  useGSAP(
    () => {
      const el = scrollRef.current;
      if (loading || !trendingKey || !el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      let pos = el.scrollLeft;
      let prevMid = pos + el.clientWidth / 2;
      const count = products.length;
      const tick = (time, delta) => {
        const rows = el.querySelectorAll('.rail-item');
        const first = rows[0];
        const next = rows[count];
        if (!first || !next) return;

        const openIdx = activeRef.current;

        if (openIdx !== null) lastOpen.current = openIdx;

        // paused while the shopper is touching/swiping or a garment is open
        if (
          touchHold.current ||
          hoverRail.current ||
          openIdx !== null ||
          document.hidden ||
          scrollTween.current?.isActive()
        ) {
          pos = el.scrollLeft;
          prevMid = pos + el.clientWidth / 2;
          return;
        }

        if (Math.abs(el.scrollLeft - pos) > 3) pos = el.scrollLeft; // shopper scrolled by hand
        const setWidth = next.offsetLeft - first.offsetLeft;
        pos += 0.045 * delta; // ~45px per second
        let wrapped = false;
        if (setWidth > 0 && pos >= setWidth) {
          pos -= setWidth;
          wrapped = true;
        }
        el.scrollLeft = pos;

        // Showcase (touch screens): the garment crossing the middle of the screen opens by itself
        const mid = pos + el.clientWidth / 2;
        if (!wrapped && isMobile) {
          for (let g = 0; g < rows.length; g++) {
            const c = rows[g].offsetLeft + rows[g].offsetWidth / 2;
            if (c > prevMid && c <= mid && g !== lastOpen.current) {
              lastOpen.current = g;
              activeRef.current = g; // pause the drift immediately
              setActiveIndex(g);
              break;
            }
          }
        }
        prevMid = mid;
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: sectionRef, dependencies: [isMobile, trendingKey, loading] }
  );

  // On mobile the lineup is repeated so the loop never shows a gap
  const railItems = Array.from({ length: copies }, (_, c) => c).flatMap((copy) =>
    products.map((p) => ({ product: p, key: `${p._id}-${copy}` }))
  );

  const handleQuickAdd = (product, finalPrice, e) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Default';

    addToCart({ ...product, price: finalPrice }, defaultSize, defaultColor, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 bg-white text-gray-900 overflow-x-hidden">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. Immersive HangOver Hero Banner Section */}
      <section className="relative w-full bg-black text-white overflow-hidden">
        <div className="relative w-full min-h-[52vh] sm:min-h-[60vh] md:aspect-[2.4/1] flex items-end">
          <img
            src="/hero-banner.png"
            alt="HangOver Streetwear Collection"
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = '/hero-banner.jpg';
              }
            }}
          />

          {/* Bottom vignette for text/button readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

          {/* Action Buttons overlay */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 pb-6 sm:pb-10">
            <div className="flex items-center justify-start gap-3 max-w-md sm:max-w-none">
              <Link
                href="/catalog"
                className="flex-1 sm:flex-initial text-center px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-black/95 hover:bg-black rounded-xl border border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.45)] transition-all duration-200 active:scale-95 hover:border-orange-400"
              >
                Shop Now
              </Link>

              <Link
                href="/new-arrivals"
                className="flex-1 sm:flex-initial text-center px-6 py-3 text-xs sm:text-sm font-bold tracking-wide text-gray-200 hover:text-white bg-black/75 hover:bg-black/95 backdrop-blur-md rounded-xl border border-white/20 transition-all duration-200 active:scale-95 shadow-md"
              >
                View New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trending Section (Above Category Grid) */}
      <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trending Now</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Discover what our community is loving right now.</p>
          </div>

          <Link href="/catalog" className="text-orange-500 font-bold text-xs sm:text-sm hover:underline flex items-center space-x-1 shrink-0">
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ClothesLoader text="Loading trending items..." />
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-500 text-sm">
            No items available right now.
          </div>
        ) : (
          <div className="relative">
            {/* Chrome clothing rail */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-3 rounded-full bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500 shadow-[0_6px_10px_-4px_rgba(0,0,0,0.35)]" />

            <div
              ref={scrollRef}
              onMouseEnter={() => {
                if (!isMobile) hoverRail.current = true;
              }}
              onMouseLeave={() => {
                hoverRail.current = false;
                if (!isMobile) closeRail();
              }}
              onTouchStart={() => {
                touchHold.current = true;
                clearTimeout(touchTimer.current);
              }}
              onTouchEnd={() => {
                clearTimeout(touchTimer.current);
                touchTimer.current = setTimeout(() => {
                  touchHold.current = false;
                }, 2500);
              }}
              className="overflow-x-auto no-scrollbar pb-6 sm:[mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]"
            >
              <div className="flex w-max mx-auto items-start gap-3 sm:gap-5 px-1">
                {railItems.map(({ product, key }, idx) => {
                  const originalPrice = Number(product.price) || 0;
                  const offerPercent = Number(product.offer) || 0;
                  const hasOffer = offerPercent > 0;

                  const finalPrice = hasOffer
                    ? Number((originalPrice - (originalPrice * offerPercent) / 100).toFixed(2))
                    : originalPrice;

                  return (
                    <div
                      key={key}
                      onPointerDownCapture={() => {
                        downActive.current = activeRef.current === idx;
                      }}
                      onPointerEnter={(e) => {
                        if (e.pointerType === 'mouse' && !isMobile) openItem(idx);
                      }}
                      onMouseMove={() => {
                        if (isMobile) return;
                        const now = Date.now();
                        if (now - lastMove.current > 600) {
                          lastMove.current = now;
                          nudgeItem(idx, 0.35);
                        }
                      }}
                      onFocusCapture={() => {
                        if (!isMobile) setActiveIndex(idx);
                      }}
                      onClickCapture={(e) => {
                        // Touch: first tap swings the garment round, second tap opens it.
                        // (Uses the state from when the finger went down, because focus/mouse events
                        // that follow a tap would otherwise mark it open before this click.)
                        const touchLike = isMobile || e.nativeEvent.pointerType === 'touch';
                        const alreadyOpen = touchLike ? downActive.current : activeIndex === idx;
                        if (!alreadyOpen) {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveIndex(idx);
                        }
                      }}
                      data-side={product.sideImage ? '1' : '0'}
                      className="rail-item relative shrink-0 w-[52px] sm:w-[76px]"
                    >
                      <div className="rail-sway relative flex justify-center pt-[14px] pb-[76px]">
                      {/* Wooden hanger: sits behind the garment, only the hook shows above it */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 130 52"
                        className="rail-hanger absolute top-0 left-1/2 -ml-[65px] w-[130px] h-[52px] z-0 pointer-events-none"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M65 30V24C65 20 71 18 71 12C71 7 66 4 62 6" stroke="#6b7280" strokeWidth="2.5" />
                        <path d="M65 30L30 42H100L65 30Z" stroke="#c8935a" strokeWidth="4" />
                      </svg>

                      <div className="rail-card relative z-10 shrink-0 w-[240px] sm:w-[280px] will-change-transform">
                        <Link href={`/product/${product._id}`} className="block relative">
                          <div className="h-[280px] sm:h-[340px] overflow-hidden relative">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="rail-front w-full h-full object-contain object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}

                            {product.sideImage && (
                              <img
                                src={product.sideImage}
                                alt={`${product.title} side view`}
                                className="rail-side absolute inset-0 w-full h-full object-cover object-top"
                              />
                            )}

                            {hasOffer && (
                              <span className="rail-badge absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md">
                                {offerPercent}% OFF
                              </span>
                            )}
                          </div>
                        </Link>

                        <div className="rail-info absolute top-full left-0 right-0 pt-2 text-center">
                          <Link href={`/product/${product._id}`}>
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1 hover:text-orange-500 transition">
                              {product.title}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-base font-black text-gray-900">
                              ₹{finalPrice.toLocaleString('en-IN')}
                            </span>
                            {hasOffer && (
                              <span className="text-xs font-bold text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                            <button
                              onClick={(e) => handleQuickAdd(product, finalPrice, e)}
                              className={`p-2 rounded-xl transition flex items-center justify-center ${
                                addedId === product._id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white'
                              }`}
                              aria-label="Quick Add to Cart"
                            >
                              {addedId === product._id ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Explore collections crafted for every occasion.</p>
          </div>
          <Link href="/catalog" className="text-orange-500 font-bold text-xs sm:text-sm hover:underline flex items-center space-x-1 shrink-0">
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalog?category=${cat.name}`}
              className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-extrabold text-base sm:text-lg">{cat.name}</h3>
                <p className="text-xs text-gray-300 font-medium">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
/* ===== ШинаТех — скрипт ===== */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Форматирование цены: 1600 -> «1 600 ₽» */
  function rub(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  /* ---------- Год в подвале ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Шапка при прокрутке ---------- */
  var header = $('#header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });

  /* ---------- Появление блоков при прокрутке ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Статус «Открыто / Закрыто» (время Кемеровской области, UTC+7) ---------- */
  var statusEl = $('#status');
  function updateStatus() {
    var h, m;
    try {
      var parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Novokuznetsk', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      h = parseInt(parts.filter(function (p) { return p.type === 'hour'; })[0].value, 10) % 24;
      m = parseInt(parts.filter(function (p) { return p.type === 'minute'; })[0].value, 10);
    } catch (e) {
      statusEl.textContent = 'Ежедневно с 08:00 до 19:00';
      return;
    }
    var mins = h * 60 + m;
    if (mins >= 8 * 60 && mins < 19 * 60) {
      statusEl.dataset.state = 'open';
      statusEl.textContent = 'Сейчас открыто · до 19:00';
    } else {
      statusEl.dataset.state = 'closed';
      statusEl.textContent = 'Сейчас закрыто · откроемся в 08:00';
    }
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Фильтр таблицы цен по размеру ---------- */
  var chips = $$('#sizeChips .chip');
  var rows = $$('#priceTable tbody tr');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      rows.forEach(function (r) { r.classList.toggle('is-hidden', f !== 'all' && r.dataset.size !== f); });
    });
  });

  /* ---------- Калькулятор ----------
     Цены полного комплекта берутся из таблицы цен (атрибут data-full у строк),
     поэтому, изменив цену в таблице, вы меняете и калькулятор. */
  var carPrices = {};
  var sizeOrder = [];
  rows.forEach(function (r) {
    carPrices[r.dataset.size] = parseInt(r.dataset.full, 10);
    sizeOrder.push(r.dataset.size);
  });
  var gazelEl = $('[data-gazel-set]');
  var GAZEL_SET = gazelEl ? parseInt(gazelEl.dataset.gazelSet, 10) : 4800;

  var typeBtns = $$('#calcType .seg__btn');
  var sizeStep = $('#sizeStep');
  var sizesBox = $('#calcSizes');
  var elLabel = $('#calcLabel');
  var elPrice = $('#calcPrice');
  var elNote = $('#calcNote');
  var state = { type: 'car', size: null };

  sizeOrder.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'size-btn';
    b.textContent = s;
    b.dataset.size = s;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { state.size = s; render(true); });
    sizesBox.appendChild(b);
  });

  typeBtns.forEach(function (b) {
    b.addEventListener('click', function () { state.type = b.dataset.type; render(true); });
  });

  function setPrice(text, animate) {
    elPrice.textContent = text;
    if (animate) {
      elPrice.classList.remove('pop');
      void elPrice.offsetWidth;
      elPrice.classList.add('pop');
    }
  }

  function render(animate) {
    typeBtns.forEach(function (b) {
      var on = b.dataset.type === state.type;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $$('.size-btn', sizesBox).forEach(function (b) {
      var on = b.dataset.size === state.size;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    if (state.type === 'gazel') {
      sizeStep.hidden = true;
      elLabel.textContent = 'Газель';
      setPrice(rub(GAZEL_SET), animate);
      elNote.textContent = 'Полный шиномонтаж, комплект из 4 колёс';
    } else {
      sizeStep.hidden = false;
      if (state.size && carPrices[state.size] != null) {
        elLabel.textContent = 'Легковой автомобиль, диски ' + state.size;
        setPrice(rub(carPrices[state.size]), animate);
        elNote.textContent = 'Полный шиномонтаж, комплект из 4 колёс';
      } else {
        elLabel.textContent = 'Выберите размер дисков';
        setPrice('— ₽', false);
        elNote.textContent = 'Полный шиномонтаж, комплект из 4 колёс';
      }
    }
  }
  render(false);

  /* ---------- Галерея и просмотр фото ---------- */
  var items = $$('.gallery__item');
  var lb = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCount = $('#lbCount');
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var it = items[current];
    lbImg.src = it.dataset.full;
    lbImg.alt = $('img', it).alt;
    lbCount.textContent = (current + 1) + ' / ' + items.length;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (it, i) { it.addEventListener('click', function () { openLb(i); }); });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { show(current - 1); });
  $('#lbNext').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  /* свайп на телефоне */
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();

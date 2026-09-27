function initQuizPagination(containerSelector, paginationSelector, pageSize, onPageChange) {
  const container = document.querySelector(containerSelector);
  const paginationEls = Array.from(document.querySelectorAll(paginationSelector));
  if (!container) return null;

  const allChildren = Array.from(container.children);
  const allCards = allChildren.filter((el) => el.classList.contains('question-card'));

  // Pre-compute, for the "all" (unfiltered) view, which page each divider/card
  // belongs to — this preserves the original grouped-by-section pagination.
  const basePageOf = new Map();
  {
    let qIndex = 0;
    const tmp = [];
    allChildren.forEach((el) => {
      if (el.classList.contains('question-card')) {
        tmp.push(Math.floor(qIndex / pageSize));
        qIndex++;
      } else {
        tmp.push(null);
      }
    });
    let lastPage = 0;
    for (let i = tmp.length - 1; i >= 0; i--) {
      if (tmp[i] === null) {
        tmp[i] = lastPage;
      } else {
        lastPage = tmp[i];
      }
    }
    allChildren.forEach((el, i) => basePageOf.set(el, tmp[i]));
  }

  let currentFilter = 'all';
  let currentPage = 0;

  function filteredCards() {
    if (currentFilter === 'all') return allCards;
    return allCards.filter((el) => el.dataset.topic === currentFilter);
  }

  function totalPagesFor(cards) {
    return cards.length ? Math.ceil(cards.length / pageSize) : 1;
  }

  function showPage(p, scroll) {
    const cards = filteredCards();
    const totalPages = totalPagesFor(cards);
    currentPage = Math.max(0, Math.min(p, totalPages - 1));

    if (currentFilter === 'all') {
      allChildren.forEach((el) => {
        el.style.display = basePageOf.get(el) === currentPage ? '' : 'none';
      });
    } else {
      const start = currentPage * pageSize;
      const pageSet = new Set(cards.slice(start, start + pageSize));
      allChildren.forEach((el) => {
        if (el.classList.contains('question-card')) {
          el.style.display = pageSet.has(el) ? '' : 'none';
        } else {
          el.style.display = 'none';
        }
      });
    }

    renderPagination(totalPages);
    if (scroll) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof onPageChange === 'function') {
      onPageChange();
    }
  }

  function buildPaginationInto(paginationEl, totalPages, scrollOnClick) {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '← Anterior';
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener('click', () => showPage(currentPage - 1, scrollOnClick));
    paginationEl.appendChild(prevBtn);

    for (let p = 0; p < totalPages; p++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(p + 1);
      btn.className = 'page-btn' + (p === currentPage ? ' active' : '');
      btn.addEventListener('click', () => showPage(p, scrollOnClick));
      paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Próxima →';
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.addEventListener('click', () => showPage(currentPage + 1, scrollOnClick));
    paginationEl.appendChild(nextBtn);
  }

  function renderPagination(totalPages) {
    paginationEls.forEach((paginationEl, idx) => {
      const scrollOnClick = idx > 0;
      buildPaginationInto(paginationEl, totalPages, scrollOnClick);
    });
  }

  window.addEventListener('beforeprint', () => {
    allChildren.forEach((el) => {
      if (currentFilter === 'all') {
        el.style.display = '';
      } else {
        el.style.display = el.classList.contains('question-card')
          ? (el.dataset.topic === currentFilter ? '' : 'none')
          : 'none';
      }
    });
    paginationEls.forEach((el) => { el.style.display = 'none'; });
    if (typeof onPageChange === 'function') {
      onPageChange();
    }
  });

  window.addEventListener('afterprint', () => {
    paginationEls.forEach((el) => { el.style.display = ''; });
    showPage(currentPage, false);
  });

  showPage(0, false);

  return {
    setFilter(topic) {
      currentFilter = topic;
      showPage(0, false);
    },
  };
}

function initTopicFilter(containerSelector, filterBarSelector, onChange) {
  const container = document.querySelector(containerSelector);
  const bars = Array.from(document.querySelectorAll(filterBarSelector));
  if (!container || !bars.length) return;

  const cards = Array.from(container.querySelectorAll('.question-card[data-topic]'));
  if (!cards.length) {
    bars.forEach((bar) => { bar.style.display = 'none'; });
    return;
  }

  const topics = [];
  cards.forEach((c) => {
    const t = c.dataset.topic;
    if (t && topics.indexOf(t) === -1) topics.push(t);
  });

  let active = 'all';

  function render() {
    bars.forEach((bar) => {
      bar.innerHTML = '';

      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'topic-btn' + (active === 'all' ? ' active' : '');
      allBtn.textContent = 'Todos os tópicos';
      allBtn.addEventListener('click', () => select('all'));
      bar.appendChild(allBtn);

      topics.forEach((t) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'topic-btn' + (active === t ? ' active' : '');
        b.textContent = t;
        b.addEventListener('click', () => select(t));
        bar.appendChild(b);
      });
    });
  }

  function select(topic) {
    active = topic;
    render();
    onChange(topic);
  }

  render();
}

function initPrintButton(buttonSelector) {
  const btn = document.querySelector(buttonSelector);
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
}

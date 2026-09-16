(function () {
  "use strict";

  const data = window.KANJI_GARDEN_DATA;
  const readingDetails = window.KANJI_GARDEN_READING_DETAILS || {};
  const storage = window.KanjiGardenStorage;
  const game = window.KanjiGardenGame;
  const byId = new Map(data.kanjis.map(item => [item.id, item]));

  let state = storage.load();
  if (!Array.isArray(state.selectedIds)) state.selectedIds = data.defaultSelectedIds.slice();
  let session = null;

  const $ = selector => document.querySelector(selector);
  const views = ["homeView", "selectionView", "gameView", "resultView"];

  function showView(id) {
    views.forEach(viewId => $("#" + viewId).classList.toggle("active", viewId === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function persist() { storage.save(state); }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $("#themeToggle").textContent = state.theme === "dark" ? "☾" : "☀";
  }

  function selectedKanjis() {
    return state.selectedIds.map(id => byId.get(id)).filter(Boolean);
  }

  function modeLabel(mode) {
    if (mode === "full") return "completa";
    if (mode === "infinite") return "infinita";
    return `de ${mode}`;
  }

  function saveSessionSnapshot(options = {}) {
    if (!session) return;
    const nextIndex = options.nextIndex ?? session.index;
    if (nextIndex >= session.queue.length && session.mode !== "infinite") {
      state.activeSession = null;
    } else {
      state.activeSession = {
        mode: session.mode,
        queueIds: session.queue.map(item => item.id),
        index: nextIndex,
        correct: session.correct,
        answered: session.answered
      };
    }
    persist();
  }

  function updateResumeCard() {
    const card = $("#resumeCard");
    const saved = state.activeSession;
    if (!saved || !Array.isArray(saved.queueIds) || !saved.queueIds.length) {
      card.classList.add("hidden");
      return;
    }
    const total = saved.queueIds.length;
    const position = Math.min(Number(saved.index || 0) + 1, total);
    $("#resumeMeta").textContent = `Sessão ${modeLabel(saved.mode)} · carta ${position} de ${total}`;
    card.classList.remove("hidden");
  }

  function updateHome() {
    const count = selectedKanjis().length;
    $("#selectionSummary").textContent = `${count} kanjis selecionados`;
    $("#selectionCount").textContent = count;
    $("#statAnswered").textContent = state.stats.answered;
    $("#statCorrect").textContent = state.stats.correct;
    $("#statAccuracy").textContent = state.stats.answered ? `${Math.round(state.stats.correct / state.stats.answered * 100)}%` : "—";
    updateResumeCard();

    document.querySelectorAll(".mode-card").forEach(button => {
      const mode = button.dataset.mode;
      if (mode === "20") button.disabled = count < 20;
      else if (mode === "30") button.disabled = count < 30;
      else button.disabled = count === 0;
    });
  }

  function renderSelection() {
    const root = $("#kanjiSelection");
    root.innerHTML = "";
    const selected = new Set(state.selectedIds);

    data.books.forEach(book => {
      const group = document.createElement("section");
      group.className = "curriculum-group";
      const bookItems = data.kanjis.filter(item => item.book === book.id);
      group.innerHTML = `<div class="curriculum-heading"><h3>${book.label}</h3><span class="muted">${bookItems.filter(item => selected.has(item.id)).length}/${bookItems.length}</span></div>`;

      [...new Set(bookItems.map(item => item.chapter))].forEach(chapter => {
        const block = document.createElement("div");
        block.className = "chapter";
        block.innerHTML = `<div class="chapter-title">漢字 ${chapter}</div><div class="kanji-checks"></div>`;
        const checks = block.querySelector(".kanji-checks");
        bookItems.filter(item => item.chapter === chapter).forEach(item => {
          const wrapper = document.createElement("div");
          wrapper.className = "kanji-check";
          wrapper.innerHTML = `<input id="pick-${item.id}" type="checkbox" ${selected.has(item.id) ? "checked" : ""}><label for="pick-${item.id}" title="${item.meanings.join(", ")}">${item.kanji}</label>`;
          wrapper.querySelector("input").addEventListener("change", event => {
            const set = new Set(state.selectedIds);
            if (event.target.checked) set.add(item.id); else set.delete(item.id);
            state.selectedIds = data.kanjis.filter(k => set.has(k.id)).map(k => k.id);
            persist();
            renderSelection();
            updateHome();
          });
          checks.appendChild(wrapper);
        });
        group.appendChild(block);
      });
      root.appendChild(group);
    });
    $("#selectedCount").textContent = `${selected.size} selecionados`;
  }

  function startSession(mode) {
    const selected = selectedKanjis();
    if (!selected.length) return;
    session = {
      mode,
      queue: game.makeSession(selected, mode),
      index: 0,
      correct: 0,
      answered: 0,
      revealed: false,
      resolved: false
    };
    saveSessionSnapshot();
    showView("gameView");
    renderQuestion();
  }

  function continueSavedSession() {
    const saved = state.activeSession;
    if (!saved || !Array.isArray(saved.queueIds)) return;
    const queue = saved.queueIds.map(id => byId.get(id)).filter(Boolean);
    if (!queue.length) {
      state.activeSession = null;
      persist();
      updateHome();
      return;
    }
    session = {
      mode: saved.mode,
      queue,
      index: Math.min(Number(saved.index || 0), queue.length - 1),
      correct: Number(saved.correct || 0),
      answered: Number(saved.answered || 0),
      revealed: false,
      resolved: false
    };
    showView("gameView");
    renderQuestion();
  }

  function currentItem() { return session.queue[session.index]; }

  function renderQuestion() {
    const item = currentItem();
    session.revealed = false;
    session.resolved = false;
    saveSessionSnapshot();
    $("#currentKanji").textContent = item.kanji;
    $("#currentMeta").textContent = `${item.book === "np1" ? "New Progressive 1" : "New Progressive 2"} · 漢字 ${item.chapter}`;
    $("#answerInput").value = "";
    $("#answerInput").disabled = false;
    $("#feedback").className = "feedback";
    $("#feedback").innerHTML = "";
    $("#dontKnow").disabled = false;
    $("#confirmAnswer").classList.remove("hidden");
    $("#nextKanji").classList.add("hidden");

    const total = session.queue.length;
    $("#gameProgress").textContent = session.mode === "infinite" ? `${session.index + 1} · ciclo de ${total}` : `${session.index + 1} / ${total}`;
    $("#progressBar").style.width = `${(session.index / total) * 100}%`;
    setTimeout(() => $("#answerInput").focus(), 30);
  }

  function defaultReadingUsage(item, displayReading) {
    const isOnyomi = /[\u30A1-\u30FA]/.test(displayReading);
    const isVariant = /[～〜]/.test(displayReading);
    const hasOkurigana = /[（(]/.test(displayReading);

    if (isVariant) return `Variação fonética usada em compostos ou contagens · ${item.meanings.join(" · ")}`;
    if (isOnyomi) return `On'yomi · comum em palavras compostas · ${item.meanings.join(" · ")}`;
    if (hasOkurigana) return `Kun'yomi · usada com okurigana · ${item.meanings.join(" · ")}`;
    return `Kun'yomi · leitura japonesa nativa · ${item.meanings.join(" · ")}`;
  }

  function getReadingDetail(item, displayReading) {
    return readingDetails[item.id]?.[displayReading] || {};
  }

  function showAnswer(item, prefix) {
    const cards = item.displayReadings.map((displayReading, index) => {
      const detail = getReadingDetail(item, displayReading);
      const sourceReading = item.readings[index] || displayReading;
      const romaji = game.displayReadingToRomaji(sourceReading);
      const usage = detail.usage || defaultReadingUsage(item, displayReading);
      const example = detail.example ? `<div class="reading-example">${detail.example}</div>` : "";

      return `
        <div class="reading-card">
          <div class="reading-main">
            <span class="reading-kana" lang="ja">${displayReading}</span>
            <span class="reading-romaji">${romaji}</span>
          </div>
          <div class="reading-usage">${usage}</div>
          ${example}
        </div>`;
    }).join("");

    $("#feedback").innerHTML = `
      <div class="feedback-title">${prefix}</div>
      <div class="reading-cards">${cards}</div>
      <div class="kanji-meaning-summary">Significados: ${item.meanings.join(" · ")}</div>`;
  }

  function submitAnswer() {
    if (!session || session.resolved) { nextQuestion(); return; }
    const item = currentItem();
    const input = $("#answerInput").value;
    if (!input.trim()) return;

    if (game.readingMatches(input, item)) {
      session.resolved = true;
      session.answered += 1;
      if (!session.revealed) {
        session.correct += 1;
        state.stats.correct += 1;
      }
      state.stats.answered += 1;
      saveSessionSnapshot({ nextIndex: session.index + 1 });
      $("#feedback").className = "feedback good";
      showAnswer(item, session.revealed ? "Correto. Agora ficou!" : "Correto!");
      $("#answerInput").disabled = true;
      $("#dontKnow").disabled = true;
      $("#confirmAnswer").classList.add("hidden");
      $("#nextKanji").classList.remove("hidden");
      $("#nextKanji").focus();
    } else {
      $("#feedback").className = "feedback bad";
      if (session.revealed) showAnswer(item, "Ainda não. Digite uma das leituras abaixo:");
      else $("#feedback").textContent = "Quase. Tente novamente.";
    }
  }

  function revealAnswer() {
    if (!session || session.resolved) return;
    session.revealed = true;
    const item = currentItem();
    $("#feedback").className = "feedback";
    showAnswer(item, "Sem problema. Digite uma das leituras abaixo para continuar:");
    $("#answerInput").focus();
  }

  function nextQuestion() {
    if (!session || !session.resolved) return;
    session.index += 1;
    if (session.index < session.queue.length) {
      renderQuestion();
      return;
    }
    if (session.mode === "infinite") {
      session.queue = game.weightedSample(selectedKanjis(), selectedKanjis().length);
      session.index = 0;
      renderQuestion();
      return;
    }
    finishSession();
  }

  function finishSession() {
    state.activeSession = null;
    persist();
    $("#resultCorrect").textContent = session.correct;
    $("#resultTotal").textContent = `/ ${session.answered}`;
    const accuracy = session.answered ? Math.round(session.correct / session.answered * 100) : 0;
    $("#resultAccuracy").textContent = `${accuracy}% de acertos sem usar “Não sei”.`;
    $("#progressBar").style.width = "100%";
    showView("resultView");
  }

  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    persist();
    applyTheme();
  });
  $("#openSelection").addEventListener("click", () => { renderSelection(); showView("selectionView"); });
  $("#backFromSelection").addEventListener("click", () => { updateHome(); showView("homeView"); });
  $("#selectAll").addEventListener("click", () => { state.selectedIds = data.kanjis.map(item => item.id); persist(); renderSelection(); updateHome(); });
  $("#restoreDefaults").addEventListener("click", () => { state.selectedIds = data.defaultSelectedIds.slice(); persist(); renderSelection(); updateHome(); });
  $("#continueTraining").addEventListener("click", continueSavedSession);
  document.querySelectorAll(".mode-card").forEach(button => button.addEventListener("click", () => startSession(button.dataset.mode)));
  $("#exitGame").addEventListener("click", () => { session = null; updateHome(); showView("homeView"); });
  $("#answerForm").addEventListener("submit", event => { event.preventDefault(); submitAnswer(); });
  $("#dontKnow").addEventListener("click", revealAnswer);
  $("#nextKanji").addEventListener("click", nextQuestion);
  $("#backHome").addEventListener("click", () => { updateHome(); showView("homeView"); });
  $("#repeatSession").addEventListener("click", () => startSession(session?.mode || "10"));

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.repeat) return;
    if (!session || !session.resolved || !$("#gameView").classList.contains("active")) return;
    event.preventDefault();
    nextQuestion();
  });

  applyTheme();
  updateHome();
  persist();
})();

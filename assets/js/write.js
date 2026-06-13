(function () {
  "use strict";

  const REPO = "siwon3/siwon3.github.io";
  const BRANCH = "main";
  const PAT_KEY = "siwonsong-gh-pat";
  const DRAFT_KEY = "siwonsong-write-draft";

  let editor;
  let saveTimer;

  function slugify(text) {
    return (text || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 60);
  }

  function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  function escapeYamlString(str) {
    return (str || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function buildFrontMatter({ title, tags, summary }) {
    const tagsBlock =
      tags.length > 0
        ? `tags:\n${tags.map((t) => `  - ${t}`).join("\n")}`
        : "tags: []";
    return `---
layout: single
title: "${escapeYamlString(title)}"
${tagsBlock}
post_type: article
summary: "${escapeYamlString(summary)}"
sitemap:
  changefreq: daily
  priority: 0.5
categories: Tech
---

`;
  }

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function ghGet(path) {
    const pat = localStorage.getItem(PAT_KEY);
    return fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
  }

  async function ghPut(path, body) {
    const pat = localStorage.getItem(PAT_KEY);
    return fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify(body),
    });
  }

  async function resolveUniqueFilename(date, slug) {
    let candidate = `_posts/${date}-${slug}.md`;
    let counter = 2;
    while (true) {
      const r = await ghGet(candidate);
      if (r.status === 404) return candidate;
      if (!r.ok) {
        // 권한 문제 등이면 그대로 진행 시도
        return candidate;
      }
      candidate = `_posts/${date}-${slug}-${counter}.md`;
      counter += 1;
    }
  }

  async function publishPost({ title, tags, summary, content }) {
    const pat = localStorage.getItem(PAT_KEY);
    if (!pat) {
      throw new Error(
        "GitHub PAT가 설정되지 않았습니다. ⚙️ 버튼으로 먼저 설정하세요."
      );
    }

    const date = todayStr();
    const slug = slugify(title) || "untitled";
    const filename = await resolveUniqueFilename(date, slug);

    const fullContent = buildFrontMatter({ title, tags, summary }) + content;
    const encoded = utf8ToBase64(fullContent);

    const resp = await ghPut(filename, {
      message: `새 글: ${title}`,
      content: encoded,
      branch: BRANCH,
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`발행 실패 (${resp.status}): ${txt}`);
    }

    return { filename };
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveDraft(data) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  function gatherForm() {
    const title = document.getElementById("write-title").value.trim();
    const summary = document.getElementById("write-summary").value.trim();
    const tags = Array.from(
      document.querySelectorAll(".write-tags input:checked")
    ).map((el) => el.value);
    const content = editor ? editor.getMarkdown() : "";
    return { title, tags, summary, content };
  }

  function updateFilenamePreview() {
    const title = document.getElementById("write-title").value.trim();
    const slug = slugify(title) || "untitled";
    const date = todayStr();
    const el = document.getElementById("write-filename-preview");
    if (el) el.textContent = `_posts/${date}-${slug}.md`;
  }

  function autoSave() {
    saveDraft(gatherForm());
    const el = document.getElementById("write-draft-status");
    if (el) {
      const t = new Date();
      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      const ss = String(t.getSeconds()).padStart(2, "0");
      el.textContent = `임시저장됨 ${hh}:${mm}:${ss}`;
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autoSave, 1500);
  }

  function initEditor() {
    const draft = loadDraft();

    if (!window.toastui || !toastui.Editor) {
      alert(
        "에디터 로드 실패. 네트워크를 확인하고 새로고침 해주세요."
      );
      return;
    }

    editor = new toastui.Editor({
      el: document.getElementById("editor"),
      height: "calc(100vh - 220px)",
      initialEditType: "wysiwyg",
      previewStyle: "tab",
      theme: "dark",
      initialValue: draft && draft.content ? draft.content : "",
      placeholder: "여기에 글을 쓰세요...",
      usageStatistics: false,
      toolbarItems: [
        ["heading", "bold", "italic", "strike"],
        ["hr", "quote"],
        ["ul", "ol", "task"],
        ["table", "image", "link"],
        ["code", "codeblock"],
      ],
    });

    if (draft) {
      document.getElementById("write-title").value = draft.title || "";
      document.getElementById("write-summary").value = draft.summary || "";
      (draft.tags || []).forEach((t) => {
        const cb = document.querySelector(
          `.write-tags input[value="${CSS.escape(t)}"]`
        );
        if (cb) cb.checked = true;
      });
      updateFilenamePreview();
    }

    editor.on("change", scheduleSave);
    document
      .querySelectorAll("#write-title, #write-summary")
      .forEach((el) =>
        el.addEventListener("input", () => {
          updateFilenamePreview();
          scheduleSave();
        })
      );
    document
      .querySelectorAll(".write-tags input")
      .forEach((el) => el.addEventListener("change", scheduleSave));
  }

  function initButtons() {
    document
      .getElementById("write-publish")
      .addEventListener("click", async () => {
        const form = gatherForm();
        if (!form.title) {
          alert("제목을 입력하세요.");
          return;
        }
        if (
          form.tags.length === 0 &&
          !confirm("태그가 비어있어요. 그래도 발행할까요?")
        )
          return;
        if (!confirm(`발행할까요?\n\n제목: ${form.title}\n태그: ${form.tags.join(", ") || "(없음)"}`)) return;

        const btn = document.getElementById("write-publish");
        btn.disabled = true;
        btn.textContent = "발행 중...";
        try {
          const result = await publishPost(form);
          alert(
            `발행 완료!\n${result.filename}\n\n1-2분 후 사이트에 반영됩니다.`
          );
          clearDraft();
        } catch (e) {
          alert(e.message || String(e));
        } finally {
          btn.disabled = false;
          btn.textContent = "📤 발행";
        }
      });

    const modal = document.getElementById("write-pat-modal");
    const patInput = document.getElementById("write-pat-input");
    document.getElementById("write-pat-btn").addEventListener("click", () => {
      patInput.value = localStorage.getItem(PAT_KEY) || "";
      modal.hidden = false;
      setTimeout(() => patInput.focus(), 50);
    });
    document.getElementById("write-pat-save").addEventListener("click", () => {
      const v = patInput.value.trim();
      if (v) localStorage.setItem(PAT_KEY, v);
      else localStorage.removeItem(PAT_KEY);
      modal.hidden = true;
    });
    document
      .getElementById("write-pat-cancel")
      .addEventListener("click", () => {
        modal.hidden = true;
      });
  }

  function init() {
    initEditor();
    initButtons();
    updateFilenamePreview();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

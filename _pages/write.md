---
title: "글쓰기"
layout: archive
permalink: /write/
author_profile: false
sidebar_main: false
---

<link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css" />
<link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/theme/toastui-editor-dark.min.css" />

<div class="write-page">

<div class="write-main" id="write-main">
  <div class="write-toolbar">
    <input type="text" id="write-title" class="write-toolbar__title" placeholder="제목을 입력하세요" />
    <span class="write-toolbar__status" id="write-draft-status">자동 저장 대기</span>
    <button type="button" id="write-pat-btn" class="write-toolbar__btn" title="GitHub PAT 설정">⚙️</button>
    <button type="button" id="write-publish" class="write-toolbar__publish">📤 발행</button>
  </div>

  <div class="write-meta">
    <div class="write-meta__row">
      <span class="write-meta__label">태그</span>
      <div class="write-tags">
        <label><input type="checkbox" value="창업"> <span>창업</span></label>
        <label><input type="checkbox" value="삶"> <span>삶</span></label>
        <label><input type="checkbox" value="인간관계"> <span>인간관계</span></label>
        <label><input type="checkbox" value="사랑"> <span>사랑</span></label>
        <label><input type="checkbox" value="일"> <span>일</span></label>
        <label><input type="checkbox" value="PE"> <span>PE</span></label>
        <label><input type="checkbox" value="주식"> <span>주식</span></label>
      </div>
    </div>
    <div class="write-meta__row">
      <span class="write-meta__label">요약</span>
      <input type="text" id="write-summary" class="write-meta__summary" placeholder="한 줄 요약 (선택)" />
    </div>
    <div class="write-meta__row write-meta__row--hint">
      <span class="write-meta__label">파일명</span>
      <code id="write-filename-preview">_posts/YYYY-MM-DD-slug.md</code>
    </div>
  </div>

  <div class="write-editor">
    <div id="editor"></div>
  </div>
</div>

<div class="write-modal" id="write-pat-modal" hidden>
  <div class="write-modal__inner">
    <h3>GitHub Personal Access Token</h3>
    <p class="write-modal__desc">
      발행은 GitHub API로 직접 커밋합니다. <strong>Fine-grained PAT</strong>가 필요해요.<br>
      <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub에서 PAT 생성하기 →</a><br>
      <small>
        Repository access: <code>siwon3/siwon3.github.io</code>만 선택 ·
        Repository permissions → Contents: <code>Read and write</code>
      </small>
    </p>
    <input type="password" id="write-pat-input" class="write-modal__input" placeholder="github_pat_..." autocomplete="off" />
    <div class="write-modal__actions">
      <button type="button" id="write-pat-cancel" class="write-modal__btn">취소</button>
      <button type="button" id="write-pat-save" class="write-modal__btn write-modal__btn--primary">저장</button>
    </div>
    <p class="write-modal__warn">⚠ 토큰은 이 브라우저의 localStorage에만 저장됩니다. 공용 PC에서는 절대 사용하지 마세요.</p>
  </div>
</div>

</div>

<script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
<script src="{{ '/assets/js/write.js' | relative_url }}"></script>

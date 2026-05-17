(function () {
  "use strict";

  const PASSWORD_HASH =
    "d99210b7366f189081f197ec3a2fa60b11eb29f72087dc9a856228a02d3630c5";

  async function sha256Hex(text) {
    const buffer = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const hero = document.getElementById("hero-graph");
    const overlay = document.getElementById("hero-graph-overlay");
    const unlockButton = document.getElementById("hero-graph-unlock-btn");

    if (!hero || !overlay || !unlockButton) return;

    unlockButton.addEventListener("click", async () => {
      const input = window.prompt("비밀번호를 입력해주세요");
      if (input === null) return;

      try {
        const hashed = await sha256Hex(input);
        if (hashed === PASSWORD_HASH) {
          hero.classList.remove("hero-graph--locked");
          overlay.remove();
        } else {
          window.alert("비밀번호가 일치하지 않습니다.");
        }
      } catch (err) {
        window.alert("인증 처리 중 오류가 발생했습니다.");
      }
    });
  });
})();

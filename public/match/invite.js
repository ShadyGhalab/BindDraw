// Fixed destinations: never redirect to a host or route supplied by an invitation sender.
(function () {
  "use strict";
  const modes = Object.freeze({
    guess: "Guess What I Drew",
    guesslive: "Live Guess What I Drew",
    copycat: "Copycat Challenge",
    copycatlive: "Live Copycat Challenge",
    speeddraw: "Speed Draw",
    speeddrawlive: "Live Speed Draw",
    blindrelay: "Blind Relay",
    collab: "Draw Together",
  });
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const code = (params.get("code") || "").toUpperCase();
  const title = document.getElementById("title");
  const message = document.getElementById("message");
  if (!Object.prototype.hasOwnProperty.call(modes, mode) || !/^[2-9A-HJKMNP-Z]{6}$/.test(code)) {
    title.textContent = "Invalid invitation";
    message.textContent = "This invitation is incomplete or invalid. Ask your friend to send a new one.";
    return;
  }
  title.textContent = "You were invited to " + modes[mode];
  message.textContent = "Open the app or join the game in your browser.";
  document.getElementById("code").textContent = code;
  const matchPath = "match/" + mode + "?code=" + code;
  document.getElementById("app").href = "invisibleink://" + matchPath;
  document.getElementById("browser").href = "https://blind-draw-c6ee2.web.app/" + matchPath;
  document.getElementById("actions").hidden = false;
})();

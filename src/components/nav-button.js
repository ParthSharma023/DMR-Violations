// actionButton → hash-navigation to the button's target page.

import { h } from "preact";
import htm from "htm";
const html = htm.bind(h);

export function NavButton({ visual }) {
  const caption = visual.button_text || visual.title || "(untitled)";
  const target = visual.action_target_slug;
  const onClick = (e) => {
    e.preventDefault();
    if (target) window.location.hash = `#/${target}`;
  };
  return html`
    <button class="nav-button" onClick=${onClick} disabled=${!target}>
      ${caption}
    </button>
  `;
}

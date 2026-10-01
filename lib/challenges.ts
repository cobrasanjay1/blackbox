export type ChallengeHint = {
  text: string;
};

export type Challenge = {
  id: string;
  order: number;
  title: string;
  storyFragment: string; // Narrative piece revealed on unlock
  description: string;   // What the player sees as their current objective
  mechanic: string;      // Internal mechanic type label
  hints: string[];
  // answer is server-side only — never exported to client
};

// All challenge metadata (NO answers — those live in lib/answers.ts server-only)
export const CHALLENGES: Challenge[] = [
  {
    id: "the-message",
    order: 1,
    title: "THE MESSAGE",
    storyFragment:
      "At 02:13 AM, someone accessed the Black Box Association Archive. One file disappeared. The only thing left behind was this website. If you're reading this... perhaps the file wasn't deleted. Perhaps it was hidden.",
    description:
      "Something doesn't feel right about this page. They always say the surface is just the beginning. Look a little deeper than what you can see.",
    mechanic: "html-comment",
    hints: [
      "Every webpage is made of code. What if that code says more than what's displayed?",
      "Try right-clicking anywhere on this page and selecting 'View Page Source'.",
      "Look for something that starts with <!-- in the page source. HTML comments are invisible on screen, but they're still there.",
    ],
  },
  {
    id: "the-archive",
    order: 2,
    title: "THE ARCHIVE",
    storyFragment:
      "NULL left breadcrumbs. Not obvious ones — hidden ones. The archive holds something, but not everything is visible at first glance.",
    description:
      "You've found the archive. Something is on this page, but it's not showing itself. Sometimes text can hide in plain sight — invisible, but present.",
    mechanic: "hidden-text",
    hints: [
      "Not everything on a webpage has to be visible to exist.",
      "Try selecting all the text on the page (Ctrl+A or Cmd+A). Sometimes hidden text gets selected too.",
      "Look at the page source. There might be text styled to be invisible — same color as the background.",
    ],
  },
  {
    id: "the-source",
    order: 3,
    title: "THE SOURCE",
    storyFragment:
      "NULL was careful. The clues aren't in what you see — they're in what the page whispers to the browser. Look at the code, not the content.",
    description:
      "You found the hidden text. But the archive has more. Pages can contain instructions that run silently. Look at the source code of this page — not just the visible content, but the scripts.",
    mechanic: "js-comment",
    hints: [
      "Right-click and select 'View Page Source'. Look at every section, not just the visible text.",
      "Look for lines that start with // in the JavaScript sections — those are comments that developers leave behind.",
      "Find a JavaScript section (look for <script> tags) and read the comments carefully.",
    ],
  },
  {
    id: "the-signal",
    order: 4,
    title: "THE SIGNAL",
    storyFragment:
      "The message was never written to be read — only to be decoded. NULL communicated in a language that isn't encryption, just transformation.",
    description:
      "You've received a transmission. It looks like noise, but it isn't. This string was encoded, not encrypted. There's a difference. Encoded means it can be reversed with the right tool.",
    mechanic: "base64",
    hints: [
      "The string uses only letters, numbers, and sometimes = at the end. This is a pattern.",
      "This type of encoding is called Base64. It's used to represent data as text.",
      "Search for 'Base64 decode' online. Paste the string into any decoder to read the message.",
      "Once decoded, submit the first word of the message.",
    ],
  },
  {
    id: "the-parameter",
    order: 5,
    title: "THE PARAMETER",
    storyFragment:
      "URLs aren't just addresses — they're conversations. You can ask the server questions by changing what comes after the ?. NULL hid something behind the right question.",
    description:
      "Look at the URL bar in your browser. See the part after the '?' — that's a parameter. The server responds differently to different values. What if the file isn't 'missing' anymore?",
    mechanic: "url-parameter",
    hints: [
      "Look at the URL in your browser. It contains ?file=something.",
      "Try changing the value after 'file=' in the URL and pressing Enter.",
      "Did the decoded message tell you what the file is called? Try ?file=node in the URL bar.",
    ],
  },
  {
    id: "the-memory",
    order: 6,
    title: "THE MEMORY",
    storyFragment:
      "Browsers remember things. Even after you close a tab, evidence can remain — stored silently in memory the browser keeps just for you.",
    description:
      "The browser remembers what happened here. Not everything is visible on the page. Sometimes clues are stored in the browser's own memory — things like cookies and local storage.",
    mechanic: "localstorage",
    hints: [
      "Open your browser's Developer Tools (press F12 or right-click → Inspect).",
      "In DevTools, find the 'Application' tab (Chrome) or 'Storage' tab (Firefox).",
      "Look under 'Local Storage' → select this site's URL → you'll see key-value pairs stored there.",
    ],
  },
  {
    id: "the-script",
    order: 7,
    title: "THE SCRIPT",
    storyFragment:
      "NULL wrote something in the page's instructions. Not to display it — to hide it. Developers sometimes leave things in scripts that they forget aren't secret.",
    description:
      "There's a variable hidden in this page's JavaScript. It can't be seen normally — but if you open the browser console, you can read it.",
    mechanic: "js-variable",
    hints: [
      "Open DevTools (F12) and click the 'Console' tab.",
      "Type: next_clue and press Enter. JavaScript variables stored on the page can be read in the console.",
      "Alternatively, look at the page source for a <script> tag and find a variable named next_clue.",
    ],
  },
  {
    id: "the-image",
    order: 8,
    title: "THE IMAGE",
    storyFragment:
      "A picture says a thousand words. But it can also hide them. Files carry metadata — invisible information embedded in the file itself, invisible to the naked eye.",
    description:
      "This image doesn't look suspicious. But files remember more than pictures. They carry hidden data called metadata. Download the image and examine its properties.",
    mechanic: "image-metadata",
    hints: [
      "Right-click the image and save it to your computer.",
      "On Windows: right-click the file → Properties → Details. On Mac: right-click → Get Info.",
      "Look for a 'Comment' or 'Description' field in the file properties. That's where NULL left something.",
    ],
  },
  {
    id: "the-cipher",
    order: 9,
    title: "THE CIPHER",
    storyFragment:
      "Not all codes are complicated. Sometimes a message is just shifted — every letter moved a fixed number of positions in the alphabet. Simple, but effective if you don't know to look.",
    description:
      "You've found an encoded message inside the vault. This one isn't Base64 — it's a Caesar cipher. Each letter has been shifted 13 positions in the alphabet. Decode it to continue.",
    mechanic: "rot13",
    hints: [
      "This is ROT13 — a Caesar cipher with a shift of 13. It's one of the simplest ciphers.",
      "Search for 'ROT13 decoder' online and paste the text to decode it.",
      "Each letter A becomes N, B becomes O, etc. After Z, it wraps back around.",
    ],
  },
  {
    id: "the-cookie",
    order: 10,
    title: "THE COOKIE",
    storyFragment:
      "NULL left a trail of crumbs — small, quiet, and easy to overlook. Browsers hold on to some of them for a very long time.",
    description:
      "The vault is open, but something is still stored on your machine for this site. Not in local storage this time — in the other kind of browser memory. Find the cookie NULL left behind.",
    mechanic: "cookie",
    hints: [
      "Open DevTools (F12) and go to the 'Application' tab (Chrome) or 'Storage' tab (Firefox).",
      "Expand 'Cookies' (not Local Storage) and select this site's URL.",
      "Look for a cookie named 'relic'. Its value is the answer.",
    ],
  },
  {
    id: "the-key",
    order: 11,
    title: "THE KEY",
    storyFragment:
      "Every investigation ends with a conclusion. NULL left one final lock. The key is made of everything you've discovered — six fragments, combined into one truth.",
    description:
      "You've collected all the fragments. The vault's final lock is built from the answers you submitted in Stages 1 through 6. Take the first letter of each, in order, and combine them. Stages 7 to 10 were detours — they are not part of the key.",
    mechanic: "combination",
    hints: [
      "Look back at the six words you submitted in Stages 1–6. Write down only the first letter of each, in order.",
      "Group the letters 3 - 1 - 2: the first three letters, then the fourth on its own, then the last two.",
      "Format: xxx-x-xx — all lowercase, hyphens between the groups, no spaces.",
    ],
  },
];

export const TOTAL_CHALLENGES = CHALLENGES.length;

export function getChallengeByOrder(order: number): Challenge | undefined {
  return CHALLENGES.find((c) => c.order === order);
}

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

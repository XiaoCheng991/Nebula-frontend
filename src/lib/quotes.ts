/**
 * Random-rolling quote list for the floating "word of the moment" patch.
 *
 * Mix of code-wisdom and cyberpunk / hacker voice. Mostly English so
 * every line fits the mono terminal typography of the site. The
 * occasional Chinese line is kept short - long bodies would feel
 * translated, not quoted.
 *
 * Attribution is intentionally informal: "Alan Kay" / "man page"
 * beats nobody. We use a single source line, not "source: book".
 *
 * No em-dash anywhere in shipping copy. ASCII hyphens only.
 */
export interface Quote {
  body: string;
  by: string;
}

export const QUOTES: Quote[] = [
  {
    body: "The best way to predict the future is to ship it.",
    by: "Alan Kay",
  },
  {
    body: "Make it work, make it right, make it fast. In that order.",
    by: "Kent Beck",
  },
  {
    body: "Simplicity is the ultimate sophistication.",
    by: "Leonardo da Vinci",
  },
  {
    body: "Code never lies, comments sometimes do.",
    by: "man page tradition",
  },
  {
    body: "First we shape the tools, thereafter they shape us.",
    by: "John Culkin, on McLuhan",
  },
  {
    body: "Programs must be written for people to read, and only incidentally for machines to execute.",
    by: "Hal Abelson",
  },
  {
    body: "The internet is the first thing that humanity has built that humanity does not understand.",
    by: "Eric Schmidt",
  },
  {
    body: "Move fast and fix things.",
    by: "github issues folklore",
  },
  {
    body: "Write drunk. Refactor sober.",
    by: "often attributed to Hemingway, probably apocryphal",
  },
  {
    body: "There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
    by: "Phil Karlton (folkloric)",
  },
  {
    body: "A program is poetry. A bug is a missed rhyme.",
    by: "studio kyon",
  },
  {
    body: "Turn the dial, watch the lights blink. The machine is alive.",
    by: "studio kyon",
  },
];

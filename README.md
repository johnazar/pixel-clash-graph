# pixel-clash-graph

Spells "PIXEL CLASH" on the GitHub contribution graph.

`graph-art.mjs` draws the text with a 3x5 pixel font, maps each lit pixel to a day in the last 12 months,
and makes empty commits backdated to those days (12 per day). The graph needs a git email that GitHub
accepts for your account (use your `ID+login@users.noreply.github.com` address).

```bash
node graph-art.mjs preview                                   # print the text as a grid, no commits
node graph-art.mjs build ./out ID+login@users.noreply.github.com 12   # make the repo in ./out, then push it
```

The graph shows the last 12 months, so the text scrolls away over time. Rebuild in a fresh repo to move it.

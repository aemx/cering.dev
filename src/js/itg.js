import * as util from './util';

const diffMap = {
  "beginner":   "SN",
  "easy":       "SE",
  "medium":     "SM",
  "hard":       "SH",
  "challenge":  "SX",
  "edit":       "ED",
}

const diffSvg = {
  "beginner":   "n",
  "easy":       "e",
  "medium":     "m",
  "hard":       "h",
  "challenge":  "x",
  "edit":       "edit",
}

// Determine BPM + tier
const getBpm = (song, chart) => {
  const [dMin, dMax] = song.displaybpm;
  const breakdown = chart.breakdown ? chart.breakdown: "";
  let bpm = Math.round(dMax);
  let strBpm = bpm;
  if (breakdown.includes("@")) {
    let [_, atBpm] = breakdown.split('@');
    bpm = atBpm;
    strBpm = atBpm;
  } else if (dMin !== dMax) {
    strBpm = `${Math.round(dMin)} - ${bpm}`;
  }
  return {
    value: strBpm,
    tier: Math.min(10 * Math.floor(bpm/10), 180)
  }
}

const cleanBd = bd => bd ? bd.replaceAll(/([\|\/\-'])/g, ' $1 ') : "No stream";

// Get a file list for an ITG pack's JSON
// TODO: Make this not suck
export const fileList = async (data, isBySong, sortMode, showLowers) => {
  let list = [];
  const selectedDiffs = Object.fromEntries(data.map(x => [x.sid, "challenge"]));
  let htmlElement = ``;

  for (const song of data) {
    const id          = song.sid;
    const bnPath      = `./assets/packs/streams/bn/${id}.jpg`;
    const graphPath   = await util.req(`./assets/packs/streams/graph/${id}-x.svg`);
    const title       = song.titletranslit ? song.titletranslit : song.title
    const artist      = song.artisttranslit ? song.artisttranslit : song.artist
    const [mainDiff]  = song.difficulties.filter(x => x.slot === "Challenge");
    const bpm         = getBpm(song, mainDiff);
    const breakdown   = cleanBd(mainDiff.breakdown);
    let diffs         = ``;

    for (const diff of song.difficulties) {
      const slot = diff.slot.toLowerCase();
      const isChallenge = slot === "challenge" ? " itg-diff-challenge-fill" : "";
      diffs += `<div id="${id}-${slot}" class="itg-diff-${slot}${isChallenge}"><span>${diff.difficulty}</span></div>`

      // Add a click listener (song/chart view)
      if (isBySong === true) {
        util.addClickListener(async e => {
          const oldButton   = document.getElementById(`${id}-${selectedDiffs[id]}`);
          const diffButton  = document.getElementById(`${id}-${slot}`);
          const graphView   = document.getElementById(`${id}-chart`);
          const breakdown   = document.getElementById(`${id}-breakdown`);
          if (diffButton.contains(e.target)) {
            // unhighlight old diff
            oldButton.classList.remove(`itg-diff-${selectedDiffs[id]}-fill`)
            // highlight new diff
            diffButton.classList.add(`itg-diff-${slot}-fill`)
            selectedDiffs[id] = slot;
            const graphPath = await util.req(`./assets/packs/streams/graph/${id}-${diffSvg[slot]}.svg`);
            graphView.innerHTML = graphPath;
            breakdown.innerHTML = cleanBd(diff.breakdown);
          }
        })
      }

      // Add element (list view)
      const chartFilter = showLowers ? slot !== "beginner" : slot === "challenge";
      const diffBpm = getBpm(song, diff);
      if (isBySong === false && chartFilter) {
        const chartHtml = `
        <div class="songlist-entry">
          <div class="songlist-entry-diff">
            <div class="itg-diff-${slot}-alt"><span>${diffMap[slot]} ${diff.difficulty}</span></div>
          </div>
          <div class="songlist-entry-bpm">
            <p class="itg-bpm-${diffBpm.tier}">${diffBpm.value} <b>BPM</b></p>
          </div>
          <div class="songlist-entry-title">
            <p>${title} <i class="comment-small">${song.subtitle}</i></p>
          </div>
          <div class="songlist-entry-breakdown">
            <p>${cleanBd(diff.breakdown)}</p>
          </div>
        </div>`
        // Add to list
        list.push({
          diff:   Number(diff.difficulty),
          bpm:    Number(diffBpm.value),
          title:  title,
          ifMix:  title.includes("[Mix]"),
          html:   chartHtml
        })
      }
    }

    // Add element (song/chart view)
    if (isBySong === true) {
      const songHtml = `
      <div class="chart">
        <div class="chart-meta">
          <img class="chart-bn" src="${bnPath}" alt="${artist} - ${title}" title="${artist} - ${title}"/>
          <div class="chart-inner">
            <p class="itg-bpm-${bpm.tier}">${bpm.value} <b>BPM</b></p>
            <div class="chart-diffs">${diffs}</div>
          </div>
        </div>
        <div class="chart-stats">
          <div id="${id}-chart" class="chart-graph">${graphPath}</div>
          <div class="chart-desc">
            <p id="${id}-breakdown">${breakdown}</p>
          </div>
        </div>
      </div>`;
      // Add to list
      list.push({
        diff:   Number(mainDiff.difficulty),
        bpm:    Number(bpm.value),
        title:  title,
        ifMix:  title.includes("[Mix]"),
        html:   songHtml
      })
    }
  }

  // sort
  if (sortMode === "bpm") {
    list = list
    .sort((a,b) => a.diff - b.diff)
    .sort((a,b) => a.bpm - b.bpm)
    .sort((a,b) => a.ifMix - b.ifMix)
  } else if (sortMode === "sx") {
    list = list
    .sort((a,b) => a.bpm - b.bpm)
    .sort((a,b) => a.diff - b.diff)
  } else if (sortMode === "alpha") {
    list = list
    .sort((a,b) => a.title.localeCompare(b.title, 'en', {'sensitivity': 'base'}))
    .sort((a,b) => a.ifMix - b.ifMix)
  }

  // apply html
  list.forEach(chart => {
    htmlElement += chart.html;
  })
  const target = document.getElementById('charts');
  if (target) {
    target.innerHTML = htmlElement;
  }
}

export const listControl = async (data) => {
  const toggles = {
    list:   document.getElementById("toggle-list"),
    diffs:  document.getElementById("toggle-diffs"),
  }
  const sorts = {
    bpm:    document.getElementById("sort-bpm"),
    sx:     document.getElementById("sort-sx"),
    alpha:  document.getElementById("sort-alpha"),
  }
  const chartDiv  = document.getElementById('charts');
  let isBySong    = true;
  let sortMode    = "bpm";
  let showLowers  = false;

  // Swap sort mode
  const changeSort = newSort => {
    if (sortMode !== newSort) {
      sorts[sortMode].classList.add("action-hollow");
    }
    sortMode = newSort;
    sorts[newSort].classList.remove("action-hollow");
  }

  // Init
  await fileList(data, isBySong, sortMode, showLowers);
  toggles.diffs.disabled = true;

  // Handle button events
  util.addClickListener(async e => {
    // swap between chart + listview
    if (toggles.list.contains(e.target)) {
      isBySong = !isBySong;
      await fileList(data, isBySong, sortMode, showLowers);
      toggles.diffs.disabled = isBySong;
      if (isBySong !== true) {
        toggles.diffs.classList.remove("action-disabled");
        chartDiv.classList.add("nogaps");
      } else {
        toggles.diffs.classList.add("action-disabled");
        chartDiv.classList.remove("nogaps");
      }

    // show all difficulties
    } else if (toggles.diffs.contains(e.target) && !toggles.diffs.disabled) {
      showLowers = !showLowers;
      await fileList(data, isBySong, sortMode, showLowers);

    // sorts
    } else if (sorts.bpm.contains(e.target)) {
      changeSort("bpm");
      await fileList(data, isBySong, sortMode, showLowers);
    } else if (sorts.sx.contains(e.target)) {
      changeSort("sx");
      await fileList(data, isBySong, sortMode, showLowers);
    } else if (sorts.alpha.contains(e.target)) {
      changeSort("alpha");
      await fileList(data, isBySong, sortMode, showLowers);
    }
  })
}
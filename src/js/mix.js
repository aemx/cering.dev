import * as svg from './svg';

export const mixList = async (data) => {
  const keys = Object.keys(data);
  keys.forEach(sort => {
    let mixHtml = '';
    data[sort].forEach(mix => {
      const artist = mix.artistOnly ? mix.artist : `${mix.artist} (mixed by CERiNG)`;
      const packName = mix.packLink
        ? `<a class="link external" href="${mix.packLink}" target="_blank" rel="noopener">${mix.pack}</a>`
        : `<b>${mix.pack}</b>`
      const packLink = mix.pack ? `<p class="comment-small extend-none">from ${packName}</p>` : "";
      let srcAudio = `${artist} - ${mix.title}`
      if (mix.srcRule) {
        const srcReplace = mix.srcRule.in.match(/^\/.+\/$/)
          ? new RegExp(mix.srcRule.in.replace(/\//g,""))
          : mix.srcRule.in
        console.log(mix.title, srcReplace, mix.srcRule.out);
        srcAudio = srcAudio.replace(srcReplace, mix.srcRule.out);
        console.log(srcAudio);
      }
      let mixContents = ``;
      mix.songs.forEach(song => {
        const mm = String(Math.floor(song.time / 60)).padStart(2, "0");
        const ss = String(song.time % 60).padStart(2, "0");
        mixContents += `
          <p class="mix-song"><span class="mix-song-time">${mm}:${ss}</span> <span>${song.song}</span></p>
        `
      });
      mixHtml += `
        <div class="mix">
          <div class="mix-metadata">
            <p class="mix-genre">${mix.genre}</p>
            <p class="extend-none"><b><i>${artist}</i></b></p>
            <h3 class="text extend-none"><b>${mix.title}</b></h3>
            ${packLink}
          </div>
          <div class="mix-player">
            <a class="mix-download" href="assets/mix/${srcAudio}.mp3" target="_blank" download>
              ${svg.download}
            </a>
            <audio class="mix-audio" controls>
              <source src="assets/mix/${srcAudio}.mp3" type="audio/mpeg"/>
            </audio>
          </div>
          <div class="mix-contents">
            ${mixContents}
          </div>
        </div>
      `;
    })
    // Combine all html and put in appropriate ID
    const target = document.getElementById(`mixes-${sort}`);
    if (target) {
      target.innerHTML = mixHtml;
    }
  })
}
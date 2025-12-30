console.log("Script loaded");
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");


  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      console.log(element.href);
      console.log(element.href.split(`/%5C${folder}%5C`)[1]);
      songs.push(element.href.split(`/%5C${folder}%5C`)[1]);
    }
  }
  return songs;
}

const playmusic = (track, pause = false) => {
  //let audio = new Audio("/%5Csongs%5C" + track);
  currentsong.src = `/%5C${currfolder}%5C` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  //console.log(div);
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.href.includes("%5Csongs")) {
      console.log(element.href);
      let folder = element.href.split("%5C").slice(-1)[0];
      // Get the metadata of the album
      let a = await fetch(`/songs/${folder}/info.json`)
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log("Fetching Songs")
      console.log(item.currentTarget.dataset.folder.split("/")[0])
      songs = await getsongs(`songs%5C${item.currentTarget.dataset.folder.split("/")[0]}`)
      console.log(songs)
      playmusic(songs[0])

    })
  })
  return songs;
}

async function main() {


  // Get the list of all the songs
  songs = await getsongs("songs%5CAngry");
  playmusic(songs[0], true)

  //change playlist button
  document.querySelector(".change").addEventListener("click", async () => {
    let name = prompt("Enter the name of the playlist you want to change to");
    songs = await getsongs(`songs%5C${name}`);
    playmusic(songs[0])
  })

  // Display all the albums on the page
  songs = await displayAlbums()


  // Show all the songs into playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")}</div>
                                    <div> Rony</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="play.svg" alt="">
                                </div>
                            </li>`;
  }
  // Attach an event listner to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })
  });

  // Attach event listener to play,previous,next button
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });

  // Listern to timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration) * percent) / 100
  })

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })

  // Add an event listener for when the previous
  previous.addEventListener("click", () => {
    currentsong.pause()
    console.log("Previous clicked")
    let index = songs.indexOf(currentsong.src.split(`/%5C${currfolder}%5C`).slice(-1)[0])
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1])
    }
  })

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentsong.pause()
    console.log("Next clicked")
    //console.log(currentsong.src)
    //console.log(songs)
    let index = songs.indexOf(currentsong.src.split(`/%5C${currfolder}%5C`).slice(-1)[0])
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1])
    }


  })

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100")
    currentsong.volume = parseInt(e.target.value) / 100
    if (currentsong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
  })
}

main();
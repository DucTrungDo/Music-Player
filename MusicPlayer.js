const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const volumeBar = $('.volume-bar');
const muteIcon = $('.icon-mute');
const unmuteIcon = $('.icon-unmute');
const timeRange = $('#timeRange');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  currentVolume: 1,
  savedVolume: 1,

  config: {},
  // (1/2) Uncomment the line below to use localStorage
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: 'Nevada',
      singer: 'Vicetone',
      path: './assets/music/song1.mp3',
      image: './assets/img/song1.jpg',
    },
    {
      name: 'K-391 - Summertime',
      singer: 'Sunshine',
      path: './assets/music/song2.mp3',
      image: './assets/img/song2.jpg',
    },
    {
      name: 'Laura Brehm',
      singer: 'TheFatRat',
      path: './assets/music/song3.mp3',
      image: './assets/img/song3.jpg',
    },
    {
      name: 'Lost Frequencies',
      singer: 'Janieck Devy - Reality',
      path: './assets/music/song4.mp3',
      image: './assets/img/song4.jpg',
    },
    {
      name: 'Hanezeve Caradhina',
      singer: 'Takeshi Saito',
      path: './assets/music/song5.mp3',
      image: './assets/img/song5.jpg',
    },
    {
      name: 'Lemon Tree',
      singer: 'DJ DESA REMIX',
      path: './assets/music/song6.mp3',
      image: './assets/img/song6.jpg',
    },
    {
      name: 'Hotel California',
      singer: 'The Eagles',
      path: './assets/music/song7.mp3',
      image: './assets/img/song7.jpg',
    },
    {
      name: 'My Love',
      singer: 'Westlife',
      path: './assets/music/song8.mp3',
      image: './assets/img/song8.jpg',
    },
    {
      name: 'Attention',
      singer: 'Charlie Puth',
      path: './assets/music/song9.mp3',
      image: './assets/img/song9.jpg',
    },
    {
      name: 'Monsters',
      singer: 'Katie Sky',
      path: './assets/music/song10.mp3',
      image: './assets/img/song10.jpg',
    },
    {
      name: 'Free Bird',
      singer: 'Lynyrd Skynyrd',
      path: './assets/music/song11.mp3',
      image: './assets/img/song11.jpg',
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? 'active' : ''
        }" data-index="${index}">
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
    `;
    });
    playlist.innerHTML = htmls.join('');
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    let isTouchingVolume = false;
    volumeBar.addEventListener(
      'touchstart',
      (e) => {
        isTouchingVolume = true;
      },
      { passive: false }
    );

    document.addEventListener('touchmove', (e) => {
      if (isTouchingVolume) {
        e.preventDefault(); // Ngăn cuộn trang khi di chuyển ngón tay
      }
    });
    document.addEventListener('touchend', (e) => {
      isTouchingVolume = false;
    });
    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
    };

    // Khi song được pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
        timeRange.textContent =
          formatTime(audio.currentTime) + '/ ' + formatTime(audio.duration);
      }
    };
    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    // Xử lý khi tua song
    progress.oninput = function (e) {
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };

    // Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    };

    // Xử lý lặp lại một song
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');

      if (songNode || e.target.closest('.option')) {
        // Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        if (e.target.closest('.option')) {
        }
      }
    };

    //Xử lý khi click vào nút volume

    if (_this.currentVolume > 0) {
      volumeBar.value = _this.currentVolume;
      audio.volume = _this.currentVolume;
      $('.icon-unmute').style.visibility = 'visible';
      $('.icon-mute').style.visibility = 'hidden';
    } else {
      volumeBar.value = 0;
      audio.volume = 0;
      $('.icon-unmute').style.visibility = 'hidden';
      $('.icon-mute').style.visibility = 'visible';
    }
    audio.onvolumechange = () => {
      volumeBar.value = audio.volume;
      if (audio.volume === 0) {
        muteIcon.style.visibility = 'visible';
        unmuteIcon.style.visibility = 'hidden';
      } else {
        muteIcon.style.visibility = 'hidden';
        unmuteIcon.style.visibility = 'visible';
      }
    };

    volumeBar.oninput = (e) => {
      this.setConfig('currentVolume', e.target.value);
      audio.volume = volumeBar.value;
      volumeBar.setAttribute(
        'title',
        'Âm lượng ' + volumeBar.value * 100 + '%'
      );
    };

    unmuteIcon.onclick = (e) => {
      this.setConfig('savedVolume', audio.volume);
      audio.volume = 0;
      this.setConfig('currentVolume', audio.volume);
    };
    muteIcon.onclick = (e) => {
      audio.volume = this.config.savedVolume;
      this.setConfig('currentVolume', audio.volume);
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }, 100);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render playlist
    this.render();
  },
};

app.start();

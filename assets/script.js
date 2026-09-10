 // Database lưu trữ lời bài hát dưới dạng chuẩn LRC ([mm:ss.xx] Lời bài hát)
    const lyricsStore = {
      
// Nỗi buồn thối lại

      1: `[00:06.26] Ánh mắt trong veo
[00:09.25] Mái tóc mây thêu
[00:11.69] Sưởi ấm buổi chiều
[00:14.72] Rực rỡ nụ hồng môi em
[00:21.44] 
[00:24.56] Bóng lá trôi theo đường ta
[00:29.47] Ai đếm được là
[00:32.25] Ngày nắng còn lại bao nhiêu
[00:38.94] 
[00:41.76] Em muốn được ngồi đây
[00:47.10] Chiều hôm nay thu đến theo ai
[00:53.17] Nụ hôn ấy có khiến em vơi những ngày
[01:01.43] (...)
[01:18.20] Ánh mắt trong veo
[01:20.98] Mái tóc mây thêu
[01:23.65] Sưởi ấm buổi chiều
[01:26.42] Rực rỡ nụ hồng môi em
[01:32.32] 
[01:36.40] Bóng lá trôi theo đường ta
[01:41.45] Ai đếm được là ngày nắng còn lại bao nhiêu
[01:51.80] 
[01:56.41] Đứng xuống vai anh
[01:59.97] Là mái tóc em xanh
[02:03.01] Những nỗi buồn
[02:06.86] Thổi lại sau lưng
[02:12.58] (...)
[02:14.39] Em muốn được ngồi đây
[02:20.07] Chiều hôm nay thu đến theo ai
[02:26.11] Nụ hôn ấy có khiến em vơi những ngày không vui
[02:38.53] Em hát một bài ca
[02:44.21] Rồi không gian tan biến theo ai
[02:50.11] Dù anh có nghe thấy hay không
[02:54.98] Những dòng mưa xa
[03:02.20] (...)
[03:26.85] Em muốn được ngồi đây
[03:31.75] Chiều hôm nay thu đến theo ai
[03:38.45] (Em muốn được ngồi đây)
[03:44.15] Nụ hôn ấy có khiến em vơi
[03:50.48] Em hát một bài ca
[03:56.12] Rồi không gian tan biến theo ta
[04:02.82] (Em muốn được ngồi đây)
[04:08.13] Dù anh có nghe thấy hay không
[04:15.58] `,



// Nếu mùa hè còn mãi 


    };

    // DOM Elements
    const audio = document.getElementById('audioPlayer');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const albumPlayHoverBtn = document.getElementById('albumPlayHoverBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const trackItems = document.querySelectorAll('.track-item');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const lyricsContainer = document.getElementById('lyricsContainer');
    const lyricsView = document.getElementById('lyricsView');
    const playlistView = document.getElementById('playlistView');
    const tabLyricsBtn = document.getElementById('tabLyricsBtn');
    const tabPlaylistBtn = document.getElementById('tabPlaylistBtn');

    let currentTrackIndex = 0;
    let parsedLyrics = []; // Lưu trữ dạng mảng: [{ time: seconds, text: "..." }]
    let activeLyricIndex = -1;

    // --- Tab Switching Logic ---
    tabLyricsBtn.addEventListener('click', () => {
      lyricsView.classList.remove('hidden');
      playlistView.classList.add('hidden');
      tabLyricsBtn.className = "px-4 py-1.5 text-sm font-semibold border-b-2 border-sky-400 text-sky-400 transition";
      tabPlaylistBtn.className = "px-4 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition";
    });

    tabPlaylistBtn.addEventListener('click', () => {
      playlistView.classList.remove('hidden');
      lyricsView.classList.add('hidden');
      tabPlaylistBtn.className = "px-4 py-1.5 text-sm font-semibold border-b-2 border-sky-400 text-sky-400 transition";
      tabLyricsBtn.className = "px-4 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition";
    });

    // --- Parse LRC Lyrics Helper ---
    function parseLRC(lrcText) {
      if (!lrcText) return [];
      const lines = lrcText.split('\n');
      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
      const result = [];

      for (let line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
          const time = minutes * 60 + seconds + milliseconds / 1000;
          const text = line.replace(timeRegex, '').trim();
          if (text) {
            result.push({ time, text });
          }
        }
      }
      return result.sort((a, b) => a.time - b.time);
    }

    // Render lời bài hát ra danh sách HTML
    function renderLyrics(index) {
      const rawLrc = lyricsStore[index] || `[00:00.00] ${trackItems[index].querySelector('.track-title').innerText}\n[00:02.00] Lời bài hát đang được cập nhật...`;
      parsedLyrics = parseLRC(rawLrc);
      lyricsContainer.innerHTML = '';
      activeLyricIndex = -1;

      parsedLyrics.forEach((item, idx) => {
        const p = document.createElement('p');
        p.className = 'lyric-line text-slate-400 font-medium my-2.5 transition-all duration-300';
        p.innerText = item.text;
        p.dataset.index = idx;
        p.dataset.time = item.time;
        
        // Nhấp vào dòng chữ bất kỳ để phát ngay mốc thời gian đó
        p.addEventListener('click', () => {
          audio.currentTime = item.time;
          if (audio.paused) audio.play();
        });

        lyricsContainer.appendChild(p);
      });
    }

    // Cập nhật Highlight và Tự động cuộn dọc (Auto Scroll) lời bài hát
    function updateLyricsHighlight(currentTime) {
      if (!parsedLyrics.length) return;

      let newIndex = -1;
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (currentTime >= parsedLyrics[i].time) {
          newIndex = i;
        } else {
          break;
        }
      }

      if (newIndex !== activeLyricIndex) {
        const lines = lyricsContainer.querySelectorAll('.lyric-line');
        if (activeLyricIndex >= 0 && lines[activeLyricIndex]) {
          lines[activeLyricIndex].classList.remove('active');
        }

        if (newIndex >= 0 && lines[newIndex]) {
          lines[newIndex].classList.add('active');
          // Cuộn mượt dòng đang hát vào giữa khung nhìn
          lines[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        activeLyricIndex = newIndex;
      }
    }

    // --- Track Loading & Player Controls ---
    function loadTrack(index) {
      currentTrackIndex = index;
      const selectedItem = trackItems[index];
      const audioSrc = selectedItem.getAttribute('data-src');
      const title = selectedItem.querySelector('.track-title').innerText;

      audio.src = audioSrc;
      nowPlayingTitle.innerText = title;

      // Cập nhật giao diện danh sách nhạc
      trackItems.forEach((item, i) => {
        const icon = item.querySelector('.active-icon');
        if (i === index) {
          item.classList.add('active', 'bg-white/10', 'border-l-4', 'border-sky-400');
          item.querySelector('.track-title').classList.replace('text-slate-300', 'text-slate-200');
          if (icon) icon.classList.remove('opacity-0');
        } else {
          item.classList.remove('active', 'bg-white/10', 'border-l-4', 'border-sky-400');
          item.querySelector('.track-title').classList.replace('text-slate-200', 'text-slate-300');
          if (icon) icon.classList.add('opacity-0');
        }
      });

      renderLyrics(index);
    }

    function togglePlay() {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }

    function updatePlayIcon(isPlaying) {
      const icon = mainPlayBtn.querySelector('i');
      const hoverIcon = albumPlayHoverBtn.querySelector('i');
      if (isPlaying) {
        icon.className = 'fa-solid fa-pause';
        hoverIcon.className = 'fa-solid fa-pause';
      } else {
        icon.className = 'fa-solid fa-play ml-0.5';
        hoverIcon.className = 'fa-solid fa-play';
      }
    }

    function formatTime(seconds) {
      if (isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Event Listeners
    mainPlayBtn.addEventListener('click', togglePlay);
    albumPlayHoverBtn.addEventListener('click', togglePlay);

    prevBtn.addEventListener('click', () => {
      let prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) prevIndex = trackItems.length - 1;
      loadTrack(prevIndex);
      audio.play().catch(() => {});
    });

    nextBtn.addEventListener('click', () => {
      let nextIndex = currentTrackIndex + 1;
      if (nextIndex >= trackItems.length) nextIndex = 0;
      loadTrack(nextIndex);
      audio.play().catch(() => {});
    });

    trackItems.forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        loadTrack(idx);
        audio.play().catch(() => {});
      });
    });

    audio.addEventListener('play', () => updatePlayIcon(true));
    audio.addEventListener('pause', () => updatePlayIcon(false));

    audio.addEventListener('timeupdate', () => {
      const cur = audio.currentTime;
      const dur = audio.duration;

      if (!isNaN(dur) && dur > 0) {
        progressBar.value = (cur / dur) * 100;
        durationEl.innerText = formatTime(dur);
      }
      currentTimeEl.innerText = formatTime(cur);

      // Cập nhật dòng chữ theo tiến trình nhạc
      updateLyricsHighlight(cur);
    });

    audio.addEventListener('ended', () => {
      let nextIndex = currentTrackIndex + 1;
      if (nextIndex >= trackItems.length) nextIndex = 0;
      loadTrack(nextIndex);
      audio.play().catch(() => {});
    });

    progressBar.addEventListener('input', () => {
      const dur = audio.duration;
      if (!isNaN(dur) && dur > 0) {
        audio.currentTime = (progressBar.value / 100) * dur;
      }
    });

    // Khởi chạy bài hát đầu tiên khi load xong trang
    window.onload = () => {
      loadTrack(0);
    };
import { defineStore } from 'pinia';
import confetti from 'canvas-confetti';

export const useWeddingStore = defineStore('wedding', {
  state: () => ({
    weddingConfig: {
      groom: "陆子昂",
      groomEn: "Ethan",
      bride: "林婉清",
      brideEn: "Clara",
      weddingDate: "2026-10-18",
      venue: "云顶庄园 · 水晶空中礼堂",
      slogan: "以爱之名 · 共度余生",
      subSlogan: "TWO HEARTS, ONE LOVE",
      welcomeText: "欢迎各位亲朋好友莅临见证我们的幸福时刻",
      activeMusicId: "m-01"
    },
    screenSettings: {
      template: "champagne-gold", // champagne-gold | chinese-classic | forest-green | retro-polaroid | starlight-dream
      transition: "kenburns",
      fitMode: "cover", // cover 铺满屏幕 | contain 居中自适应
      interval: 6,
      showStory: true,
      showDanmaku: true,
      danmakuSpeed: "normal",
      danmakuOpacity: 0.9,
      isPaused: false,
      musicPlaying: false,
      currentPhotoIndex: 0
    },
    photos: [],
    musicList: [],
    blessings: [],
    serverInfo: {
      localIp: 'localhost',
      port: 3000,
      blessingUrl: '',
      screenUrl: '',
      adminUrl: ''
    },
    // 运行态变量
    isConnected: false,
    audioElement: null,
    carouselTimer: null,
    activeDanmakuQueue: [], // 正在屏幕漂浮的弹幕
    latestBlessing: null,   // 最新弹出弹幕卡片
    showQrModal: false,
    isFullscreen: false
  }),

  getters: {
    currentPhoto: (state) => {
      if (!state.photos || state.photos.length === 0) return null;
      const idx = state.screenSettings.currentPhotoIndex % state.photos.length;
      return state.photos[idx] || state.photos[0];
    },
    activeMusic: (state) => {
      return state.musicList.find(m => m.id === state.weddingConfig.activeMusicId) || state.musicList[0] || null;
    },
    approvedBlessings: (state) => {
      return state.blessings.filter(b => b.status !== 'rejected');
    }
  },

  actions: {
    async init() {
      await this.fetchInitialData();
      this.initWebSocket();
      this.initAudio();
      this.startCarousel();
    },

    async fetchInitialData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            this.weddingConfig = json.data.weddingConfig;
            this.screenSettings = json.data.screenSettings;
            this.photos = json.data.photos;
            this.musicList = json.data.musicList;
            this.blessings = json.data.blessings;
            this.serverInfo = json.serverInfo;
          }
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    },

    initWebSocket() {
      const loc = window.location;
      const host = loc.hostname;
      // 后端端口通常是 3000，或通过代理
      const wsUrl = `ws://${host}:3000`;
      
      let ws;
      try {
        ws = new WebSocket(wsUrl);
      } catch (e) {
        console.warn('WS connection failed, retry in 3s', e);
        setTimeout(() => this.initWebSocket(), 3000);
        return;
      }

      ws.onopen = () => {
        this.isConnected = true;
        console.log('✅ 大屏 WebSocket 实时通信已就绪');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleWsMessage(msg);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        this.isConnected = false;
        setTimeout(() => this.initWebSocket(), 3000);
      };

      ws.onerror = (err) => {
        console.warn('WS error:', err);
      };

      this.ws = ws;
    },

    sendWsControl(type, data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, data }));
      }
    },

    handleWsMessage(msg) {
      switch (msg.type) {
        case 'INIT_STATE':
          if (msg.data) {
            this.weddingConfig = msg.data.weddingConfig;
            this.screenSettings = msg.data.screenSettings;
            this.photos = msg.data.photos;
            this.musicList = msg.data.musicList;
            this.blessings = msg.data.blessings;
          }
          break;

        case 'SCREEN_SETTINGS_CHANGED':
          Object.assign(this.screenSettings, msg.data);
          // 重新校准轮播或音乐
          if (msg.data.musicPlaying !== undefined) {
            if (msg.data.musicPlaying) {
              this.playMusic();
            } else {
              this.pauseMusic();
            }
          }
          break;

        case 'WEDDING_CONFIG_CHANGED':
          Object.assign(this.weddingConfig, msg.data);
          break;

        case 'PHOTOS_UPDATED':
          this.photos = msg.data;
          break;

        case 'NEW_BLESSING':
          this.blessings.unshift(msg.data);
          this.triggerNewDanmaku(msg.data);
          this.launchConfetti();
          break;

        case 'BLESSING_LIKED':
          const idx = this.blessings.findIndex(b => b.id === msg.data.id);
          if (idx !== -1) {
            this.blessings[idx].likes = msg.data.likes;
          }
          break;

        case 'BLESSINGS_UPDATED':
          this.blessings = msg.data;
          break;

        case 'TRIGGER_CONFETTI':
          this.launchConfetti(msg.data?.intensity || 'medium');
          break;
      }
    },

    // 弹幕触发与排队
    triggerNewDanmaku(blessing) {
      this.latestBlessing = blessing;
      // 屏幕上方随机垂直轨道 (15% ~ 65%)
      const topPercent = Math.floor(Math.random() * 50) + 12;
      const danmakuItem = {
        id: `fly-${Date.now()}-${Math.random()}`,
        top: topPercent,
        sender: blessing.sender,
        avatar: blessing.avatar || '💖',
        content: blessing.content
      };
      this.activeDanmakuQueue.push(danmakuItem);
      // 12秒后从当前活动队列清除
      setTimeout(() => {
        this.activeDanmakuQueue = this.activeDanmakuQueue.filter(item => item.id !== danmakuItem.id);
      }, 13000);

      // 4秒后收起最新弹出卡片
      setTimeout(() => {
        if (this.latestBlessing && this.latestBlessing.id === blessing.id) {
          this.latestBlessing = null;
        }
      }, 4500);
    },

    // 庆祝礼花特效
    launchConfetti(intensity = 'medium') {
      const count = intensity === 'super' ? 120 : 60;
      confetti({
        particleCount: count,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ec4899', '#ef4444', '#10b981', '#fbbf24', '#ffffff']
      });
      // 伴随两侧金粉散落
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    },

    // 轮播控制
    startCarousel() {
      if (this.carouselTimer) clearInterval(this.carouselTimer);
      const intervalMs = Math.max(3, this.screenSettings.interval || 6) * 1000;
      this.carouselTimer = setInterval(() => {
        if (!this.screenSettings.isPaused && this.photos.length > 0) {
          this.nextPhoto(false);
        }
      }, intervalMs);
    },

    stopCarousel() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer);
        this.carouselTimer = null;
      }
    },

    nextPhoto(sync = true) {
      if (this.photos.length === 0) return;
      const nextIdx = (this.screenSettings.currentPhotoIndex + 1) % this.photos.length;
      this.screenSettings.currentPhotoIndex = nextIdx;
      if (sync) {
        this.syncScreenSettings({ currentPhotoIndex: nextIdx });
      }
    },

    prevPhoto(sync = true) {
      if (this.photos.length === 0) return;
      const prevIdx = (this.screenSettings.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
      this.screenSettings.currentPhotoIndex = prevIdx;
      if (sync) {
        this.syncScreenSettings({ currentPhotoIndex: prevIdx });
      }
    },

    goToPhoto(index, sync = true) {
      if (index >= 0 && index < this.photos.length) {
        this.screenSettings.currentPhotoIndex = index;
        if (sync) {
          this.syncScreenSettings({ currentPhotoIndex: index });
        }
      }
    },

    togglePlayPause() {
      this.screenSettings.isPaused = !this.screenSettings.isPaused;
      this.syncScreenSettings({ isPaused: this.screenSettings.isPaused });
    },

    setTemplate(template) {
      this.screenSettings.template = template;
      this.syncScreenSettings({ template });
    },

    setTransition(transition) {
      this.screenSettings.transition = transition;
      this.syncScreenSettings({ transition });
    },

    setIntervalTime(seconds) {
      this.screenSettings.interval = seconds;
      this.syncScreenSettings({ interval: seconds });
      this.startCarousel();
    },

    toggleDanmaku() {
      this.screenSettings.showDanmaku = !this.screenSettings.showDanmaku;
      this.syncScreenSettings({ showDanmaku: this.screenSettings.showDanmaku });
    },

    toggleStory() {
      this.screenSettings.showStory = !this.screenSettings.showStory;
      this.syncScreenSettings({ showStory: this.screenSettings.showStory });
    },

    toggleFitMode() {
      const next = this.screenSettings.fitMode === 'cover' ? 'contain' : 'cover';
      this.setFitMode(next);
    },

    setFitMode(mode) {
      this.screenSettings.fitMode = mode;
      this.syncScreenSettings({ fitMode: mode });
    },

    async syncScreenSettings(changes) {
      try {
        await fetch('/api/screen-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes)
        });
      } catch (e) {
        console.error('Failed to sync screen settings:', e);
      }
    },

    // 音乐播放器支持
    initAudio() {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.loop = true;
      }
      this.updateAudioSource();
    },

    updateAudioSource() {
      if (this.activeMusic && this.audioElement) {
        if (this.audioElement.src !== this.activeMusic.url) {
          this.audioElement.src = this.activeMusic.url;
          if (this.screenSettings.musicPlaying) {
            this.playMusic();
          }
        }
      }
    },

    playMusic() {
      if (!this.audioElement) this.initAudio();
      this.updateAudioSource();
      this.audioElement.play().then(() => {
        this.screenSettings.musicPlaying = true;
      }).catch(err => {
        console.log('Audio autoplay prevented by browser policy (click anywhere to start):', err);
        this.screenSettings.musicPlaying = false;
      });
    },

    pauseMusic() {
      if (this.audioElement) {
        this.audioElement.pause();
        this.screenSettings.musicPlaying = false;
      }
    },

    toggleMusic() {
      if (this.screenSettings.musicPlaying) {
        this.pauseMusic();
        this.syncScreenSettings({ musicPlaying: false });
      } else {
        this.playMusic();
        this.syncScreenSettings({ musicPlaying: true });
      }
    },

    switchMusic(musicId) {
      this.weddingConfig.activeMusicId = musicId;
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeMusicId: musicId })
      });
      this.updateAudioSource();
    },

    // 全屏切换
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          this.isFullscreen = true;
        }).catch(err => console.warn(err));
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            this.isFullscreen = false;
          });
        }
      }
    },

    // 照片管理 Actions
    async deletePhoto(id) {
      // 乐观立即从本地数组移除，消除等待感
      const previousPhotos = [...this.photos];
      this.photos = this.photos.filter(p => p.id !== id);
      if (this.screenSettings.currentPhotoIndex >= this.photos.length) {
        this.screenSettings.currentPhotoIndex = Math.max(0, this.photos.length - 1);
      }

      try {
        const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            this.photos = json.data;
          }
          return true;
        } else {
          // 失败回滚
          this.photos = previousPhotos;
          return false;
        }
      } catch (err) {
        console.error('Failed to delete photo:', err);
        this.photos = previousPhotos;
        return false;
      }
    },

    async uploadPhotos(files, category = 'wedding') {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
      formData.append('category', category);

      try {
        const res = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            this.photos.push(...json.data);
          }
          return true;
        }
      } catch (err) {
        console.error('Failed to upload photos:', err);
      }
      return false;
    },

    async addPhoto(photoData) {
      try {
        const res = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photoData)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            this.photos.push(json.data);
          }
          return true;
        }
      } catch (err) {
        console.error('Failed to add photo:', err);
      }
      return false;
    },

    async updatePhoto(id, updates) {
      try {
        const res = await fetch(`/api/photos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const idx = this.photos.findIndex(p => p.id === id);
            if (idx !== -1) {
              this.photos[idx] = { ...this.photos[idx], ...json.data };
            }
          }
          return true;
        }
      } catch (err) {
        console.error('Failed to update photo:', err);
      }
      return false;
    },

    async resetDefaultPhotos() {
      try {
        const res = await fetch('/api/photos/reset-default', { method: 'POST' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            this.photos = json.data;
          }
          return true;
        }
      } catch (err) {
        console.error('Failed to reset default photos:', err);
      }
      return false;
    }
  }
});

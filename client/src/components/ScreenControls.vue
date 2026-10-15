<template>
  <div 
    class="controls-wrapper" 
    :class="{ 'is-visible': isHovered || isLocked }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 顶部热区触发提示微光条 -->
    <div class="hover-trigger-bar">
      <span class="indicator-arrow">✦ 播控栏 (移入展开) ✦</span>
    </div>

    <!-- 悬浮播控条主体 -->
    <div class="controls-bar glass-panel-dark">
      <!-- 轮播前后翻页与播放暂停 -->
      <div class="control-group">
        <button class="icon-btn" title="上一张 (←)" @click="store.prevPhoto()">
          <ChevronLeft :size="20" />
        </button>

        <button 
          class="icon-btn play-btn" 
          :title="store.screenSettings.isPaused ? '开始轮播 (空格)' : '暂停轮播 (空格)'" 
          @click="store.togglePlayPause()"
        >
          <Play v-if="store.screenSettings.isPaused" :size="20" />
          <Pause v-else :size="20" />
        </button>

        <button class="icon-btn" title="下一张 (→)" @click="store.nextPhoto()">
          <ChevronRight :size="20" />
        </button>
      </div>

      <div class="divider"></div>

      <!-- 模板切换下拉/快捷切换 -->
      <div class="control-group template-selector">
        <Palette :size="18" class="text-gold" />
        <select 
          :value="store.screenSettings.template" 
          @change="e => store.setTemplate(e.target.value)"
          class="theme-select"
        >
          <option value="champagne-gold">✨ 浪漫法式香槟金</option>
          <option value="chinese-classic">🏮 中式国潮吉庆红</option>
          <option value="forest-green">🌿 极简轻奢白绿森系</option>
          <option value="retro-polaroid">📷 复古拍立得时光</option>
          <option value="starlight-dream">🌌 现代梦幻星空幻境</option>
        </select>
      </div>

      <!-- 轮播间隔时间 -->
      <div class="control-group interval-selector">
        <Clock :size="16" class="text-muted" />
        <select 
          :value="store.screenSettings.interval" 
          @change="e => store.setIntervalTime(Number(e.target.value))"
          class="time-select"
        >
          <option :value="4">4秒切换</option>
          <option :value="6">6秒切换</option>
          <option :value="8">8秒切换</option>
          <option :value="10">10秒切换</option>
        </select>
      </div>

      <div class="divider"></div>

      <!-- 音乐播放控制器 -->
      <div class="control-group music-group">
        <button 
          class="icon-btn music-btn" 
          :class="{ 'is-playing': store.screenSettings.musicPlaying }"
          :title="store.screenSettings.musicPlaying ? '暂停背景音乐' : '播放背景音乐'"
          @click="store.toggleMusic()"
        >
          <Music :size="18" />
        </button>
        <span class="music-name" v-if="store.activeMusic">
          {{ store.activeMusic.name }}
        </span>
      </div>

      <div class="divider"></div>

      <!-- 互动与辅助功能 -->
      <div class="control-group">
        <!-- 弹幕开关 -->
        <button 
          class="btn-toggle" 
          :class="{ active: store.screenSettings.showDanmaku }"
          title="开关现场祝福弹幕"
          @click="store.toggleDanmaku()"
        >
          <MessageSquare :size="16" />
          <span>弹幕 {{ store.screenSettings.showDanmaku ? '开' : '关' }}</span>
        </button>

        <!-- 一键漫天礼花 -->
        <button 
          class="btn-confetti" 
          title="发射庆祝礼花" 
          @click="store.launchConfetti('super')"
        >
          <Sparkles :size="16" />
          <span>撒花</span>
        </button>

        <!-- 扫码祝福二维码 -->
        <button 
          class="btn-qr" 
          title="显示宾客手机扫码入口"
          @click="store.showQrModal = true"
        >
          <QrCode :size="16" />
          <span>扫码祝福</span>
        </button>
      </div>

      <div class="divider"></div>

      <!-- 全屏与画面比例控制 -->
      <div class="control-group">
        <!-- 画面比例切换 (铺满全屏 / 完整居中) -->
        <button 
          class="btn-toggle" 
          :class="{ active: store.screenSettings.fitMode === 'cover' }"
          :title="store.screenSettings.fitMode === 'cover' ? '当前模式: 铺满大屏 (点击切换完整居中)' : '当前模式: 完整居中 (点击切换铺满大屏)'"
          @click="store.toggleFitMode()"
        >
          <Scaling :size="16" />
          <span>{{ store.screenSettings.fitMode === 'cover' ? '铺满屏幕' : '完整居中' }}</span>
        </button>

        <button 
          class="icon-btn" 
          :title="store.isFullscreen ? '退出全屏 (F/Esc)' : '全屏沉浸播放 (F)'" 
          @click="store.toggleFullscreen()"
        >
          <Maximize v-if="!store.isFullscreen" :size="18" />
          <Minimize v-else :size="18" />
        </button>

        <router-link to="/admin" class="admin-link-btn" title="进入后台播控与照片管理">
          <Settings :size="18" />
          <span>管理后台</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useWeddingStore } from '@/stores/wedding';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Palette, Clock, 
  Music, MessageSquare, Sparkles, QrCode, Maximize, Minimize, Settings, Scaling 
} from 'lucide-vue-next';

const store = useWeddingStore();
const isHovered = ref(false);
const isLocked = ref(false);
let hideTimer = null;

function handleMouseEnter() {
  isHovered.value = true;
  if (hideTimer) clearTimeout(hideTimer);
}

function handleMouseLeave() {
  hideTimer = setTimeout(() => {
    isHovered.value = false;
  }, 1200);
}

// 监听键盘快捷键
function handleKeyDown(e) {
  // 当不在输入框中时
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

  if (e.code === 'Space') {
    e.preventDefault();
    store.togglePlayPause();
  } else if (e.code === 'ArrowRight') {
    store.nextPhoto();
  } else if (e.code === 'ArrowLeft') {
    store.prevPhoto();
  } else if (e.key === 'f' || e.key === 'F') {
    store.toggleFullscreen();
  } else if (e.key === 'm' || e.key === 'M') {
    store.toggleMusic();
  } else if (e.key === 'b' || e.key === 'B') {
    store.toggleDanmaku();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<style scoped>
.controls-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(-82%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.controls-wrapper.is-visible {
  transform: translateY(0);
}

.hover-trigger-bar {
  padding: 6px 20px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  cursor: pointer;
  color: rgba(254, 240, 138, 0.7);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  transition: all 0.3s ease;
}

.hover-trigger-bar:hover {
  background: rgba(0, 0, 0, 0.75);
  color: #fde047;
}

.controls-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  border-radius: 30px;
  margin-top: 8px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 4px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.06);
}

.play-btn {
  background: #f59e0b;
  color: #000;
}
.play-btn:hover {
  background: #fbbf24;
}

.theme-select,
.time-select {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.theme-select option,
.time-select option {
  background: #18181b;
  color: #fff;
}

.music-group {
  max-width: 180px;
}

.music-btn.is-playing {
  background: #10b981;
  color: #fff;
  animation: pulseGlow 2s infinite;
}

.music-name {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-toggle,
.btn-confetti,
.btn-qr,
.admin-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-toggle {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
}
.btn-toggle.active {
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(96, 165, 250, 0.5);
  color: #bfdbfe;
}

.btn-confetti {
  background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
  color: #fff;
}
.btn-confetti:hover {
  filter: brightness(1.15);
}

.btn-qr {
  background: linear-gradient(135deg, #eab308 0%, #d97706 100%);
  color: #000;
  font-weight: 600;
}
.btn-qr:hover {
  filter: brightness(1.1);
}

.admin-link-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.admin-link-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.text-gold {
  color: #f59e0b;
}
.text-muted {
  color: rgba(255, 255, 255, 0.6);
}
</style>

<template>
  <div class="template-retro-polaroid">
    <!-- 智能照片舞台 (横图饱满大屏，竖图拍立得相纸卡框装裱不裁切) -->
    <SmartPhotoStage 
      :photo="currentPhoto"
      template="retro-polaroid"
      :transitionAnimation="transitionAnimation"
      :isPaused="screenSettings.isPaused"
    />

    <!-- 屏幕贴边复古边框与和纸胶带 -->
    <div class="screen-frame-decor">
      <div class="vintage-border-line"></div>
      <div class="washi-tape top-left-tape"></div>
      <div class="washi-tape top-right-tape"></div>
    </div>

    <!-- 怀旧纪念邮戳印章 -->
    <div class="post-stamp-float">
      <span>FOREVER</span>
      <small>{{ weddingConfig.weddingDate.substring(0, 4) }}</small>
    </div>

    <!-- 顶部手写时光标题 -->
    <header class="polaroid-header-float">
      <div class="header-inner glass-panel-dark">
        <div class="stamp-badge">
          <span class="icon">📷</span>
          <span>OUR LOVE STORY ARCHIVE</span>
        </div>
        <div class="names-script">
          {{ weddingConfig.groom }} & {{ weddingConfig.bride }}
        </div>
        <div class="vintage-sub">
          时光漫漫，与你定格的每一个心动时刻
        </div>
      </div>
    </header>

    <!-- 底部悬浮手写便签与故事卡片 -->
    <footer v-if="screenSettings.showStory && currentPhoto" class="polaroid-footer-float">
      <div class="polaroid-card-note glass-panel-dark">
        <div class="handwriting-title">{{ currentPhoto.title }}</div>
        <div class="handwriting-note">“{{ currentPhoto.story }}”</div>
        <div class="polaroid-meta">
          <span class="loc">📍 {{ currentPhoto.location }}</span>
          <span class="date">📅 {{ currentPhoto.date }}</span>
          <span class="index">#{{ screenSettings.currentPhotoIndex + 1 }} / {{ totalPhotos }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SmartPhotoStage from '@/components/SmartPhotoStage.vue';

const props = defineProps({
  currentPhoto: Object,
  weddingConfig: Object,
  screenSettings: Object,
  totalPhotos: Number
});

const transitionAnimation = computed(() => {
  const trans = props.screenSettings.transition;
  if (trans === 'kenburns') {
    return (props.screenSettings.currentPhotoIndex % 2 === 0) ? 'anim-kenburns-in' : 'anim-kenburns-out';
  }
  return '';
});
</script>

<style scoped>
.template-retro-polaroid {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #140e0a;
  font-family: var(--font-serif);
}

/* 屏幕四周胶带微饰 */
.screen-frame-decor {
  position: absolute;
  inset: 16px;
  pointer-events: none;
  z-index: 10;
}

.vintage-border-line {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(254, 240, 138, 0.25);
  border-radius: 12px;
}

.washi-tape {
  position: absolute;
  width: 110px;
  height: 28px;
  background: rgba(254, 240, 138, 0.55);
  border-left: 2px dashed rgba(202, 138, 4, 0.4);
  border-right: 2px dashed rgba(202, 138, 4, 0.4);
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
}
.top-left-tape {
  top: 10px;
  left: 30px;
  transform: rotate(-3deg);
}
.top-right-tape {
  top: 10px;
  right: 30px;
  transform: rotate(4deg);
}

.post-stamp-float {
  position: absolute;
  top: 2.2rem;
  right: 3.5rem;
  width: 68px;
  height: 68px;
  border: 2px dashed #f59e0b;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fde68a;
  transform: rotate(15deg);
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 25;
  pointer-events: none;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
}

/* 顶部悬浮名牌 */
.polaroid-header-float {
  position: absolute;
  top: 1.2rem;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.header-inner {
  padding: 6px 30px;
  border-radius: 40px;
  border: 1px solid rgba(254, 240, 138, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.stamp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  color: #fde68a;
  background: rgba(0,0,0,0.3);
  padding: 2px 10px;
  border-radius: 20px;
  border: 1px dashed rgba(253, 230, 138, 0.4);
}

.names-script {
  font-size: 2rem;
  font-weight: 700;
  color: #fef3c7;
  letter-spacing: 0.08em;
  margin: 0.1rem 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
}

.vintage-sub {
  font-size: 0.8rem;
  color: rgba(254, 243, 199, 0.85);
  font-style: italic;
  letter-spacing: 0.1em;
}

/* 底部悬浮手写卡片 */
.polaroid-footer-float {
  position: absolute;
  bottom: 1.2rem;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.polaroid-card-note {
  max-width: 600px;
  width: 82%;
  border: 1px solid rgba(254, 240, 138, 0.3);
  border-radius: 16px;
  padding: 0.7rem 1.6rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  animation: slideUpFade 0.6s ease-out;
}

.handwriting-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #fef3c7;
  margin-bottom: 0.2rem;
}

.handwriting-note {
  font-size: 0.92rem;
  line-height: 1.5;
  margin-bottom: 0.3rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
}

.polaroid-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.78rem;
  color: #fde68a;
}
</style>

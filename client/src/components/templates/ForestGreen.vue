<template>
  <div class="template-forest-green">
    <!-- 智能照片舞台 (横图饱满铺满，竖图白卡画廊装裱不裁切) -->
    <SmartPhotoStage 
      :photo="currentPhoto"
      template="forest-green"
      :transitionAnimation="transitionAnimation"
      :isPaused="screenSettings.isPaused"
    />

    <!-- 屏幕贴边自然植物微边框 -->
    <div class="screen-frame-decor">
      <div class="forest-border-line"></div>
      <div class="leaf-corner leaf-tl">🌿</div>
      <div class="leaf-corner leaf-tr">🌿</div>
      <div class="leaf-corner leaf-bl">🌿</div>
      <div class="leaf-corner leaf-br">🌿</div>
    </div>

    <!-- 顶部悬浮森林画报抬头 -->
    <header class="forest-header-float">
      <div class="header-inner glass-panel-dark">
        <div class="brand-line">
          <span class="leaf">🌿</span>
          <span class="brand-text">BOTANICAL LOVE STORY</span>
          <span class="leaf">🌿</span>
        </div>
        <div class="couple-title">
          <span class="first-name">{{ weddingConfig.groomEn }}</span>
          <span class="ampersand">&</span>
          <span class="second-name">{{ weddingConfig.brideEn }}</span>
        </div>
        <div class="cn-names">
          {{ weddingConfig.groom }} 与 {{ weddingConfig.bride }} 的婚礼之约
        </div>
      </div>
    </header>

    <!-- 底部悬浮森系文艺卡片 -->
    <footer v-if="screenSettings.showStory && currentPhoto" class="forest-footer-float">
      <div class="botanical-card glass-panel-dark">
        <div class="card-header-bar">
          <span class="botanical-tag">自然絮语 / {{ currentPhoto.category }}</span>
          <span class="venue-mark">{{ weddingConfig.venue }}</span>
        </div>
        <h3 class="forest-photo-title">{{ currentPhoto.title }}</h3>
        <p class="forest-desc">“{{ currentPhoto.story }}”</p>
        <div class="forest-meta">
          <span>🌿 {{ currentPhoto.location }}</span>
          <span class="dot">•</span>
          <span>📅 {{ currentPhoto.date }}</span>
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
.template-forest-green {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #02120b;
  font-family: var(--font-sans);
}

/* 屏幕贴边微边框 */
.screen-frame-decor {
  position: absolute;
  inset: 16px;
  pointer-events: none;
  z-index: 10;
}

.forest-border-line {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(110, 231, 183, 0.3);
  box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.1);
  border-radius: 12px;
}

.leaf-corner {
  position: absolute;
  font-size: 1.4rem;
  opacity: 0.8;
}
.leaf-tl { top: 2px; left: 4px; }
.leaf-tr { top: 2px; right: 4px; transform: scaleX(-1); }
.leaf-bl { bottom: 2px; left: 4px; transform: scaleY(-1); }
.leaf-br { bottom: 2px; right: 4px; transform: scale(-1); }

/* 顶部悬浮名牌 */
.forest-header-float {
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
  padding: 6px 28px;
  border-radius: 40px;
  border: 1px solid rgba(110, 231, 183, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.brand-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.72rem;
  letter-spacing: 0.35em;
  color: #a7f3d0;
  font-family: var(--font-serif);
}

.couple-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-family: var(--font-serif);
  font-size: 2rem;
  letter-spacing: 0.08em;
  margin: 0.1rem 0;
  color: #f0fdf4;
}

.ampersand {
  font-style: italic;
  color: #6ee7b7;
  font-size: 1.6rem;
  font-weight: 300;
}

.cn-names {
  font-size: 0.8rem;
  color: rgba(209, 250, 229, 0.85);
  letter-spacing: 0.15em;
}

/* 底部悬浮卡片 */
.forest-footer-float {
  position: absolute;
  bottom: 1.2rem;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.botanical-card {
  max-width: 600px;
  width: 82%;
  border: 1px solid rgba(110, 231, 183, 0.25);
  border-radius: 16px;
  padding: 0.7rem 1.6rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  animation: slideUpFade 0.6s ease-out;
}

.card-header-bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #a7f3d0;
  margin-bottom: 0.2rem;
  letter-spacing: 0.1em;
}

.forest-photo-title {
  color: #f0fdf4;
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  letter-spacing: 0.05em;
}

.forest-desc {
  font-size: 0.92rem;
  color: rgba(240, 253, 244, 0.9);
  font-style: italic;
  font-family: var(--font-serif);
  line-height: 1.5;
  margin-bottom: 0.3rem;
}

.forest-meta {
  font-size: 0.78rem;
  color: rgba(167, 243, 208, 0.8);
  display: flex;
  justify-content: center;
  gap: 14px;
}
</style>

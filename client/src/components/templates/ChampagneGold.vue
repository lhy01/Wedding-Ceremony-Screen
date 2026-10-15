<template>
  <div class="template-champagne-gold">
    <!-- 动态微金光影 -->
    <div class="ambient-glow"></div>
    <div class="ambient-glow glow-2"></div>

    <!-- 智能照片舞台 (横图饱满铺满，竖图金框装裱居中不裁切) -->
    <SmartPhotoStage 
      :photo="currentPhoto"
      template="champagne-gold"
      :transitionAnimation="transitionAnimation"
      :isPaused="screenSettings.isPaused"
    />

    <!-- 屏幕贴边奢华流金边框与典雅四角花饰 -->
    <div class="screen-frame-decor">
      <div class="gold-border-line"></div>
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
    </div>

    <!-- 顶部悬浮新人名牌与仪式抬头 -->
    <header class="header-banner-float">
      <div class="header-inner glass-panel-dark">
        <div class="title-line">
          <span class="ornament">❖</span>
          <span class="en-sub">THE WEDDING CELEBRATION</span>
          <span class="ornament">❖</span>
        </div>
        <div class="couple-names">
          <span class="name groom">{{ weddingConfig.groom }} <small class="en">({{ weddingConfig.groomEn }})</small></span>
          <div class="heart-symbol">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span class="name bride">{{ weddingConfig.bride }} <small class="en">({{ weddingConfig.brideEn }})</small></span>
        </div>
        <div class="date-venue">
          <span>{{ weddingConfig.weddingDate }}</span>
          <span class="dot">•</span>
          <span>{{ weddingConfig.venue }}</span>
        </div>
      </div>
    </header>

    <!-- 底部悬浮心语故事卡片 -->
    <footer v-if="screenSettings.showStory && currentPhoto" class="footer-story-float">
      <div class="story-card glass-panel-dark">
        <div class="story-tag">
          <span class="category-badge">{{ formatCategory(currentPhoto.category) }}</span>
          <span class="photo-index">{{ (screenSettings.currentPhotoIndex + 1).toString().padStart(2, '0') }} / {{ totalPhotos.toString().padStart(2, '0') }}</span>
        </div>
        <h2 class="photo-title">{{ currentPhoto.title }}</h2>
        <p class="story-desc">“{{ currentPhoto.story }}”</p>
        <div class="photo-meta">
          <span class="loc"><span class="icon">📍</span>{{ currentPhoto.location }}</span>
          <span class="date"><span class="icon">📅</span>{{ currentPhoto.date }}</span>
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

function formatCategory(cat) {
  const map = {
    wedding: '婚纱大片',
    daily: '甜蜜日常',
    proposal: '求婚铭记',
    welcoming: '宾客迎礼'
  };
  return map[cat] || '美好瞬间';
}
</script>

<style scoped>
.template-champagne-gold {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0d0a08;
}

.ambient-glow {
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(234, 179, 8, 0.16) 0%, transparent 70%);
  top: -10%;
  left: 10%;
  pointer-events: none;
  filter: blur(80px);
  z-index: 6;
  animation: floatGentle 14s ease-in-out infinite alternate;
}

.glow-2 {
  top: 40%;
  left: 60%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%);
  animation-duration: 18s;
  animation-direction: alternate-reverse;
}

/* 屏幕贴边奢华流金边框 */
.screen-frame-decor {
  position: absolute;
  inset: 16px;
  pointer-events: none;
  z-index: 10;
}

.gold-border-line {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(212, 175, 55, 0.35);
  box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.1);
  border-radius: 12px;
}

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #fef08a;
  border-style: solid;
}
.corner-tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
.corner-tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
.corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
.corner-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

/* 顶部悬浮名牌 */
.header-banner-float {
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
  padding: 6px 26px;
  border-radius: 40px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(234, 179, 8, 0.2);
  text-align: center;
  animation: slideUpFade 0.8s ease-out;
}

.title-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #d4af37;
  font-size: 0.72rem;
  letter-spacing: 0.3em;
  font-weight: 500;
}

.couple-names {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin: 0.1rem 0;
}

.couple-names .name {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #fff7ed 0%, #fef08a 40%, #eab308 70%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.8));
}

.couple-names .en {
  font-size: 0.9rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  opacity: 0.9;
}

.heart-symbol {
  color: #f59e0b;
  animation: pulseGlow 2.5s infinite;
  display: flex;
  align-items: center;
}

.date-venue {
  color: rgba(254, 243, 199, 0.85);
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.date-venue .dot {
  color: #d4af37;
}

/* 底部悬浮故事卡片 */
.footer-story-float {
  position: absolute;
  bottom: 1.2rem;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.story-card {
  max-width: 600px;
  width: 82%;
  padding: 0.7rem 1.6rem;
  border-radius: 16px;
  border: 1px solid rgba(234, 179, 8, 0.35);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
  text-align: center;
  animation: slideUpFade 0.6s ease-out;
}

.story-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.category-badge {
  font-size: 0.72rem;
  padding: 2px 10px;
  background: rgba(234, 179, 8, 0.25);
  border: 1px solid rgba(234, 179, 8, 0.45);
  color: #fef08a;
  border-radius: 20px;
  letter-spacing: 0.1em;
}

.photo-index {
  font-family: var(--font-title);
  font-size: 0.82rem;
  color: rgba(254, 240, 138, 0.8);
  letter-spacing: 0.15em;
}

.photo-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.2rem;
  letter-spacing: 0.08em;
}

.story-desc {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.92);
  font-family: var(--font-serif);
  line-height: 1.5;
  margin-bottom: 0.4rem;
  font-style: italic;
}

.photo-meta {
  display: flex;
  justify-content: center;
  gap: 1.8rem;
  font-size: 0.78rem;
  color: rgba(254, 243, 199, 0.8);
}

.photo-meta .icon {
  margin-right: 4px;
}

.anim-kenburns-in {
  animation: kenburnsZoomIn 14s ease-out infinite alternate;
}
.anim-kenburns-out {
  animation: kenburnsZoomOut 14s ease-out infinite alternate;
}
</style>

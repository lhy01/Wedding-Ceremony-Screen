<template>
  <div class="template-starlight-dream">
    <!-- 极光与星云光晕 -->
    <div class="nebula nebula-1"></div>
    <div class="nebula nebula-2"></div>

    <!-- 智能照片舞台 (横图饱满星空全屏，竖图水晶霓虹画框装裱不裁切) -->
    <SmartPhotoStage 
      :photo="currentPhoto"
      template="starlight-dream"
      :transitionAnimation="transitionAnimation"
      :isPaused="screenSettings.isPaused"
    />

    <!-- 屏幕贴边水晶霓虹微光边框 -->
    <div class="screen-frame-decor">
      <div class="neon-border-line"></div>
      <div class="star-corner star-tl">✦</div>
      <div class="star-corner star-tr">✦</div>
      <div class="star-corner star-bl">✦</div>
      <div class="star-corner star-br">✦</div>
    </div>

    <!-- 顶部悬浮星宿标题栏 -->
    <header class="galaxy-header-float">
      <div class="header-inner glass-panel-dark">
        <div class="constellation-mark">
          <span class="star-icon">✦</span>
          <span>A LOVE WRITTEN IN THE STARS</span>
          <span class="star-icon">✦</span>
        </div>
        <div class="galaxy-names">
          <span class="neon-name">{{ weddingConfig.groom }}</span>
          <div class="ring-planet">🪐</div>
          <span class="neon-name">{{ weddingConfig.bride }}</span>
        </div>
        <div class="galaxy-sub">
          <span>跨越光年 · 奔向你</span>
          <span class="sep">•</span>
          <span>{{ weddingConfig.weddingDate }}</span>
        </div>
      </div>
    </header>

    <!-- 底部悬浮深蓝星光故事条 -->
    <footer v-if="screenSettings.showStory && currentPhoto" class="galaxy-footer-float">
      <div class="starlight-card glass-panel-dark">
        <div class="starlight-header-line">
          <span class="star-badge">GALAXY CHAPTER {{ screenSettings.currentPhotoIndex + 1 }}</span>
          <span class="venue-pos">✦ {{ weddingConfig.venue }}</span>
        </div>
        <h3 class="starlight-title">{{ currentPhoto.title }}</h3>
        <p class="starlight-desc">“{{ currentPhoto.story }}”</p>
        <div class="starlight-meta">
          <span>坐标：{{ currentPhoto.location }}</span>
          <span class="dot">·</span>
          <span>时间印记：{{ currentPhoto.date }}</span>
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
.template-starlight-dream {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #050818;
  font-family: var(--font-sans);
}

.nebula {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  z-index: 6;
}

.nebula-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%);
  top: -10%;
  left: 10%;
  animation: floatGentle 16s infinite alternate;
}

.nebula-2 {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%);
  bottom: -15%;
  right: 10%;
  animation: floatGentle 20s infinite alternate-reverse;
}

/* 屏幕贴边水晶霓虹边框 */
.screen-frame-decor {
  position: absolute;
  inset: 16px;
  pointer-events: none;
  z-index: 10;
}

.neon-border-line {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(139, 92, 246, 0.35);
  box-shadow: inset 0 0 25px rgba(99, 102, 241, 0.15);
  border-radius: 12px;
}

.star-corner {
  position: absolute;
  color: #c4b5fd;
  font-size: 1.2rem;
  animation: pulseGlow 2s infinite alternate;
}
.star-tl { top: 4px; left: 8px; }
.star-tr { top: 4px; right: 8px; }
.star-bl { bottom: 4px; left: 8px; }
.star-br { bottom: 4px; right: 8px; }

/* 顶部悬浮名牌 */
.galaxy-header-float {
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
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(129, 140, 248, 0.25);
  text-align: center;
}

.constellation-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.72rem;
  letter-spacing: 0.35em;
  color: #93c5fd;
}

.galaxy-names {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin: 0.1rem 0;
}

.neon-name {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.8));
}

.ring-planet {
  font-size: 1.6rem;
  filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.8));
}

.galaxy-sub {
  color: rgba(199, 210, 254, 0.85);
  font-size: 0.8rem;
  letter-spacing: 0.2em;
}

.galaxy-sub .sep {
  margin: 0 8px;
  color: #6366f1;
}

/* 底部悬浮故事条 */
.galaxy-footer-float {
  position: absolute;
  bottom: 1.2rem;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.starlight-card {
  max-width: 600px;
  width: 82%;
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 16px;
  padding: 0.7rem 1.6rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(129, 140, 248, 0.25);
  animation: slideUpFade 0.6s ease-out;
}

.starlight-header-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #a5b4fc;
  margin-bottom: 0.2rem;
  letter-spacing: 0.1em;
}

.starlight-title {
  color: #f5f3ff;
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  letter-spacing: 0.08em;
}

.starlight-desc {
  font-size: 0.92rem;
  color: rgba(224, 231, 255, 0.92);
  font-style: italic;
  line-height: 1.5;
  margin-bottom: 0.3rem;
}

.starlight-meta {
  font-size: 0.78rem;
  color: rgba(165, 180, 252, 0.8);
  display: flex;
  justify-content: center;
  gap: 14px;
}
</style>

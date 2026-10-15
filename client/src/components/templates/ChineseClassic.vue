<template>
  <div class="template-chinese-classic">
    <!-- 智能照片舞台 (横图饱满铺满，竖图红木海棠画框装裱不裁切) -->
    <SmartPhotoStage 
      :photo="currentPhoto"
      template="chinese-classic"
      :transitionAnimation="transitionAnimation"
      :isPaused="screenSettings.isPaused"
    />

    <!-- 屏幕贴边中式烫金框饰与四角海棠花窗 -->
    <div class="screen-frame-decor">
      <div class="chinese-border-line"></div>
      <div class="gold-flower flower-tl">✤</div>
      <div class="gold-flower flower-tr">✤</div>
      <div class="gold-flower flower-bl">✤</div>
      <div class="gold-flower flower-br">✤</div>
    </div>

    <!-- 左右悬浮雅致对联挂幅 -->
    <aside class="couplet-float couplet-left">
      <div class="couplet-char" v-for="(char, i) in '结发同心天地久'" :key="i">{{ char }}</div>
    </aside>
    <aside class="couplet-float couplet-right">
      <div class="couplet-char" v-for="(char, i) in '琴瑟和鸣福禄长'" :key="i">{{ char }}</div>
    </aside>

    <!-- 顶部悬浮喜庆匾额 -->
    <header class="chinese-header-float">
      <div class="header-inner glass-panel-dark">
        <div class="couplet-top">
          <span class="knot">囍</span>
          <span class="motto">良辰美景 · 永结同心</span>
          <span class="knot">囍</span>
        </div>
        <div class="names-row">
          <div class="name-box">
            <span class="role">新郎</span>
            <span class="chinese-name">{{ weddingConfig.groom }}</span>
          </div>
          <div class="double-happiness">
            <div class="double-xi">囍</div>
          </div>
          <div class="name-box">
            <span class="role">新娘</span>
            <span class="chinese-name">{{ weddingConfig.bride }}</span>
          </div>
        </div>
        <div class="chinese-subline">
          <span>{{ weddingConfig.weddingDate }}</span>
          <span class="sep">丨</span>
          <span>{{ weddingConfig.venue }}</span>
        </div>
      </div>
    </header>

    <!-- 底部悬浮卷轴式故事心语 -->
    <footer v-if="screenSettings.showStory && currentPhoto" class="chinese-footer-float">
      <div class="scroll-card">
        <div class="scroll-rod rod-left"></div>
        <div class="scroll-content glass-panel-dark">
          <div class="title-row">
            <span class="stamp-tag">吉日定格</span>
            <span class="photo-title">《{{ currentPhoto.title }}》</span>
            <span class="index-num">第 {{ screenSettings.currentPhotoIndex + 1 }} 卷</span>
          </div>
          <p class="story-poem">“{{ currentPhoto.story }}”</p>
          <div class="foot-meta">
            <span>执手之地：{{ currentPhoto.location }}</span>
            <span class="dot">·</span>
            <span>岁月铭记：{{ currentPhoto.date }}</span>
          </div>
        </div>
        <div class="scroll-rod rod-right"></div>
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
.template-chinese-classic {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1a0101;
  font-family: var(--font-serif);
}

/* 屏幕贴边中式边框 */
.screen-frame-decor {
  position: absolute;
  inset: 16px;
  pointer-events: none;
  z-index: 10;
}

.chinese-border-line {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: inset 0 0 25px rgba(220, 38, 38, 0.2);
  border-radius: 12px;
}

.gold-flower {
  position: absolute;
  color: #fde047;
  font-size: 1.6rem;
  z-index: 5;
}
.flower-tl { top: -4px; left: -2px; }
.flower-tr { top: -4px; right: -2px; }
.flower-bl { bottom: -4px; left: -2px; }
.flower-br { bottom: -4px; right: -2px; }

/* 左右对联悬浮 */
.couplet-float {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  background: rgba(84, 6, 6, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 10px 30px rgba(0,0,0,0.7);
  padding: 20px 8px;
  border-radius: 8px;
  display: flex;
  gap: 14px;
  color: #fef08a;
  font-size: 1.15rem;
  letter-spacing: 0.25em;
  font-weight: 600;
  z-index: 15;
  pointer-events: none;
}
.couplet-left { left: 2.2rem; }
.couplet-right { right: 2.2rem; }

/* 顶部悬浮喜庆匾额 */
.chinese-header-float {
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
  border: 1px solid rgba(245, 158, 11, 0.45);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(220, 38, 38, 0.3);
  text-align: center;
}

.couplet-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fde047;
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  font-weight: 600;
}

.names-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.8rem;
  margin: 0.1rem 0;
}

.name-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.name-box .role {
  font-size: 0.68rem;
  color: #fca5a5;
  letter-spacing: 0.2em;
}

.name-box .chinese-name {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  background: linear-gradient(180deg, #fffbeb 0%, #fef08a 50%, #eab308 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 10px rgba(0,0,0,0.8));
}

.double-xi {
  font-size: 2.2rem;
  color: #f59e0b;
  font-weight: 900;
  animation: pulseGlow 3s infinite alternate;
}

.chinese-subline {
  color: rgba(254, 243, 199, 0.85);
  font-size: 0.8rem;
  letter-spacing: 0.2em;
}

.chinese-subline .sep {
  color: #d97706;
  margin: 0 8px;
}

/* 底部悬浮卷轴 */
.chinese-footer-float {
  position: absolute;
  bottom: 1.2rem;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.scroll-card {
  display: flex;
  align-items: center;
  max-width: 600px;
  width: 82%;
  animation: slideUpFade 0.6s ease-out;
}

.scroll-rod {
  width: 10px;
  height: 78px;
  background: linear-gradient(180deg, #b45309, #78350f, #b45309);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
}

.scroll-content {
  flex: 1;
  border-top: 2px solid #f59e0b;
  border-bottom: 2px solid #f59e0b;
  padding: 0.6rem 1.6rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.7);
}

.title-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.2rem;
}

.stamp-tag {
  background: #b91c1c;
  color: #fff;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 3px;
  letter-spacing: 0.1em;
}

.photo-title {
  color: #fef08a;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.index-num {
  color: #fca5a5;
  font-size: 0.78rem;
}

.story-poem {
  color: #fef2f2;
  font-size: 0.92rem;
  line-height: 1.5;
  margin-bottom: 0.3rem;
  font-style: italic;
}

.foot-meta {
  color: rgba(254, 202, 202, 0.85);
  font-size: 0.78rem;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>

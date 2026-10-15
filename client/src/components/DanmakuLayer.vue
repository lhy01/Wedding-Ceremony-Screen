<template>
  <div v-if="screenSettings.showDanmaku" class="danmaku-container">
    <!-- 屏幕上方浮动飞过的平滑弹幕队列 -->
    <div 
      v-for="item in activeQueue" 
      :key="item.id" 
      class="danmaku-fly-item"
      :style="{
        top: `${item.top}%`,
        animationDuration: flyDuration,
        opacity: screenSettings.danmakuOpacity || 0.9
      }"
    >
      <span class="danmaku-avatar">{{ item.avatar }}</span>
      <span class="danmaku-sender">{{ item.sender }}:</span>
      <span class="danmaku-text">{{ item.content }}</span>
    </div>

    <!-- 左下角最新祝福通知气泡卡片 -->
    <transition name="pop-card">
      <div v-if="latestBlessing" class="latest-blessing-card glass-panel-dark">
        <div class="card-glow"></div>
        <div class="card-avatar">{{ latestBlessing.avatar }}</div>
        <div class="card-body">
          <div class="card-sender">
            <span class="name">{{ latestBlessing.sender }}</span>
            <span class="tag" v-if="latestBlessing.relation">{{ latestBlessing.relation }}</span>
            <span class="tip">刚刚送上新婚祝福</span>
          </div>
          <div class="card-content">“{{ latestBlessing.content }}”</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  screenSettings: Object,
  activeQueue: Array,
  latestBlessing: Object
});

const flyDuration = computed(() => {
  const speed = props.screenSettings.danmakuSpeed;
  if (speed === 'fast') return '8s';
  if (speed === 'slow') return '16s';
  return '11s';
});
</script>

<style scoped>
.danmaku-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}

.danmaku-fly-item {
  position: absolute;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 12, 10, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(254, 240, 138, 0.35);
  border-radius: 30px;
  padding: 6px 18px 6px 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(234, 179, 8, 0.2);
  white-space: nowrap;
  animation-name: danmakuRun;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.danmaku-avatar {
  font-size: 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.danmaku-sender {
  font-weight: 600;
  color: #fde68a;
  font-size: 0.95rem;
}

.danmaku-text {
  color: #ffffff;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
}

/* 最新弹幕气泡卡片 */
.latest-blessing-card {
  position: absolute;
  bottom: 2.5rem;
  left: 2.5rem;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  border-radius: 18px;
  border: 1px solid rgba(245, 158, 11, 0.4);
  max-width: 420px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 25px rgba(245, 158, 11, 0.25);
  animation: floatGentle 8s infinite alternate;
}

.card-avatar {
  font-size: 2.2rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-radius: 50%;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-body {
  overflow: hidden;
}

.card-sender {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-sender .name {
  font-weight: 700;
  color: #fde047;
  font-size: 0.95rem;
}

.card-sender .tag {
  background: rgba(239, 68, 68, 0.35);
  color: #fecaca;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 10px;
}

.card-sender .tip {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.card-content {
  font-size: 0.95rem;
  color: #fff;
  line-height: 1.4;
  white-space: normal;
  word-break: break-all;
}

/* 卡片进出动画 */
.pop-card-enter-active,
.pop-card-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.pop-card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.pop-card-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>

<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="qr-modal-card glass-panel-dark">
      <button class="close-btn" @click="$emit('close')">✕</button>
      
      <div class="modal-header">
        <div class="qr-icon-top">💌</div>
        <h2 class="modal-title">扫码送上新婚祝福</h2>
        <p class="modal-subtitle">拿起手机微信/浏览器扫一扫，实时向大屏发送祝福弹幕与献花</p>
      </div>

      <div class="qr-box">
        <canvas ref="canvasRef" class="qr-canvas"></canvas>
        <div class="qr-corner corner-tl"></div>
        <div class="qr-corner corner-tr"></div>
        <div class="qr-corner corner-bl"></div>
        <div class="qr-corner corner-br"></div>
      </div>

      <div class="url-hint-box">
        <span class="url-text">{{ fullUrl }}</span>
        <button class="copy-btn" @click="copyUrl">
          {{ copied ? '已复制 ✔' : '复制网址' }}
        </button>
      </div>

      <div class="features-row">
        <div class="feat-item">
          <span class="emoji">✨</span>
          <span>大屏实时弹幕</span>
        </div>
        <div class="feat-item">
          <span class="emoji">🎉</span>
          <span>触发满屏礼花</span>
        </div>
        <div class="feat-item">
          <span class="emoji">💖</span>
          <span>点赞上墙互动</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  visible: Boolean,
  serverInfo: Object
});

const emit = defineEmits(['close']);
const canvasRef = ref(null);
const copied = ref(false);

const fullUrl = computed(() => {
  if (props.serverInfo && props.serverInfo.blessingUrl) {
    return props.serverInfo.blessingUrl;
  }
  return `${window.location.origin}/bless`;
});

function drawQr() {
  if (!canvasRef.value) return;
  QRCode.toCanvas(canvasRef.value, fullUrl.value, {
    width: 220,
    margin: 2,
    color: {
      dark: '#1e140a',
      light: '#ffffff'
    }
  }, (err) => {
    if (err) console.error('QR code generation failed:', err);
  });
}

function copyUrl() {
  navigator.clipboard.writeText(fullUrl.value).then(() => {
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  });
}

watch(() => props.visible, (val) => {
  if (val) {
    nextTick(() => {
      drawQr();
    });
  }
});

onMounted(() => {
  if (props.visible) {
    drawQr();
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.qr-modal-card {
  position: relative;
  width: 90%;
  max-width: 440px;
  padding: 2.2rem;
  border-radius: 24px;
  border: 1px solid rgba(234, 179, 8, 0.4);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(234, 179, 8, 0.25);
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.qr-icon-top {
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
}

.modal-title {
  font-family: var(--font-title);
  font-size: 1.6rem;
  color: #fef08a;
  letter-spacing: 0.08em;
  margin-bottom: 0.4rem;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.qr-box {
  position: relative;
  display: inline-block;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.qr-canvas {
  display: block;
}

.qr-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: #d4af37;
  border-style: solid;
}
.corner-tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
.corner-tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
.corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
.corner-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

.url-hint-box {
  margin-top: 1.4rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.url-text {
  font-size: 0.78rem;
  color: #93c5fd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  background: #f59e0b;
  color: #000;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 6px;
  flex-shrink: 0;
}
.copy-btn:hover {
  background: #fbbf24;
}

.features-row {
  margin-top: 1.4rem;
  display: flex;
  justify-content: space-around;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
}

.feat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.feat-item .emoji {
  font-size: 1.2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

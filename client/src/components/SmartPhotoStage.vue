<template>
  <div class="smart-photo-stage" :class="[`tpl-${template}`, isPortrait ? 'mode-portrait' : 'mode-landscape']">
    <!-- 虚化景深背景 (横图与竖图均提供流光色彩衬底) -->
    <div 
      class="backdrop-blur" 
      :style="{ backgroundImage: photo ? `url(${photo.url})` : 'none' }"
    ></div>

    <!-- 画面主舞台 -->
    <div class="photo-display-container" :class="{ 'is-paused': isPaused }">
      <!-- 1. 横图展示模式：巨幕饱满充满整屏，大气沉浸，视觉极具张力 -->
      <div v-if="!isPortrait" class="landscape-fullscreen-stage">
        <div class="landscape-inner">
          <img 
            v-if="photo"
            :key="photo.id + '-land'"
            :src="photo.url" 
            :alt="photo.title"
            class="photo-img-landscape"
            :class="transitionAnimation"
            @load="onImageLoad"
          />
        </div>
        <!-- 横图电影级微暗角，增强纵深感 -->
        <div class="landscape-cinematic-vignette"></div>
      </div>

      <!-- 2. 竖图展示模式：绝不裁切！纯正高级画框装裱，高度完美避开顶底悬浮文字 -->
      <div v-else class="portrait-framed-stage">
        <!-- 竖图专属艺术画框 (外层装裱框 + 内层精致卡衬) -->
        <div class="portrait-art-frame">
          <!-- 典雅四角花饰 -->
          <div class="frame-corner corner-tl"></div>
          <div class="frame-corner corner-tr"></div>
          <div class="frame-corner corner-bl"></div>
          <div class="frame-corner corner-br"></div>

          <!-- 画框内衬 -->
          <div class="portrait-matting">
            <img 
              v-if="photo"
              :key="photo.id + '-port'"
              :src="photo.url" 
              :alt="photo.title"
              class="photo-img-portrait"
              :class="transitionAnimation"
              @load="onImageLoad"
            />
          </div>
        </div>

        <!-- 竖图大屏两侧诗意艺术挂条 (让整块宽屏饱满充盈，毫无空旷感) -->
        <aside class="portrait-side-panel left-panel">
          <div class="side-decor-line"></div>
          <div class="side-tag">{{ isChinese ? '天作之合' : 'WEDDING VOWS' }}</div>
          <div class="side-text">{{ isChinese ? '执手共赴岁月长' : 'Two Hearts, One Soul' }}</div>
          <div class="side-icon">❦</div>
        </aside>

        <aside class="portrait-side-panel right-panel">
          <div class="side-decor-line"></div>
          <div class="side-tag">{{ isChinese ? '良辰吉日' : 'LOVE STORY' }}</div>
          <div class="side-text">{{ isChinese ? '琴瑟和鸣敬余生' : 'A Love For Eternity' }}</div>
          <div class="side-icon">❦</div>
        </aside>
      </div>
    </div>

    <!-- 隐形预加载检测图片 -->
    <img 
      v-if="photo" 
      :src="photo.url" 
      class="hidden-preloader" 
      @load="onImageLoad"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  photo: Object,
  template: {
    type: String,
    default: 'champagne-gold'
  },
  transitionAnimation: {
    type: String,
    default: ''
  },
  isPaused: Boolean
});

// 是否是竖图 (默认为 false，通过计算真实宽高比)
const isPortrait = ref(false);

const isChinese = computed(() => props.template === 'chinese-classic');

function detectOrientation(img) {
  if (!img) return;
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (w && h) {
    // 只要高度大于宽度，即判定为竖图！严格画框装裱不裁切
    isPortrait.value = h > w;
  }
}

function onImageLoad(e) {
  detectOrientation(e.target);
}

// 切换照片时预判
watch(() => props.photo, (newPhoto) => {
  if (newPhoto && newPhoto.url) {
    const tempImg = new Image();
    tempImg.src = newPhoto.url;
    if (tempImg.complete) {
      detectOrientation(tempImg);
    } else {
      tempImg.onload = () => detectOrientation(tempImg);
    }
  }
}, { immediate: true });
</script>

<style scoped>
.smart-photo-stage {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
}

/* 虚化景深衬底 */
.backdrop-blur {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  filter: blur(55px) brightness(0.35);
  transform: scale(1.12);
  z-index: 1;
  transition: background-image 1.2s ease-in-out;
}

.photo-display-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ================= 1. 横图饱满全屏模式 ================= */
.landscape-fullscreen-stage {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.landscape-inner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.photo-img-landscape {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.landscape-cinematic-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.85) 100%),
              linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 22%, transparent 75%, rgba(0,0,0,0.8) 100%);
  pointer-events: none;
}

/* ================= 2. 竖图精致装裱画框模式 (严格避开顶底浮层，绝不裁切) ================= */
.portrait-framed-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

/* 艺术画框主体：高度精细控制在 68vh 左右 (避让顶部的 110px 和底部的 110px)，保证照片从头顶到裙摆100%露出来 */
.portrait-art-frame {
  position: relative;
  height: calc(100vh - 240px);
  max-height: 68vh;
  max-width: 52vw;
  padding: 12px;
  border-radius: 14px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 0, 0, 0.5);
  animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.portrait-matting {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: #050505;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
}

/* 竖图照片：绝对不使用 cover，采用 contain 完整呈现新人面容与身形 */
.photo-img-portrait {
  height: 100%;
  max-height: calc(100vh - 264px);
  width: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
  border-radius: 4px;
}

/* 针对不同模板定制框饰材质 */

/* 法式香槟金画框 */
.tpl-champagne-gold .portrait-art-frame {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.75) 0%, rgba(254, 240, 138, 0.3) 50%, rgba(212, 175, 55, 0.8) 100%);
  border: 2px solid rgba(254, 240, 138, 0.6);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.35);
}
.tpl-champagne-gold .frame-corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: #fef08a;
  border-style: solid;
}
.tpl-champagne-gold .corner-tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
.tpl-champagne-gold .corner-tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
.tpl-champagne-gold .corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
.tpl-champagne-gold .corner-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

/* 中式喜庆红木框 */
.tpl-chinese-classic .portrait-art-frame {
  background: #630808;
  border: 3px solid #d97706;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(220, 38, 38, 0.4);
}
.tpl-chinese-classic .frame-corner {
  position: absolute;
  color: #fde047;
  font-size: 1.3rem;
}
.tpl-chinese-classic .corner-tl { top: 2px; left: 4px; }
.tpl-chinese-classic .corner-tr { top: 2px; right: 4px; }
.tpl-chinese-classic .corner-bl { bottom: 2px; left: 4px; }
.tpl-chinese-classic .corner-br { bottom: 2px; right: 4px; }
.tpl-chinese-classic .frame-corner::before { content: '✤'; }

/* 极简森系纯白卡纸装裱 */
.tpl-forest-green .portrait-art-frame {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(110, 231, 183, 0.5);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.25);
}

/* 复古拍立得白相纸框 */
.tpl-retro-polaroid .portrait-art-frame {
  background: #fdfbf7;
  padding: 14px 14px 24px 14px;
  transform: rotate(-0.8deg);
  border: 1px solid rgba(254, 240, 138, 0.35);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 5px 20px rgba(0,0,0,0.5);
}

/* 现代梦幻星空水晶霓虹框 */
.tpl-starlight-dream .portrait-art-frame {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.25) 50%, rgba(99, 102, 241, 0.6) 100%);
  border: 2px solid rgba(165, 180, 252, 0.6);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9), 0 0 45px rgba(129, 140, 248, 0.4);
}
.tpl-starlight-dream .frame-corner {
  position: absolute;
  color: #c4b5fd;
  font-size: 1.1rem;
}
.tpl-starlight-dream .corner-tl { top: 2px; left: 4px; }
.tpl-starlight-dream .corner-tr { top: 2px; right: 4px; }
.tpl-starlight-dream .corner-bl { bottom: 2px; left: 4px; }
.tpl-starlight-dream .corner-br { bottom: 2px; right: 4px; }
.tpl-starlight-dream .frame-corner::before { content: '✦'; }

/* 竖图两侧诗意画廊侧挂条 (大屏空间和谐饱满) */
.portrait-side-panel {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  opacity: 0.85;
}
.left-panel {
  left: calc(50% - 34vw);
}
.right-panel {
  right: calc(50% - 34vw);
}

.side-decor-line {
  width: 1px;
  height: 50px;
  background: linear-gradient(180deg, transparent, rgba(254, 240, 138, 0.5), transparent);
}

.side-tag {
  font-size: 0.72rem;
  letter-spacing: 0.25em;
  color: #fde68a;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(254, 240, 138, 0.3);
}

.side-text {
  writing-mode: vertical-rl;
  font-size: 0.92rem;
  letter-spacing: 0.3em;
  color: #ffffff;
  font-family: var(--font-serif);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.side-icon {
  font-size: 0.9rem;
  color: #f59e0b;
}

.hidden-preloader {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>

<template>
  <div class="screen-view-container" @click="handleScreenClick">
    <!-- 背景动态氛围粒子 -->
    <ParticleCanvas :template="store.screenSettings.template" />

    <!-- 动态渲染当前大屏模板 -->
    <component 
      :is="currentTemplateComponent"
      :currentPhoto="store.currentPhoto"
      :weddingConfig="store.weddingConfig"
      :screenSettings="store.screenSettings"
      :totalPhotos="store.photos.length"
    />

    <!-- 弹幕层 -->
    <DanmakuLayer 
      :screenSettings="store.screenSettings"
      :activeQueue="store.activeDanmakuQueue"
      :latestBlessing="store.latestBlessing"
    />

    <!-- 悬浮播控条 -->
    <ScreenControls />

    <!-- 宾客扫码弹窗 -->
    <QrCodeModal 
      :visible="store.showQrModal"
      :serverInfo="store.serverInfo"
      @close="store.showQrModal = false"
    />

    <!-- 照片为空时的贴心提示 -->
    <div v-if="store.photos.length === 0" class="empty-state-overlay glass-panel-dark">
      <div class="empty-icon">🖼️</div>
      <h2>暂无婚礼轮播照片</h2>
      <p>请点击下方进入管理后台上传新人唯美照片与设置故事。</p>
      <router-link to="/admin" class="btn-go-admin">进入管理后台上传</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useWeddingStore } from '@/stores/wedding';
import ParticleCanvas from '@/components/ParticleCanvas.vue';
import DanmakuLayer from '@/components/DanmakuLayer.vue';
import ScreenControls from '@/components/ScreenControls.vue';
import QrCodeModal from '@/components/QrCodeModal.vue';

// 5 大模板导入
import ChampagneGold from '@/components/templates/ChampagneGold.vue';
import ChineseClassic from '@/components/templates/ChineseClassic.vue';
import ForestGreen from '@/components/templates/ForestGreen.vue';
import RetroPolaroid from '@/components/templates/RetroPolaroid.vue';
import StarlightDream from '@/components/templates/StarlightDream.vue';

const store = useWeddingStore();

const templateMap = {
  'champagne-gold': ChampagneGold,
  'chinese-classic': ChineseClassic,
  'forest-green': ForestGreen,
  'retro-polaroid': RetroPolaroid,
  'starlight-dream': StarlightDream
};

const currentTemplateComponent = computed(() => {
  return templateMap[store.screenSettings.template] || ChampagneGold;
});

// 点击任意处若音乐开启但受浏览器策略限制未出声，则触发播放
function handleScreenClick() {
  if (store.screenSettings.musicPlaying && store.audioElement && store.audioElement.paused) {
    store.playMusic();
  }
}

onMounted(() => {
  store.init();
});
</script>

<style scoped>
.screen-view-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
}

.empty-state-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 3rem;
  border-radius: 24px;
  text-align: center;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state-overlay h2 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.empty-state-overlay p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.btn-go-admin {
  display: inline-block;
  padding: 10px 24px;
  background: #f59e0b;
  color: #000;
  font-weight: 600;
  border-radius: 20px;
  text-decoration: none;
}
</style>

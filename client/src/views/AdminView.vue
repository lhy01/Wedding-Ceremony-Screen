<template>
  <div class="admin-container">
    <!-- 全局操作轻提示 Toast -->
    <transition name="toast-fade">
      <div v-if="toastMessage" class="global-toast glass-panel-dark">
        {{ toastMessage }}
      </div>
    </transition>

    <!-- 顶部导航栏 -->
    <header class="admin-header glass-panel-dark">
      <div class="header-left">
        <div class="logo-icon">💍</div>
        <div>
          <h1 class="logo-title">婚礼大屏轮播系统 · 播控中心</h1>
          <p class="logo-sub">WEDDING SCREEN CONTROLLER & PHOTO MANAGER</p>
        </div>
      </div>

      <div class="header-right">
        <div class="status-indicator" :class="{ online: store.isConnected }">
          <span class="status-dot"></span>
          <span>{{ store.isConnected ? '大屏实时联机中' : '连接中断重试中' }}</span>
        </div>

        <button class="btn-action btn-confetti-quick" @click="triggerConfetti">
          <Sparkles :size="16" />
          <span>大屏撒花</span>
        </button>

        <button class="btn-action btn-qr-quick" @click="store.showQrModal = true">
          <QrCode :size="16" />
          <span>手机祝福二维码</span>
        </button>

        <router-link to="/" target="_blank" class="btn-action btn-screen-link">
          <ExternalLink :size="16" />
          <span>打开展示大屏</span>
        </router-link>
      </div>
    </header>

    <!-- 主体区域：左右/选项卡布局 -->
    <main class="admin-main">
      <!-- 导航 Tabs -->
      <nav class="admin-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'screen' }"
          @click="currentTab = 'screen'"
        >
          <MonitorPlay :size="18" />
          <span>大屏实时播控</span>
        </button>

        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'photos' }"
          @click="currentTab = 'photos'"
        >
          <Images :size="18" />
          <span>照片库管理 ({{ store.photos.length }})</span>
        </button>

        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'wedding' }"
          @click="currentTab = 'wedding'"
        >
          <Heart :size="18" />
          <span>婚礼基本信息</span>
        </button>

        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'interaction' }"
          @click="currentTab = 'interaction'"
        >
          <MessageCircleHeart :size="18" />
          <span>弹幕祝福 & 音乐</span>
        </button>
      </nav>

      <!-- 选项卡 1：大屏实时播控 -->
      <section v-if="currentTab === 'screen'" class="tab-content screen-control-panel">
        <div class="grid-2-col">
          <!-- 当前正在大屏播放的画面监控 -->
          <div class="card glass-panel-dark">
            <h2 class="card-title">
              <Eye :size="18" class="text-gold" />
              <span>当前大屏实时放映</span>
              <span class="badge" v-if="store.currentPhoto">
                NO. {{ (store.screenSettings.currentPhotoIndex + 1) }} / {{ store.photos.length }}
              </span>
            </h2>

            <div class="screen-preview-box">
              <img 
                v-if="store.currentPhoto" 
                :src="store.currentPhoto.url" 
                :alt="store.currentPhoto.title"
                class="preview-img"
              />
              <div v-else class="preview-empty">暂无播放照片</div>

              <div class="preview-overlay">
                <span class="template-indicator">
                  当前模板: {{ getTemplateName(store.screenSettings.template) }}
                </span>
                <span class="status-tag" :class="{ paused: store.screenSettings.isPaused }">
                  {{ store.screenSettings.isPaused ? '⏸ 轮播已暂停' : '▶ 自动轮播中' }}
                </span>
              </div>
            </div>

            <!-- 快捷播控按键 -->
            <div class="playback-controls">
              <button class="ctrl-btn" @click="store.prevPhoto()">
                <ChevronLeft :size="20" />
                <span>上一张</span>
              </button>

              <button 
                class="ctrl-btn primary-ctrl" 
                @click="store.togglePlayPause()"
              >
                <Play v-if="store.screenSettings.isPaused" :size="20" />
                <Pause v-else :size="20" />
                <span>{{ store.screenSettings.isPaused ? '开始播放' : '暂停播放' }}</span>
              </button>

              <button class="ctrl-btn" @click="store.nextPhoto()">
                <span>下一张</span>
                <ChevronRight :size="20" />
              </button>
            </div>
          </div>

          <!-- 视觉主题与转场设置 -->
          <div class="card glass-panel-dark">
            <h2 class="card-title">
              <Palette :size="18" class="text-gold" />
              <span>流行视觉模板切换</span>
            </h2>

            <div class="template-cards-grid">
              <div 
                v-for="tpl in templateList" 
                :key="tpl.id"
                class="tpl-card"
                :class="{ active: store.screenSettings.template === tpl.id }"
                @click="store.setTemplate(tpl.id)"
              >
                <div class="tpl-icon">{{ tpl.icon }}</div>
                <div class="tpl-info">
                  <div class="tpl-name">{{ tpl.name }}</div>
                  <div class="tpl-desc">{{ tpl.desc }}</div>
                </div>
                <div class="tpl-check" v-if="store.screenSettings.template === tpl.id">✔</div>
              </div>
            </div>

            <div class="divider-line"></div>

            <!-- 播控参数调节 -->
            <div class="settings-row">
              <div class="setting-item">
                <label>转场过渡效果：</label>
                <select 
                  :value="store.screenSettings.transition" 
                  @change="e => store.setTransition(e.target.value)"
                  class="admin-select"
                >
                  <option value="kenburns">电影感 Ken Burns 缓慢推拉</option>
                  <option value="3d-cube">3D 立体悬浮翻转</option>
                  <option value="fade-blur">优雅淡入淡出</option>
                </select>
              </div>

              <div class="setting-item">
                <label>轮播切换间隔：</label>
                <select 
                  :value="store.screenSettings.interval" 
                  @change="e => store.setIntervalTime(Number(e.target.value))"
                  class="admin-select"
                >
                  <option :value="4">4 秒 (快速节奏)</option>
                  <option :value="6">6 秒 (推荐标准)</option>
                  <option :value="8">8 秒 (舒缓优雅)</option>
                  <option :value="12">12 秒 (慢镜头品味)</option>
                </select>
              </div>

              <div class="setting-item">
                <label>画面铺满比例：</label>
                <select 
                  :value="store.screenSettings.fitMode || 'cover'" 
                  @change="e => store.setFitMode(e.target.value)"
                  class="admin-select"
                >
                  <option value="cover">📺 铺满大屏 (Cover 满屏震撼无黑边)</option>
                  <option value="contain">🖼️ 完整居中 (Contain 原比例展示)</option>
                </select>
              </div>
            </div>

            <div class="switches-row">
              <label class="switch-label">
                <input 
                  type="checkbox" 
                  :checked="store.screenSettings.showStory" 
                  @change="store.toggleStory()"
                />
                <span>大屏显示照片故事与拍摄地</span>
              </label>

              <label class="switch-label">
                <input 
                  type="checkbox" 
                  :checked="store.screenSettings.showDanmaku" 
                  @change="store.toggleDanmaku()"
                />
                <span>大屏展示现场祝福弹幕</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- 选项卡 2：照片管理中心 -->
      <section v-if="currentTab === 'photos'" class="tab-content photo-management-panel">
        <!-- 上传区与快捷操作 -->
        <div class="action-banner glass-panel-dark">
          <div class="upload-dropzone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
            <input 
              ref="fileInputRef" 
              type="file" 
              multiple 
              accept="image/*" 
              class="hidden-file-input" 
              @change="handleFileSelect"
            />
            <div class="upload-icon">📸</div>
            <div class="upload-text">
              <strong>点击或拖拽照片至此批量上传</strong>
              <small>支持 JPG、PNG、WEBP 高清大图，单次最多支持 20 张</small>
            </div>
          </div>

          <div class="quick-tools">
            <button class="tool-btn" @click="showAddUrlModal = true">
              <Plus :size="16" />
              <span>URL添加照片</span>
            </button>
            <button class="tool-btn text-amber" @click="resetToDefaultPhotos">
              <RotateCcw :size="16" />
              <span>重置为精美预设图</span>
            </button>
          </div>
        </div>

        <!-- 照片列表展示 -->
        <div class="photos-grid">
          <div 
            v-for="(photo, index) in store.photos" 
            :key="photo.id" 
            class="photo-manage-card"
            :class="{ playing: index === store.screenSettings.currentPhotoIndex }"
          >
            <div class="photo-thumb-box">
              <img :src="photo.url" :alt="photo.title" class="thumb-img" />
              <div class="photo-badge">#{{ index + 1 }}</div>
              <div class="playing-tag" v-if="index === store.screenSettings.currentPhotoIndex">
                正在放映
              </div>
            </div>

            <div class="photo-info-box">
              <h3 class="photo-card-title">{{ photo.title }}</h3>
              <p class="photo-card-story">{{ photo.story }}</p>
              <div class="photo-card-meta">
                <span>📍 {{ photo.location }}</span>
                <span>📅 {{ photo.date }}</span>
              </div>
            </div>

            <div class="photo-card-actions">
              <button 
                class="card-act-btn jump-btn" 
                title="大屏立即播放此张"
                @click="store.goToPhoto(index)"
              >
                <Play :size="14" />
                <span>播此张</span>
              </button>

              <button 
                class="card-act-btn edit-btn" 
                title="编辑文字与故事"
                @click="openEditModal(photo)"
              >
                <Edit3 :size="14" />
                <span>编辑</span>
              </button>

              <button 
                class="card-act-btn del-btn" 
                title="删除照片"
                @click="deletePhoto(photo.id)"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 选项卡 3：婚礼基本信息 -->
      <section v-if="currentTab === 'wedding'" class="tab-content wedding-config-panel">
        <div class="config-card glass-panel-dark">
          <h2 class="card-title">
            <Heart :size="18" class="text-rose-400" />
            <span>婚礼主题与新人资料</span>
          </h2>

          <form @submit.prevent="saveWeddingConfig" class="config-form">
            <div class="form-row">
              <div class="form-group">
                <label>新郎姓名 (中文)：</label>
                <input v-model="weddingForm.groom" type="text" class="admin-input" required />
              </div>
              <div class="form-group">
                <label>新郎英文称呼：</label>
                <input v-model="weddingForm.groomEn" type="text" class="admin-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>新娘姓名 (中文)：</label>
                <input v-model="weddingForm.bride" type="text" class="admin-input" required />
              </div>
              <div class="form-group">
                <label>新娘英文称呼：</label>
                <input v-model="weddingForm.brideEn" type="text" class="admin-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>婚礼吉日 (日期)：</label>
                <input v-model="weddingForm.weddingDate" type="date" class="admin-input" required />
              </div>
              <div class="form-group">
                <label>婚礼场地 / 宴会厅：</label>
                <input v-model="weddingForm.venue" type="text" class="admin-input" placeholder="例如：云顶庄园 · 水晶空中大礼堂" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>婚礼主题口号 (中文)：</label>
                <input v-model="weddingForm.slogan" type="text" class="admin-input" placeholder="例如：以爱之名 · 共度余生" />
              </div>
              <div class="form-group">
                <label>英文副标语：</label>
                <input v-model="weddingForm.subSlogan" type="text" class="admin-input" placeholder="例如：TWO HEARTS, ONE LOVE" />
              </div>
            </div>

            <div class="form-group full-width">
              <label>迎宾欢迎致辞：</label>
              <textarea v-model="weddingForm.welcomeText" rows="2" class="admin-textarea"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save">保存并同步大屏</button>
              <span v-if="saveSuccessTip" class="save-tip">{{ saveSuccessTip }}</span>
            </div>
          </form>
        </div>
      </section>

      <!-- 选项卡 4：弹幕祝福与音乐 -->
      <section v-if="currentTab === 'interaction'" class="tab-content interaction-panel">
        <div class="grid-2-col">
          <!-- 弹幕管理卡片 -->
          <div class="card glass-panel-dark">
            <div class="card-header-flex">
              <h2 class="card-title">
                <MessageSquare :size="18" class="text-gold" />
                <span>现场祝福列表 ({{ store.blessings.length }})</span>
              </h2>
              <button class="clear-btn" @click="clearAllBlessings">清空祝福</button>
            </div>

            <div class="blessings-list-scroll">
              <div 
                v-for="b in store.blessings" 
                :key="b.id" 
                class="admin-blessing-item"
              >
                <div class="b-avatar">{{ b.avatar || '🌸' }}</div>
                <div class="b-info">
                  <div class="b-header">
                    <span class="b-name">{{ b.sender }}</span>
                    <span class="b-tag" v-if="b.relation">{{ b.relation }}</span>
                    <span class="b-likes">❤️ {{ b.likes || 1 }}</span>
                  </div>
                  <div class="b-content">“{{ b.content }}”</div>
                </div>
                <button class="del-b-btn" title="删除不良弹幕" @click="deleteBlessing(b.id)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- 背景音乐管理卡片 -->
          <div class="card glass-panel-dark">
            <h2 class="card-title">
              <Music :size="18" class="text-gold" />
              <span>婚礼背景音乐 (BGM)</span>
            </h2>

            <div class="music-list-box">
              <div 
                v-for="m in store.musicList" 
                :key="m.id" 
                class="music-item"
                :class="{ active: store.weddingConfig.activeMusicId === m.id }"
              >
                <div class="music-icon">🎵</div>
                <div class="music-detail">
                  <div class="music-title">{{ m.name }}</div>
                  <div class="music-artist">{{ m.artist }}</div>
                </div>
                <button 
                  class="music-play-btn"
                  @click="store.switchMusic(m.id)"
                >
                  {{ store.weddingConfig.activeMusicId === m.id ? '当前播放中' : '设为播放' }}
                </button>
              </div>
            </div>

            <div class="music-upload-section">
              <label class="upload-music-btn">
                <Upload :size="16" />
                <span>上传本地婚礼歌曲 (MP3/WAV)</span>
                <input type="file" accept="audio/*" class="hidden-file-input" @change="handleMusicUpload" />
              </label>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 编辑照片弹窗 Modal -->
    <div v-if="editingPhoto" class="modal-backdrop" @click.self="editingPhoto = null">
      <div class="modal-card glass-panel-dark">
        <h3>编辑照片信息</h3>
        <div class="modal-form">
          <div class="form-group">
            <label>照片标题：</label>
            <input v-model="editForm.title" type="text" class="admin-input" />
          </div>
          <div class="form-group">
            <label>拍摄地点：</label>
            <input v-model="editForm.location" type="text" class="admin-input" />
          </div>
          <div class="form-group">
            <label>拍摄日期：</label>
            <input v-model="editForm.date" type="text" class="admin-input" />
          </div>
          <div class="form-group">
            <label>所属分类：</label>
            <select v-model="editForm.category" class="admin-select">
              <option value="wedding">婚纱大片</option>
              <option value="daily">恋爱日常</option>
              <option value="proposal">求婚记忆</option>
              <option value="welcoming">迎宾特辑</option>
            </select>
          </div>
          <div class="form-group">
            <label>照片背后的浪漫故事：</label>
            <textarea v-model="editForm.story" rows="3" class="admin-textarea"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="editingPhoto = null">取消</button>
            <button class="btn-save" @click="savePhotoEdit">保存修改</button>
          </div>
        </div>
      </div>
    </div>

    <!-- URL 添加照片 Modal -->
    <div v-if="showAddUrlModal" class="modal-backdrop" @click.self="showAddUrlModal = false">
      <div class="modal-card glass-panel-dark">
        <h3>网络图片链接添加</h3>
        <div class="modal-form">
          <div class="form-group">
            <label>图片 URL 地址：</label>
            <input v-model="urlForm.url" type="url" placeholder="https://..." class="admin-input" required />
          </div>
          <div class="form-group">
            <label>照片标题：</label>
            <input v-model="urlForm.title" type="text" class="admin-input" />
          </div>
          <div class="form-group">
            <label>拍摄地点：</label>
            <input v-model="urlForm.location" type="text" class="admin-input" />
          </div>
          <div class="form-group">
            <label>故事心语：</label>
            <textarea v-model="urlForm.story" rows="2" class="admin-textarea"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showAddUrlModal = false">取消</button>
            <button class="btn-save" @click="submitUrlPhoto">添加照片</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <QrCodeModal 
      :visible="store.showQrModal"
      :serverInfo="store.serverInfo"
      @close="store.showQrModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useWeddingStore } from '@/stores/wedding';
import QrCodeModal from '@/components/QrCodeModal.vue';
import { 
  Sparkles, QrCode, ExternalLink, MonitorPlay, Images, Heart, 
  MessageCircleHeart, Eye, ChevronLeft, ChevronRight, Play, Pause, 
  Palette, Plus, RotateCcw, Edit3, Trash2, MessageSquare, Music, Upload 
} from 'lucide-vue-next';

const store = useWeddingStore();

const currentTab = ref('screen');
const fileInputRef = ref(null);
const saveSuccessTip = ref('');
const showAddUrlModal = ref(false);

const templateList = [
  { id: 'champagne-gold', name: '浪漫法式香槟金', desc: '轻奢高雅，珠光流金，法式美学', icon: '✨' },
  { id: 'chinese-classic', name: '中式国潮吉庆红', desc: '朱红烫金，喜庆祥云，雅致吉席', icon: '🏮' },
  { id: 'forest-green', name: '极简轻奢白绿森系', desc: '尤加利绿，自然晨光，清新画报', icon: '🌿' },
  { id: 'retro-polaroid', name: '复古拍立得时光', desc: '白底相纸，和纸胶带，温情时光', icon: '📷' },
  { id: 'starlight-dream', name: '现代梦幻星空幻境', desc: '午夜银河，深邃极光，立体悬浮', icon: '🌌' }
];

function getTemplateName(id) {
  const t = templateList.find(item => item.id === id);
  return t ? t.name : '经典模板';
}

// 婚礼信息表单
const weddingForm = reactive({
  groom: '',
  groomEn: '',
  bride: '',
  brideEn: '',
  weddingDate: '',
  venue: '',
  slogan: '',
  subSlogan: '',
  welcomeText: ''
});

// 编辑照片
const editingPhoto = ref(null);
const editForm = reactive({
  id: '',
  title: '',
  location: '',
  date: '',
  category: 'wedding',
  story: ''
});

// 添加 URL 照片
const urlForm = reactive({
  url: '',
  title: '新婚掠影',
  location: '幸福之城',
  date: '2026.10.18',
  category: 'wedding',
  story: '执子之手，与子偕老。'
});

function initForms() {
  Object.assign(weddingForm, store.weddingConfig);
}

// 保存婚礼基本信息
async function saveWeddingConfig() {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weddingForm)
    });
    if (res.ok) {
      saveSuccessTip.value = '✔ 保存成功，大屏端已同步！';
      setTimeout(() => saveSuccessTip.value = '', 3000);
    }
  } catch (e) {
    console.error(e);
  }
}

// 上传照片
function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click();
}

async function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    await uploadPhotos(files);
  }
}

async function handleFileDrop(e) {
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    await uploadPhotos(files);
  }
}

// 提示信息 Toast
const toastMessage = ref('');
let toastTimer = null;
function showToast(msg) {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 2500);
}

// 上传照片
async function uploadPhotos(files) {
  const ok = await store.uploadPhotos(files);
  if (ok) {
    showToast('✔ 照片上传成功并同步大屏');
  }
}

// 编辑照片
function openEditModal(photo) {
  editingPhoto.value = photo;
  Object.assign(editForm, {
    id: photo.id,
    title: photo.title,
    location: photo.location,
    date: photo.date,
    category: photo.category || 'wedding',
    story: photo.story
  });
}

async function savePhotoEdit() {
  const ok = await store.updatePhoto(editForm.id, editForm);
  if (ok) {
    editingPhoto.value = null;
    showToast('✔ 照片信息已成功保存');
  }
}

async function deletePhoto(id) {
  if (confirm('确定要删除这张照片吗？')) {
    const ok = await store.deletePhoto(id);
    if (ok) {
      showToast('✔ 照片已成功删除');
    }
  }
}

async function resetToDefaultPhotos() {
  if (confirm('确定要恢复为预置的高画质婚礼样板照片吗？')) {
    const ok = await store.resetDefaultPhotos();
    if (ok) {
      showToast('✔ 已恢复预置婚礼大片');
    }
  }
}

async function submitUrlPhoto() {
  if (!urlForm.url) return;
  const ok = await store.addPhoto({ ...urlForm });
  if (ok) {
    showAddUrlModal.value = false;
    urlForm.url = '';
    showToast('✔ 照片已成功添加');
  }
}

// 弹幕操作
async function deleteBlessing(id) {
  store.blessings = store.blessings.filter(b => b.id !== id);
  await fetch(`/api/blessings/${id}`, { method: 'DELETE' });
  showToast('✔ 祝福已删除');
}

async function clearAllBlessings() {
  if (confirm('确定要清空全部弹幕祝福吗？')) {
    store.blessings = [];
    await fetch('/api/blessings', { method: 'DELETE' });
    showToast('✔ 已清空全部现场祝福');
  }
}

// 音乐上传
async function handleMusicUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('music', file);
  try {
    await fetch('/api/music/upload', {
      method: 'POST',
      body: formData
    });
  } catch (e) {
    console.error('Upload music failed:', e);
  }
}

// 触发礼花
function triggerConfetti() {
  fetch('/api/blessings/confetti', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intensity: 'super' })
  });
  store.launchConfetti('super');
}

onMounted(async () => {
  await store.init();
  initForms();
});
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #090807;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 2rem;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #fef08a;
}

.logo-sub {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.5);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #f87171;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 20px;
}

.status-indicator.online {
  color: #4ade80;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.btn-confetti-quick {
  background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
  color: #fff;
}

.btn-qr-quick {
  background: rgba(234, 179, 8, 0.2);
  border: 1px solid rgba(234, 179, 8, 0.4);
  color: #fef08a;
}

.btn-screen-link {
  background: #f59e0b;
  color: #000;
}

/* 主体与标签栏 */
.admin-main {
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
}

.tab-btn.active {
  background: rgba(245, 158, 11, 0.15);
  color: #fde047;
  font-weight: 600;
}

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  padding: 1.5rem;
  border-radius: 18px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.15rem;
  color: #fff;
  margin-bottom: 1.2rem;
}

.card-title .badge {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fde047;
}

/* 屏幕监控盒 */
.screen-preview-box {
  position: relative;
  width: 100%;
  height: 280px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.status-tag {
  color: #4ade80;
}
.status-tag.paused {
  color: #fbbf24;
}

.playback-controls {
  display: flex;
  gap: 12px;
  margin-top: 1rem;
}

.ctrl-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 10px;
  font-size: 0.9rem;
}

.ctrl-btn.primary-ctrl {
  background: #f59e0b;
  color: #000;
  font-weight: 600;
}

/* 模板切换器卡片 */
.template-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.tpl-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tpl-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tpl-card.active {
  background: rgba(234, 179, 8, 0.15);
  border-color: #f59e0b;
}

.tpl-icon {
  font-size: 1.5rem;
}

.tpl-name {
  font-weight: 600;
  font-size: 0.92rem;
  color: #fff;
}

.tpl-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.tpl-check {
  margin-left: auto;
  color: #f59e0b;
  font-weight: bold;
}

.divider-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1.2rem 0;
}

.settings-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin-bottom: 1rem;
}

.setting-item label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.admin-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.admin-select option {
  background: #18181b;
}

.switches-row {
  display: flex;
  gap: 20px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
}

/* 照片管理 */
.action-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.upload-dropzone {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  border: 2px dashed rgba(234, 179, 8, 0.4);
  padding: 14px 24px;
  border-radius: 14px;
  background: rgba(234, 179, 8, 0.05);
  transition: all 0.2s;
}

.upload-dropzone:hover {
  background: rgba(234, 179, 8, 0.12);
  border-color: #f59e0b;
}

.upload-icon {
  font-size: 2rem;
}

.upload-text strong {
  display: block;
  color: #fde047;
  font-size: 0.95rem;
}

.upload-text small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.hidden-file-input {
  display: none;
}

.quick-tools {
  display: flex;
  gap: 10px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.85rem;
}

.text-amber {
  color: #f59e0b;
}

/* 照片网格 */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
}

.photo-manage-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.photo-manage-card.playing {
  border-color: #f59e0b;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.photo-thumb-box {
  position: relative;
  width: 100%;
  height: 180px;
  background: #000;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fde047;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
}

.playing-tag {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #10b981;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
}

.photo-info-box {
  padding: 10px 12px;
  flex: 1;
}

.photo-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.photo-card-story {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
  line-height: 1.35;
}

.photo-card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: rgba(254, 240, 138, 0.8);
}

.photo-card-actions {
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-act-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.78rem;
}
.card-act-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.del-btn {
  flex: 0 0 36px;
  color: #f87171;
}

/* 婚礼资料表单 */
.config-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 1.2rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
}

.admin-input,
.admin-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  padding: 10px 14px;
  font-size: 0.9rem;
}
.admin-input:focus,
.admin-textarea:focus {
  border-color: #f59e0b;
  outline: none;
}

.btn-save {
  background: linear-gradient(135deg, #eab308 0%, #d97706 100%);
  color: #000;
  font-weight: 700;
  padding: 10px 28px;
  border-radius: 10px;
  font-size: 0.95rem;
}

.save-tip {
  margin-left: 14px;
  color: #4ade80;
  font-size: 0.85rem;
}

/* 弹幕与音乐 */
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.clear-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 6px;
}

.blessings-list-scroll {
  max-height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-blessing-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.b-avatar {
  font-size: 1.5rem;
}

.b-info {
  flex: 1;
}

.b-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  margin-bottom: 2px;
}

.b-name {
  font-weight: 600;
  color: #fde047;
}

.b-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
}

.b-likes {
  margin-left: auto;
  color: #fca5a5;
}

.b-content {
  font-size: 0.88rem;
  color: #fff;
}

.del-b-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  padding: 6px;
}
.del-b-btn:hover {
  color: #f87171;
}

/* 音乐管理 */
.music-list-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1.2rem;
}

.music-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.music-item.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.music-icon {
  font-size: 1.4rem;
}

.music-detail {
  flex: 1;
}

.music-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #fff;
}

.music-artist {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.music-play-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.78rem;
  padding: 6px 12px;
  border-radius: 8px;
}

.music-item.active .music-play-btn {
  background: #10b981;
  color: #fff;
}

.music-upload-section {
  margin-top: 1rem;
}

.upload-music-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 0.88rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
}
.upload-music-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 弹窗样式 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-card h3 {
  font-size: 1.25rem;
  color: #fef08a;
  margin-bottom: 1.2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 1.5rem;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 8px 18px;
  border-radius: 8px;
}

/* 全局 Toast 提示 */
.global-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 22, 18, 0.95);
  border: 1px solid #f59e0b;
  color: #fef08a;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 158, 11, 0.3);
  z-index: 9999;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>

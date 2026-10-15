<template>
  <div class="mobile-blessing-page">
    <!-- 顶部浪漫封面 -->
    <header class="mobile-header">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="wedding-badge">WEDDING BLESSING</div>
        <h1 class="couple-title">
          {{ store.weddingConfig.groom }} & {{ store.weddingConfig.bride }}
        </h1>
        <p class="wedding-date">
          <span>📅 {{ store.weddingConfig.weddingDate }}</span>
          <span class="dot">•</span>
          <span>📍 {{ store.weddingConfig.venue }}</span>
        </p>
        <div class="slogan-tag">“{{ store.weddingConfig.slogan }}”</div>
      </div>
    </header>

    <!-- 祝福表单卡片 -->
    <main class="blessing-form-container">
      <div class="form-card">
        <h2 class="form-title">
          <span>💌</span> 送上您的真挚祝福
        </h2>

        <!-- 头像与身份选择 -->
        <div class="avatar-selection-box">
          <label class="form-label">选择您的婚礼互动徽章：</label>
          <div class="avatar-list">
            <button 
              v-for="emoji in avatars" 
              :key="emoji"
              type="button"
              class="avatar-option"
              :class="{ selected: selectedAvatar === emoji }"
              @click="selectedAvatar = emoji"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">您的姓名 / 称呼：</label>
            <input 
              v-model="senderName" 
              type="text" 
              class="form-input" 
              placeholder="例如：大学室友小林 / 伴娘佳佳"
              maxlength="15"
            />
          </div>

          <div class="form-group">
            <label class="form-label">与新人的关系：</label>
            <select v-model="relation" class="form-input select-input">
              <option value="好友兄弟">好友兄弟</option>
              <option value="闺蜜姐妹">闺蜜姐妹</option>
              <option value="长辈亲属">长辈亲属</option>
              <option value="同窗好友">同窗好友</option>
              <option value="同事伙伴">同事伙伴</option>
              <option value="至亲贵客">至亲贵客</option>
            </select>
          </div>
        </div>

        <!-- 快捷祝福语胶囊标签 -->
        <div class="quick-tags-section">
          <label class="form-label">一键填入快捷祝福：</label>
          <div class="tag-capsules">
            <button 
              v-for="tag in quickTags" 
              :key="tag" 
              type="button" 
              class="tag-capsule"
              @click="content = tag"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- 祝福语内容框 -->
        <div class="form-group">
          <label class="form-label">祝福寄语：</label>
          <textarea 
            v-model="content" 
            class="form-textarea" 
            rows="3" 
            placeholder="写下你想对新人说的暖心祝福..."
            maxlength="100"
          ></textarea>
          <div class="char-count">{{ content.length }}/100</div>
        </div>

        <!-- 提交按钮与互动按钮 -->
        <div class="btn-group">
          <button 
            class="submit-btn" 
            :disabled="isSubmitting || !content.trim()"
            @click="submitBlessing"
          >
            <span v-if="!isSubmitting">🎉 发送祝福并上墙</span>
            <span v-else>正在传递祝福...</span>
          </button>

          <button class="confetti-btn" @click="triggerConfetti">
            <span>✨ 撒花庆祝</span>
          </button>
        </div>

        <div v-if="successMsg" class="success-banner">
          {{ successMsg }}
        </div>
      </div>

      <!-- 现场来宾祝福榜单 -->
      <section class="blessing-wall">
        <h3 class="wall-title">
          <span>💖 现场真情祝福墙</span>
          <small>({{ store.blessings.length }} 条祝福)</small>
        </h3>

        <div class="blessing-stream">
          <div 
            v-for="b in store.blessings" 
            :key="b.id" 
            class="blessing-item"
          >
            <div class="b-avatar">{{ b.avatar || '🌸' }}</div>
            <div class="b-content">
              <div class="b-header">
                <span class="b-name">{{ b.sender }}</span>
                <span class="b-tag" v-if="b.relation">{{ b.relation }}</span>
                <span class="b-time">{{ b.time }}</span>
              </div>
              <p class="b-text">{{ b.content }}</p>
              <div class="b-actions">
                <button class="like-btn" @click="likeBlessing(b)">
                  ❤️ {{ b.likes || 1 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部悬浮快捷返回大屏或首页按钮 -->
    <footer class="mobile-footer">
      <router-link to="/" class="view-screen-link">📺 查看大屏轮播展示</router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWeddingStore } from '@/stores/wedding';

const store = useWeddingStore();

const senderName = ref('');
const relation = ref('好友兄弟');
const selectedAvatar = ref('🌸');
const content = ref('');
const isSubmitting = ref(false);
const successMsg = ref('');

const avatars = ['🌸', '🥂', '🏮', '🎉', '💍', '👑', '💌', '✨', '💐', '🕊️'];

const quickTags = [
  '百年好合，永结同心！',
  '以爱之名，共度余生！',
  '新娘美绝，新郎帅爆！',
  '良辰吉日，喜结良缘！',
  '甜甜蜜蜜，早生贵子！',
  '琴瑟和鸣，岁月静好！'
];

async function submitBlessing() {
  if (!content.value.trim()) return;
  isSubmitting.value = true;
  successMsg.value = '';

  const payload = {
    sender: senderName.value.trim() || '现场亲友',
    relation: relation.value,
    avatar: selectedAvatar.value,
    content: content.value.trim()
  };

  try {
    const res = await fetch('/api/blessings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      successMsg.value = '🎉 祝福已成功飞上大屏！感谢您的美好心意！';
      content.value = '';
      setTimeout(() => successMsg.value = '', 4000);
    }
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
}

async function triggerConfetti() {
  try {
    await fetch('/api/blessings/confetti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intensity: 'super' })
    });
    store.launchConfetti('super');
  } catch (e) {
    console.warn(e);
  }
}

async function likeBlessing(b) {
  try {
    b.likes = (b.likes || 0) + 1;
    await fetch(`/api/blessings/${b.id}/like`, { method: 'POST' });
  } catch (e) {
    console.warn(e);
  }
}

onMounted(() => {
  store.init();
});
</script>

<style scoped>
.mobile-blessing-page {
  min-height: 100vh;
  background: #0d0b09;
  color: #fff;
  padding-bottom: 5rem;
  overflow-y: auto;
  user-select: auto;
}

.mobile-header {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #78350f 0%, #1e1b4b 50%, #450a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(234, 179, 8, 0.3);
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.75) 100%);
}

.header-content {
  position: relative;
  z-index: 2;
}

.wedding-badge {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  color: #fde047;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 10px;
  border-radius: 12px;
  margin-bottom: 0.3rem;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.couple-title {
  font-family: var(--font-title);
  font-size: 1.8rem;
  background: linear-gradient(135deg, #fff 0%, #fef08a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.3rem;
}

.wedding-date {
  font-size: 0.8rem;
  color: rgba(254, 240, 138, 0.8);
  margin-bottom: 0.3rem;
}

.wedding-date .dot {
  margin: 0 6px;
}

.slogan-tag {
  font-size: 0.85rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
}

/* 表单容器 */
.blessing-form-container {
  max-width: 600px;
  margin: -25px auto 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 10;
}

.form-card {
  background: rgba(26, 22, 18, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(234, 179, 8, 0.35);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.form-title {
  font-size: 1.25rem;
  color: #fef08a;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-selection-box {
  margin-bottom: 1rem;
}

.avatar-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 6px 2px;
}

.avatar-option {
  font-size: 1.4rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.avatar-option.selected {
  background: #f59e0b;
  transform: scale(1.15);
  border-color: #fef08a;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.form-input,
.form-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  color: #fff;
  padding: 10px 14px;
  font-size: 0.9rem;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #f59e0b;
}

.select-input option {
  background: #1c1917;
  color: #fff;
}

.quick-tags-section {
  margin-bottom: 1rem;
}

.tag-capsules {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-capsule {
  background: rgba(254, 240, 138, 0.1);
  border: 1px solid rgba(254, 240, 138, 0.25);
  color: #fef08a;
  font-size: 0.75rem;
  padding: 5px 10px;
  border-radius: 16px;
}
.tag-capsule:hover {
  background: rgba(254, 240, 138, 0.25);
}

.char-count {
  text-align: right;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 0.5rem;
}

.submit-btn {
  flex: 1;
  background: linear-gradient(135deg, #eab308 0%, #d97706 100%);
  color: #000;
  font-weight: 700;
  padding: 14px;
  border-radius: 14px;
  font-size: 1rem;
}
.submit-btn:disabled {
  opacity: 0.5;
}

.confetti-btn {
  background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
  color: #fff;
  font-weight: 600;
  padding: 14px 18px;
  border-radius: 14px;
  font-size: 0.95rem;
}

.success-banner {
  margin-top: 1rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  color: #a7f3d0;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  font-size: 0.85rem;
}

/* 祝福列表 */
.blessing-wall {
  margin-top: 2rem;
}

.wall-title {
  font-size: 1.15rem;
  color: #fef08a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wall-title small {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.blessing-stream {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.blessing-item {
  background: rgba(26, 22, 18, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  gap: 12px;
}

.b-avatar {
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.b-content {
  flex: 1;
}

.b-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.b-name {
  font-weight: 600;
  color: #fde68a;
  font-size: 0.88rem;
}

.b-tag {
  background: rgba(245, 158, 11, 0.2);
  color: #fef08a;
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 8px;
}

.b-time {
  margin-left: auto;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
}

.b-text {
  font-size: 0.9rem;
  color: #fff;
  line-height: 1.4;
  margin-bottom: 6px;
}

.b-actions {
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #fca5a5;
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 12px;
}

.mobile-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(13, 11, 9, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
  text-align: center;
  z-index: 50;
}

.view-screen-link {
  display: inline-block;
  color: #f59e0b;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
}
</style>

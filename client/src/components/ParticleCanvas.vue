<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  template: {
    type: String,
    default: 'champagne-gold'
  }
});

const canvasRef = ref(null);
let ctx = null;
let animationFrameId = null;
let particles = [];
let width = 0;
let height = 0;

// 根据不同模板配置粒子类型
function initParticles() {
  particles = [];
  const count = props.template === 'starlight-dream' ? 80 : (props.template === 'chinese-classic' ? 45 : 50);

  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }
}

function createParticle() {
  const t = props.template;
  if (t === 'chinese-classic') {
    // 飘落的红花瓣
    return {
      type: 'petal',
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 1.5 + 0.8,
      speedX: Math.sin(Math.random() * Math.PI) * 1.2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      color: Math.random() > 0.4 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(244, 63, 94, 0.65)',
      opacity: Math.random() * 0.7 + 0.3
    };
  } else if (t === 'starlight-dream') {
    // 璀璨星芒与微光流星
    return {
      type: 'star',
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      alpha: Math.random(),
      alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.3 ? '#ffffff' : '#93c5fd'
    };
  } else if (t === 'forestGreen' || t === 'forest-green') {
    // 阳光光斑与微尘
    return {
      type: 'bokeh',
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 20 + 8,
      speedY: -Math.random() * 0.5 - 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.2 + 0.05,
      color: Math.random() > 0.5 ? 'rgba(236, 253, 245, ' : 'rgba(254, 240, 138, '
    };
  } else if (t === 'retro-polaroid') {
    // 暖调复古尘粒
    return {
      type: 'dust',
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: -Math.random() * 0.4 - 0.1,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
      color: 'rgba(251, 191, 36, 0.5)'
    };
  } else {
    // 香槟金微光闪烁粒子
    return {
      type: 'gold',
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.2,
      speedY: -Math.random() * 0.6 - 0.2,
      speedX: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      alphaSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.5 ? '#fef08a' : '#f59e0b'
    };
  }
}

function resize() {
  if (!canvasRef.value) return;
  width = canvasRef.value.width = window.innerWidth;
  height = canvasRef.value.height = window.innerHeight;
}

function animate() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    if (p.type === 'petal') {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 1.5;
      p.rotation += p.rotSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 1.6, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'star') {
      p.alpha += p.alphaSpeed;
      if (p.alpha <= 0.1 || p.alpha >= 0.95) p.alphaSpeed = -p.alphaSpeed;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (p.type === 'bokeh') {
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y < -50) p.y = height + 50;
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      p.y += p.speedY;
      p.x += p.speedX;
      p.alpha += p.alphaSpeed || 0.01;
      if (p.alpha <= 0.1 || p.alpha >= 0.9) p.alphaSpeed = -(p.alphaSpeed || 0.01);
      if (p.y < -10) p.y = height + 10;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  animationFrameId = requestAnimationFrame(animate);
}

watch(() => props.template, () => {
  initParticles();
});

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  resize();
  initParticles();
  window.addEventListener('resize', resize);
  animate();
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', resize);
});
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 5;
}
</style>

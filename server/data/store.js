import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'store.json');

// 预设高画质浪漫婚礼摄影图库（免版权优质摄影集）
const DEFAULT_PHOTOS = [
  {
    id: "p-01",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
    title: "微光下的誓言",
    date: "2025.10.12",
    location: "法国 · 普罗旺斯庄园",
    story: "晨光透过薄纱，你微笑着走向我，那一刻全世界都安静了。",
    category: "wedding",
    order: 1
  },
  {
    id: "p-02",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80",
    title: "海风与白纱",
    date: "2025.06.18",
    location: "希腊 · 圣托里尼悬崖礼堂",
    story: "爱琴海的风很轻，吹动了你的发梢，也吹动了我们一生的约定。",
    category: "wedding",
    order: 2
  },
  {
    id: "p-03",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1920&q=80",
    title: "红妆之喜 · 执子之手",
    date: "2025.12.08",
    location: "苏州 · 姑苏园林古轩",
    story: "喜帕初揭，秋水盈盈。凤冠霞帔，许你一世欢喜与长安。",
    category: "wedding",
    order: 3
  },
  {
    id: "p-04",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1920&q=80",
    title: "相识初见的街角",
    date: "2023.04.15",
    location: "上海 · 武康路街角咖啡馆",
    story: "那天下着毛毛雨，你把伞分给我一半，故事从那杯热拿铁开始。",
    category: "daily",
    order: 4
  },
  {
    id: "p-05",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1920&q=80",
    title: "星空下的求婚",
    date: "2024.09.28",
    location: "新疆 · 赛里木湖星空营地",
    story: "在万千银河的见证下单膝跪地，我说'嫁给我吧'，你含着泪点头。",
    category: "proposal",
    order: 5
  },
  {
    id: "p-06",
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=80",
    title: "并肩漫步夕阳",
    date: "2024.11.05",
    location: "三亚 · 太阳湾日落海岸",
    story: "只要身边是你，无论看多少次日落都不会觉得平淡。",
    category: "daily",
    order: 6
  },
  {
    id: "p-07",
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1920&q=80",
    title: "林间森系花序",
    date: "2025.08.20",
    location: "杭州 · 九溪烟树密林",
    story: "在绿意盎然的天然穹顶下，定格我们最纯粹自然的笑容。",
    category: "wedding",
    order: 7
  },
  {
    id: "p-08",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1920&q=80",
    title: "良辰美景，敬余生",
    date: "2026.10.18",
    location: "今日大婚 · 礼堂宴会厅",
    story: "今天，感谢所有至亲好友一同见证，我们的小小家庭正式启程！",
    category: "welcoming",
    order: 8
  }
];

// 预设默认背景音乐列表
const DEFAULT_MUSIC = [
  {
    id: "m-01",
    name: "Canon in D (卡农 钢琴浪漫版)",
    artist: "Johann Pachelbel",
    url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=romantic-wedding-love-112194.mp3"
  },
  {
    id: "m-02",
    name: "A Thousand Years (抒情大提琴)",
    artist: "The Piano Guys Style",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=gentle-wedding-acoustic-guitar-15589.mp3"
  },
  {
    id: "m-03",
    name: "Sweet Wedding Day (轻快森系)",
    artist: "Acoustic Melody",
    url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_2c5f1cfb36.mp3?filename=wedding-love-123498.mp3"
  }
];

// 预设现场祝福弹幕
const DEFAULT_BLESSINGS = [
  {
    id: "b-01",
    sender: "伴娘团 · 佳佳",
    relation: "新娘闺蜜",
    avatar: "🌸",
    content: "新娘今天美绝了！Ethan你要一辈子对我们家婉清好哦！💖",
    time: "刚刚",
    likes: 88,
    status: "approved"
  },
  {
    id: "b-02",
    sender: "大学死党 · 阿杰",
    relation: "新郎兄弟",
    avatar: "🥂",
    content: "恭喜老陆终于抱得美人归！祝新婚快乐，白头偕老！",
    time: "1分钟前",
    likes: 66,
    status: "approved"
  },
  {
    id: "b-03",
    sender: "二姑妈",
    relation: "长辈亲属",
    avatar: "🏮",
    content: "郎才女貌，天作之合！祝侄儿媳妇早生贵子，甜甜蜜蜜！",
    time: "2分钟前",
    likes: 99,
    status: "approved"
  },
  {
    id: "b-04",
    sender: "同窗球友群",
    relation: "好友",
    avatar: "🎉",
    content: "球场少了个单身汉，世上多了个模范丈夫！干杯！🍻",
    time: "3分钟前",
    likes: 42,
    status: "approved"
  },
  {
    id: "b-05",
    sender: "婉清的表妹",
    relation: "亲属",
    avatar: "💍",
    content: "大屏放的照片太好看了！从校园走到婚礼，太好哭了呜呜呜",
    time: "4分钟前",
    likes: 77,
    status: "approved"
  },
  {
    id: "b-06",
    sender: "公司同事大家庭",
    relation: "同事伙伴",
    avatar: "✨",
    content: "祝两位新人以爱之名，共度余生，生活甜度超标！",
    time: "5分钟前",
    likes: 53,
    status: "approved"
  }
];

const INITIAL_DATA = {
  weddingConfig: {
    groom: "陆子昂",
    groomEn: "Ethan",
    bride: "林婉清",
    brideEn: "Clara",
    weddingDate: "2026-10-18",
    venue: "云顶庄园 · 水晶空中礼堂",
    slogan: "以爱之名 · 共度余生",
    subSlogan: "TWO HEARTS, ONE LOVE",
    welcomeText: "欢迎各位亲朋好友莅临见证我们的幸福时刻",
    activeMusicId: "m-01"
  },
  screenSettings: {
    template: "champagne-gold", // champagne-gold | chinese-classic | forest-green | retro-polaroid | starlight-dream
    transition: "kenburns",      // kenburns | 3d-cube | fade-blur | polaroid-drop | smart-random
    fitMode: "cover",            // cover (铺满屏幕) | contain (居中完整)
    interval: 6,                 // 切换间隔（秒）
    showStory: true,             // 是否在轮播中显示拍摄地点、日期与温情故事
    showDanmaku: true,           // 是否显示祝福弹幕
    danmakuSpeed: "normal",      // slow | normal | fast
    danmakuOpacity: 0.9,
    isPaused: false,
    musicPlaying: true,
    currentPhotoIndex: 0
  },
  photos: DEFAULT_PHOTOS,
  musicList: DEFAULT_MUSIC,
  blessings: DEFAULT_BLESSINGS
};

export class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading store.json, using initial data:', e);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData(data = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving store.json:', e);
    }
  }

  get() {
    return this.data;
  }

  updateWeddingConfig(config) {
    this.data.weddingConfig = { ...this.data.weddingConfig, ...config };
    this.saveData();
    return this.data.weddingConfig;
  }

  updateScreenSettings(settings) {
    this.data.screenSettings = { ...this.data.screenSettings, ...settings };
    this.saveData();
    return this.data.screenSettings;
  }

  // 照片管理
  addPhoto(photo) {
    const newPhoto = {
      id: `p-${Date.now()}`,
      order: this.data.photos.length + 1,
      ...photo
    };
    this.data.photos.push(newPhoto);
    this.saveData();
    return newPhoto;
  }

  updatePhoto(id, updates) {
    const idx = this.data.photos.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.photos[idx] = { ...this.data.photos[idx], ...updates };
      this.saveData();
      return this.data.photos[idx];
    }
    return null;
  }

  deletePhoto(id) {
    this.data.photos = this.data.photos.filter(p => p.id !== id);
    // 重新校正当前播放索引
    if (this.data.screenSettings.currentPhotoIndex >= this.data.photos.length) {
      this.data.screenSettings.currentPhotoIndex = Math.max(0, this.data.photos.length - 1);
    }
    this.saveData();
    return true;
  }

  reorderPhotos(orderedIds) {
    const photoMap = new Map(this.data.photos.map(p => [p.id, p]));
    const newPhotos = [];
    orderedIds.forEach((id, index) => {
      const p = photoMap.get(id);
      if (p) {
        p.order = index + 1;
        newPhotos.push(p);
      }
    });
    // 补齐未在列表中的
    this.data.photos.forEach(p => {
      if (!orderedIds.includes(p.id)) {
        p.order = newPhotos.length + 1;
        newPhotos.push(p);
      }
    });
    this.data.photos = newPhotos;
    this.saveData();
    return this.data.photos;
  }

  resetDefaultPhotos() {
    this.data.photos = JSON.parse(JSON.stringify(DEFAULT_PHOTOS));
    this.saveData();
    return this.data.photos;
  }

  // 祝福弹幕管理
  addBlessing(blessing) {
    const newBlessing = {
      id: `b-${Date.now()}`,
      time: "刚刚",
      likes: 1,
      status: "approved",
      avatar: blessing.avatar || "💐",
      ...blessing
    };
    this.data.blessings.unshift(newBlessing);
    this.saveData();
    return newBlessing;
  }

  likeBlessing(id) {
    const b = this.data.blessings.find(item => item.id === id);
    if (b) {
      b.likes = (b.likes || 0) + 1;
      this.saveData();
      return b;
    }
    return null;
  }

  deleteBlessing(id) {
    this.data.blessings = this.data.blessings.filter(b => b.id !== id);
    this.saveData();
    return true;
  }

  clearBlessings() {
    this.data.blessings = [];
    this.saveData();
    return true;
  }

  // 音乐管理
  addMusic(music) {
    const newMusic = {
      id: `m-${Date.now()}`,
      ...music
    };
    this.data.musicList.push(newMusic);
    this.saveData();
    return newMusic;
  }

  deleteMusic(id) {
    this.data.musicList = this.data.musicList.filter(m => m.id !== id);
    if (this.data.weddingConfig.activeMusicId === id && this.data.musicList.length > 0) {
      this.data.weddingConfig.activeMusicId = this.data.musicList[0].id;
    }
    this.saveData();
    return true;
  }
}

export const store = new DataStore();

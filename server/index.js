import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { store } from './data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 获取局域网 IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let candidate = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          return iface.address;
        }
        candidate = iface.address;
      }
    }
  }
  return candidate;
}

const LOCAL_IP = getLocalIP();

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Multer 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB 最大限制
});

// 创建 HTTP 与 WebSocket 服务
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 广播消息给所有连接的客户端
export function broadcast(message) {
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws) => {
  // 发送当前数据快照
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    data: store.get()
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      // 处理来自远程播控/大屏的控制信令
      if (parsed.type === 'CONTROL_SCREEN') {
        store.updateScreenSettings(parsed.data);
        broadcast({
          type: 'SCREEN_SETTINGS_CHANGED',
          data: parsed.data
        });
      } else if (parsed.type === 'TRIGGER_CONFETTI') {
        broadcast({
          type: 'TRIGGER_CONFETTI',
          data: parsed.data || {}
        });
      }
    } catch (e) {
      console.error('WS message parse error:', e);
    }
  });
});

// RESTful API 路由

// 1. 获取所有初始化数据与网络信息
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    data: store.get(),
    serverInfo: {
      localIp: LOCAL_IP,
      port: PORT,
      blessingUrl: `http://${LOCAL_IP}:5173/bless`,
      screenUrl: `http://${LOCAL_IP}:5173/`,
      adminUrl: `http://${LOCAL_IP}:5173/admin`
    }
  });
});

// 2. 更新婚礼基本信息
app.post('/api/config', (req, res) => {
  const updated = store.updateWeddingConfig(req.body);
  broadcast({
    type: 'WEDDING_CONFIG_CHANGED',
    data: updated
  });
  res.json({ success: true, data: updated });
});

// 3. 更新大屏播控设置
app.post('/api/screen-settings', (req, res) => {
  const updated = store.updateScreenSettings(req.body);
  broadcast({
    type: 'SCREEN_SETTINGS_CHANGED',
    data: updated
  });
  res.json({ success: true, data: updated });
});

// 4. 单张/批量上传照片 (使用 upload.any() 容错兼容任意字段名)
app.post('/api/photos/upload', upload.any(), (req, res) => {
  try {
    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // 中文文件名编码兼容
        let rawName = file.originalname;
        try {
          rawName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (e) {}

        const parsedTitle = path.parse(rawName).name || "甜蜜瞬间";
        const photo = store.addPhoto({
          url: `/uploads/${file.filename}`,
          title: parsedTitle,
          date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
          location: "婚礼现场甜蜜特辑",
          story: "美好瞬间，定格永恒。",
          category: req.body.category || "wedding"
        });
        uploadedPhotos.push(photo);
      });

      broadcast({
        type: 'PHOTOS_UPDATED',
        data: store.get().photos
      });
    }
    res.json({ success: true, data: uploadedPhotos });
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. 添加照片(URL方式)
app.post('/api/photos', (req, res) => {
  const photo = store.addPhoto(req.body);
  broadcast({
    type: 'PHOTOS_UPDATED',
    data: store.get().photos
  });
  res.json({ success: true, data: photo });
});

// 6. 编辑照片
app.put('/api/photos/:id', (req, res) => {
  const updated = store.updatePhoto(req.params.id, req.body);
  if (updated) {
    broadcast({
      type: 'PHOTOS_UPDATED',
      data: store.get().photos
    });
    res.json({ success: true, data: updated });
  } else {
    res.status(404).json({ success: false, message: 'Photo not found' });
  }
});

// 7. 删除照片
app.delete('/api/photos/:id', (req, res) => {
  try {
    const photo = store.get().photos.find(p => p.id === req.params.id);
    if (photo && photo.url && photo.url.includes('/uploads/')) {
      try {
        const filename = path.basename(photo.url);
        const filepath = path.join(uploadDir, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      } catch (err) {
        console.warn('Physical file deletion error:', err);
      }
    }
    store.deletePhoto(req.params.id);
    const photos = store.get().photos;
    broadcast({
      type: 'PHOTOS_UPDATED',
      data: photos
    });
    broadcast({
      type: 'SCREEN_SETTINGS_CHANGED',
      data: store.get().screenSettings
    });
    res.json({ success: true, data: photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. 照片拖拽重排
app.post('/api/photos/reorder', (req, res) => {
  const { ids } = req.body;
  if (Array.isArray(ids)) {
    const reordered = store.reorderPhotos(ids);
    broadcast({
      type: 'PHOTOS_UPDATED',
      data: reordered
    });
    res.json({ success: true, data: reordered });
  } else {
    res.status(400).json({ success: false, message: 'Invalid payload' });
  }
});

// 9. 恢复预置高画质照片
app.post('/api/photos/reset-default', (req, res) => {
  const photos = store.resetDefaultPhotos();
  broadcast({
    type: 'PHOTOS_UPDATED',
    data: photos
  });
  res.json({ success: true, data: photos });
});

// 10. 宾客提交祝福
app.post('/api/blessings', (req, res) => {
  const blessing = store.addBlessing(req.body);
  // 广播新祝福让大屏即刻发射弹幕
  broadcast({
    type: 'NEW_BLESSING',
    data: blessing
  });
  res.json({ success: true, data: blessing });
});

// 11. 祝福点赞
app.post('/api/blessings/:id/like', (req, res) => {
  const b = store.likeBlessing(req.params.id);
  if (b) {
    broadcast({
      type: 'BLESSING_LIKED',
      data: b
    });
    res.json({ success: true, data: b });
  } else {
    res.status(404).json({ success: false });
  }
});

// 12. 删除祝福
app.delete('/api/blessings/:id', (req, res) => {
  store.deleteBlessing(req.params.id);
  broadcast({
    type: 'BLESSINGS_UPDATED',
    data: store.get().blessings
  });
  res.json({ success: true });
});

// 13. 清空祝福
app.delete('/api/blessings', (req, res) => {
  store.clearBlessings();
  broadcast({
    type: 'BLESSINGS_UPDATED',
    data: []
  });
  res.json({ success: true });
});

// 14. 触发礼花动画
app.post('/api/blessings/confetti', (req, res) => {
  broadcast({
    type: 'TRIGGER_CONFETTI',
    data: req.body
  });
  res.json({ success: true });
});

// 15. 音频上传与添加
app.post('/api/music/upload', upload.single('music'), (req, res) => {
  if (req.file) {
    const music = store.addMusic({
      name: path.parse(req.file.originalname).name,
      artist: req.body.artist || "本地上传",
      url: `http://${LOCAL_IP}:${PORT}/uploads/${req.file.filename}`
    });
    res.json({ success: true, data: music });
  } else {
    res.status(400).json({ success: false, message: 'No file uploaded' });
  }
});

app.post('/api/music', (req, res) => {
  const music = store.addMusic(req.body);
  res.json({ success: true, data: music });
});

app.delete('/api/music/:id', (req, res) => {
  store.deleteMusic(req.params.id);
  res.json({ success: true });
});

// 全局错误处理中间件 (捕获 Multer 错误等)
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `上传错误: ${err.message}` });
  }
  res.status(500).json({ success: false, message: err.message || '内部服务错误' });
});

// 启动服务
server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🌸 婚礼大屏轮播系统后端服务启动成功!`);
  console.log(`📡 本地访问:    http://localhost:${PORT}`);
  console.log(`🌐 局域网访问:  http://${LOCAL_IP}:${PORT}`);
  console.log(`===============================================`);
});

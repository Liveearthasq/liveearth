# 实时地球 · LiveEarth

移动端 H5 实时地图应用，纯前端、零密钥，打开即用。可交互分层展示全球实时地图资料。

## 功能
- **底图切换**：街道 / 暗色 / 卫星（Esri）
- **实时图层**（均为免费公开 API）：
  - 实时雷达降水 — RainViewer
  - 卫星云图 — NASA GIBS (Aqua)
  - 实时地震 — USGS（近 24 小时）
  - 空气质量 AQI — Open-Meteo
  - NASA 真彩影像 — GIBS (Terra)
- **城市搜索跳转**：内置 100 城离线库（中/英文），即时匹配，联网兜底地理编码
- **收藏 / 轨迹**：收藏地图点（本机保存），一键连成轨迹
- **分享当前视图**：把视野+图层编码进链接，对方打开即同步

## 本地运行
```bash
npx serve -l 8080 .
# 或
python -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080
```

## 部署到 Vercel（一键）
本项目是纯静态站点，Vercel 无需构建，直接托管根目录即可。

### 方式一：用 Vercel 命令行（推荐，最简单）
```bash
npx vercel        # 首次会打开浏览器让你登录，按提示完成
npx vercel --prod # 部署到生产环境，返回线上地址
```

### 方式二：用 Token 非交互部署（CI / 助手代部署）
在 https://vercel.com/account/tokens 生成一个 Token，然后：
```bash
VERCEL_TOKEN=你的token npx vercel deploy --prod --token=$VERCEL_TOKEN
```

### 方式三：GitHub + Deploy 按钮
1. 把本目录推到 GitHub 仓库（如 `your-name/liveearth`）
2. 点击下面按钮，按引导导入并部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLiveearthasq%2Fliveearth&project-name=liveearth&root-directory=.)

> 提示：上面按钮已指向 `github.com/Liveearthasq/liveearth`，请先把这个仓库推到你的 GitHub 同名仓库，再点按钮导入部署。

## 目录结构
```
index.html        # 页面结构
assets/style.css  # 样式（移动端优先暗色 UI）
assets/app.js     # 地图引擎 + 实时数据 + 搜索/收藏/分享逻辑
vercel.json       # Vercel 静态托管配置
```

## 说明
- NASA 真彩影像通常滞后 1–2 天发布，属数据源特性。
- 所有请求失败均有降级提示，不会白屏。
- 收藏数据仅存于本机浏览器（localStorage），不上传服务器。

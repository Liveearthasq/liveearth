# 实时地球 · LiveEarth

移动端 H5 实时地图应用，纯前端、零密钥，打开即用。可交互分层展示全球实时地图资料。

## 功能
- **底图切换**：街道 / 暗色 / 卫星（Esri）；右下角带「+ / −」缩放控件与比例尺
- **实时图层**（均为免费公开 API）：
  - 实时雷达降水 — RainViewer
  - 卫星云图 — NASA GIBS (Aqua)
  - 实时地震 — USGS（近 24 小时）
  - 空气质量 AQI — Open-Meteo
  - NASA 真彩影像 — GIBS (Terra)
- **城市搜索跳转**：内置 100 城离线库（中/英文），即时匹配，联网兜底地理编码
- **收藏 / 轨迹**：收藏地图点（本机保存），一键连成轨迹
- **分享当前视图**：把视野+图层编码进链接，对方打开即同步
- **城市名称标注**：地图常驻显示中国中等城市与外国大城市名称（图层面板可开关，缩到全球视图时自动隐藏避免重叠）

## 本地运行
```bash
npx serve -l 8080 .
# 或
python -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080
```

## 部署（任选其一，本项目是纯静态站点，零构建）

### 方式一：GitHub Pages（推荐 · 无需安装任何工具）
代码已在 GitHub 仓库，几步即可上线，免费、自带域名：
1. 打开 `https://github.com/Liveearthasq/liveearth` → **Settings → Pages**
2. **Source** 选 `Deploy from a branch` → **Branch** 选 `main`、**folder** 选 `/ (root)`
3. 点 **Save**
4. 约 1 分钟后访问 `https://Liveearthasq.github.io/liveearth/`

> 仓库已含 `.nojekyll`，GitHub Pages 会按纯静态文件原样托管，无需 Jekyll。

### 方式二：Netlify Drop（无需安装 · 拖拽即上线）
1. 打开 `https://app.netlify.com/drop`
2. 把本仓库下载到本地的整个文件夹拖进去
3. 自动生成 `https://xxxx.netlify.app` 地址，可随时改自定义域名

### 方式三：Vercel（需在本机安装 Vercel CLI 或登录 Vercel 账号）
```bash
npx vercel        # 首次会打开浏览器让你登录，按提示完成
npx vercel --prod # 部署到生产环境，返回线上地址
```
或用 Token 非交互部署（CI / 助手代部署）：
```bash
VERCEL_TOKEN=你的token npx vercel deploy --prod --token=$VERCEL_TOKEN
```
也可点下面按钮按引导导入（需 Vercel 账号）：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLiveearthasq%2Fliveearth&project-name=liveearth&root-directory=.)

> 提示：上面按钮已指向 `github.com/Liveearthasq/liveearth`。

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

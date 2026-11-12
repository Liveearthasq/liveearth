/* 实时地球 · LiveEarth —— 纯前端 H5，免费公开 API */
(function () {
  'use strict';

  // ---------- 数据源常量 ----------
  var RV_URL = 'https://api.rainviewer.com/public/weather-maps.json';
  var USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
  var AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

  // ---------- 底图 ----------
  var SOURCES = {
    osm: {
      label: '街道',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      opts: { attribution: '&copy; OpenStreetMap', subdomains: 'abc', maxZoom: 19 }
    },
    dark: {
      label: '暗色',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      opts: { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }
    },
    sat: {
      label: '卫星',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      opts: { attribution: 'Tiles &copy; Esri', maxZoom: 18 }
    }
  };

  // ---------- AQI 城市（每个请求一次，控制在 14 个）----------
  var CITIES = [
    { name: '北京', lat: 39.9042, lng: 116.4074 },
    { name: '上海', lat: 31.2304, lng: 121.4737 },
    { name: '广州', lat: 23.1291, lng: 113.2644 },
    { name: '东京', lat: 35.6762, lng: 139.6503 },
    { name: '新加坡', lat: 1.3521, lng: 103.8198 },
    { name: '纽约', lat: 40.7128, lng: -74.0060 },
    { name: '洛杉矶', lat: 34.0522, lng: -118.2437 },
    { name: '伦敦', lat: 51.5074, lng: -0.1278 },
    { name: '巴黎', lat: 48.8566, lng: 2.3522 },
    { name: '莫斯科', lat: 55.7558, lng: 37.6173 },
    { name: '迪拜', lat: 25.2048, lng: 55.2708 },
    { name: '悉尼', lat: -33.8688, lng: 151.2093 },
    { name: '圣保罗', lat: -23.5505, lng: -46.6333 },
    { name: '开普敦', lat: -33.9249, lng: 18.4241 }
  ];

  // ---------- 城市搜索库（中文名 + 英文名，离线匹配）----------
  var CITY_DB = [
    { name: '北京', en: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: '上海', en: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: '广州', en: 'Guangzhou', lat: 23.1291, lng: 113.2644 },
    { name: '深圳', en: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
    { name: '成都', en: 'Chengdu', lat: 30.5728, lng: 104.0668 },
    { name: '杭州', en: 'Hangzhou', lat: 30.2741, lng: 120.1551 },
    { name: '武汉', en: 'Wuhan', lat: 30.5928, lng: 114.3055 },
    { name: '西安', en: "Xi'an", lat: 34.3416, lng: 108.9398 },
    { name: '南京', en: 'Nanjing', lat: 32.0603, lng: 118.7969 },
    { name: '重庆', en: 'Chongqing', lat: 29.5630, lng: 106.5516 },
    { name: '天津', en: 'Tianjin', lat: 39.3434, lng: 117.3616 },
    { name: '苏州', en: 'Suzhou', lat: 31.2989, lng: 120.5853 },
    { name: '青岛', en: 'Qingdao', lat: 36.0671, lng: 120.3826 },
    { name: '大连', en: 'Dalian', lat: 38.9140, lng: 121.6147 },
    { name: '厦门', en: 'Xiamen', lat: 24.4798, lng: 118.0894 },
    { name: '昆明', en: 'Kunming', lat: 24.8801, lng: 102.8329 },
    { name: '长沙', en: 'Changsha', lat: 28.2282, lng: 112.9388 },
    { name: '郑州', en: 'Zhengzhou', lat: 34.7466, lng: 113.6254 },
    { name: '哈尔滨', en: 'Harbin', lat: 45.8038, lng: 126.5349 },
    { name: '沈阳', en: 'Shenyang', lat: 41.8057, lng: 123.4315 },
    { name: '乌鲁木齐', en: 'Urumqi', lat: 43.8256, lng: 87.6168 },
    { name: '拉萨', en: 'Lhasa', lat: 29.6520, lng: 91.1721 },
    { name: '呼和浩特', en: 'Hohhot', lat: 40.8424, lng: 111.7490 },
    { name: '南宁', en: 'Nanning', lat: 22.8170, lng: 108.3665 },
    { name: '兰州', en: 'Lanzhou', lat: 36.0611, lng: 103.8343 },
    { name: '贵阳', en: 'Guiyang', lat: 26.6470, lng: 106.6302 },
    { name: '太原', en: 'Taiyuan', lat: 37.8706, lng: 112.5489 },
    { name: '济南', en: 'Jinan', lat: 36.6512, lng: 117.1201 },
    { name: '合肥', en: 'Hefei', lat: 31.8206, lng: 117.2272 },
    { name: '福州', en: 'Fuzhou', lat: 26.0745, lng: 119.2965 },
    { name: '海口', en: 'Haikou', lat: 20.0440, lng: 110.1999 },
    { name: '香港', en: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
    { name: '澳门', en: 'Macao', lat: 22.1987, lng: 113.5439 },
    { name: '台北', en: 'Taipei', lat: 25.0330, lng: 121.5654 },
    { name: '东京', en: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: '大阪', en: 'Osaka', lat: 34.6937, lng: 135.5023 },
    { name: '首尔', en: 'Seoul', lat: 37.5665, lng: 126.9780 },
    { name: '平壤', en: 'Pyongyang', lat: 39.0392, lng: 125.7625 },
    { name: '曼谷', en: 'Bangkok', lat: 13.7563, lng: 100.5018 },
    { name: '新加坡', en: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: '吉隆坡', en: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
    { name: '雅加达', en: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: '马尼拉', en: 'Manila', lat: 14.5995, lng: 120.9842 },
    { name: '河内', en: 'Hanoi', lat: 21.0278, lng: 105.8342 },
    { name: '新德里', en: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { name: '孟买', en: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: '达卡', en: 'Dhaka', lat: 23.8103, lng: 90.4125 },
    { name: '卡拉奇', en: 'Karachi', lat: 24.8607, lng: 67.0011 },
    { name: '迪拜', en: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: '利雅得', en: 'Riyadh', lat: 24.7136, lng: 46.6753 },
    { name: '伊斯坦布尔', en: 'Istanbul', lat: 41.0082, lng: 28.9784 },
    { name: '德黑兰', en: 'Tehran', lat: 35.6892, lng: 51.3890 },
    { name: '巴格达', en: 'Baghdad', lat: 33.3152, lng: 44.3661 },
    { name: '伦敦', en: 'London', lat: 51.5074, lng: -0.1278 },
    { name: '巴黎', en: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: '柏林', en: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: '马德里', en: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: '罗马', en: 'Rome', lat: 41.9028, lng: 12.4964 },
    { name: '莫斯科', en: 'Moscow', lat: 55.7558, lng: 37.6173 },
    { name: '阿姆斯特丹', en: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: '维也纳', en: 'Vienna', lat: 48.2082, lng: 16.3738 },
    { name: '苏黎世', en: 'Zurich', lat: 47.3769, lng: 8.5417 },
    { name: '斯德哥尔摩', en: 'Stockholm', lat: 59.3293, lng: 18.0686 },
    { name: '雅典', en: 'Athens', lat: 37.9838, lng: 23.7275 },
    { name: '华沙', en: 'Warsaw', lat: 52.2297, lng: 21.0122 },
    { name: '纽约', en: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: '洛杉矶', en: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: '芝加哥', en: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: '旧金山', en: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: '西雅图', en: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: '多伦多', en: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { name: '墨西哥城', en: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    { name: '圣保罗', en: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
    { name: '里约热内卢', en: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    { name: '布宜诺斯艾利斯', en: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
    { name: '利马', en: 'Lima', lat: -12.0464, lng: -77.0428 },
    { name: '波哥大', en: 'Bogota', lat: 4.7110, lng: -74.0721 },
    { name: '开罗', en: 'Cairo', lat: 30.0444, lng: 31.2357 },
    { name: '开普敦', en: 'Cape Town', lat: -33.9249, lng: 18.4241 },
    { name: '内罗毕', en: 'Nairobi', lat: -1.2921, lng: 36.8219 },
    { name: '拉各斯', en: 'Lagos', lat: 6.5244, lng: 3.3792 },
    { name: '约翰内斯堡', en: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
    { name: '悉尼', en: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: '墨尔本', en: 'Melbourne', lat: -37.8136, lng: 144.9631 },
    { name: '奥克兰', en: 'Auckland', lat: -36.8485, lng: 174.7633 },
    { name: '珀斯', en: 'Perth', lat: -31.9505, lng: 115.8605 }
  ];

  // ---------- 地图常驻城市标注（中国中等城市 + 外国大城市）----------
  var LABEL_CITIES = [
    // 中国中等城市
    { name: '苏州', lat: 31.30, lng: 120.62, country: 'cn' },
    { name: '无锡', lat: 31.49, lng: 120.31, country: 'cn' },
    { name: '宁波', lat: 29.87, lng: 121.55, country: 'cn' },
    { name: '青岛', lat: 36.07, lng: 120.38, country: 'cn' },
    { name: '大连', lat: 38.91, lng: 121.61, country: 'cn' },
    { name: '厦门', lat: 24.48, lng: 118.09, country: 'cn' },
    { name: '常州', lat: 31.81, lng: 119.97, country: 'cn' },
    { name: '温州', lat: 27.99, lng: 120.70, country: 'cn' },
    { name: '佛山', lat: 23.02, lng: 113.12, country: 'cn' },
    { name: '东莞', lat: 23.02, lng: 113.75, country: 'cn' },
    { name: '烟台', lat: 37.46, lng: 121.45, country: 'cn' },
    { name: '泉州', lat: 24.87, lng: 118.58, country: 'cn' },
    { name: '嘉兴', lat: 30.75, lng: 120.75, country: 'cn' },
    { name: '南通', lat: 31.98, lng: 120.89, country: 'cn' },
    { name: '徐州', lat: 34.27, lng: 117.18, country: 'cn' },
    { name: '唐山', lat: 39.63, lng: 118.18, country: 'cn' },
    { name: '绍兴', lat: 30.00, lng: 120.58, country: 'cn' },
    { name: '合肥', lat: 31.82, lng: 117.23, country: 'cn' },
    { name: '昆明', lat: 25.04, lng: 102.71, country: 'cn' },
    { name: '南昌', lat: 28.68, lng: 115.86, country: 'cn' },
    { name: '贵阳', lat: 26.65, lng: 106.63, country: 'cn' },
    { name: '南宁', lat: 22.82, lng: 108.32, country: 'cn' },
    { name: '兰州', lat: 36.06, lng: 103.83, country: 'cn' },
    { name: '太原', lat: 37.87, lng: 112.55, country: 'cn' },
    { name: '石家庄', lat: 38.04, lng: 114.51, country: 'cn' },
    { name: '福州', lat: 26.07, lng: 119.30, country: 'cn' },
    { name: '哈尔滨', lat: 45.80, lng: 126.53, country: 'cn' },
    { name: '长春', lat: 43.82, lng: 125.32, country: 'cn' },
    { name: '沈阳', lat: 41.81, lng: 123.43, country: 'cn' },
    { name: '济南', lat: 36.65, lng: 117.12, country: 'cn' },
    { name: '郑州', lat: 34.75, lng: 113.62, country: 'cn' },
    { name: '长沙', lat: 28.23, lng: 112.94, country: 'cn' },
    { name: '武汉', lat: 30.59, lng: 114.31, country: 'cn' },
    { name: '成都', lat: 30.57, lng: 104.07, country: 'cn' },
    { name: '西安', lat: 34.34, lng: 108.94, country: 'cn' },
    // 外国大城市
    { name: '东京', lat: 35.68, lng: 139.69, country: 'intl' },
    { name: '大阪', lat: 34.69, lng: 135.50, country: 'intl' },
    { name: '首尔', lat: 37.57, lng: 126.98, country: 'intl' },
    { name: '曼谷', lat: 13.76, lng: 100.50, country: 'intl' },
    { name: '新加坡', lat: 1.35, lng: 103.82, country: 'intl' },
    { name: '吉隆坡', lat: 3.14, lng: 101.69, country: 'intl' },
    { name: '雅加达', lat: -6.21, lng: 106.85, country: 'intl' },
    { name: '新德里', lat: 28.61, lng: 77.21, country: 'intl' },
    { name: '孟买', lat: 19.08, lng: 72.88, country: 'intl' },
    { name: '迪拜', lat: 25.20, lng: 55.27, country: 'intl' },
    { name: '伊斯坦布尔', lat: 41.01, lng: 28.98, country: 'intl' },
    { name: '莫斯科', lat: 55.75, lng: 37.62, country: 'intl' },
    { name: '伦敦', lat: 51.51, lng: -0.13, country: 'intl' },
    { name: '巴黎', lat: 48.85, lng: 2.35, country: 'intl' },
    { name: '柏林', lat: 52.52, lng: 13.40, country: 'intl' },
    { name: '马德里', lat: 40.42, lng: -3.70, country: 'intl' },
    { name: '罗马', lat: 41.90, lng: 12.50, country: 'intl' },
    { name: '纽约', lat: 40.71, lng: -74.01, country: 'intl' },
    { name: '洛杉矶', lat: 34.05, lng: -118.24, country: 'intl' },
    { name: '芝加哥', lat: 41.88, lng: -87.63, country: 'intl' },
    { name: '多伦多', lat: 43.65, lng: -79.38, country: 'intl' },
    { name: '墨西哥城', lat: 19.43, lng: -99.13, country: 'intl' },
    { name: '圣保罗', lat: -23.55, lng: -46.63, country: 'intl' },
    { name: '开普敦', lat: -33.92, lng: 18.42, country: 'intl' },
    { name: '悉尼', lat: -33.87, lng: 151.21, country: 'intl' }
  ];
  var labelMarkers = [];

  // ---------- 状态 ----------
  var map, baseLayer, currentBase = 'dark';
  var overlays = {
    radar:     { name: '实时雷达降水', sub: 'RainViewer 全球降水回波', layer: null, load: loadRadar, on: false },
    satellite: { name: '卫星云图',     sub: 'NASA Aqua 真彩（含云）',  layer: null, load: loadSatellite, on: false },
    quakes:    { name: '实时地震',     sub: 'USGS 近 24 小时',          layer: null, load: loadQuakes, on: false },
    aqi:       { name: '空气质量',     sub: 'Open-Meteo AQI',           layer: null, load: loadAQI, on: false },
    nasa:      { name: 'NASA 真彩影像', sub: 'GIBS MODIS 每日真彩',      layer: null, load: loadNASA, on: false },
    labels:    { name: '城市名称标注',   sub: '中国中等城市 / 外国大城市',  layer: null, load: loadLabels, on: false }
  };
  var autoTimer = null;
  var myMarker = null;

  // 收藏 / 轨迹
  var FAV_KEY = 'liveearth_favorites';
  var favorites = loadFavorites();
  var favLayer = null;
  var trackLine = null;
  var trackOn = false;
  var favIcon = null;

  // ---------- 工具 ----------
  function toast(msg, ms) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  }
  function magColor(m) {
    if (m >= 6) return '#7f1d1d';
    if (m >= 4.5) return '#dc2626';
    if (m >= 3) return '#f59e0b';
    if (m >= 2) return '#facc15';
    return '#4ade80';
  }
  function aqiColor(a) {
    if (a <= 50) return '#22c55e';
    if (a <= 100) return '#eab308';
    if (a <= 150) return '#f97316';
    if (a <= 200) return '#ef4444';
    if (a <= 300) return '#a855f7';
    return '#7f1d1d';
  }
  function aqiText(a) {
    if (a <= 50) return '优';
    if (a <= 100) return '良';
    if (a <= 150) return '轻度';
    if (a <= 200) return '中度';
    if (a <= 300) return '重度';
    return '严重';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function setUpdated() {
    var el = document.getElementById('updated');
    var now = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    el.textContent = '更新于 ' + p(now.getHours()) + ':' + p(now.getMinutes());
  }

  // ---------- 底图 ----------
  function buildBase(key) {
    var s = SOURCES[key];
    var l = L.tileLayer(s.url, s.opts);
    l.setZIndex(0);
    return l;
  }
  function switchBase(key) {
    if (key === currentBase && baseLayer) return;
    if (baseLayer) map.removeLayer(baseLayer);
    baseLayer = buildBase(key);
    baseLayer.addTo(map);
    currentBase = key;
    Object.keys(overlays).forEach(function (k) {
      if (overlays[k].layer && overlays[k].layer.setZIndex) overlays[k].layer.setZIndex(500);
    });
    document.querySelectorAll('#base-list .chip').forEach(function (c) {
      c.classList.toggle('active', c.dataset.key === key);
    });
  }

  // ---------- 图层加载 ----------
  function loadRadar() {
    return fetch(RV_URL).then(function (r) { return r.json(); }).then(function (data) {
      var frames = (data.radar.past || []).concat(data.radar.nowcast || []);
      if (!frames.length) throw new Error('无雷达帧');
      var f = frames[frames.length - 1];
      return L.tileLayer(data.host + f.path + '/256/{z}/{x}/{y}/2/1_1.png',
        { attribution: '&copy; RainViewer', opacity: 0.8, maxZoom: 18, zIndex: 500 });
    });
  }
  function gibsLayer(product, dateOffset) {
    function tryDate(off) {
      var ds = gibsDate(off);
      var url = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/' + product +
        '/default/' + ds + '/GoogleMapsCompatible_Level9/{z}/{x}/{y}.jpg';
      var l = L.tileLayer(url, { attribution: '&copy; NASA GIBS', opacity: 0.65, maxZoom: 9, zIndex: 500 });
      return new Promise(function (resolve, reject) {
        var done = false;
        l.on('tileerror', function () { if (!done) { done = true; reject(new Error('tile')); } });
        var src = url.replace('{z}', '3').replace('{x}', '4').replace('{y}', '3');
        fetch(src, { method: 'GET', mode: 'cors' }).then(function (r) {
          if (r.ok) { done = true; resolve(l); } else { done = true; reject(new Error('http' + r.status)); }
        }).catch(function () { done = true; reject(new Error('net')); });
      });
    }
    return tryDate(dateOffset).catch(function () { return tryDate(dateOffset + 1); });
  }
  function loadSatellite() {
    return gibsLayer('MODIS_Aqua_CorrectedReflectance_TrueColor', 1);
  }
  function loadQuakes() {
    return fetch(USGS_URL).then(function (r) { return r.json(); }).then(function (gj) {
      var grp = L.layerGroup();
      (gj.features || []).forEach(function (f) {
        var m = f.properties.mag || 0;
        var c = f.geometry.coordinates;
        var marker = L.circleMarker([c[1], c[0]], {
          radius: Math.max(3, m * 2), color: '#fff', weight: 1,
          fillColor: magColor(m), fillOpacity: 0.55
        });
        marker.bindPopup('<div class="pop"><b>震级 M ' + m.toFixed(1) + '</b><br>' +
          (f.properties.place || '未知地点') + '<br>' +
          new Date(f.properties.time).toLocaleString() + '</div>');
        grp.addLayer(marker);
      });
      return grp;
    });
  }
  function loadAQI() {
    var grp = L.layerGroup();
    return Promise.all(CITIES.map(function (c) {
      var u = AQI_URL + '?latitude=' + c.lat + '&longitude=' + c.lng +
        '&current=us_aqi,european_aqi,pm2_5,pm10';
      return fetch(u).then(function (r) { return r.json(); })
        .then(function (d) { return { c: c, d: d }; })
        .catch(function () { return null; });
    })).then(function (res) {
      res.forEach(function (item) {
        if (!item || !item.d || !item.d.current) return;
        var cur = item.d.current;
        var aqi = (cur.us_aqi != null) ? cur.us_aqi : (cur.european_aqi != null ? cur.european_aqi : 0);
        var col = aqiColor(aqi);
        var marker = L.circleMarker([item.c.lat, item.c.lng], {
          radius: 8, color: '#fff', weight: 1.5, fillColor: col, fillOpacity: 0.9
        });
        marker.bindPopup('<div class="pop"><b>' + item.c.name + '</b><br>' +
          'AQI <span class="aqi-badge" style="background:' + col + '">' + aqi + '</span> ' + aqiText(aqi) +
          '<br>PM2.5: ' + (cur.pm2_5 != null ? cur.pm2_5.toFixed(1) : '-') + ' µg/m³</div>');
        grp.addLayer(marker);
      });
      return grp;
    });
  }
  function gibsDate(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() - (offsetDays || 0));
    return d.toISOString().slice(0, 10);
  }
  function loadNASA() {
    return gibsLayer('MODIS_Terra_CorrectedReflectance_TrueColor', 1);
  }

  // ---------- 城市名称标注 ----------
  function buildLabelLayer() {
    var grp = L.layerGroup();
    labelMarkers = [];
    LABEL_CITIES.forEach(function (c) {
      var icon = L.divIcon({
        className: 'city-label ' + (c.country === 'cn' ? 'cn' : 'intl'),
        html: '<span>' + c.name + '</span>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      var m = L.marker([c.lat, c.lng], { icon: icon, interactive: false, keyboard: false });
      m.addTo(grp);
      labelMarkers.push(m);
    });
    return grp;
  }
  function loadLabels() {
    return Promise.resolve(buildLabelLayer());
  }
  function updateLabelVisibility() {
    if (!overlays.labels.on) return;
    var z = map.getZoom();
    var show = z >= 3; // 缩到最小（看全球）时隐藏，避免标签过度重叠
    labelMarkers.forEach(function (m) {
      var el = m.getElement ? m.getElement() : null;
      if (el) el.style.display = show ? '' : 'none';
    });
  }

  // ---------- 图层开关 ----------
  function toggleOverlay(key, on) {
    var o = overlays[key];
    o.on = on;
    if (on) {
      toast('正在加载「' + o.name + '」…');
      o.load().then(function (layer) {
        o.layer = layer;
        if (o.layer.setZIndex) o.layer.setZIndex(500);
        o.layer.addTo(map);
        if (key === 'labels') updateLabelVisibility();
        setUpdated();
        updateLegend();
      }).catch(function (e) {
        o.on = false;
        syncSwitch(key);
        toast('「' + o.name + '」加载失败：' + (e && e.message ? e.message : '数据源不可用'));
      });
    } else {
      if (o.layer) map.removeLayer(o.layer);
      updateLegend();
    }
  }
  function refreshAll() {
    var btn = document.getElementById('btn-refresh');
    btn.classList.add('spin');
    var tasks = [];
    Object.keys(overlays).forEach(function (key) {
      if (overlays[key].on) {
        if (overlays[key].layer) map.removeLayer(overlays[key].layer);
        tasks.push(overlays[key].load().then(function (layer) {
          overlays[key].layer = layer;
          if (layer.setZIndex) layer.setZIndex(500);
          layer.addTo(map);
        }).catch(function () {
          toast('「' + overlays[key].name + '」刷新失败');
        }));
      }
    });
    Promise.all(tasks).then(function () {
      btn.classList.remove('spin');
      setUpdated();
      toast('实时数据已刷新');
    });
  }

  // ---------- 图例 ----------
  function updateLegend() {
    var el = document.getElementById('legend');
    var html = '';
    if (overlays.quakes.on) {
      html += '<h4>实时地震（颜色/大小=震级）</h4>' +
        ['#4ade80|&lt;2', '#facc15|2-3', '#f59e0b|3-4.5', '#dc2626|4.5-6', '#7f1d1d|≥6']
          .map(function (s) { var p = s.split('|'); return '<div class="row"><span class="dot" style="background:' + p[0] + '"></span>' + p[1] + '</div>'; }).join('');
    }
    if (overlays.aqi.on) {
      html += '<h4>空气质量 AQI</h4>' +
        ['#22c55e|优 0-50', '#eab308|良 51-100', '#f97316|轻度 101-150', '#ef4444|中度 151-200', '#a855f7|重度 201-300', '#7f1d1d|严重 &gt;300']
          .map(function (s) { var p = s.split('|'); return '<div class="row"><span class="bar" style="background:' + p[0] + '"></span>' + p[1] + '</div>'; }).join('');
    }
    if (html) { el.innerHTML = html; el.classList.remove('hidden'); }
    else { el.classList.add('hidden'); }
  }

  // ---------- 定位 ----------
  function locateMe() {
    map.locate({ setView: true, maxZoom: 6 });
  }
  function onLocated(e) {
    var ll = e.latlng;
    if (myMarker) map.removeLayer(myMarker);
    myMarker = L.circleMarker(ll, { radius: 9, color: '#38bdf8', weight: 3, fillColor: '#38bdf8', fillOpacity: 0.4 });
    myMarker.addTo(map);
    var u = AQI_URL + '?latitude=' + ll.lat.toFixed(4) + '&longitude=' + ll.lng.toFixed(4) +
      '&current=us_aqi,european_aqi,pm2_5';
    fetch(u).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.current) {
        var aqi = (d.current.us_aqi != null) ? d.current.us_aqi : (d.current.european_aqi != null ? d.current.european_aqi : '—');
        myMarker.bindPopup('<div class="pop"><b>我的位置</b><br>AQI: ' + aqi + '</div>').openPopup();
      } else {
        myMarker.bindPopup('<div class="pop"><b>我的位置</b></div>').openPopup();
      }
    }).catch(function () {
      myMarker.bindPopup('<div class="pop"><b>我的位置</b></div>').openPopup();
    });
    toast('已定位到你的位置');
  }

  // ---------- 城市搜索 ----------
  function initSearch() {
    var panel = document.getElementById('search-panel');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var btnSearch = document.getElementById('btn-search');
    var btnClose = document.getElementById('search-close');

    function openPanel() { panel.classList.remove('hidden'); input.focus(); }
    function closePanel() { panel.classList.add('hidden'); input.value = ''; results.innerHTML = ''; input.blur(); }

    btnSearch.addEventListener('click', function () {
      if (panel.classList.contains('hidden')) openPanel(); else closePanel();
    });
    btnClose.addEventListener('click', closePanel);
    input.addEventListener('input', function () { doSearch(input.value, results); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

    // 点击结果外区域关闭
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btnSearch && !btnSearch.contains(e.target)) {
        if (!panel.classList.contains('hidden')) closePanel();
      }
    });
  }
  function doSearch(q, results) {
    q = (q || '').trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    var matches = CITY_DB.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) >= 0 || (c.en && c.en.toLowerCase().indexOf(q) >= 0);
    }).slice(0, 8);
    if (matches.length) {
      renderResults(results, matches);
    } else {
      results.innerHTML = '<div class="sr-loading">未匹配本地城市，正在联网查询…</div>';
      onlineSearch(q, results);
    }
  }
  function renderResults(results, list) {
    if (!list.length) { results.innerHTML = '<div class="sr-empty">未找到匹配的城市</div>'; return; }
    results.innerHTML = '';
    list.forEach(function (c) {
      var item = document.createElement('div');
      item.className = 'sr-item';
      item.innerHTML = '<span><span class="sr-name">' + escapeHtml(c.name) + '</span>' +
        '<span class="sr-en">' + escapeHtml(c.en || '') + '</span></span>' +
        '<span class="sr-coord">' + c.lat.toFixed(2) + ', ' + c.lng.toFixed(2) + '</span>';
      item.addEventListener('click', function () { flyToCity(c); });
      results.appendChild(item);
    });
  }
  function flyToCity(c) {
    map.flyTo([c.lat, c.lng], 11, { duration: 1.1 });
    document.getElementById('search-panel').classList.add('hidden');
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
  }
  function onlineSearch(q, results) {
    // Nominatim 免费地理编码（无密钥，受速率限制，仅作兜底）
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=' + encodeURIComponent(q);
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (arr) {
        if (!arr || !arr.length) { results.innerHTML = '<div class="sr-empty">未找到匹配的城市（联网查询无结果）</div>'; return; }
        var list = arr.map(function (a) {
          return { name: a.name || a.display_name.split(',')[0], en: a.display_name, lat: +a.lat, lng: +a.lon };
        });
        renderResults(results, list);
      })
      .catch(function () { results.innerHTML = '<div class="sr-empty">联网查询失败，请检查网络</div>'; });
  }

  // ---------- 收藏 / 轨迹 ----------
  function loadFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
  }
  function saveFavorites() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch (e) {}
  }
  function initFavorites() {
    favIcon = L.divIcon({ className: 'fav-pin', html: '★', iconSize: [24, 24], iconAnchor: [12, 12] });
    favLayer = L.layerGroup().addTo(map);
    drawFav();
    renderFavorites();

    document.getElementById('btn-add-fav').addEventListener('click', function () {
      var c = map.getCenter();
      var def = '收藏点 ' + (favorites.length + 1);
      var name = window.prompt('给这个收藏点起个名字：', def);
      if (name === null) return;
      addFavorite(c, (name.trim() || def));
    });
    document.getElementById('track-toggle').addEventListener('change', function (e) {
      trackOn = e.target.checked; drawFav();
    });
    // 长按地图收藏
    map.on('contextmenu', function (e) {
      addFavorite(e.latlng, '收藏点 ' + (favorites.length + 1));
      toast('已收藏该点');
    });
  }
  function addFavorite(ll, name) {
    favorites.push({ id: Date.now() + '_' + Math.floor(Math.random() * 1000), name: name, lat: ll.lat, lng: ll.lng });
    saveFavorites(); renderFavorites(); drawFav();
    toast('已收藏：' + name);
  }
  function removeFavorite(id) {
    favorites = favorites.filter(function (f) { return f.id !== id; });
    saveFavorites(); renderFavorites(); drawFav();
  }
  function drawFav() {
    if (!favLayer) return;
    favLayer.clearLayers();
    favorites.forEach(function (f) {
      var m = L.marker([f.lat, f.lng], { icon: favIcon });
      m.bindPopup('<div class="pop"><b>' + escapeHtml(f.name) + '</b><br>' +
        f.lat.toFixed(3) + ', ' + f.lng.toFixed(3) + '</div>');
      m.addTo(favLayer);
    });
    if (trackLine) { map.removeLayer(trackLine); trackLine = null; }
    if (trackOn && favorites.length > 1) {
      var pts = favorites.map(function (f) { return [f.lat, f.lng]; });
      trackLine = L.polyline(pts, { color: '#fbbf24', weight: 3, dashArray: '6 6', opacity: 0.9 }).addTo(map);
    }
  }
  function renderFavorites() {
    var el = document.getElementById('fav-list');
    if (!favorites.length) {
      el.innerHTML = '<p class="empty">还没有收藏。点上方按钮收藏当前地图中心，或在地图上「长按」直接收藏。</p>';
      return;
    }
    el.innerHTML = '';
    favorites.forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'fav-row';
      row.innerHTML = '<div class="fav-info"><b>' + escapeHtml(f.name) + '</b>' +
        '<small>' + f.lat.toFixed(3) + ', ' + f.lng.toFixed(3) + '</small></div>' +
        '<button class="fav-del" data-id="' + f.id + '">✕</button>';
      row.querySelector('.fav-info').addEventListener('click', function () { map.flyTo([f.lat, f.lng], 12); });
      row.querySelector('.fav-del').addEventListener('click', function (e) {
        e.stopPropagation(); removeFavorite(f.id);
      });
      el.appendChild(row);
    });
  }

  // ---------- 分享当前视图 ----------
  function shareView() {
    var c = map.getCenter();
    var z = map.getZoom();
    var active = [];
    Object.keys(overlays).forEach(function (k) { if (overlays[k].on) active.push(k); });
    var qs = 'base=' + currentBase + '&layers=' + active.join(',');
    var hash = '#c=' + c.lat.toFixed(5) + ',' + c.lng.toFixed(5) + ',' + z;
    var url = location.origin + location.pathname + '?' + qs + hash;
    var done = false;
    if (navigator.share) {
      navigator.share({ title: '实时地球 · 共享视图', text: '来看看这个实时地球视图', url: url })
        .catch(function () {});
      done = true;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        if (!done) toast('分享链接已复制到剪贴板');
      }).catch(function () { if (!done) toast('复制失败，请手动复制地址栏链接'); });
    } else if (!done) {
      toast('当前环境不支持分享，请手动复制地址栏链接');
    }
    if (done) toast('已唤起系统分享');
  }
  function applySharedState() {
    try {
      var qs = new URLSearchParams(location.search);
      var hash = location.hash || '';
      if (qs.get('base') && SOURCES[qs.get('base')]) switchBase(qs.get('base'));
      var layers = qs.get('layers');
      if (layers) {
        layers.split(',').forEach(function (k) {
          if (overlays[k]) {
            var inp = document.querySelector('#overlay-list input[data-key="' + k + '"]');
            if (inp) { inp.checked = true; toggleOverlay(k, true); }
          }
        });
      }
      var m = hash.match(/c=([-\d.]+),([-\d.]+),(\d+(\.\d+)?)/);
      if (m) {
        map.setView([parseFloat(m[1]), parseFloat(m[2])], parseFloat(m[3]));
      }
    } catch (e) {}
  }

  // ---------- UI 构建 ----------
  function buildUI() {
    var baseList = document.getElementById('base-list');
    Object.keys(SOURCES).forEach(function (key) {
      var b = document.createElement('button');
      b.className = 'chip' + (key === currentBase ? ' active' : '');
      b.dataset.key = key;
      b.textContent = SOURCES[key].label;
      b.addEventListener('click', function () { switchBase(key); });
      baseList.appendChild(b);
    });
    var ol = document.getElementById('overlay-list');
    Object.keys(overlays).forEach(function (key) {
      var o = overlays[key];
      var line = document.createElement('label');
      line.className = 'switch-line';
      line.innerHTML = '<span class="label"><b>' + o.name + '</b><small>' + o.sub + '</small></span>' +
        '<input type="checkbox" data-key="' + key + '"><span class="track"></span>';
      ol.appendChild(line);
      line.querySelector('input').addEventListener('change', function (ev) {
        toggleOverlay(key, ev.target.checked);
      });
    });
    var sheet = document.getElementById('sheet');
    document.getElementById('sheet-handle').addEventListener('click', function () {
      sheet.classList.toggle('open');
      var leg = document.getElementById('legend');
      leg.style.bottom = sheet.classList.contains('open')
        ? 'calc(env(safe-area-inset-bottom) + ' + sheet.offsetHeight + 'px)'
        : 'calc(env(safe-area-inset-bottom) + 200px)';
    });
    document.getElementById('auto-refresh').addEventListener('change', function (ev) {
      if (ev.target.checked) {
        autoTimer = setInterval(refreshAll, 5 * 60 * 1000);
        toast('已开启自动刷新');
      } else {
        clearInterval(autoTimer); autoTimer = null;
        toast('已关闭自动刷新');
      }
    });
    document.getElementById('btn-refresh').addEventListener('click', refreshAll);
    document.getElementById('btn-locate').addEventListener('click', locateMe);
    document.getElementById('btn-share').addEventListener('click', shareView);
  }
  function syncSwitch(key) {
    var inp = document.querySelector('#overlay-list input[data-key="' + key + '"]');
    if (inp) inp.checked = overlays[key].on;
  }

  // ---------- 初始化 ----------
  function init() {
    map = L.map('map', { zoomControl: false, worldCopyJump: true, attributionControl: true })
      .setView([20, 110], 3);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomright', metric: true, imperial: false, maxWidth: 120 }).addTo(map);
    map.attributionControl.setPrefix(false);
    map.on('zoomend', updateLabelVisibility);
    switchBase(currentBase);
    map.on('locationfound', onLocated);
    map.on('locationerror', function () { toast('定位失败，请检查浏览器权限'); });
    buildUI();
    initSearch();
    initFavorites();
    applySharedState();
    setUpdated();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

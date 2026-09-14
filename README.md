# 校园公交实时信息中心

云南大学信息学院 · 软件开发综合实践期末大作业

## 项目简介

本项目是一个校园公交实时信息展示中心，提供公交到站时间、行程路线、票价明细、实时载客人数等信息，帮助学生合理规划出行，避免因等不上公交导致上课迟到。

## 功能模块

| 页面 | 文件 | 功能 |
|------|------|------|
| 首页 | index.html + js/home.js | 实时公交到站倒计时、拥挤度展示、路线卡片 |
| 路线详情 | route.html + js/route.js | 站点列表、票价明细、车辆实时信息、首末班时间 |
| 数据统计 | stats.html + js/stats.js | ECharts柱状图 + Chart.js折线图 + 拥挤度表格 |
| 三维展示 | three.html + js/three.js | Three.js校园公交3D路线场景 |

## 技术栈

- **Bootstrap 5.3.3** — 响应式布局框架
- **jQuery 3.7.1** — DOM操作与AJAX
- **ECharts** — 柱状图可视化
- **Chart.js** — 折线图可视化
- **Three.js r128** — 三维场景渲染
- **JSON** — 本地数据存储

## 数据说明

所有数据为模拟教学演示数据，非真实运营数据。

- `data/routes.json` — 3条路线、站点、票价、班次
- `data/realtime.json` — 实时车辆位置、载客量、到站时间
- `data/stats.json` — 周客流量、时段客流、拥挤度统计

## 运行说明

### 环境要求

- Python 3.x（用于启动本地服务器）
- 现代浏览器（Chrome/Firefox/Edge）

### 启动步骤

1. 克隆仓库：
   ```
   git clone https://github.com/jzn111/campus-bus.git
   cd campus-bus
   ```

2. 启动服务器（二选一）：
   - 双击 `启动服务器.bat`
   - 或手动执行：`py server.py`

3. 打开浏览器访问：`http://127.0.0.1:8772`

### 注意事项

- 必须使用 `server.py` 启动服务器（确保JS文件以UTF-8编码发送）
- 如使用 `python -m http.server`，中文注释可能导致JavaScript解析错误

## 项目结构

```
campus-bus/
├── index.html          # 首页
├── route.html          # 路线详情
├── stats.html          # 数据统计
├── three.html          # 三维展示
├── server.py           # 自定义UTF-8服务器
├── 启动服务器.bat       # Windows启动脚本
├── .gitignore
├── css/
│   └── style.css       # 响应式样式
├── data/
│   ├── routes.json     # 路线数据
│   ├── realtime.json   # 实时数据
│   └── stats.json      # 统计数据
├── js/
│   ├── common.js       # 共享函数
│   ├── home.js         # 首页逻辑
│   ├── route.js        # 路线页逻辑
│   ├── stats.js        # 统计页逻辑
│   └── three.js        # 三维场景逻辑
└── libs/
    ├── bootstrap.min.css
    ├── bootstrap.bundle.min.js
    ├── jquery-3.7.1.min.js
    ├── echarts.min.js
    ├── chart.umd.js
    ├── three.min.js
    └── OrbitControls.js
```

## 响应式断点

- 375px — 手机
- 768px — 平板
- 1200px — 桌面

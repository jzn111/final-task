// route.js - route detail page logic

const state = { route: null, vehicle: null, countdown: 0 };

async function loadData() {
  showStatus('加载中...', false);
  const params = new URLSearchParams(location.search);
  const routeId = params.get('id') || 'R1';
  try {
    const [routesData, realtimeData] = await Promise.all([
      fetchJson('data/routes.json'),
      fetchJson('data/realtime.json')
    ]);
    const route = routesData.routes.find(r => r.id === routeId);
    const vehicle = realtimeData.vehicles.find(v => v.routeId === routeId);
    if (!route) throw new Error('未找到路线 ' + routeId);

    state.route = route;
    state.vehicle = vehicle;
    state.countdown = vehicle ? vehicle.etaSeconds : 0;

    $('#route-title').text(route.name);
    $('#route-info').html(`
      <span class="me-3">方向：${route.direction}</span>
      <span class="me-3">发车间隔：${route.interval}分钟</span>
      <span>车型容量：${route.capacity}人</span>
    `);
    $('#status').hide();

    renderStops();
    renderFare();
    renderVehicle();
    renderSchedule();
    startCountdown();
  } catch (error) {
    showStatus('加载失败：' + error.message, true);
  }
}

function renderStops() {
  const r = state.route;
  const curIdx = state.vehicle ? state.vehicle.currentStopIndex : -1;
  let html = '';
  r.stops.forEach((s, i) => {
    const active = i === curIdx ? 'active' : '';
    const arrived = i < curIdx ? 'text-muted text-decoration-line-through' : '';
    html += `
      <li class="list-group-item stop-item ${active}">
        <span class="stop-dot me-2"></span>
        <span class="${arrived}">${s.name}</span>
        <span class="float-end text-muted small">${s.arrive}</span>
      </li>`;
  });
  $('#stop-list').html(html);
}

function renderFare() {
  const fare = state.route.fare;
  const stops = state.route.stops.length;
  let html = '';
  html += `<tr><td>1~${fare.maxStops}站</td><td>¥${fare.base.toFixed(1)}</td></tr>`;
  if (stops > fare.maxStops) {
    html += `<tr><td>${fare.maxStops + 1}站及以上</td><td>¥${fare.longRide.toFixed(1)}</td></tr>`;
  }
  $('#fare-table').html(html);
}

function renderVehicle() {
  const v = state.vehicle;
  if (!v) {
    $('#vehicle-info').html('<p class="text-muted">当前无运行车辆</p>');
    return;
  }
  const rate = Math.round((v.passengers / v.capacity) * 100);
  html = `
    <p class="mb-1">车牌：<b>${v.plate}</b></p>
    <p class="mb-1">下一站：<b>${v.nextStopName}</b></p>
    <p class="mb-1">方向：${v.direction}</p>
    <p class="mb-1">速度：${v.speed} km/h</p>
    <div class="text-center my-3">
      <span class="countdown" id="cd-main">${formatCountdown(state.countdown)}</span>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-1">
      <span class="small">车上人数</span>
      <span class="small">${v.passengers}/${v.capacity}人（${rate}%）</span>
    </div>
    <div class="progress passenger-bar mb-2">
      <div class="progress-bar ${crowdBarColor(rate)}" style="width:${rate}%"></div>
    </div>
    <p class="text-center">${crowdBadge(v.crowdLevel)}</p>
  `;
  $('#vehicle-info').html(html);
}

function renderSchedule() {
  const r = state.route;
  $('#schedule-info').html(`
    <li class="mb-1">首班：${r.firstBus}</li>
    <li class="mb-1">末班：${r.lastBus}</li>
    <li class="mb-1">发车间隔：${r.interval} 分钟</li>
    <li class="mb-1">总站点数：${r.stops.length} 站</li>
  `);
}

function startCountdown() {
  setInterval(() => {
    state.countdown -= 5;
    if (state.countdown <= 0) {
      state.countdown = state.vehicle ? state.vehicle.routeId === 'R3' ? 240 : (state.vehicle.routeId === 'R2' ? 300 : 180) : 180;
    }
    $('#cd-main').text(formatCountdown(state.countdown));
  }, 5000);
}

$(document).ready(function () {
  loadData();
});

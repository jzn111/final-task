// home.js - home page logic: load realtime data, render route cards, countdown refresh

const state = { realtime: null, routes: null };
let countdownTimers = {};

async function loadData() {
  showStatus('加载中...', false);
  try {
    const [realtime, routes] = await Promise.all([
      fetchJson('data/realtime.json'),
      fetchJson('data/routes.json')
    ]);
    state.realtime = realtime;
    state.routes = routes;
    $('#sub-title').text(realtime.title + ' · ' + realtime.source);
    $('#source-note').text('更新时间：' + realtime.updateTime);
    $('#status').hide();
    renderCards();
    startCountdown();
  } catch (error) {
    showStatus('加载失败：' + error.message + '（可在 Network 面板勾 Offline 复现）', true);
  }
}

function renderCards() {
  const vehicles = state.realtime.vehicles;
  const routes = state.routes.routes;
  let html = '';

  vehicles.forEach(v => {
    const route = routes.find(r => r.id === v.routeId);
    const color = route ? route.color : '#6c757d';
    const rate = Math.round((v.passengers / v.capacity) * 100);
    const barColor = crowdBarColor(rate);

    html += `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card route-card h-100" onclick="location.href='route.html?id=${v.routeId}'">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0" style="color:${color}">${v.routeName}</h5>
            ${crowdBadge(v.crowdLevel)}
          </div>
          <p class="text-muted small mb-1">车牌：${v.plate}</p>
          <p class="text-muted small mb-2">方向：${v.direction}</p>
          <div class="text-center my-3">
            <span class="countdown" id="cd-${v.routeId}">${formatCountdown(v.etaSeconds)}</span>
          </div>
          <p class="text-muted small text-center mb-2">下一站：<b>${v.nextStopName}</b></p>
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small">车上人数</span>
            <span class="small">${v.passengers}/${v.capacity}人</span>
          </div>
          <div class="progress passenger-bar">
            <div class="progress-bar ${barColor}" style="width:${rate}%"></div>
          </div>
        </div>
      </div>
    </div>`;
  });
  $('#route-cards').html(html);
}

function startCountdown() {
  // 清除旧定时器
  Object.values(countdownTimers).forEach(t => clearInterval(t));
  countdownTimers = {};

  state.realtime.vehicles.forEach(v => {
    countdownTimers[v.routeId] = setInterval(() => {
      v.etaSeconds -= 5;
      if (v.etaSeconds <= 0) {
        v.etaSeconds = v.routeId === 'R3' ? 240 : (v.routeId === 'R2' ? 300 : 180);
      }
      const el = $('#cd-' + v.routeId);
      if (el.length) el.text(formatCountdown(v.etaSeconds));
    }, 5000);
  });
}

$(document).ready(function () {
  loadData();
});

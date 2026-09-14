// stats.js - stats page logic: ECharts bar + Chart.js line + crowd table

const state = { data: null };

async function loadData() {
  showStatus('加载中...', false);
  try {
    const data = await fetchJson('data/stats.json');
    state.data = data;
    $('#sub-title').text(data.title + ' · ' + data.source);
    $('#status').hide();
    renderSummary();
    renderBarChart();
    renderLineChart();
    renderCrowdTable();
  } catch (error) {
    showStatus('加载失败：' + error.message, true);
  }
}

function renderSummary() {
  const routes = state.data.weeklyByRoute;
  let html = '';
  routes.forEach(r => {
    const total = r.monday + r.tuesday + r.wednesday + r.thursday + r.friday + r.saturday + r.sunday;
    const avg = Math.round(total / 7);
    html += `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card text-center h-100">
          <div class="card-body">
            <h5 class="card-title">${r.route}</h5>
            <p class="h2 text-primary mb-1">${total}</p>
            <p class="text-muted small mb-0">周总客流 / 日均${avg}</p>
          </div>
        </div>
      </div>`;
  });
  $('#summary-cards').html(html);
}

function renderBarChart() {
  const data = state.data.weeklyByRoute;
  const days = ['周一','周二','周三','周四','周五','周六','周日'];
  const series = data.map(r => ({
    name: r.route,
    type: 'bar',
    data: [r.monday, r.tuesday, r.wednesday, r.thursday, r.friday, r.saturday, r.sunday]
  }));
  echarts.init(document.getElementById('bar-chart')).setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: data.map(r => r.route), bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value', name: '客流量(人)' },
    series: series,
    color: ['#0d6efd', '#198754', '#dc3545']
  });
}

function renderLineChart() {
  const data = state.data.hourlyFlow;
  new Chart(document.getElementById('line-chart'), {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        { label: '楠苑环线', data: data['楠苑环线'], borderColor: '#0d6efd', tension: 0.3, fill: false },
        { label: '梓苑—楠苑通勤线', data: data['梓苑—楠苑通勤线'], borderColor: '#198754', tension: 0.3, fill: false },
        { label: '北门—南门直达线', data: data['北门—南门直达线'], borderColor: '#dc3545', tension: 0.3, fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { title: { display: true, text: '客流量(人)' } } }
    }
  });
}

function renderCrowdTable() {
  const data = state.data.crowdSummary;
  let html = '';
  data.forEach(r => {
    const rate = parseInt(r.avgRate);
    const color = rate < 50 ? 'text-success' : (rate < 80 ? 'text-warning' : 'text-danger');
    html += `
      <tr>
        <td>${r.route}</td>
        <td>${r.avgPassengers}人</td>
        <td>${r.capacity}人</td>
        <td class="${color} fw-bold">${r.avgRate}</td>
        <td>${r.peakHour}</td>
        <td>${r.peakPassengers}人</td>
      </tr>`;
  });
  $('#crowd-table').html(html);
}

$(document).ready(function () {
  loadData();
});

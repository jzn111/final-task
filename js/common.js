// common.js - shared functions (fetchJson, status, nav highlight, crowd badge)

// crowd badge mapping
function crowdBadge(level) {
  var map = {
    '\u7a7a\u65f7': '<span class="badge badge-comfortable">\u7a7a\u65f7</span>',
    '\u8212\u9002': '<span class="badge badge-comfortable">\u8212\u9002</span>',
    '\u9002\u4e2d': '<span class="badge badge-moderate">\u9002\u4e2d</span>',
    '\u62e5\u6324': '<span class="badge badge-crowded">\u62e5\u6324</span>'
  };
  return map[level] || '<span class="badge bg-secondary">\u672a\u77e5</span>';
}

// progress bar color
function crowdBarColor(rate) {
  if (rate < 50) return 'bg-success';
  if (rate < 80) return 'bg-warning';
  return 'bg-danger';
}

// fetch JSON with HTTP status check
async function fetchJson(url) {
  var resp = await fetch(url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status + ' (' + url + ')');
  return resp.json();
}

// show/hide loading status
function showStatus(msg, withRetry) {
  $('#status-text').text(msg);
  $('#retry-btn').toggle(withRetry === true);
  $('#status').show();
}

// highlight current nav link
function highlightNav() {
  var page = location.pathname.split('/').pop() || 'index.html';
  $('.nav-link').removeClass('active');
  $('.nav-link[href="' + page + '"]').addClass('active');
}

// countdown format
function formatCountdown(seconds) {
  if (seconds <= 0) return '\u5df2\u5230\u7ad9';
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return m + '\u5206' + (s < 10 ? '0' : '') + s + '\u79d2';
}

$(document).ready(function () {
  highlightNav();
  // retry button
  $('#retry-btn').on('click', function () {
    location.reload();
  });
});

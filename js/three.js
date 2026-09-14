// three.js - Three.js campus bus 3D scene

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2a3a);
scene.fog = new THREE.Fog(0x1a2a3a, 15, 35);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(10, 10, 12);

const container = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
function resizeRenderer() {
  const w = container.clientWidth;
  const h = container.clientHeight || 600;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 光照
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(5, 10, 7);
scene.add(dir);

// 地面
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 20),
  new THREE.MeshStandardMaterial({ color: 0x2d4a2d })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 网格辅助
scene.add(new THREE.GridHelper(24, 24, 0x4a6a4a, 0x3a5a3a));

// 站点数据（与 routes.json 一致）
const routeData = [
  {
    name: '楠苑环线', color: 0x0d6efd,
    stops: [
      { name: '楠苑宿舍', x: -4, z: -3 }, { name: '楠苑食堂', x: -2, z: -4 },
      { name: '图书馆', x: 0, z: -3 }, { name: '教学楼A栋', x: 2, z: -2 },
      { name: '体育馆', x: 3, z: 0 }, { name: '梓苑宿舍', x: 2, z: 3 },
      { name: '北门', x: 0, z: 4 }, { name: '行政楼', x: -2, z: 3 }
    ]
  },
  {
    name: '梓苑—楠苑通勤线', color: 0x198754,
    stops: [
      { name: '梓苑宿舍', x: 2, z: 3 }, { name: '体育馆', x: 3, z: 0 },
      { name: '教学楼A栋', x: 2, z: -2 }, { name: '图书馆', x: 0, z: -3 },
      { name: '楠苑食堂', x: -2, z: -4 }, { name: '楠苑宿舍', x: -4, z: -3 }
    ]
  },
  {
    name: '北门—南门直达线', color: 0xdc3545,
    stops: [
      { name: '北门', x: 0, z: 4 }, { name: '行政楼', x: -2, z: 3 },
      { name: '图书馆', x: 0, z: -3 }, { name: '教学楼B栋', x: 4, z: -4 },
      { name: '南门', x: 0, z: -6 }
    ]
  }
];

// 建筑物（站点球体 + 标签）
const stopMeshes = [];
routeData.forEach(route => {
  // 路线连线
  const points = route.stops.map(s => new THREE.Vector3(s.x, 0.3, s.z));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({
    color: route.color, dashSize: 0.5, gapSize: 0.3
  }));
  line.computeLineDistances();
  scene.add(line);

  // 站点球体
  route.stops.forEach(s => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 24),
      new THREE.MeshStandardMaterial({ color: route.color })
    );
    sphere.position.set(s.x, 0.5, s.z);
    sphere.userData = { name: s.name, route: route.name };
    scene.add(sphere);
    stopMeshes.push(sphere);

    // 标签文字（Canvas纹理）
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 64;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(s.name, 128, 40);
    const tex = new THREE.CanvasTexture(cv);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    sprite.position.set(s.x, 1.3, s.z);
    sprite.scale.set(1.5, 0.4, 1);
    scene.add(sprite);
  });
});

// 公交车模型
function createBus(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 0.5),
    new THREE.MeshStandardMaterial({ color: color })
  );
  body.position.y = 0.5;
  group.add(body);
  // 车窗
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.25, 0.52),
    new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6 })
  );
  win.position.y = 0.7;
  group.add(win);
  // 车轮
  [[-0.4,0.3],[-0.4,-0.3],[0.4,0.3],[0.4,-0.3]].forEach(([x,z]) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x333 })
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.15, z);
    group.add(wheel);
  });
  return group;
}

const buses = routeData.map(r => {
  const bus = createBus(r.color);
  bus.userData = { stops: r.stops, index: 0, progress: 0, speed: 0.008 };
  scene.add(bus);
  return bus;
});

// 射线点击
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('click', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(stopMeshes);
  if (hits.length > 0) {
    const d = hits[0].object.userData;
    alert('站点：' + d.name + '\n所属路线：' + d.route);
  }
});

// 动画
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  buses.forEach(bus => {
    const stops = bus.userData.stops;
    const from = stops[bus.userData.index];
    const to = stops[(bus.userData.index + 1) % stops.length];
    bus.userData.progress += bus.userData.speed;
    if (bus.userData.progress >= 1) {
      bus.userData.progress = 0;
      bus.userData.index = (bus.userData.index + 1) % stops.length;
    }
    bus.position.x = from.x + (to.x - from.x) * bus.userData.progress;
    bus.position.z = from.z + (to.z - from.z) * bus.userData.progress;
    // 朝向
    bus.lookAt(to.x, 0, to.z);
  });

  renderer.render(scene, camera);
}

resizeRenderer();
animate();

window.addEventListener('resize', resizeRenderer);

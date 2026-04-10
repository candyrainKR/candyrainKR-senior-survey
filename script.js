// ===== App scale for FHD tablet =====
function resizeApp() {
  const baseWidth = 1920;
  const baseHeight = 1080;

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);

  const app = document.getElementById("app");
  app.style.transform = `scale(${scale})`;
  app.style.marginLeft = `${(window.innerWidth - baseWidth * scale) / 2}px`;
  app.style.marginTop = `${(window.innerHeight - baseHeight * scale) / 2}px`;
}

// ===== Screen helpers =====
let screenHistory = [];

function pushHistory(id){
  if(screenHistory.length === 0){
    screenHistory = [id];
    return;
  }
  if(screenHistory[screenHistory.length - 1] !== id){
    screenHistory.push(id);
  }
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
  pushHistory(id);
}

// ===== Sound =====
let soundUnlocked = false;

function playAudio(id){
  const a = document.getElementById(id);
  if(!a) return;
  try{
    a.currentTime = 0;
    a.play().catch(()=>{});
  }catch(e){}
}
function sfxClick(){ if(soundUnlocked) playAudio("sfxClick"); }
function sfxTada(){ if(soundUnlocked) playAudio("sfxTada"); }

// ===== State =====
let qIndex = 0;
let state = {
  digestion: null,
  concern: null,
  activity: null,
  time: null,
  style: null
};

// ===== Questions =====
const questions = [
  {
    step: "STEP 1. 소화 편안함 체크",
    title: "Q1. 우유를 마시면 배가 불편했던 적이 있나요?",
    desc: "소화 편안함에 따라 추천 제품이 달라집니다.",
    img: "images/q1.png",
    choices: [
      { text: "A. 전혀 없다", set: { digestion: "none" } },
      { text: "B. 가끔 있다", set: { digestion: "sometimes" } },
      { text: "C. 자주 있다", set: { digestion: "often" } },
    ],
  },
  {
    step: "STEP 2. 건강 고민 선택",
    title: "Q2. 요즘 가장 신경 쓰는 건강은?",
    desc: "현재 가장 중요하게 생각하는 목표를 선택하세요.",
    img: "images/q2.png",
    choices: [
      { text: "A. 뼈 건강", set: { concern: "bone" } },
      { text: "B. 근육·기력 유지", set: { concern: "protein" } },
      { text: "C. 혈당 관리", set: { concern: "sugar" } },
      { text: "D. 체중 관리", set: { concern: "diet" } },
      { text: "E. 특별한 고민 없음", set: { concern: "none" } },
    ],
  },
  {
    step: "STEP 3. 활동 시간",
    title: "Q3. 하루 평균 움직이는 시간은 어느 정도인가요?",
    desc: "최근 일주일 기준으로 가장 가까운 시간을 선택해주세요.",
    img: "images/q3.png",
    choices: [
      { text: "A. 30분 미만 (집 안 위주, 가벼운 움직임)", set: { activity: "low" } },
      { text: "B. 30분~1시간 (장보기·산책·모임 등)", set: { activity: "medium" } },
      { text: "C. 1시간 이상 (산책·운동·복지관 프로그램)", set: { activity: "active" } },
    ],
  },
  {
    step: "STEP 4. 섭취 시간",
    title: "Q4. 우유는 언제 드시는 걸 선호하세요?",
    desc: "시간대에 따라 권장 용량이 달라질 수 있어요.",
    img: "images/q4.png",
    choices: [
      { text: "A. 아침에", set: { time: "morning" } },
      { text: "B. 간식 시간에", set: { time: "snack" } },
      { text: "C. 자기 전에", set: { time: "night" } },
    ],
  },
  {
    step: "STEP 5. 섭취 스타일",
    title: "Q5. 우유는 어떻게 드시는 게 좋으세요?",
    desc: "평소 자주 드시는 방식으로 선택해주세요.",
    img: "images/q5.png",
    choices: [
      { text: "A. 그냥 마신다", set: { style: "drink" } },
      { text: "B. 커피에 넣는다", set: { style: "coffee" } },
      { text: "C. 빵·시리얼과 함께", set: { style: "food" } },
      { text: "D. 요거트를 더 좋아한다", set: { style: "yogurt" } },
    ],
  },
];

// ===== Profiles =====
const profiles = {
  bone: {
    name: "튼튼 뼈 지킴이형",
    sub: "뼈 건강 중심 루틴",
    icon: "images/bone.png",
    baseRec: [
      "일반 우유 또는 고칼슘 우유",
      "하루 1~2컵 (200ml 기준)"
    ],
    ment: "뼈는 은행 통장처럼 미리 채워야 든든합니다."
  },
  gut: {
    name: "속 편안 밸런스형",
    sub: "락토프리로 편안하게",
    icon: "images/tummy.png",
    baseRec: [
      "락토프리 우유",
      "150~200ml 소용량부터 시작"
    ],
    ment: "편안함이 먼저입니다. 우유는 참는 음식이 아닙니다."
  },
  protein: {
    name: "단백질 보강형",
    sub: "근육·기력 유지 중심",
    icon: "images/protein.png",
    baseRec: [
      "고단백 우유",
      "그릭요거트",
      "200ml + 요거트 1회"
    ],
    ment: "기력은 쌓이는 루틴이 만듭니다. 오늘 한 번이 내일을 바꿔요."
  },
  light: {
    name: "가벼운 관리형",
    sub: "가볍게 관리하는 루틴",
    icon: "images/light.png",
    baseRec: [
      "저지방 우유",
      "무가당 요거트"
    ],
    ment: "가볍게 꾸준히가 이깁니다. 매일 가능한 루틴이 최고예요."
  },
  small: {
    name: "소량 자주형",
    sub: "나눠 마시는 편안 루틴",
    icon: "images/small.png",
    baseRec: [
      "100~150ml 소컵",
      "나눠 마시기"
    ],
    ment: "한 번에 끝내기보다, 작은 행복을 여러 번. 몸도 그 편이 좋아해요."
  }
};

const typeColors = {
  bone: "#3C5A99",
  gut: "#5B8C5A",
  protein: "#C57A2D",
  light: "#7A6AA6",
  small: "#8C6B4F"
};

// ===== Logic =====
function decideType(s){
  if(s.digestion === "sometimes" || s.digestion === "often") return "gut";
  if(s.concern === "bone") return "bone";
  if(s.concern === "protein") return "protein";
  if(s.concern === "sugar" || s.concern === "diet") return "light";
  return "small";
}

function getPortionLine(s){
  let base = "150~200ml";
  if(s.activity === "low") base = "100~150ml";
  if(s.activity === "medium") base = "150~200ml";
  if(s.activity === "active") base = "200ml 내외";

  let freq = "하루 1번";
  if(s.activity === "medium") freq = "하루 1~2번";
  if(s.activity === "active") freq = "운동/산책 후 1번";

  let timing = "";
  if(s.time === "morning") timing = "아침에";
  if(s.time === "snack") timing = "간식 시간에";
  if(s.time === "night") timing = "자기 전엔";

  if(s.time === "night" && base === "200ml 내외") base = "150ml 내외";
  return `${timing} ${base}, ${freq}`.trim();
}

function uniq(arr){ return [...new Set(arr.filter(Boolean))]; }

function applyStyleTweaks(recList, s){
  if(s.style === "coffee") recList.push("커피에 넣을 땐 우유는 소용량부터");
  if(s.style === "food") recList.push("빵·시리얼과 함께면 소컵부터 추천");
  if(s.style === "yogurt") recList.push("요거트는 무가당 먼저가 편해요");
}

function setMetric(fillId, leftId, rightId, leftPct, rightPct){
  const fill = document.getElementById(fillId);
  const l = document.getElementById(leftId);
  const r = document.getElementById(rightId);
  if(!fill || !l || !r) return;

  l.textContent = leftPct;
  r.textContent = rightPct;
  fill.style.width = rightPct + "%";
}

function computeMetrics(s, typeKey){
  let right_m1 = 55;
  if(s.activity === "low") right_m1 = 75;
  if(s.activity === "medium") right_m1 = 60;
  if(s.activity === "active") right_m1 = 45;
  if(s.time === "night") right_m1 = Math.min(85, right_m1 + 10);
  const left_m1 = 100 - right_m1;

  const left_m2 = 60, right_m2 = 40;

  let right_m3 = 35;
  if(s.digestion === "sometimes") right_m3 = 65;
  if(s.digestion === "often") right_m3 = 80;
  const left_m3 = 100 - right_m3;

  let left_m4 = 55, right_m4 = 45;
  if(typeKey === "light") { left_m4 = 65; right_m4 = 35; }
  if(typeKey === "small") { left_m4 = 45; right_m4 = 55; }
  if(typeKey === "protein") { left_m4 = 60; right_m4 = 40; }
  if(typeKey === "bone") { left_m4 = 58; right_m4 = 42; }
  if(typeKey === "gut") { left_m4 = 52; right_m4 = 48; }

  if(s.style === "yogurt"){
    right_m4 = Math.min(70, right_m4 + 5);
    left_m4 = 100 - right_m4;
  }

  return {
    m1:[left_m1,right_m1],
    m2:[left_m2,right_m2],
    m3:[left_m3,right_m3],
    m4:[left_m4,right_m4]
  };
}

// ===== Render =====
function renderQuestion(){
  const q = questions[qIndex];

  document.getElementById("progressText").textContent = `STEP ${qIndex + 1} / ${questions.length}`;
  document.getElementById("stepBadge").textContent = q.step;
  document.getElementById("qTitle").textContent = q.title;
  document.getElementById("qDesc").textContent = q.desc;

  const img = document.getElementById("qImage");
  const media = document.getElementById("qMedia");

  if(q.img){
    img.src = q.img;
    media.classList.add("show");
  } else {
    media.classList.remove("show");
    img.removeAttribute("src");
  }

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  q.choices.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = c.text;
    btn.onclick = () => {
      sfxClick();
      Object.assign(state, c.set);
      qIndex++;
      if(qIndex >= questions.length){
        showResult();
      } else {
        renderQuestion();
      }
    };
    choicesEl.appendChild(btn);
  });
}

function showResult(){
  const typeKey = decideType(state);
  const profile = profiles[typeKey];

  document.documentElement.style.setProperty("--result-color", typeColors[typeKey]);

  let rec = [...profile.baseRec];
  rec.push(getPortionLine(state));
  applyStyleTweaks(rec, state);
  rec = uniq(rec);

  let sub = profile.sub;
  if(typeKey === "gut" && state.style === "yogurt"){
    sub = "락토프리 기준, 요거트 중심 루틴";
  }

  let ment = profile.ment;
  if(state.time === "night"){
    ment = `자기 전엔 소용량으로 편안하게. ${ment}`;
  }

  document.getElementById("resultName").textContent = profile.name;
  document.getElementById("resultSub").textContent = sub;
  document.getElementById("resultIcon").src = profile.icon;

  const recEl = document.getElementById("resultRec");
  recEl.innerHTML = "";
  rec.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r;
    recEl.appendChild(li);
  });

  document.getElementById("resultMent").textContent = ment;

  const metrics = computeMetrics(state, typeKey);
  setMetric("m1Fill","m1L","m1R", metrics.m1[0], metrics.m1[1]);
  setMetric("m2Fill","m2L","m2R", metrics.m2[0], metrics.m2[1]);
  setMetric("m3Fill","m3L","m3R", metrics.m3[0], metrics.m3[1]);
  setMetric("m4Fill","m4L","m4R", metrics.m4[0], metrics.m4[1]);

  sfxTada();
  showScreen("screen-result");
}

// ===== Wire up =====
window.addEventListener("DOMContentLoaded", () => {
  resizeApp();
  screenHistory = ["screen-home"];
  showScreen("screen-home");

  document.getElementById("btnStart").onclick = () => {
    soundUnlocked = true;
    sfxClick();

    qIndex = 0;
    state = { digestion:null, concern:null, activity:null, time:null, style:null };

    showScreen("screen-quiz");
    renderQuestion();
  };

  document.getElementById("btnGoHome").onclick = () => {
    sfxClick();
    screenHistory = ["screen-home"];
    showScreen("screen-home");
  };

  document.getElementById("btnHome").onclick = () => {
    sfxClick();
    screenHistory = ["screen-home"];
    showScreen("screen-home");
  };

  document.getElementById("btnBack").onclick = () => {
    sfxClick();

    if (document.getElementById("screen-quiz").classList.contains("active") && qIndex > 0) {
      qIndex--;
      renderQuestion();
      return;
    }

    if(screenHistory.length <= 1){
      screenHistory = ["screen-home"];
      showScreen("screen-home");
      return;
    }

    screenHistory.pop();
    const prev = screenHistory[screenHistory.length - 1];
    showScreen(prev);
  };

  document.getElementById("btnFull").onclick = async () => {
    sfxClick();
    try{
      if(!document.fullscreenElement){
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    }catch(e){
      alert("전체화면이 차단됐어요. 크롬으로 열고 다시 눌러보세요.");
    }
  };
});

window.addEventListener("resize", resizeApp);
window.addEventListener("load", resizeApp);
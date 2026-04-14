function resizeApp() {
  const baseWidth = 1920;
  const baseHeight = 1080;

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);

  const app = document.getElementById("app");
  if (app) {
    app.style.transform = `scale(${scale})`;
    app.style.marginLeft = `${(window.innerWidth - baseWidth * scale) / 2}px`;
    app.style.marginTop = `${(window.innerHeight - baseHeight * scale) / 2}px`;
  }
}

let screenHistory = [];

function pushHistory(id) {
  if (screenHistory.length === 0) {
    screenHistory = [id];
    return;
  }
  if (screenHistory[screenHistory.length - 1] !== id) {
    screenHistory.push(id);
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  pushHistory(id);
}

let soundUnlocked = false;

function playAudio(id) {
  const a = document.getElementById(id);
  if (!a) return;
  try {
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch (e) {}
}

function sfxClick() {
  if (soundUnlocked) playAudio("sfxClick");
}

function sfxTada() {
  if (soundUnlocked) playAudio("sfxTada");
}

let qIndex = 0;
let state = {
  digestion: null,
  concern: null,
  activity: null,
  time: null,
  style: null
};

const questions = [
  {
    step: "STEP 1. 소화 편안함 체크",
    title: "Q1.우유 드시면 속이 편하신가요?",
    desc: "평소 느낌으로 선택해주세요.",
    img: "images/q1.png",
    choices: [
      { text: "A. 전혀 없다", set: { digestion: "none" } },
      { text: "B. 가끔 있다", set: { digestion: "sometimes" } },
      { text: "C. 자주 있다", set: { digestion: "often" } }
    ]
  },
  {
    step: "STEP 2. 건강 상태",
    title: "Q2.요즘 어디가 가장 신경 쓰이세요?",
    desc: "가장 가까운 항목을 선택해주세요.",
    img: "images/q2.png",
    choices: [
      { text: "A. 뼈 / 관절", set: { concern: "bone" } },
      { text: "B. 힘 / 기력", set: { concern: "protein" } },
      { text: "C. 혈당 / 체중", set: { concern: "sugar" } },
      { text: "D. 특별히 없다", set: { concern: "none" } }
    ]
  },
  {
    step: "STEP 3. 활동 시간",
    title: "Q3.하루에 얼마나 움직이세요?",
    desc: "가장 가까운 시간을 선택해주세요.",
    img: "images/q3.png",
    choices: [
      { text: "A. 30분 미만", set: { activity: "low" } },
      { text: "B. 30분~1시간", set: { activity: "medium" } },
      { text: "C. 1시간 이상", set: { activity: "active" } }
    ]
  },
  {
    step: "STEP 4. 선호 시간",
    title: "Q4.우유는 언제 드세요?",
    desc: "가장 편한 시간을 선택해주세요.",
    img: "images/q4.png",
    choices: [
      { text: "A. 아침", set: { time: "morning" } },
      { text: "B. 간식 시간", set: { time: "snack" } },
      { text: "C. 잠들기 전", set: { time: "night" } }
    ]
  },
  {
    step: "STEP 5. 섭취 스타일",
    title: "Q5.우유는 어떻게 드시나요?",
    desc: "평소 드시는 방법을 선택해주세요.",
    img: "images/q5.png",
    choices: [
      { text: "A. 그냥 마신다", set: { style: "drink" } },
      { text: "B. 커피나 차에 섞는다", set: { style: "coffee" } },
      { text: "C. 빵이나 시리얼과 함께", set: { style: "food" } }
    ]
  }
];

const profiles = {
  lactoseFree: {
    name: "속 편한 락토프리 우유",
    sub: "유당을 줄여 소화가 편안한 우유",
    icon: "images/락토프리우유.png",
    ment: "속이 편안한 것이 가장 중요합니다.<br><br>락토프리 우유는 소화 부담을 줄여 편안하게 드시기 좋습니다.",
    guide: {
      amount: "100~150ml부터",
      time: "아침 / 간식",
      digest: "편안한 선택",
      method: "그대로 / 요거트와 함께"
    }
  },

  highCalcium: {
    name: "튼튼 고칼슘 우유",
    sub: "뼈 건강을 위한 칼슘 강화 우유",
    icon: "images/고칼슘우유.png",
    ment: "뼈 건강은 꾸준한 관리가 중요합니다.<br><br>고칼슘 우유는 칼슘이 강화되어 있어 뼈 건강 유지에 도움을 줄 수 있습니다.",
    guide: {
      amount: "200~250ml",
      time: "아침 / 저녁",
      digest: "보통",
      method: "그대로 마시기"
    }
  },

  highProtein: {
    name: "고단백 우유",
    sub: "근력과 기력 유지를 위한 단백질 보강",
    icon: "images/고단백우유.png",
    ment: "기력과 체력 유지를 위해 단백질이 중요합니다.<br><br>고단백 우유는 근육 유지와 일상 활력 관리에 도움을 줄 수 있습니다.",
    guide: {
      amount: "200ml + 요거트",
      time: "아침 / 활동 후",
      digest: "보통",
      method: "요거트와 함께"
    }
  },

  lowFat: {
    name: "저지방 우유",
    sub: "체중과 건강 관리를 위한 가벼운 선택",
    icon: "images/저지방우유.png",
    ment: "가볍게 드시는 것이 중요합니다.<br><br>저지방 우유는 지방 부담을 줄여 꾸준히 섭취하기에 편안한 선택입니다.",
    guide: {
      amount: "150~200ml",
      time: "아침 / 간식",
      digest: "부담 적음",
      method: "그대로 / 시리얼과 함께"
    }
  },

  general: {
    name: "신선한 흰 우유",
    sub: "균형 잡힌 영양을 위한 기본 우유",
    icon: "images/흰우유.png",
    ment: "균형 잡힌 영양 섭취가 중요합니다.<br><br>일반 우유는 기본 영양이 고르게 들어 있어 꾸준히 드시기 좋은 선택입니다.",
    guide: {
      amount: "200ml",
      time: "아침 / 간식",
      digest: "보통",
      method: "그대로 / 빵과 함께"
    }
  }
};

const typeColors = {
  lactoseFree: "#5B8C5A",
  highCalcium: "#3C5A99",
  highProtein: "#C57A2D",
  lowFat: "#7A6AA6",
  general: "#8C6B4F"
};

function decideType(s) {
  if (s.digestion === "sometimes" || s.digestion === "often") return "lactoseFree";
  if (s.concern === "bone") return "highCalcium";
  if (s.concern === "protein") return "highProtein";
  if (s.concern === "sugar") return "lowFat";
  return "general";
}

function getGuideData(typeKey, s) {
  const baseGuide = { ...profiles[typeKey].guide };

  if (typeKey === "lactoseFree" && s.activity === "active") {
    baseGuide.amount = "150~200ml부터";
  }

  if (typeKey === "highCalcium") {
    if (s.activity === "low") baseGuide.amount = "200ml";
    if (s.activity === "active") baseGuide.amount = "200~250ml";
  }

  if (typeKey === "highProtein") {
    if (s.activity === "low") baseGuide.amount = "180~200ml";
    if (s.activity === "medium") baseGuide.amount = "200ml";
    if (s.activity === "active") baseGuide.amount = "200ml + 요거트";
  }

  if (typeKey === "lowFat") {
    if (s.activity === "low") baseGuide.amount = "150ml 안팎";
    if (s.activity === "medium") baseGuide.amount = "150~200ml";
    if (s.activity === "active") baseGuide.amount = "200ml";
  }

  if (typeKey === "general") {
    if (s.activity === "low") baseGuide.amount = "150~200ml";
    if (s.activity === "active") baseGuide.amount = "200ml";
  }

  if (s.time === "morning") baseGuide.time = "아침";
  if (s.time === "snack") baseGuide.time = "간식 시간";
  if (s.time === "night") baseGuide.time = "저녁 / 잠들기 전";

  if (s.style === "drink") baseGuide.method = "그대로 마시기";
  if (s.style === "coffee") baseGuide.method = "커피·차에 활용";
  if (s.style === "food") baseGuide.method = "빵·시리얼과 함께";

  if (s.digestion === "often") baseGuide.digest = "소량부터 권장";
  if (s.digestion === "sometimes" && typeKey !== "lactoseFree") baseGuide.digest = "천천히 적응";

  return baseGuide;
}

function renderQuestion() {
  const q = questions[qIndex];
  if (!q) return;

  document.getElementById("progressText").textContent = `STEP ${qIndex + 1} / ${questions.length}`;
  document.getElementById("stepBadge").textContent = q.step;
  document.getElementById("qTitle").textContent = q.title;
  document.getElementById("qDesc").textContent = q.desc;

  const img = document.getElementById("qImage");
  const media = document.getElementById("qMedia");

  if (q.img) {
    img.src = q.img;
    media.classList.add("show");
    media.setAttribute("aria-hidden", "false");
  } else {
    img.removeAttribute("src");
    media.classList.remove("show");
    media.setAttribute("aria-hidden", "true");
  }

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  q.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = choice.text;

    btn.onclick = () => {
      sfxClick();
      Object.assign(state, choice.set);
      qIndex += 1;

      if (qIndex >= questions.length) {
        showResult();
      } else {
        renderQuestion();
      }
    };

    choicesEl.appendChild(btn);
  });
}

function showResult() {
  const typeKey = decideType(state);
  const profile = profiles[typeKey];
  const guide = getGuideData(typeKey, state);

  document.documentElement.style.setProperty("--result-color", typeColors[typeKey]);

  const resultName = document.getElementById("resultName");
  const resultSub = document.getElementById("resultSub");
  const resultIcon = document.getElementById("resultIcon");

  if (resultName) resultName.textContent = profile.name;
  if (resultSub) resultSub.textContent = profile.sub;
  if (resultIcon) resultIcon.src = profile.icon;
  const resultMent = document.getElementById("resultMent");
  if (resultMent) resultMent.innerHTML = profile.ment;
  const guideAmount = document.getElementById("guideAmount");
  const guideTime = document.getElementById("guideTime");
  const guideDigest = document.getElementById("guideDigest");
  const guideMethod = document.getElementById("guideMethod");

  if (guideAmount) guideAmount.textContent = guide.amount;
  if (guideTime) guideTime.textContent = guide.time;
  if (guideDigest) guideDigest.textContent = guide.digest;
  if (guideMethod) guideMethod.textContent = guide.method;

  sfxTada();
  showScreen("screen-result");
}

window.addEventListener("DOMContentLoaded", () => {
  resizeApp();
  showScreen("screen-home");

  const btnStart = document.getElementById("btnStart");
  const btnGoHome = document.getElementById("btnGoHome");
  const btnHome = document.getElementById("btnHome");
  const btnBack = document.getElementById("btnBack");
  const btnFull = document.getElementById("btnFull");

  if (btnStart) {
    btnStart.onclick = () => {
      soundUnlocked = true;
      sfxClick();

      qIndex = 0;
      state = {
        digestion: null,
        concern: null,
        activity: null,
        time: null,
        style: null
      };

      showScreen("screen-quiz");
      renderQuestion();
    };
  }

  if (btnGoHome) {
    btnGoHome.onclick = () => {
      sfxClick();
      showScreen("screen-home");
    };
  }

  if (btnHome) {
    btnHome.onclick = () => {
      sfxClick();
      showScreen("screen-home");
    };
  }

  if (btnBack) {
    btnBack.onclick = () => {
      sfxClick();

      const quizScreen = document.getElementById("screen-quiz");
      if (quizScreen && quizScreen.classList.contains("active") && qIndex > 0) {
        qIndex -= 1;
        renderQuestion();
        return;
      }

      showScreen("screen-home");
    };
  }

  if (btnFull) {
    btnFull.onclick = async () => {
      sfxClick();
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (e) {}
    };
  }
});

window.addEventListener("resize", resizeApp);
window.addEventListener("load", resizeApp);
const $ = id => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const times = { easy: 25, medium: 20, hard: 15 };
const maxNum = { easy: 10, medium: 30, hard: 100 };

let op = null, current = 0, score = 0, answered = 0;
let correctAnswer = 0, time = 0, timer, used = [];

/* اختيار العملية */
document.querySelectorAll('.op-btn').forEach(btn => {
  btn.onclick = () => {
    op = btn.dataset.op;
    $('warning').textContent = '';
    document.querySelectorAll('.op-btn').forEach(b => b.style.outline = '');
    btn.style.outline = '4px solid #fff7e6';
  };
});

/* بدء اللعبة */
$('start-btn').onclick = () => {
  if (!op) {
    $('warning').textContent = 'Please choose an operation first!';
    return;
  }
  current = 0; score = 0; answered = 0; used = [];
  $('score').textContent = 0;
  $('answered').textContent = 0;
  $('progress').style.width = '0%';
  $('setup-screen').classList.add('hidden');
  $('game-screen').classList.remove('hidden');
  nextQuestion();
};

/* سؤال جديد */
function nextQuestion() {
  current++;
  const level = $('level').value;
  const m = (op === '*' || op === '/') ? Math.min(maxNum[level], 12) : maxNum[level];
  let a, b, key;

  do {
    a = rand(1, m);
    b = rand(1, m);
    if (op === '-' && b > a) [a, b] = [b, a];
    if (op === '/') a = a * b;
    key = a + op + b;
  } while (used.includes(key));
  used.push(key);

  correctAnswer = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;

  $('question').textContent = `${a} ${symbols[op]} ${b} = ?`;
  $('current').textContent = current;
  $('feedback').textContent = '';
  $('feedback').className = '';
  $('answer').value = '';
  $('answer').disabled = false;
  $('check-btn').disabled = false;
  $('next-btn').classList.add('hidden');
  $('next-btn').textContent = 'Next Question';
  $('answer').focus();

  time = times[level];
  $('timer').textContent = time;
  clearInterval(timer);
  timer = setInterval(() => {
    time--;
    $('timer').textContent = time;
    if (time === 0) finish(false, true);
  }, 1000);
}

/* فحص الإجابة */
$('check-btn').onclick = () => {
  if ($('answer').value === '') {
    $('feedback').textContent = 'Type your answer first!';
    return;
  }
  finish(Number($('answer').value) === correctAnswer, false);
};
$('answer').onkeydown = e => { if (e.key === 'Enter') $('check-btn').click(); };

function finish(isCorrect, timeUp) {
  clearInterval(timer);
  answered++;
  $('check-btn').disabled = true;
  $('answer').disabled = true;

  if (isCorrect) {
    score++;
    $('feedback').className = 'correct';
    $('feedback').textContent = '😊 Correct!';
    beep(800);
    fireworks();
  } else {
    $('feedback').className = 'wrong';
    $('feedback').textContent = `😢 ${timeUp ? 'Time’s up! ' : ''}The answer is ${correctAnswer}`;
    beep(200);
  }

  $('score').textContent = score;
  $('answered').textContent = answered;
  $('progress').style.width = current * 10 + '%';
  if (current === 10) $('next-btn').textContent = 'See Score';
  $('next-btn').classList.remove('hidden');
}

/* التالي والنتيجة */
$('next-btn').onclick = () => {
  if (current === 10) showResult();
  else nextQuestion();
};

function showResult() {
  $('game-screen').classList.add('hidden');
  $('result-screen').classList.remove('hidden');
  $('final-face').textContent = score >= 9 ? '🏆' : score >= 7 ? '🎉' : score >= 5 ? '😊' : '📚';
  $('final-score').textContent = score + ' / 10';
  $('final-message').textContent =
    score >= 9 ? 'Excellent! 🌟' :
    score >= 7 ? 'Great Job! 👏' :
    score >= 5 ? 'Good Effort! 👍' : 'Keep Practicing! 💪';
}

$('again-btn').onclick = () => {
  op = null;
  document.querySelectorAll('.op-btn').forEach(b => b.style.outline = '');
  $('result-screen').classList.add('hidden');
  $('setup-screen').classList.remove('hidden');
};

/* الصوت */
const audio = new (window.AudioContext || window.webkitAudioContext)();
function beep(freq) {
  audio.resume();
  const o = audio.createOscillator();
  o.frequency.value = freq;
  o.connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + 0.3);
}

/* الألعاب النارية */
const canvas = $('fireworks'), c = canvas.getContext('2d');
function fireworks() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const x = canvas.width * (0.2 + Math.random() * 0.6);
  const y = canvas.height * (0.15 + Math.random() * 0.3);
  const dots = [];
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2, speed = Math.random() * 5 + 1;
    dots.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: `hsl(${rand(0, 360)}, 90%, 60%)` });
  }
  let frames = 0;
  (function draw() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy; d.vy += 0.1;
      c.fillStyle = d.color;
      c.fillRect(d.x, d.y, 5, 5);
    });
    if (++frames < 70) requestAnimationFrame(draw);
    else c.clearRect(0, 0, canvas.width, canvas.height);
  })();
}
const bg = new Image();
bg.src = "./assets/img/bg.png";
let array = [];
const ul = document.querySelector(".ul-score");
let request;
const fg = new Image();
fg.src = "./assets/img/fg.png";
window.cancelRequestAnimFrame = (function () {
  return (
    window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    clearTimeout
  );
})();
const dinoGlide = new Image();
dinoGlide.src = "./assets/img/bird.png";

const dinoFlap = new Image();
dinoFlap.src = "./assets/img/bird.png";

const topBone = new Image();
topBone.src = "./assets/img/pipeUp.png";

const botBone = new Image();
botBone.src = "./assets/img/pipeBottom.png";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const hitboxWidth = 40;
const hitboxHeight = 15;

const spriteOffset_X = -10;
const spriteOffset_Y = -25;

let fgPos_X = 0;
let dinoPos_X = 130;
let dinoPos_Y = 190;
let dinoAngle = 0;
let dinoState = dinoGlide;

const minBoneHeight = -100;
const maxBoneHeight = -260;

const fly = new Audio();
const gameEnd = new Audio();
const score_audio = new Audio();

fly.src = "./assets/audio/fly.mp3";
score_audio.src = "./assets/audio/score.mp3";
gameEnd.src = "./assets/audio/gameOver.wav";

const scrollSpeed = -2;
let gravity = 0.5;
let lift = -7;
let velocity = 0;

let start = false;
let gameOver = false;
let score = 0;

let bonePtr = 0;
let boneStart = 400;
let flyGap = 130;
let boneGap = 180;
let bones = [
  {
    x: boneStart - 1 * boneGap,
    y: getRandomHeight(minBoneHeight, maxBoneHeight),
  },
  { x: boneStart, y: getRandomHeight(minBoneHeight, maxBoneHeight) },
  { x: boneStart + boneGap, y: getRandomHeight(minBoneHeight, maxBoneHeight) },
  {
    x: boneStart + 2 * boneGap,
    y: getRandomHeight(minBoneHeight, maxBoneHeight),
  },
  {
    x: boneStart + 3 * boneGap,
    y: getRandomHeight(minBoneHeight, maxBoneHeight),
  },
  {
    x: boneStart + 4 * boneGap,
    y: getRandomHeight(minBoneHeight, maxBoneHeight),
  },
];

function getRandomHeight(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function playerInput() {
  if (!start) {
    start = true;
    velocity = lift;
    dinoAngle = -20;
    document.getElementById("ctrl-ctn").style.opacity = 0;
  } else {
    if (!gameOver) {
      velocity = lift;
      dinoAngle = -20;
    }
  }
}

function checkCollision() {
  // set upper bound
  if (dinoPos_Y <= -hitboxHeight) {
    velocity = 0;
  }

  // dino hit the ground
  if (dinoPos_Y + hitboxHeight >= canvas.height - fg.height) {
    velocity = 0;
    dinoPos_Y = canvas.height - fg.height - hitboxHeight;

    setGameOver();
  }

  // dino hit bone
  if (
    dinoPos_X + hitboxWidth >= bones[bonePtr].x &&
    dinoPos_X < bones[bonePtr].x + topBone.width &&
    (dinoPos_Y <= bones[bonePtr].y + topBone.height ||
      dinoPos_Y + hitboxHeight >= bones[bonePtr].y + topBone.height + flyGap)
  ) {
    setGameOver();
  }
}

function replay() {
  document.getElementById("scoreboard").style.display = "block";
  start = false;
  gameOver = false;
  ul.innerHTML = "";
  score = 0;
  velocity = 0;
  lift = -7;
  gravity = 0.5;
  dinoPos_X = 100;
  dinoPos_Y = 250;
  dinoAngle = 0;
  dinoState = dinoGlide;

  bonePtr = 0;
  bones = [
    {
      x: boneStart - 1 * boneGap,
      y: getRandomHeight(minBoneHeight, maxBoneHeight),
    },
    { x: boneStart, y: getRandomHeight(minBoneHeight, maxBoneHeight) },
    {
      x: boneStart + boneGap,
      y: getRandomHeight(minBoneHeight, maxBoneHeight),
    },
    {
      x: boneStart + 2 * boneGap,
      y: getRandomHeight(minBoneHeight, maxBoneHeight),
    },
    {
      x: boneStart + 3 * boneGap,
      y: getRandomHeight(minBoneHeight, maxBoneHeight),
    },
    {
      x: boneStart + 4 * boneGap,
      y: getRandomHeight(minBoneHeight, maxBoneHeight),
    },
  ];

  document.getElementById("ctrl-ctn").style.opacity = 1;

  document.getElementById("gameover-screen").style.visibility = "hidden";
  document.getElementById("gameover-screen").style.opacity = 0;
}
function off() {
  return false;
}

function setGameOver() {
  document.getElementById("scoreboard").style.display = "none";
  if (array.length > 9) {
    array.pop();
    array.unshift(score);
  } else {
    array.unshift(score);
  }
  localStorage.setItem("local", JSON.stringify(array));
  let words = JSON.parse(localStorage.getItem("local"));

  let ocum = "";

  words.forEach((e) => {
    ocum += `<li>
    Ваш счет: ${e}
            </li>`;
  });

  ul.innerHTML = ocum;

  gameEnd.play();
  gameOver = true;
  document.getElementById("score").innerHTML = `Score: ${score}`;
  document.getElementById("gameover-screen").style.visibility = "visible";
  document.getElementById("gameover-screen").style.opacity = 1;
  start = false;
  request = false;
  lift = 0;
  gravity = 0;
  dinoPos_X = 0;
  dinoPos_Y = 0;
  dinoAngle = 0;
}

function update() {
  // foreground scroll
  if (!gameOver) {
    fgPos_X += scrollSpeed;

    if (fgPos_X <= -canvas.width) {
      fgPos_X = 0;
    }
  }

  // game started
  if (start) {
    velocity += gravity;
    dinoPos_Y += velocity;

    // if velocity is negative show dino flap sprite else show dino falling
    if (velocity < 0) {
      dinoState = dinoFlap;
      fly.play();
    } else {
      dinoState = dinoGlide;
      dinoAngle = Math.min(dinoAngle + 2, 90);
    }

    checkCollision();

    if (!gameOver) {
      for (var i = 0; i < bones.length; i++) {
        // scroll bones across screen
        bones[i].x += scrollSpeed;

        // reassign bone object XY after it leaves screen
        if (bones[i].x <= -topBone.width) {
          if (i == 0) {
            bones[0].x = bones[bones.length - 1].x + boneGap;
          } else {
            bones[i].x = bones[i - 1].x + boneGap;
          }

          bones[i].y = getRandomHeight(minBoneHeight, maxBoneHeight);
        }
      }

      // if dino passed through the bone increase score
      if (dinoPos_X >= bones[bonePtr].x + topBone.width) {
        score_audio.play();
        score++;

        if (bonePtr == 5) {
          bonePtr = 0;
        } else {
          bonePtr++;
        }
      }
    }
  }
  render();
}

function render() {
  document.getElementById("scoreboard").innerHTML = score;

  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(bg, 270, 0);
  ctx.drawImage(bg, 540, 0);
  ctx.drawImage(bg, 810, 0);

  for (let i = 0; i < bones.length; i++) {
    ctx.drawImage(topBone, bones[i].x, bones[i].y);
    ctx.drawImage(botBone, bones[i].x, bones[i].y + topBone.height + flyGap);
  }

  ctx.save();
  ctx.translate(
    dinoPos_X + hitboxWidth / 2 + spriteOffset_X,
    dinoPos_Y + hitboxHeight / 2
  );
  ctx.rotate((dinoAngle * Math.PI) / 180);
  ctx.drawImage(
    dinoState,
    -hitboxWidth / 2,
    -hitboxHeight / 2 + spriteOffset_Y
  );
  ctx.restore();

  // Show hitbox
  // ctx.fillStyle = "#ff00ff";
  // ctx.fillRect(dinoPos_X, dinoPos_Y, hitboxWidth, hitboxHeight);

  ctx.drawImage(fg, fgPos_X, canvas.height - fg.height);
  ctx.drawImage(fg, 0, canvas.height - fg.height);
  ctx.drawImage(fg, 150, canvas.height - fg.height);
  ctx.drawImage(fg, 300, canvas.height - fg.height);
  ctx.drawImage(fg, 450, canvas.height - fg.height);
  ctx.drawImage(fg, 600, canvas.height - fg.height);
  ctx.drawImage(fg, 750, canvas.height - fg.height);
  ctx.drawImage(fg, 950, canvas.height - fg.height);
  ctx.drawImage(fg, 1100, canvas.height - fg.height);
  ctx.drawImage(fg, fgPos_X + fg.width, canvas.height - fg.height);

  window.requestAnimationFrame(update);
}

document.addEventListener("keydown", function (e) {
  let char = e.which || e.keyCode;
  if (char == 32 || char == 38) {
    e.preventDefault();
    playerInput();
  }
});

document.addEventListener("touchstart", function () {
  playerInput();
});

document.getElementById("replay").addEventListener("click", function () {
  replay();
});

update();

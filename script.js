const audio = document.getElementById("audio")
const btn = document.getElementById("playBtn")
const canvas = document.getElementById("wave")
const ctx = canvas.getContext("2d")
const cover = document.getElementById("cover")

let isPlaying = false
let audioCtx, analyser, source, dataArray

canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

function setupAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioCtx.createAnalyser()
  source = audioCtx.createMediaElementSource(audio)

  source.connect(analyser)
  analyser.connect(audioCtx.destination)

  analyser.fftSize = 256
  dataArray = new Uint8Array(analyser.frequencyBinCount)
}

function drawWave() {
  requestAnimationFrame(drawWave)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  let centerY = canvas.height / 2

  if (!isPlaying || !analyser) {
    ctx.beginPath()
    for (let x = 0; x < canvas.width; x++) {
      let y = centerY + Math.sin(x * 0.02 + Date.now() * 0.002) * 2
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = "rgba(255,255,255,0.25)"
    ctx.stroke()
    return
  }

  analyser.getByteTimeDomainData(dataArray)

  ctx.beginPath()

  let sliceWidth = canvas.width / dataArray.length
  let x = 0
  let bass = 0

  for (let i = 0; i < dataArray.length; i++) {
    let v = dataArray[i] / 128.0
    let y = v * centerY

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)

    if (i < 10) bass += dataArray[i]

    x += sliceWidth
  }

  let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, "#1e3a8a")
  gradient.addColorStop(0.5, "#3b82f6")
  gradient.addColorStop(1, "#93c5fd")

  ctx.strokeStyle = gradient
  ctx.lineWidth = 3

  ctx.shadowBlur = 20
  ctx.shadowColor = "#3b82f6"

  ctx.stroke()
  ctx.shadowBlur = 0

  /* MICRO MOVIMENTO NA CAPA (ELEGANTE) */
  let intensity = bass / 1200
  cover.style.transform = `scale(${1 + intensity * 0.015})`
}

drawWave()

function toggleContato() {
  const c = document.getElementById("contato")
  c.style.display = c.style.display === "block" ? "none" : "block"
}

/* CONTROLE DE TEMPO COM FADE-OUT */
audio.addEventListener("timeupdate", () => {
  const startFade = 54; 
  const endTime = 57;   

  // Efeito de sumir o som gradualmente
  if (audio.currentTime >= startFade && audio.currentTime < endTime) {
    let remaining = (endTime - audio.currentTime) / (endTime - startFade);
    audio.volume = Math.max(0, remaining);
  }

  // Parada total
  if (audio.currentTime >= endTime) {
    audio.pause();
    audio.currentTime = 42;
    audio.volume = 1; // Reseta para o próximo play
    btn.innerHTML = '<ion-icon name="play"></ion-icon>';
    isPlaying = false;
  }
});

function togglePlay() {
  if (!isPlaying) {

    if (!audioCtx) setupAudio()

    // Reseta para o trecho correto se necessário
    if (audio.currentTime < 42 || audio.currentTime >= 57) {
      audio.currentTime = 42
    }
    
    audio.volume = 1;
    audio.play()

    btn.innerHTML = '<ion-icon name="pause"></ion-icon>'
    isPlaying = true

  } else {
    audio.pause()
    btn.innerHTML = '<ion-icon name="play"></ion-icon>'
    isPlaying = false
  }
}
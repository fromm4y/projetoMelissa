// ----------------- Chatbot -----------------
const botaoChat = document.getElementById("btnAbrirChatbot");
const dfMessenger = document.querySelector("df-messenger");


botaoChat.addEventListener("click", () => {
    dfMessenger.classList.toggle("aberto");
    dfMessenger.setAttribute("opened", dfMessenger.classList.contains("aberto"));
});

// ----------------- Variáveis globais -----------------
let stream = null;
let modelosCarregados = false;

// Elementos DOM
document.addEventListener("DOMContentLoaded", () => {
const abrirIA = document.getElementById('abrirIA');
const cameraModal = document.getElementById('cameraModal');
const fecharModal = document.getElementById('fecharModal');
const video = document.getElementById('video');
const tirarFoto = document.getElementById('tirarFoto');
const fotoCanvas = document.getElementById('fotoCanvas');
const modalStatus = document.getElementById('modalStatus');

// ----------------- Carregar modelos -----------------
async function carregarModelos() {
  if (modelosCarregados) return;
  modalStatus.innerText = 'Carregando modelos...';
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    modelosCarregados = true;
    modalStatus.innerText = 'Modelos carregados.';
  } catch (err) {
    console.error('Erro carregando modelos:', err);
    modalStatus.innerText = 'Erro ao carregar modelos. Veja console.';
  }
}

// ----------------- Abrir modal e ativar câmera -----------------
  abrirIA.addEventListener('click', async () => {
    cameraModal.classList.add('open');
    cameraModal.setAttribute('aria-hidden', 'false');
    modalStatus.innerText = 'Carregando...';
    await carregarModelos();

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640 } });
      video.srcObject = stream;
      await video.play();
      modalStatus.innerText = 'Câmera ativa. Posicione seu rosto e clique em 📸';
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      modalStatus.innerText = 'Não foi possível acessar a câmera.';
    }
  });

  // ----------------- Fechar modal e parar câmera -----------------
  fecharModal.addEventListener('click', () => {
    pararCamera();
    cameraModal.classList.remove('open');
    cameraModal.setAttribute('aria-hidden', 'true');
    modalStatus.innerText = 'Aguardando...';
  });


// ----------------- Parar câmera -----------------
function pararCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
}

// ----------------- Tirar foto, enviar para backend e detectar emoção -----------------
tirarFoto.addEventListener('click', async () => {
  if (!video || video.readyState < 2) {
    modalStatus.innerText = 'Vídeo não pronto. Tente novamente.';
    return;
  }

  // Desenha no canvas
  fotoCanvas.width = video.videoWidth || 640;
  fotoCanvas.height = video.videoHeight || 480;
  const ctx = fotoCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);

  modalStatus.innerText = 'Enviando foto para processamento...';

  // Para a câmera e fecha modal
  pararCamera();
  cameraModal.style.display = 'none';
  cameraModal.setAttribute('aria-hidden', 'true');

  // Converte canvas em blob para envio
  fotoCanvas.toBlob(async (blob) => {
    if (!blob) {
      modalStatus.innerText = 'Erro ao capturar a foto.';
      return;
    }

    const formData = new FormData();
    formData.append('foto', blob, 'foto.png');

    try {
      const response = await fetch(`${window.location.origin}/processar-foto`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.facesEncontradas === 0) {
        modalStatus.innerText = 'Nenhuma face detectada na foto.';
        return;
      }

      // Salva imagem no sessionStorage para página de resultado
      const dataUrl = fotoCanvas.toDataURL('image/png');
      sessionStorage.setItem('ultimaFoto', dataUrl);

      // Redireciona para a página resultado com emoção e confiança
      const emocao = data.emocao || 'neutral';
      const confianca = data.confianca || 0;
      window.location.href = `resultado.html?emocao=${encodeURIComponent(emocao)}&conf=${encodeURIComponent(confianca)}`;

    } catch (err) {
      modalStatus.innerText = 'Erro ao enviar foto para o servidor.';
      console.error('Erro fetch:', err);
    }
  }, 'image/png');
});
});
 
    // TODO: integrar com backend / hardware real (ESP32-CAM) futuramente.
    (function(){
      // Elements
      const btnChat = document.getElementById('btnAbrirChatbot');
      const chatPanel = document.getElementById('chatPanel');
      const closeChat = document.getElementById('closeChat');
      const sendChat = document.getElementById('sendChat');
      const chatInput = document.getElementById('chatInput');
      const chatHistory = document.getElementById('chatHistory');
      const themeToggle = document.getElementById('themeToggle');
      const backToTop = document.getElementById('backToTop');
      const anoAtual = document.getElementById('anoAtual');

      // Year in footer
      anoAtual.textContent = new Date().getFullYear();

      // Accessibility: back to top keyboard support
      backToTop.addEventListener('click', function(e){
        e.preventDefault();
        window.scrollTo({top:0,behavior:'smooth'});
        document.getElementById('hero-title').focus();
      });

      // Chatbot open/close and simple interactions
      function abrirChatbot(){
        const isOpen = chatPanel.classList.contains('open');
        if(isOpen){
          chatPanel.classList.remove('open');
          chatPanel.setAttribute('aria-hidden','true');
          btnChat.setAttribute('aria-expanded','false');
          btnChat.focus();
        } else {
          chatPanel.classList.add('open');
          chatPanel.setAttribute('aria-hidden','false');
          btnChat.setAttribute('aria-expanded','true');
          // focus input for keyboard users
          setTimeout(()=> chatInput.focus(), 250);
        }
      }
      btnChat.addEventListener('click', abrirChatbot);
      closeChat.addEventListener('click', abrirChatbot);

      // Send chat message (front-end placeholder)
      sendChat.addEventListener('click', function(){
        const text = chatInput.value.trim();
        if(!text) return;
        const userMsg = document.createElement('div');
        userMsg.className = 'msg user';
        userMsg.textContent = text;
        chatHistory.appendChild(userMsg);

        // fake bot reply
        const botMsg = document.createElement('div');
        botMsg.className = 'msg';
        botMsg.textContent = 'Resposta automática: Obrigado pela mensagem! Considere reduzir o uso de plástico.';
        chatHistory.appendChild(botMsg);

        chatInput.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;
        chatInput.focus();
      });

      // Allow Enter key to send message
      chatInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); sendChat.click(); }
      });

      // Theme toggle
      function toggleTheme(){
        const root = document.documentElement;
        const isDark = root.classList.toggle('dark');
        themeToggle.setAttribute('aria-pressed', String(isDark));
        // Save preference (optional)
        try{ localStorage.setItem('prefersDark', isDark ? '1' : '0'); }catch(e){}
      }
      themeToggle.addEventListener('click', toggleTheme);

      // Load saved theme
      (function initTheme(){
        try{
          const pref = localStorage.getItem('prefersDark');
          if(pref === '1'){ document.documentElement.classList.add('dark'); themeToggle.setAttribute('aria-pressed','true'); }
        }catch(e){}
      })();

      // Keyboard shortcuts (accessibility)
      document.addEventListener('keydown', function(e){
        // Ctrl+M toggles mode
        if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm'){
          e.preventDefault(); toggleTheme();
        }
        // Ctrl+K opens chat
        if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
          e.preventDefault(); abrirChatbot();
        }
      });

      // Expose functions for future integration
      window.abrirChatbot = abrirChatbot;

      // Small enhancement: lazy focus for detail elements
      document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', e=>{
        if(d.open){
          d.querySelector('summary').focus();
        }
      }));

      // Ensure all interactive elements are keyboard-focusable
      document.querySelectorAll('.curio, .card').forEach(el => el.setAttribute('tabindex','0'));

    })();

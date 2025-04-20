const chatBox = document.getElementById("chat-box");

function appendMessage(sender, message, className) {
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text, lang = "en-US") {
  const synth = window.speechSynthesis;

  function setVoiceAndSpeak() {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = synth.getVoices();
    const voice = voices.find(v =>
      (lang === "en-US" && v.name.includes("Google UK English Male")) ||
      (lang === "hi-IN" && v.name.includes("Google हिंदी पुरुष"))
    );

    if (voice) utterance.voice = voice;

    synth.speak(utterance);
  }

  if (synth.getVoices().length === 0) {
    // Voices not loaded yet, wait for them
    synth.onvoiceschanged = setVoiceAndSpeak;
  } else {
    // Voices already loaded
    setVoiceAndSpeak();
  }
}



function getBotResponse(text, lang) {
  const lower = text.toLowerCase();

  const dinnerKeywords = ["dinner", "khana", "buffet", "food", "खा", "डिनर"];
  const activityKeywords = ["activity", "activities", "show", "yoga", "प्लान", "कल", "tomorrow"];
  const poolKeywords = ["pool", "पूल", "swimming", "खुल", "band", "बंद", "खुलता", "खुलने"];

  const matches = (keywords) => {
    return keywords.some(keyword => lower.includes(keyword) || text.includes(keyword));
  };

  if (matches(dinnerKeywords)) {
    return {
      text: "Our buffet is located right outside the elevators on the 4th deck. We have other dining options on the 5th and 6th deck as well. Let me know if you need assistance finding the perfect spot to feast!",
      lang: "en-US"
    };
  }

  if (matches(activityKeywords)) {
    return {
      text: "Glad you asked! Tomorrow, in the morning we have an On the Dock Yoga Class, afterwards the waterpark and slides will be open for children and adults, lastly tonight we have 3 different shows! Would you like additional help planning the perfect day tomorrow?",
      lang: "en-US"
    };
  }

  if (matches(poolKeywords)) {
    return {
      text: "पूल दस बजे खुलता है और नौ बजे बंद हो जाता है।",
      lang: "hi-IN"
    };
  }

  // Default fallback
  if (lang === "hi-IN") {
    return {
      text: "माफ कीजिए, मैं सिर्फ कुछ खास सवालों के जवाब दे सकता हूँ। आप डिनर, एक्टिविटी या पूल के बारे में पूछ सकते हैं।",
      lang: "hi-IN"
    };
  } else {
    return {
      text: "I'm sorry, I can only answer a few specific questions. Try asking about dinner, activities, or the pool.",
      lang: "en-US"
    };
  }
}

function startListening() {
  const langSelect = document.getElementById("lang");
  const selectedLang = langSelect.value;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = selectedLang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  appendMessage("Bot", `🎙️ Listening in ${selectedLang === "hi-IN" ? "हिन्दी" : "English"}...`, "bot");

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    appendMessage("You", transcript, "user");

    const response = getBotResponse(transcript, selectedLang);
    appendMessage("Bot", response.text, "bot");
    speak(response.text, response.lang);
  };

  recognition.onerror = () => {
    appendMessage("Bot", "Sorry, I couldn't hear that. Please try again.", "bot");
  };
}
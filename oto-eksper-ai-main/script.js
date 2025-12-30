// 2025 Aralık Ayarı: En güncel Gemini 2.5 Flash Modeli
const MODEL_NAME = "gemini-2.5-flash"; 

document.getElementById('carForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const apiKey = document.getElementById('apiKey').value.trim();
    const region = document.getElementById('region').value;
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const transmission = document.getElementById('transmission').value;
    const fuel = document.getElementById('fuel').value;
    const mileage = document.getElementById('mileage').value;
    
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('resultContent');
    const loadingText = document.getElementById('loadingText');

    if (!apiKey) {
        alert("API Anahtarını girmedin gari!");
        return;
    }

    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    loadingText.innerText = "Usta 2.5 Flash hızıyla bakıyor...";

    const regionPrompts = {
        "Ege": "Ege şivesiyle (gari, len, napıp durun) konuşan, samimi Muğla ustası.",
        "Karadeniz": "Karadeniz şivesiyle (uşağum, haçan, uy da) konuşan, tez canlı Trabzon ustası.",
        "Ankara": "Ankara şivesiyle (la bebe, gardaşım) konuşan, ağır abi İskitler ustası.",
        "Adana": "Adana şivesiyle (allahın adamı, kirve) konuşan, sıcakkanlı Adana ustası."
    };

    const prompt = `
        Sen bir otomobil ustasısın. KARAKTERİN: ${regionPrompts[region]}
        
        GÖREV:
        Müşterine (arkadaşına) şu araç için detaylı bir analiz yap:
        Araç: ${make} ${model}, ${transmission}, ${fuel}, ${mileage} km.

        KURALLAR:
        1. Asla teknik terim kullanma, halk ağzı kullan (Turbo->Üfleme, Şanzıman->Vites kutusu).
        2. Şiveni en koyu şekilde kullan.
        3. Samimi ol, sohbet eder gibi anlat.

        KONUŞULACAKLAR:
        - Kronik sorunları (huyları).
        - Bu kilometrede ne masraf açar?
        - Şanzıman sağlam mı?
        - Ustaya gidince nereye baktıralım?

        Yanıtı Markdown formatında ver.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        // --- HATA YAKALAMA (GÜÇLENDİRİLMİŞ) ---
        // 1. Google API'den doğrudan hata mesajı gelirse:
        if (data.error) {
            console.error("API Hatası:", data.error);
            throw new Error(`Google API Hatası: ${data.error.message} (Kod: ${data.error.code})`);
        }

        // 2. Cevap başarılı döndü ama içi boşsa:
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("Usta cevap veremedi. Gelen veri boş. (API Anahtarını veya Modeli kontrol et).");
        }
        // ----------------------------------------

        const aiText = data.candidates[0].content.parts[0].text;
        contentDiv.innerHTML = marked.parse(aiText);
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        
        let msg = error.message;
        // Kullanıcı dostu hata çevirileri
        if (msg.includes("404")) msg = "Bu model (Gemini 2.5) henüz senin bölgesinde aktif olmayabilir veya ismi yanlıştır.";
        if (msg.includes("API key")) msg = "API Anahtarı yanlış veya geçersiz gari.";
        
        alert("BİR SORUN VAR: " + msg);
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

document.getElementById('shareBtn').addEventListener('click', function() {
    const text = document.getElementById('resultContent').innerText;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent("Usta dedi ki:\n\n" + text)}`;
    window.open(whatsappUrl, '_blank');
});
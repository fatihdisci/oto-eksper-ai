document.getElementById('carForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const apiKey = document.getElementById('apiKey').value.trim(); // Boşlukları temizle
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

    // API Anahtarı Boş mu Kontrolü
    if (!apiKey) {
        alert("API anahtarını girmeyi unuttun gari! Dükkan anahtarsız açılmaz.");
        return;
    }

    // UI Güncelleme
    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    loadingText.innerText = "Usta elini siliyor, birazdan gelir...";

    // Bölgeye özel karakter ayarları
    const regionPrompts = {
        "Ege": "Sen Muğla/Aydın şivesiyle (gari, len, napıp durun, gidivee) konuşan, babacan, teknik terim kullanmayan, halk adamı bir Ege ustasısın.",
        "Karadeniz": "Sen Trabzon/Rize şivesiyle (uşağum, haçan, uy da, geliyu, daa) konuşan, tez canlı, teknik terim sevmeyen bir Karadeniz ustasısın.",
        "Ankara": "Sen Ankara şivesiyle (la bebe, gardaşım, neydiyon, mevzu var mı) konuşan, ağır abi, teknik terim yerine 'sanayi ağzı' kullanan bir İskitler ustasısın.",
        "Adana": "Sen Adana şivesiyle (allahın adamı, kirve, ne örüyon, tekerine taş değmesin) konuşan, samimi, sıcakkanlı bir Adana ustasısın."
    };

    const prompt = `
        GÖREV: Bir otomobil eksperi gibi davran.
        KARAKTER: ${regionPrompts[region]}
        
        KURALLAR:
        1. Asla resmi konuşma. Seçilen yörenin şivesini en koyu haliyle kullan.
        2. Teknik terim yasak! (Turbo deme 'üfleme' de, Amortisör deme 'zıpzıplar' de, Triger deme 'kayış' de).
        3. Sanki sanayide çay içiyoruz, sohbet ediyoruz gibi yaz.
        
        ARAÇ BİLGİLERİ:
        - Araç: ${make} ${model}
        - Vites: ${transmission}
        - Yakıt: ${fuel}
        - Kilometre: ${mileage} km

        ANLATILACAKLAR:
        1. Arabanın kronik huyları (vukuatları).
        2. Bu kilometrede başımıza ne iş açar?
        3. Vites kutusu sağlam mı?
        4. Ustaya gidince "şuna mutlaka bak" dediğin hayati tüyo.

        Yanıtı Markdown formatında ver.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // --- HATA YAKALAMA BÖLÜMÜ (Düzeltilen Kısım) ---
        
        // 1. Eğer API bir hata mesajı döndürdüyse (Örn: Geçersiz Key)
        if (data.error) {
            console.error("API Hatası Detayı:", data.error);
            throw new Error(`API Hatası: ${data.error.message} (Kod: ${data.error.code})`);
        }

        // 2. Eğer cevap başarılı ama "candidates" boşsa (Güvenlik filtresi vb.)
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Usta bu arabaya bakmak istemedi (Cevap oluşturulamadı/Güvenlik Filtresi).");
        }
        
        // ------------------------------------------------

        const aiText = data.candidates[0].content.parts[0].text;
        contentDiv.innerHTML = marked.parse(aiText);
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        
        // Hatayı kullanıcıya anlayacağı dilde göster
        let userMessage = "Bi aksilik oldu gari!";
        
        if (error.message.includes("API key not valid")) {
            userMessage = "API Anahtarı yanlış görünüyor uşağum! Kontrol edip tekrar dene.";
        } else if (error.message.includes("400")) {
            userMessage = "İstek hatalı gitti, bilgileri kontrol et.";
        } else {
            userMessage = "Hata oluştu: " + error.message;
        }

        alert(userMessage);
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

document.getElementById('shareBtn').addEventListener('click', function() {
    const text = document.getElementById('resultContent').innerText;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent("Bizim usta ne dedi bak:\n\n" + text)}`;
    window.open(whatsappUrl, '_blank');
});

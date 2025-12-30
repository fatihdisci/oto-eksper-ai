document.getElementById('carForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const transmission = document.getElementById('transmission').value;
    const fuel = document.getElementById('fuel').value;
    const mileage = document.getElementById('mileage').value;
    
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('resultContent');

    if (!apiKey) {
        alert("Lütfen Gemini API anahtarınızı giriniz.");
        return;
    }

    // UI Güncelleme
    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    contentDiv.innerHTML = '';

    // Prompt Oluşturma
    const prompt = `
        Sen uzman bir otomobil teknisyeni ve eksperisin. Aşağıdaki özelliklere sahip bir araç için detaylı bir teknik analiz yapmanı istiyorum:
        
        Araç Bilgileri:
        - Marka: ${make}
        - Model/Yıl: ${model}
        - Şanzıman: ${transmission}
        - Yakıt Tipi: ${fuel}
        - Kilometre: ${mileage} km

        Lütfen şu başlıklar altında Türkçe ve madde madde yanıt ver:
        1. **Kronik Sorunlar:** Bu modelde sık görülen, bilinen mekanik veya elektronik arızalar nelerdir?
        2. **${mileage} KM Kontrol Listesi:** Bu kilometredeki bu araç için özellikle nelere bakılmalı? (Triger, şanzıman yağı, turbo vb.)
        3. **Şanzıman ve Motor Uyumu:** Seçilen şanzıman tipinin bu motorla uyumu ve olası riskleri.
        4. **Alım Tavsiyesi:** Bu araç alınırken ekspertizde ustaya "şuna mutlaka bak" denilmesi gereken en kritik nokta nedir?

        Yanıtı Markdown formatında ver.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API Hatası: ' + response.statusText);
        }

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // Markdown'ı HTML'e çevir ve ekrana bas
        contentDiv.innerHTML = marked.parse(aiText);
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        alert('Bir hata oluştu: ' + error.message);
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

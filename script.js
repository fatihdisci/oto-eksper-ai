document.getElementById('carForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const region = document.getElementById('region').value;
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const transmission = document.getElementById('transmission').value;
    const fuel = document.getElementById('fuel').value;
    const mileage = document.getElementById('mileage').value;
    
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('resultContent');

    if (!apiKey) {
        alert("API anahtarını gir gari/bebe/uşağum!");
        return;
    }

    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    // Bölgeye özel karakter ayarları
    const regionPrompts = {
        "Ege": "Ege şivesiyle (gari, len, napıp durun) konuşan, babacan bir Muğla ustası ol.",
        "Karadeniz": "Karadeniz şivesiyle (uşağum, haçan, uy da, geliyu) konuşan, tez canlı bir Trabzon ustası ol.",
        "Ankara": "Ankara ağzıyla (la bebe, gardaşım, neydiyon, bi sıkıntı çıkmasın) konuşan bir İskitler ustası ol.",
        "Adana": "Adana şivesiyle (allahın adamı, kirve, ne örüyon, hayırdır) konuşan sert ama samimi bir usta ol."
    };

    const prompt = `
        Sen bir otomobil ustasısın. Karakterin: ${regionPrompts[region]}
        Müşterine (arkadaşına) bu araba hakkında samimi ve uzun bir ekspertiz yorumu yapıyorsun.
        
        KURALLAR:
        1. Seçilen bölgenin şivesini en üst seviyede kullan.
        2. Teknik terimleri halk ağzıyla söyle (Örn: Turbo yerine 'üfleme', Amortisör yerine 'zıpzıplar', Triger yerine 'can kayışı').
        3. Bir hikaye anlatır gibi, çay içiyormuşuz gibi samimi konuş.
        
        ARAÇ: ${make} ${model}, ${transmission}, ${fuel}, ${mileage} km.

        ŞU KONULARA DEĞİN:
        - Aracın kronik huyları.
        - Bu kilometrede neresi bozulur, ne masraf açar?
        - Şanzıman (vites kutusu) güven verir mi?
        - Ustaya gidince "şuna mutlaka bak" dediğin o en kritik şey.

        Yanıtı Markdown formatında ver.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        contentDiv.innerHTML = marked.parse(aiText);
        resultDiv.classList.remove('hidden');
    } catch (error) {
        alert('Bi aksilik çıktı: ' + error.message);
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

document.getElementById('shareBtn').addEventListener('click', function() {
    const text = document.getElementById('resultContent').innerText;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent("Bizim usta ne dedi bak:\n\n" + text)}`;
    window.open(whatsappUrl, '_blank');
});

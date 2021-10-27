let dersListesiAktiftirStringi = localStorage.getItem("ders-listesi-aktif");
if (dersListesiAktiftirStringi) {
    document.getElementById("ders-listesi-aktif").checked = dersListesiAktiftirStringi === "true";
}

document.getElementById("ders-listesi-temizleme-butonu").addEventListener("click", () => dersListesiniTemizle());

function dersListesiniTemizle() {
    chrome.tabs.query({}, (tabs) => {
        let message = {
            komut: "dersListesiniTemizle",
        };
        for (let i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }
        localStorage.setItem("dersler", "[]");
    });
}

document.getElementById("ders-listesi-aktif").addEventListener("change", function() {
    chrome.tabs.query({}, (tabs) => {
        let message = {
            komut: "dersListesiAktifliginiDegistir",
            veri: this.checked
        };
        for (let i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }
        localStorage.setItem("ders-listesi-aktif", String(this.checked));
    });

});

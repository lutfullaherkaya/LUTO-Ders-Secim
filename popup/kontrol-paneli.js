let dersListesiAktiftirStringi = null;
chrome.storage.sync.get(["ders-listesi-aktif"], function (result) {
    dersListesiAktiftirStringi = result["ders-listesi-aktif"];
});
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
        chrome.storage.sync.set({ dersler: "[]" }, function () {
            /*console.log('Value is set to ' + value);*/
        });
    });
}

document.getElementById("ders-listesi-aktif").addEventListener("change", function () {
    chrome.tabs.query({}, (tabs) => {
        let message = {
            komut: "dersListesiAktifliginiDegistir",
            veri: this.checked,
        };
        for (let i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }
        chrome.storage.sync.set({ "ders-listesi-aktif": String(this.checked) }, function () {
            /*console.log('Value is set to ' + value);*/
        });
    });

});

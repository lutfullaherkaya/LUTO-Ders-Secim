chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.komut) {
            case "enjeksiyonYapildi":
                let cevap = {

                }

                let dersListesiAktiftirStringi = localStorage.getItem("ders-listesi-aktif");
                if (dersListesiAktiftirStringi) {
                    cevap["ders-listesi-aktif"] = dersListesiAktiftirStringi === "true";
                }

                sendResponse(cevap);
                break;
            case "getItem":
                sendResponse({
                    veri: "true",
                    item: localStorage.getItem(request.key),
                });
                break;
            case "setItem":
                localStorage.setItem(request.key, request.value);
                if (request.key === "ders-listesi-aktif" && request.value === "false") {
                    chrome.tabs.query({}, (tabs) => {
                        let message = {
                            komut: "dersListesiAktifliginiDegistir",
                            veri: false
                        };
                        for (let i = 0; i < tabs.length; ++i) {
                            chrome.tabs.sendMessage(tabs[i].id, message);
                        }
                    });
                }
                sendResponse({
                    veri: "true",
                })
                break;
            case "dersSeceTiklandi":
                chrome.tabs.query({}, (tabs) => {
                    let message = {
                        komut: "dersSeceTiklandi",
                    };
                    /*for (let i = 0; i < tabs.length; ++i) {
                        chrome.tabs.sendMessage(tabs[i].id, message);
                    }*/
                });
                break;
            case "kapcaDogrulandi":
                chrome.tabs.query({}, (tabs) => {
                    let message = {
                        komut: "kapcaDogrulandi",
                    };
                    for (let i = 0; i < tabs.length; ++i) {
                        chrome.tabs.sendMessage(tabs[i].id, message);
                    }
                });
                break;
            case "dersListesiniStoragedenGuncelle":
                chrome.tabs.query({}, (tabs) => {
                    let message = {
                        komut: "dersListesiniStoragedenGuncelle",
                    };
                    for (let i = 0; i < tabs.length; ++i) {
                        chrome.tabs.sendMessage(tabs[i].id, message);
                    }
                });
                break;
        }

    }
);

function dersEkle(ders) {
    let eskiDersler = window.localStorage.getItem("dersler");
    let dersler = [];
    if (eskiDersler) {
        dersler = JSON.parse(eskiDersler);
    }
    dersler.push(ders);
    window.localStorage.setItem("dersler", JSON.stringify(dersler));
}
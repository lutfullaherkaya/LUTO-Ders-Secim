chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.komut);
        switch (request.komut) {
            case "enjeksiyonYapildi":
                let cevap = {}

                let dersListesiAktiftirStringi = null;
                chrome.storage.sync.get(["ders-listesi-aktif"], function (result) {
                    dersListesiAktiftirStringi = result["ders-listesi-aktif"];
                });
                if (dersListesiAktiftirStringi) {
                    cevap["ders-listesi-aktif"] = dersListesiAktiftirStringi === "true";
                }

                sendResponse(cevap);
                break;
            case "getItem":
                let item = null;
                console.log('itemimiz1:', request.key);
                chrome.storage.sync.get([request.key], function (result) {
                    let item = result[request.key];
                    sendResponse({
                        veri: "true",
                        item: item,
                    });
                    console.log('itemimiz:', item);
                });
                return true; // return true to indicate you want to send a response asynchronously
                break;
            case "setItem":
                let keyValuePair = {};
                keyValuePair[request.key] = request.value;
                chrome.storage.sync.set(keyValuePair, function () {
                    /*console.log('Value is set to ' + value);*/
                });
                if (request.key === "ders-listesi-aktif" && request.value === "false") {
                    chrome.tabs.query({}, (tabs) => {
                        let message = {
                            komut: "dersListesiAktifliginiDegistir",
                            veri: false,
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

    },
);

function dersEkle(ders) {
    let eskiDersler = null;
    chrome.storage.sync.get(["dersler"], function (result) {
        eskiDersler = result["dersler"];
    });
    let dersler = [];
    if (eskiDersler) {
        dersler = JSON.parse(eskiDersler);
    }
    dersler.push(ders);
    chrome.storage.sync.set({ dersler: JSON.stringify(dersler) }, function () {
            /*console.log('Value is set to ' + value);*/
        },
    );
}

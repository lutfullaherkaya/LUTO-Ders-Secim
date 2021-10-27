function localStorageGetItemMessage(key) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            komut: "getItem",
            key: key
        }, response => {
            if(response.veri === "true") {
                resolve(response.item);
            } else {
                reject('localStorageGetItem fonksiyonu localstorageden itemi alamadi.');
            }
        });
    });
}

function localStorageSetItemMessage(key, value) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            komut: "setItem",
            key: key,
            value: value
        }, response => {
            if(response.veri === "true") {
                resolve(true);
            } else {
                reject('localStorageGetItem fonksiyonu localstorageye itemi yazamadı.');
            }
        });
    });
}


/**
 * Olay doğru olana kadar sürekli kontrol ederek bekleyecek.
 * @param {function} olay - true dönene kadar bekliyoruz.
 * @param {number} azamiBeklemeSuresiDk
 * @param {number} denetimAralikSuresiMs
 * @return {Promise<number>} olay olunca resolve, bekleme süresi bitince reject olur, bekleme süresini döner saniye olarak.
 */
function olanaKadarBekle(olay, azamiBeklemeSuresiDk = 0.5, denetimAralikSuresiMs = 100) {
    return new Promise((resolve, reject) => {
        let baslamaZamani = new Date().getTime();
        let interval = setInterval(async function () {
            let beklemeSuresi = new Date().getTime() - baslamaZamani;
            if (await olay()) {
                clearInterval(interval);
                resolve(beklemeSuresi / 1000);
            } else if (beklemeSuresi > azamiBeklemeSuresiDk * 60 * 1000) {
                clearInterval(interval);
                reject(beklemeSuresi / 1000);
            }
        }, denetimAralikSuresiMs);
    });
}

class Kapca {
    static iframesiBurasidir() {
        return Boolean(document.getElementById("recaptcha-anchor"));
    }

    static yaTikla() {
        document.getElementsByClassName("recaptcha-checkbox-border")[0].click();
    }

    static dogrulandi() {
        return document.getElementById("recaptcha-accessible-status").innerHTML === "Doğrulandınız";
    }

}

async function main() {
    if(window.top === window.self) {
        // Top level window
    } else {
        if (Kapca.iframesiBurasidir()) {
            if (await localStorageGetItemMessage("otomatik-kapca") === "true") {
                Kapca.yaTikla();
                if (await localStorageGetItemMessage("otomatik-ders") === "true") {
                    olanaKadarBekle(() => Kapca.dogrulandi(), 1.5).then((beklemeSuresi) => {
                        chrome.runtime.sendMessage({
                            komut: "kapcaDogrulandi",
                        });
                    });
                }
            }
        }
    }
}

main();





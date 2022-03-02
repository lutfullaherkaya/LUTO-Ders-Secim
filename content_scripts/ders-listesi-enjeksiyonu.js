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



class Ders {
    static listesi = [];

    static listesiniTemizle() {
        let derslerTablosu = document.getElementById("dersler");
        let satirSayisi = derslerTablosu.rows.length;
        for (let i = 1; i < satirSayisi; ++i) {
            derslerTablosu.deleteRow(1);
        }
        Ders.listesi = [];
    }

    static listesiniStoragedenGuncelle() {
        Ders.listesiniTemizle();
        Ders.listesiniYukle();
    }

    static listesiniStoragedenGuncellemeMesajiGonderArkaplana() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                komut: "dersListesiniStoragedenGuncelle",
            });
        });
    }

    static async alinmaDurumlariniResetle() {
        for (let i = 0; i < Ders.listesi.length; ++i) {
            Ders.listesi[i].bilgiler.set("alinmaDurumu", "denenmedi");
        }
        Ders.listesiniKaydet();
    }

    static listesiniKaydet() {
        let dersler = Ders.listesi.map((ders) => {
            return {
                ad: ders.bilgiler.get("ad"),
                kod: ders.bilgiler.get("kod"),
                section: ders.bilgiler.get("section"),
                kategoriNo: ders.bilgiler.get("kategoriNo"),
                kategori: ders.bilgiler.get("kategori"),
                alinmaDurumu: ders.bilgiler.get("alinmaDurumu")
            }
        });
        localStorageSetItemMessage("dersler", JSON.stringify(dersler));
    }

    static async listesiniYukle() {
        let dersler = await localStorageGetItemMessage("dersler");
        if (dersler) {
            JSON.parse(dersler).forEach(ders => (new Ders(
                    ders.ad,
                    ders.kod,
                    ders.section,
                    ders.kategoriNo,
                    ders.kategori,
                    ders.alinmaDurumu
                ).ekle()
            ));
        }
    }

    static async otomatikSec() {

        for (let i = 0; i < Ders.listesi.length; ++i) {
            if (Ders.listesi[i].bilgiler.get("alinmaDurumu") === "denenmedi") {
                await localStorageSetItemMessage("otomatikDersSecilenIndeks", String(i));
                await localStorageSetItemMessage("kayitliDersSayisi", String(Ders.kayitliDersSayisi()));
                Ders.listesi[i].secimFormunuDoldur().sec();
                break;
            }
        }
    }

    static async otomatikDersSecimSonucuKontrolu() {
        if (Ders.secimSayfasindayiz()) {
            let i = await localStorageGetItemMessage("otomatikDersSecilenIndeks");
            let eskiKayitliDersSayisi = await localStorageGetItemMessage("kayitliDersSayisi");
            if (eskiKayitliDersSayisi && eskiKayitliDersSayisi !== "-1" && i && i !== "-1") {
                i = Number(i);
                eskiKayitliDersSayisi = Number(eskiKayitliDersSayisi);
                if (eskiKayitliDersSayisi < Ders.kayitliDersSayisi()) {
                    Ders.listesi[i].bilgiler.set("alinmaDurumu", "alindi");
                    Ders.satirRenginiDegistir(i + 1, "yesil");
                } else {
                    Ders.listesi[i].bilgiler.set("alinmaDurumu", "alinamadi");
                    Ders.satirRenginiDegistir(i + 1, "kirmizi");
                }
            }
            Ders.listesiniKaydet();
        }
        await localStorageSetItemMessage("otomatikDersSecilenIndeks", "-1");
        await localStorageSetItemMessage("kayitliDersSayisi", "-1");
    }

    static kayitliDersSayisi() {
        return (document.getElementsByClassName("dTable")[0].rows.length - 1);
    }

    /**
     *
     * @param {Number} satirIndeksi
     * @param {string} renk - yesil, kirmizi, beyaz
     */
    static satirRenginiDegistir(satirIndeksi, renk) {
        let renkler = {
            kirmizi: "#ff000073",
            yesil: "#2dbd3599",
            beyaz: "#ffffff"
        }
        let derslerTablosu = document.getElementById("dersler");
        derslerTablosu.rows[satirIndeksi].style.backgroundColor = renkler[renk];
    }

    static secimSayfasindayiz() {
        return Boolean(document.getElementById("textAddCourseCode"));
    }

    /**
     * Map kullandım çünkü sırası önemli anahtarların tabloya ona gore yerlesitiroyurm
     * @param {string} ad
     * @param {string} kod
     * @param {string} section
     * @param {string} kategoriNo
     * @param {string} kategori
     * @param {string} alinmaDurumu - olası değerler: "denenmedi": beyaz, "alinamadi": kırmızı, "alindi": yeşil
     */
    constructor(ad, kod, section, kategoriNo, kategori, alinmaDurumu) {
        this.bilgiler = new Map();
        this.bilgiler.set("ad", ad);
        this.bilgiler.set("kod", kod);
        this.bilgiler.set("section", section);
        this.bilgiler.set("kategoriNo", kategoriNo);
        this.bilgiler.set("kategori", kategori);
        this.bilgiler.set("alinmaDurumu", alinmaDurumu);
    }

    ekle() {
        let derslerTablosu = document.getElementById("dersler");

        let satir = derslerTablosu.insertRow(-1);
        let dersIndeksi = derslerTablosu.rows.length - 2;
        let yukariKaydirButonu = document.createElement("button");
        yukariKaydirButonu.type = "button";
        yukariKaydirButonu.innerHTML = "&#8593;"; // yukarı ok
        yukariKaydirButonu.addEventListener("click", () => {
            console.log("dersIndeksi:" + dersIndeksi);
            if (dersIndeksi > 0) {
                let gecici = Ders.listesi[dersIndeksi];
                Ders.listesi[dersIndeksi] = Ders.listesi[dersIndeksi-1];
                Ders.listesi[dersIndeksi-1] = gecici;
                Ders.listesiniKaydet();
                Ders.listesiniStoragedenGuncellemeMesajiGonderArkaplana();
            }
        });


        let asagiKaydirButonu = document.createElement("button");
        asagiKaydirButonu.type = "button";
        asagiKaydirButonu.innerHTML = "&#8595;"; // aşağı ok
        asagiKaydirButonu.addEventListener("click", () => {
            console.log("dersIndeksi:" + dersIndeksi);
            console.log("ders sayisi:" + Ders.listesi.length);
            if (dersIndeksi < Ders.listesi.length - 1) {
                let gecici = Ders.listesi[dersIndeksi];
                Ders.listesi[dersIndeksi] = Ders.listesi[dersIndeksi+1];
                Ders.listesi[dersIndeksi+1] = gecici;
                Ders.listesiniKaydet();
                Ders.listesiniStoragedenGuncellemeMesajiGonderArkaplana();
            }
        });

        let silButonu = document.createElement("button");
        silButonu.type = "button";
        silButonu.innerHTML = "X";
        silButonu.addEventListener("click", () => {
            Ders.listesi.splice(dersIndeksi, 1);
            Ders.listesiniKaydet();
            Ders.listesiniStoragedenGuncellemeMesajiGonderArkaplana();
        });

        let ayarButonlari = document.createElement("span");
        ayarButonlari.appendChild(asagiKaydirButonu);
        ayarButonlari.appendChild(yukariKaydirButonu);
        ayarButonlari.appendChild(silButonu);
        satir.insertCell(-1).appendChild(ayarButonlari);



        this.bilgiler.forEach((bilgi, anahtar) => {
            if (anahtar !== "kategoriNo" && anahtar !== "alinmaDurumu") {
                satir.insertCell(-1).innerHTML = bilgi;
            }

        });

        let dersSecButonu = document.createElement("button");
        dersSecButonu.type = "button";
        dersSecButonu.innerHTML = "Seç";
        dersSecButonu.addEventListener("click", () => {
            Ders.listesi[dersIndeksi].secimFormunuDoldur().sec();
        });
        satir.insertCell(-1).appendChild(dersSecButonu);

        let renk = "beyaz";
        switch (this.bilgiler.get("alinmaDurumu")) {
            case "alinamadi":
                renk = "kirmizi";
                break;
            case "alindi":
                renk = "yesil";
                break;
        }
        Ders.satirRenginiDegistir(derslerTablosu.rows.length - 1, renk);

        Ders.listesi.push(this);

        return this;
    }

    secimFormunuDoldur() {
        document.getElementById("textAddCourseCode").value = this.bilgiler.get("kod");
        document.getElementById("textAddCourseSection").value = this.bilgiler.get("section");
        document.getElementById("selectAddCourseCategory").value = this.bilgiler.get("kategoriNo");
        return this;
    }

    sec() {
        document.getElementsByName("submitAddCourse")[0].click()
        return this;
    }


}



(function() {

    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
    var browser = chrome;

    async function htmlIndir(url="/content_scripts/ders-listesi-enjeksiyonu.html") {
        return fetch(chrome.runtime.getURL(url)).then(r => r.text());
    }

    function dersListesiniAcKapa(acalimMi) {
        if (acalimMi) {
            app.style.left = "0";
        } else {
            app.style.left = "calc((-1 * (100vw - 800px) / 2 - 29px))";
        }
    }

    const app = document.createElement("div");
    app.id = "ders-listesi";

    chrome.runtime.sendMessage({komut: "enjeksiyonYapildi"}, function(response) {
        htmlIndir().then(async (html) => {

            app.innerHTML = html;
            document.body.appendChild(app);
            document.getElementById("luto-logo").src = chrome.runtime.getURL("luto-logo.png");

            if (response["ders-listesi-aktif"] !== undefined) {
                dersListesiniAcKapa(response["ders-listesi-aktif"]);
            }

            document.getElementById("daraltma-butonu").addEventListener("click",
                () => localStorageSetItemMessage("ders-listesi-aktif", "false"));

            document.getElementById("sablon-ekleme-butonu").addEventListener("click", function() {
                (new Ders(
                    document.getElementById("ders-adi").value,
                    document.getElementById("ders-kodu").value,
                    document.getElementById("ders-section").value,
                    document.getElementById("ders-sablonu-secimi").value,
                    document.getElementById("ders-sablonu-secimi").selectedOptions[0].innerHTML,
                    "denenmedi"
                )).ekle();
                Ders.listesiniKaydet();
                Ders.listesiniStoragedenGuncellemeMesajiGonderArkaplana();
            });

            let otoKapca = document.getElementById("otomatik-kapca");
            let otoDers = document.getElementById("otomatik-ders")
            otoKapca.checked = (await localStorageGetItemMessage("otomatik-kapca") === "true");
            if (!otoKapca.checked) {
                otoDers.checked = false;
                otoDers.disabled = true;
                await localStorageSetItemMessage("otomatik-ders", "false");
            } else {
                otoDers.disabled = false;
            }
            otoKapca.addEventListener("change", async function() {
                await localStorageSetItemMessage("otomatik-kapca", String(this.checked));
                if (!otoKapca.checked) {
                    otoDers.checked = false;
                    otoDers.disabled = true;
                    await localStorageSetItemMessage("otomatik-ders", "false");
                } else {
                    otoDers.disabled = false;
                }
            });

            otoDers.checked = (await localStorageGetItemMessage("otomatik-ders") === "true");
            otoDers.addEventListener("change", async function() {
                await localStorageSetItemMessage("otomatik-ders", String(this.checked));
            });

            document.getElementById("ders-listesi-temizleme-butonu").addEventListener("click", async () => {
                await localStorageSetItemMessage("dersler", "[]");
                await Ders.listesiniStoragedenGuncellemeMesajiGonderArkaplana();
            });

            document.getElementById("ders-alinma-durumlarini-resetle-butonu").addEventListener("click", async () => {
                await Ders.alinmaDurumlariniResetle();
                await Ders.listesiniStoragedenGuncellemeMesajiGonderArkaplana();
            });


            await Ders.listesiniYukle();
            await Ders.otomatikDersSecimSonucuKontrolu();
        });
    });




    chrome.runtime.onMessage.addListener((message) => {
        switch (message.komut) {
            case "dersListesiniTemizle":
                Ders.listesiniTemizle();
                break;
            case "dersListesiniStoragedenGuncelle":
                Ders.listesiniStoragedenGuncelle();
                break;
            case "dersListesiAktifliginiDegistir":
                dersListesiniAcKapa(message.veri);
                break;
            case "kapcaDogrulandi":
                Ders.otomatikSec();
                break;

        }
    });

})();

async function main() {

    let s = document.createElement('script');
    s.src = chrome.runtime.getURL('/content_scripts/all_frames/yardimciFonksiyonlar.js');

    (document.head || document.documentElement).appendChild(s);

    if(window.top === window.self) {
        // Top level window
    } else {
        //
    }
}

main();

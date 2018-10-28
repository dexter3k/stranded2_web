async function loadBinaryAsset(source) {
    return new Promise(resolve => {
        var request = new XMLHttpRequest();
        request.open("GET", source, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
            console.log("Loaded asset " + source);
            resolve(new Uint8Array(request.response));
        };
        request.send();
    });
}
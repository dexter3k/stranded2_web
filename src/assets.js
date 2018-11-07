async function loadBinaryAsset(source) {
    return new Promise(resolve => {
        var request = new XMLHttpRequest();
        request.open("GET", source, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
            console.log("Loaded binary asset " + source);
            resolve(request.response);
        };
        request.send();
    });
}

async function loadTextAsset(source) {
    return new Promise(resolve => {
        var request = new XMLHttpRequest();
        request.open("GET", source, true);
        request.responseType = "text";
        request.onload = function() {
            console.log("Loaded text asset " + source);
            resolve(request.response);
        };
        request.send();
    });
}

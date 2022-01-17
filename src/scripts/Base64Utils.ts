

export function arrayBufferToBase64String(arrayBuffer: ArrayBuffer){
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for(let x = 0;x<len;x++){
        binary += String.fromCharCode(bytes[x]);
    }
    const base64String = btoa(binary);
    return base64String;
}

export function base64StringToArrayBuffer(base64String: string){
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
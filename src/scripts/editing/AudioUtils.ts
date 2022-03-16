
import { Region } from "wavesurfer.js/src/plugin/regions";
import toWav from "audiobuffer-to-wav"; //MIT ok
import RegionData from "./RegionData";
import { resample } from 'wave-resampler';

import lamejs from "lamejs";

const SAMPLE_RATE = 441000;//select sample rate

/**
 * downsamples the audio to @see SAMPLE_RATE samples
 * NOTE: uses sinc downsampling. that is the slowest and may be too slow for large data
 * @param {AudioBuffer} audioBuffer 
 * @returns {AudioBuffer}
 */
export function downSampleAudioBuffer(audioBuffer: AudioBuffer): AudioBuffer {
    const newSamples = resample(audioBuffer.getChannelData(0), audioBuffer.sampleRate, SAMPLE_RATE, { method: 'sinc' });
    const floatArray = new Float32Array(newSamples);
    const newBuffer: AudioBuffer = new AudioContext().createBuffer(
        1, //Channels
        audioBuffer.length,
        SAMPLE_RATE
    );
    newBuffer.copyToChannel(floatArray, 0);
    return newBuffer;
}

/**
 * plays an array buffer
 * @param {ArrayBuffer} buf the buffer to be played
 */
export function playArrayBuffer(buf: ArrayBuffer) {
    new AudioContext().decodeAudioData(buf, function (decodedBuffer) {
        const context = new AudioContext();
        const source = context.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(context.destination);
        source.start();
    });
}


/**
 * plays an audio buffer
 * @param {AudioBuffer} buf the buffer to be played
 */
export function playAudioBuffer(buf: AudioBuffer) {
    const context = new AudioContext();
    const source = context.createBufferSource();
    source.buffer = buf;
    source.connect(context.destination);
    source.start();
}

//https://github.com/zhuker/lamejs/issues/55
function floatArray2Int16 (floatbuffer) {
    const int16Buffer = new Int16Array(floatbuffer.length);
    for (let i = 0, len = floatbuffer.length; i < len; i++) {
        if (floatbuffer[i] < 0) {
            int16Buffer[i] = 0x8000 * floatbuffer[i];
        } else {
            int16Buffer[i] = 0x7FFF * floatbuffer[i];
        }
    }
    
    return int16Buffer;
  }

const KBPS = 16;
/**
 * encodes an AudioBuffer to an mp3 ArrayBuffer with {@link KBPS} kbit/s
 * @param {AudioBuffer} buf 
 * @returns {ArrayBuffer}
 */
export function convertToMp3(buf: AudioBuffer): ArrayBuffer {
    const mp3encoder = new lamejs.Mp3Encoder(1, buf.sampleRate, KBPS);

    const samples = floatArray2Int16(buf.getChannelData(0));
    const sampleBlockSize = 1152;

    const mp3Data: any[] = [];
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    const mp3Buf = mp3encoder.flush();
    if (mp3Buf.length > 0) {
        mp3Data.push(new Int8Array(mp3Buf));
    }

    let length = 0;
    mp3Data.forEach(item => {
        length += item.length;
    });
    console.log(mp3Data);
    // Create a new array with total length and merge all source arrays.
    const mergedArray = new Int8Array(length);
    let offset = 0;
    mp3Data.forEach(item => {
        mergedArray.set(item, offset);
        offset += item.length;
    });
    //https://jsfiddle.net/koldev/cW7W5/
    /*const blob = new Blob([mergedArray], {type: "audio/mp3"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    //a.style = "display: none";
    a.href = url;
    a.download = "download.mp3";
    a.click();window.URL.revokeObjectURL(url);
    */
    return mergedArray.buffer;
}

/**
 * copys the specific region of the audioBuffer and encodes it to a wave file format
 * @param {RegionData} region the region, we want the data from
 * @param {AudioBuffer} audioBuffer the buffer containing the uncut data 
 * @returns {ArrayBuffer} the encoded data in wave format
 */
export function trimAudio(region: RegionData, audioBuffer: AudioBuffer): ArrayBuffer {
    audioBuffer.length
    //https://github.com/Vinit-Dantkale/AudioFy/blob/master/audio.js
    const startPoint = Math.floor(
        (region.start * audioBuffer.length) / audioBuffer.duration
    );
    const endPoint = Math.ceil(
        (region.end * audioBuffer.length) / audioBuffer.duration
    );
    const audioBufferLength = endPoint - startPoint;
    const trimmedAudio = new AudioContext().createBuffer(
        1, //Channels
        audioBufferLength,
        audioBuffer.sampleRate
    );
    //copy channel data
    trimmedAudio.copyToChannel(
        audioBuffer.getChannelData(0).slice(startPoint, endPoint),
        0
    );

    const wav = convertToMp3(trimmedAudio);
    return wav;
} //trimAudio
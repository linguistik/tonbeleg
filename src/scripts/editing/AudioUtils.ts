
import { Region } from "wavesurfer.js/src/plugin/regions";
import toWav from "audiobuffer-to-wav"; //MIT ok
import RegionData from "./RegionData";

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
} //play array buffer


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
} //play audio buffer


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

    const wav = toWav(trimmedAudio);
    return wav;
} //trimAudio
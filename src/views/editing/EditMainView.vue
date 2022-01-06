<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>
      {{ folderName }}
      <ion-button @click="goBack()"> Go Back </ion-button>
      <ion-button @click="load()"> Load </ion-button>
      <ion-button @click="play()"> Play </ion-button>
      <ion-button @click="finish()"> Finish </ion-button>
      <ExploreContainer name="Editing" />
      <div id="waveform" class="waveform"></div>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from "@ionic/vue";

import ExploreContainer from "@/components/ExploreContainer.vue";
import router from "@/router";
import firebase from "@/backend/firebase-config";

import WaveSurfer from "wavesurfer.js";
import RegionPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";
import ExportAudioPlugin from "wavesurfer-export-audio-plugin";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

//import encode from "opus-encode";
//import EmsWorkerProxy from "opusenc.js/worker/EmsWorkerProxy";
//import{ OpusEncoder }from "@discordjs/opus";
//import  OpusScript from "opusscript";
//import concat from "concat-stream";
//import encode from "opus-encode/lib/encoder.js";
//import * as encode from "opus-encode/lib/encoder.js";
//import stream from "stream";
//import audioEncoder from "audio-encoder";
import toWav from "audiobuffer-to-wav";

import { replayAudioData, getAudioString } from "@/scripts/ReplayData";
import { Region } from "wavesurfer.js/src/plugin/regions";

export default defineComponent({
  name: "TabAccount",

  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    ExploreContainer,
    IonButton,
  },

  props: {
    folderName: String,
  },

  setup(props: any) {
    // multi-lingual support
    const { t } = useI18n();

    const str2ab = (str) => {
      const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      const bufView = new Uint16Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    };
    //https://github.com/mmig/opus-encdec
    //https://github.com/Rillke/opusenc.js
    //https://github.com/zhuker/lamejs

    //https://github.com/katspaugh/wavesurfer.js
    //https://wavesurfer-js.org/doc/class/src/plugin/regions.js~RegionsPlugin.html

    //https://github.com/Vinit-Dantkale/AudioFy

    //https://www.npmjs.com/package/wavesurfer-export-audio-plugin

    let wavesurfer: WaveSurfer;
    let regionID: string;

    const regionIds: string[] = [];
    let renderedBuffer;
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const currentUserUID = currentUser.uid;

    const load = async () => {
      wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "violet",
        progressColor: "purple",
        plugins: [RegionPlugin.create(), ExportAudioPlugin.create()],
      });

      console.log(wavesurfer.RegionsPlugin);


      //TODO for all parts

      const audio = await replayAudioData(props.folderName, currentUserUID);
      const audioString = await getAudioString(
        props.folderName,
        currentUserUID
      );
      wavesurfer.load(audio);

      wavesurfer.on("ready", async () => {
        console.log("ready");
        wavesurfer.enableDragSelection({});
        renderedBuffer = await wavesurfer.getRenderedAudioBuffer();
        console.log("buffer:", renderedBuffer);
      });

      wavesurfer.on("region-created", (newRegion) => {
        console.log("new Region");
        regionIds.push(newRegion.id);
      });

      wavesurfer.on("region-update-end", (newRegion) => {
        console.log(newRegion.start, ", ", newRegion.end);
        regionID = newRegion.id;
      });
    };

    const play = () => {
      //wavesurfer.regions.list[regionID].play();
      wavesurfer.play();
    };

    //return a new ogg encoded file containing the data of that region
    const trimAudio = (region: Region) => {
      console.log("trim", region);
      //https://github.com/Vinit-Dantkale/AudioFy/blob/master/audio.js
      const startPoint = Math.floor((region.start*renderedBuffer.length)/wavesurfer.getDuration());
      const endPoint = Math.ceil((region.end*renderedBuffer.length)/wavesurfer.getDuration());
      const audioBufferLength = endPoint - startPoint;
      const trimmedAudio = new AudioContext().createBuffer(
        1,//Channels
        audioBufferLength,
        renderedBuffer.sampleRate
      );
      //copy channel data 
      trimmedAudio.copyToChannel(renderedBuffer.getChannelData(0).slice(startPoint, endPoint), 0);
      
      //trimmedAudio is the buffer thats needs to be encoded to ogg for returning
     /* const blob = new Blob([trimmedAudio.getChannelData(0)],{type: "audio/wav" });
      const audio = new Audio();
      const url = window.URL.createObjectURL(blob);
      audio.src = url;
      audio.load();
      audio.oncanplay = ()=>{console.log("play");audio.play();}*/

/*      const context = new AudioContext();
      const source = context.createBufferSource();
      source.buffer = trimmedAudio;
      source.connect(context.destination);
      source.start();
*/
      //const worker = new Worker("opus-encdec/dist/encoderWorker.js");
//console.log(worker);
      //console.log(new OpusEncoder());
     /* const args = ["input", "output.opus"];
      const outData = {"encoded.opus":{"MIME":"audio/ogg"}};

      const worker = new Worker("opusenc.js/worker/EmsWorkerProxy.js");
      worker.postMessage({command: "encode",
      args:args,
      outData: outData,
      fileData: trimmedAudio.getChannelData(0)})*/

      //const encoder = new OpusEncoder(48000,1);

      //const encoded = encoder.encode(trimmedAudio);
      //console.log(encoded);
/*
      console.assert(trimmedAudio.sampleRate == 48000);
      console.assert(trimmedAudio.numberOfChannels == 1);
      const encoder = new OpusScript(48000, 1, OpusScript.Application.AUDIO ,{wasm: false});
      const encodedAudio = encoder.encode(trimmedAudio.getChannelData(0), 48000 * 20 /1000);
      //console.log(encodedAudio);
*/

/*      const audioStream = new stream.Readable({objectMode: true}); 

      console.log(audioStream);
      audioStream._read = function(){
        this.push(trimmedAudio);
        this.push(null);
      }
      const doSomething = concat(function(buf){
        const blob = new Blob([buf.toArrayBuffer()]);
        console.log(blob);
      });
      console.log(encode);
      //audioStream.pipe(encode());//.pipe(doSomething);
*/
/*
      console.log("start");//only works with 44.1kHz, 32kHz, 24kHz. we have 44kHz
      audioEncoder(trimmedAudio, 128, function onProgress(){console.log("progress");}, function onComplete(blob){
        console.log(blob);
      });
*/
      const wav = toWav(trimmedAudio);
      return wav;

      
    };

    const playAudioBuffer = (buf) =>{
      new AudioContext().decodeAudioData(buf, function(decodedBuffer){
          const context = new AudioContext();
      const source = context.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(context.destination);
      source.start();
      });
    }

    const finish = async () => {
      for (const regionId of regionIds) {
        console.log(regionId);
        const wavFileData = trimAudio(wavesurfer.regions.list[regionId]);
        await Filesystem.writeFile({
          path: "/" + currentUserUID + "/" + props.folderName + "/" + "export.wav",
          data: wavFileData,
          directory: Directory.Data,
          encoding: Encoding.UTF8 
        });
      }
      const readRes = await Filesystem.readFile({
        path: "/" + currentUserUID + "/" + props.folderName + "/" + "export.wav",
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      console.log("read", readRes.data);
      console.log(typeof(readRes.data));

      playAudioBuffer(readRes.data);


      /*new AudioContext().decodeAudioData(readRes.data, function(buffer){
        console.log(buffer);
      })*/
/*
      const context = new AudioContext();
      const source = context.createBufferSource();
      source.buffer = readRes.data;
      source.connect(context.destination);
      source.start();
*/
     // wavesurfer.load(readRes.data);
    };

    const goBack = () => {
      router.back();
    };
    return { t, goBack, load, finish, play };
  },
});
</script>
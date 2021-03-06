<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Schneiden</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-button expand="block"  @mousedown="finishWithoutSaving()">
        Beenden ohne Speichern</ion-button
      >
      <ion-button expand="block"  @mousedown="finishAndSaveEventHandler()">
        Beenden und Speichern</ion-button
      >
      <div id="waveform" class="waveform"></div>
      <div id="timeline" class="timeline"></div>
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-text
              class="css-icon"
              @click="skipEventHandler(-10)"
            >-10</ion-text>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="playing ? pauseCircleOutline : playCircleOutline"
              @click="playPauseEventHandler"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-text
              class="css-icon"
              @click="skipEventHandler(10)"
            >+10</ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-button expand="block" @mousedown="mergeRegionsEventHandler()">
        Überlappende Regionen zusammenfügen</ion-button
      >
      <ion-button expand="block" @mousedown="vadEventHandler()">
        Automatisch Stimmen erkennen</ion-button
      >
      <ion-grid>
        <ion-row v-for="item in regionsRef" v-bind:key="item">
          <ion-col size="1">
            <ColoredIcon
              :icon="square"
              size="small"
              :color="usefulColorMapRef.get(item.color)"
            ></ColoredIcon>
          </ion-col>
          <ion-col>
            <ion-label
              class="elementName"
              @click="setNameOfRecordingIdEventHandler(item.id)"
              :key="updateKey"
            >
              {{ getNameOfRecordingId(item.id) }}
            </ion-label>
          </ion-col>
          <ion-col size="2">
            <ion-icon
              :icon="playCircleOutline"
              class="controlElements"
              @click="item.play(0)"
            ></ion-icon>
          </ion-col>
          <ion-col size="2">
            <ion-icon
              :icon="trashOutline"
              class="controlElements"
              @click="item.remove()"
            ></ion-icon>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useI18n } from "vue-i18n";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonRow,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  alertController,
  IonText
} from "@ionic/vue";

import {
  playSkipForwardCircleOutline,
  playBackCircleOutline,
  playForwardCircleOutline,
  square,
  trashOutline,
  playCircleOutline,
  pauseCircleOutline
} from "ionicons/icons";

import ColoredIcon from "@/components/ColoredIcon.vue";

import router from "@/router";
import firebase from "@/backend/firebase-config";

import WaveSurfer from "wavesurfer.js"; //BSD-3 ok
import RegionPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js"; //ok
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.js";
import ExportAudioPlugin from "wavesurfer-export-audio-plugin"; //MIT ok

import toWav from "audiobuffer-to-wav"; //MIT ok


import { replayAudioData} from "@/scripts/ReplayData";
import { Region } from "wavesurfer.js/src/plugin/regions";
import {
  setRecordingEntryRegionDataArray,
  getRecordingEntryRegionDataArray,
} from "@/scripts/RecordingStorage";
import {onIonViewWillLeave, onIonViewDidEnter} from "@ionic/vue";
import { useMenuSettings } from "@/scripts/ionicVueSettings/menuSettings";

import VoiceActivityDetector from "@/scripts/vad/VoiceActivityDetector";

export default defineComponent({
  name: "TabEdit",

  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonButton,
    IonRow,
    IonCol,
    IonGrid,
    IonIcon,
    ColoredIcon,
    IonLabel,
    IonText,
  },

  props: {
    folderName: String,
  },

  setup(props: any) {
    // multi-lingual support
    const { t } = useI18n();

    const {toggleSwipeMenu} = useMenuSettings();
    onIonViewWillLeave(()=>toggleSwipeMenu.value = true);
    onIonViewDidEnter(()=>toggleSwipeMenu.value = false);



    //https://github.com/mmig/opus-encdec
    //https://github.com/Rillke/opusenc.js
    //https://github.com/zhuker/lamejs

    //https://github.com/katspaugh/wavesurfer.js
    //https://wavesurfer-js.org/doc/class/src/plugin/regions.js~RegionsPlugin.html

    //https://github.com/Vinit-Dantkale/AudioFy

    //https://www.npmjs.com/package/wavesurfer-export-audio-plugin

    let wavesurfer: WaveSurfer;

    let changesApplied = false;
    const regionIdsRef: Ref<string[]> = ref([]);
    const regionsRef: Ref<Region[]> = ref([]);
    let renderedBuffer;
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const currentUserUID = currentUser.uid;


    /**
     * this is used to force an update of the name/id labels on the page to display the new name after being set
     */
    const updateKey = ref(0);
    const forceUpdate = () => {
      updateKey.value += 1;
    };

    let index = 0; //this is the index for determining the next color
    const usefulColorMap = new Map<string, string>([


      ["rgba(255,215,0, 0.5)", "gold"],
      ["rgba(0,250,154, 0.5)", "mediumspringgreen"],
      ["rgba(128,128,128,0.5)", "gray"],
      ["rgba(135,206,235,0.5)", "skyblue"],
      ["rgba(240,230,140,0.5)", "khaki"],
      ["rgba(188,143,143,0.5)", "rosybrown"],
      ["rgba(216,191,216,0.5)", "thistle"],
      ["rgba(255,105,180,0.5)", "hotpink"],
    ]);

    const usefulColorMapRef = ref(usefulColorMap);

    const idToNameMap = new Map<string, string>();

    /**
     * returns a name of a recording to display to the screen
     * @param {string} id the id of the recording
     * @returns {string} name of that recording if it is set, returns the recording id otherwise
     */
    const getNameOfRecordingId = (id: string) => {
      if (!idToNameMap.has(id)) return id;
      else return idToNameMap.get(id);
    };

    /**
     * opens an alert that asks for a new name for this region
     * and forces an update of that element to display the new name
     * @param {string} id the id of the recording to set a name for
     */
    const setNameOfRecordingIdEventHandler = async (id: string) => {
      const alert = await alertController.create({
        message: "Choose a name",
        inputs: [
          {
            name: "textField",
            id: "textField",
            type: "text",
            attributes: {
              required: true,
              minlength: 1,
              maxlength: 20,
              inputMode: "text",
            },
            handler: () => {
              console.log("texteingabe erfolgt"); //is this handler really necessary? For some reason it is^^
            },
          },
        ], //inputs
        buttons: [
          {
            text: "cancel",
            handler: () => {
              console.log("confirm cancel");
            },
          },
          {
            text: "OK",
            handler: (data) => {
              const x = data.textField;
              console.log(x);
              if (!(x.length === 0) && x.length <= 35) {
                idToNameMap.set(id, x);
                forceUpdate();
              } else {
                console.log("not a valid name");
              }
            },
          },
        ],
      });
      await alert.present();
    };

    const playing = ref(false)
    /**
     * creates the {@link wavesurfer}
     * loads the specific audio data
     * initializes the {@link renderedBuffer} with an AudioBuffer of the audio data
     * loads the regionData and imports them into {@link wavesurfer}
     * extracts the names of the regionData and inserts them into {@link idToNameMap}
     *
     * NOTE: this cannot be called directly on creation, since wavesurfer needs the specific waveform container in the html
     */
    const load = async () => {
      wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "violet",
        progressColor: "purple",
        mediaControls: true,
        plugins: [
          RegionPlugin.create(),
          ExportAudioPlugin.create(),
          TimelinePlugin.create({
            container: "#timeline",
          }),
        ],
      });


      const audio = await replayAudioData(props.folderName, currentUserUID);

      wavesurfer.load(audio);

      wavesurfer.on("ready", async () => {
        console.log("ready", wavesurfer.getDuration());
        wavesurfer.enableDragSelection({});
        const regionArrayData = getRecordingEntryRegionDataArray(
          props.folderName
        );
        for (const regionData of regionArrayData) {
          wavesurfer.addRegion(regionData);
          if (regionData.name != regionData.id) {
            idToNameMap.set(regionData.id, regionData.name);
          }
        }
        renderedBuffer = await wavesurfer.getRenderedAudioBuffer();
      });

      wavesurfer.on("region-created", (newRegion) => {console.log("region-created");
        newRegion.color = Array.from(usefulColorMap.keys())[
          index % usefulColorMap.size
        ];
        index = index + 1;
        regionIdsRef.value.push(newRegion.id);
        regionsRef.value.push(newRegion);
      });

      wavesurfer.on("region-update-end", (region) => {
        changesApplied = true;
        console.log("ready2", renderedBuffer);
      });

      wavesurfer.on("region-removed", (region) => {
        const index = regionsRef.value.indexOf(region);
        if (index > -1) {
          changesApplied = true;
          regionsRef.value.splice(index, 1);
        }
      });
      wavesurfer.on('pause', function () {
        playing.value = false;
        console.log(playing.value);
      });
      wavesurfer.on('play', function () {
        playing.value = true;
        console.log(playing.value);
      });
    };

    /**
     * load the audio data after a timeout of 100ms
     */
    const loadAfterTimeout = async () => {
      window.setTimeout(load, 100);
    };
    loadAfterTimeout();

    /**
     * save the data concerning the regions
     */
    const finishAndSaveEventHandler = async () => {
      setRecordingEntryRegionDataArray(
        props.folderName,
        regionsRef.value,
        idToNameMap
      );
      router.back();
    };

    /**
     * pause the recording
     */
    const playPauseEventHandler = () => {
      wavesurfer.playPause();
    };

    /**
     * skip forwards or backwards in the recording (10s)
     */
    const skipEventHandler = (amt: number) => {
      wavesurfer.skip(amt);
    };

    /**
     * creates an alert asking the user if he wants to leave the edit view without saving
     */
    const finishWithoutSaving = async () => {
      if (changesApplied) {
        //ask user if he wants to leave without saving
        const alert = await alertController.create({
          message: "Willst du wirklich abbrechen ohne zu speichern?.",
          buttons: [
            {
              text: "Ja",
              handler: () => { //return to TabSaved
                router.back();
                wavesurfer.destroy();
              },
            },
            {
              text: "Nein",
              handler: () => {
                //do nothing, stay in this window
              },
            },
          ],
        });
        await alert.present();
      } else {
        router.back();
        wavesurfer.destroy();
      }
    };

    /**
     * merge overlapping regions in the edit view
     */
    const mergeRegionsEventHandler=()=>{
      changesApplied = true;
      let changeApplied = false;
      do{
        changeApplied = false;
        //go through all regions
        outerLoop:
        for(const outerRegionId in wavesurfer.regions.list){
          const outerRegion: Region = wavesurfer.regions.list[outerRegionId];    //compare end with start of all other regions
          for(const innerRegionId in wavesurfer.regions.list){
            if(innerRegionId == outerRegionId){
              continue;
            }
            const innerRegion = wavesurfer.regions.list[innerRegionId];
            if(outerRegion.start<=innerRegion.start && outerRegion.end>=innerRegion.start){
              console.log("merge");
              let newName = "";                                           //merge
              if(idToNameMap.has(outerRegionId)){                         //outerRegion starts first
                newName += idToNameMap.get(outerRegionId);                //correct name
              }
              if(idToNameMap.has(outerRegionId) && idToNameMap.has(innerRegionId)){
                newName += " + "
              }
              if(idToNameMap.has(innerRegionId)){
                newName += idToNameMap.get(innerRegionId);
              }
              if(newName!=""){
                idToNameMap.set(outerRegionId, newName);
              }

              if(outerRegion.end<innerRegion.end){                         //set ending of outer region if it is bigger than current ending
                outerRegion.update({
                  id: outerRegion.id,
                  start:outerRegion.start,
                  end: innerRegion.end,
                  color: outerRegion.color
                })
              }
              innerRegion.remove();                                        //remove inner region from wavesurfer
              changeApplied = true;
              break outerLoop;
            }
          }
        }
      }while(changeApplied);
    }

    /**
     * called when the voice detection button is clicked
     * highlights regions with voice activity
     */
    const vadEventHandler =()=>{
      const vad = new VoiceActivityDetector(renderedBuffer,(_start, _end)=>{
        changesApplied = true;
        wavesurfer.addRegion({start: _start/1000, end: _end/1000});
        });
      vad.extractRegions();
    }

    return {
      t,
      finishWithoutSaving,
      finishAndSaveEventHandler,
      playPauseEventHandler,
      skipEventHandler,
      getNameOfRecordingId,
      setNameOfRecordingIdEventHandler,
      mergeRegionsEventHandler,
      vadEventHandler,
      regionsRef,
      usefulColorMapRef,
      playSkipForwardCircleOutline,
      playBackCircleOutline,
      playForwardCircleOutline,
      square,
      trashOutline,
      playCircleOutline,
      pauseCircleOutline,
      updateKey,
      playing,
      router,
    };
  },
});
</script>
<style scoped>
.waveform {
  margin: 25px;
  border-style: solid;
  border-width: thin;
  border-radius: 5px;
}
.timeline {
  margin: 25px;
}

.controlElements {
  font-size: 32px;
}

.css-icon{
  font-size: 32px;
  border-style: solid;
  border-width: thick;
  border-radius: 999px;
  height: 2.5em;
  width: 2.5em;
  padding: 16px;
  position: relative;
}

ion-icon {
  font-size: 64px;
}

ion-col {
  text-align: center;
}

ion-grid {
  margin-bottom: 30px;
}
</style>
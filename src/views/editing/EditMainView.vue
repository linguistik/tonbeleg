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
            <ion-icon
              :icon="playBackCircleOutline"
              @click="skipEventHandler(-10)"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="playing ? pauseCircleOutline : playCircleOutline"
              @click="playPauseEventHandler"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="playForwardCircleOutline"
              @click="skipEventHandler(10)"
            ></ion-icon>
          </ion-col>
        </ion-row>
      </ion-grid>
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
  alertController, onIonViewDidEnter,
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

import { replayAudioData, getAudioData } from "@/scripts/ReplayData";
import { Region } from "wavesurfer.js/src/plugin/regions";
import {
  setRecordingEntryRegionDataArray,
  getRecordingEntryRegionDataArray,
} from "@/scripts/RecordingStorage";
import {UploadToFirebase} from "@/scripts/RecordingUpload";

export default defineComponent({
  name: "TabAccount",

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
  },

  props: {
    folderName: String,
  },

  setup(props: any) {
    // multi-lingual support
    const { t } = useI18n();

    //https://github.com/mmig/opus-encdec
    //https://github.com/Rillke/opusenc.js
    //https://github.com/zhuker/lamejs

    //https://github.com/katspaugh/wavesurfer.js
    //https://wavesurfer-js.org/doc/class/src/plugin/regions.js~RegionsPlugin.html

    //https://github.com/Vinit-Dantkale/AudioFy

    //https://www.npmjs.com/package/wavesurfer-export-audio-plugin

    let wavesurfer: WaveSurfer;
    let regionID: string;

    let changesApplied = false;
    const regionIdsRef: Ref<string[]> = ref([]);
    const regionsRef: Ref<Region[]> = ref([]);
    let renderedBuffer;
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const currentUserUID = currentUser.uid;

    const clickcounter = ref(0);

    /**
     * this is used to force an update of the name/id labels on the page to display the new name after being set
     */
    const updateKey = ref(0);
    const forceUpdate = () => {
      updateKey.value += 1;
    };

    let index = 0; //this is the index for determining the next color
    const usefulColorMap = new Map<string, string>([
      ["rgba(255,0,0,0.5)", "red"],
      ["rgba(38,255,0,0.5)", "green"],
      ["rgba(0,0,255,0.5)", "blue"],
      ["rgba(255,0,230,0.5)", "pink"],
      ["rgba(255,242,0,0.5)", "yellow"],
      ["rgba(0,255,200,0.5)", "cyan"],
      ["rgba(119,0,255,0.5)", "purple"],
      ["rgba(0,0,0,0.5)", "black"],
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
                //nur kleine und nicht leere eingaben
                idToNameMap.set(id, x);
                forceUpdate();
              } else {
                console.log("not a valid name");
              }
            },
          },
        ], //buttons
      }); //create alert
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
      //TODO for all parts

      const audio = await replayAudioData(props.folderName, currentUserUID);

      wavesurfer.load(audio);

      wavesurfer.on("ready", async () => {
        console.log("ready", wavesurfer.getDuration());
        wavesurfer.enableDragSelection({});
        //importRegions(wavesurfer, idToNameMap, props.folderName);
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

      wavesurfer.on("region-created", (newRegion) => {
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
    }; //load

    const loadAfterTimeout = async () => {
      window.setTimeout(load, 100);
    };
    loadAfterTimeout();

    const finishAndSaveEventHandler = async () => {
      setRecordingEntryRegionDataArray(
        props.folderName,
        regionsRef.value,
        idToNameMap
      );

      //this is still useful code!!!
      /*for (const region of regionsRef.value) {
        const wavFileData = trimAudio(region);
        await Filesystem.writeFile({
          path:
            "/" + currentUserUID + "/" + props.folderName + "/" + region.id +".wav",
          data: wavFileData,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
      }*/
      //playAudioBuffer(await getAudioData(props.folderName, "export.wav"));
      router.back();
    }; //finish

    const playPauseEventHandler = () => {
      wavesurfer.playPause();
    };

    const skipEventHandler = (amt: number) => {
      wavesurfer.skip(amt);
    };

    const finishWithoutSaving = async () => {
      if (changesApplied) {
        //ask user if he wants to leave without saving
        const alert = await alertController.create({
          message: "Willst du wirklich abbrechen ohne zu speichern?.",
          buttons: [
            {
              text: "Ja",
              handler: () => {
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

    return {
      t,
      finishWithoutSaving,
      finishAndSaveEventHandler,
      playPauseEventHandler,
      skipEventHandler,
      getNameOfRecordingId,
      setNameOfRecordingIdEventHandler,
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
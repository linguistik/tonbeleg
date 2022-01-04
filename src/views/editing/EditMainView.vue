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
import { Filesystem, Directory } from '@capacitor/filesystem';

import {replayAudioData} from "@/scripts/ReplayData";

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

    let wavesurfer: WaveSurfer;
    const load = async () => {
      wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "violet",
        progressColor: "purple",
        plugins: [
        //RegionsPlugin.create()
    ]
      });
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const currentUserUID = currentUser.uid;

      //TODO for all parts
      
      const audio = await replayAudioData(props.folderName,currentUserUID);
      wavesurfer.load(audio);
      wavesurfer.on("ready", ()=>{
        console.log("ready");
        wavesurfer.enableDragSelection({}); 
      });
    };

    const goBack = () => {
      router.back();
    };
    return { t, goBack, load };
  },
});
</script>
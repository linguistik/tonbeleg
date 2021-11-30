<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Gespeichertes</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-button v-on:click="safeRecordings();loadRecordings();refresh()">
        refresh
      </ion-button>
      <ion-list
      lines="full"
      v-if="recordingsRef.length!=0">
        <ol>
          <Recording v-for="item in recordingsRef" v-bind:key="item" v-bind:recording="item" @refreshEmit="refreshAfterTimeout()">
          </Recording>
        </ol>
      </ion-list>
  <div id="container" v-else>
    <p>Du hast auf diesem Gerät noch keine gespeicherten Aufnahmen </p>
  </div>



    </ion-content>



  </ion-page>
</template>

<!--
If u are trying to fix a bug that occured on a test,
read example.spec.ts first
-->

<script lang="ts">
import {defineComponent, ref, Ref} from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
} from "@ionic/vue";

import {
  Filesystem,
  Directory,
  //Encoding,
  //WriteFileResult,
  //ReaddirResult,
} from "@capacitor/filesystem";

import firebase from "@/backend/firebase-config";
import Recording from "@/components/Recording.vue";

import {loadRecordings, safeRecordings, recordings, getRecordings } from "@/scripts/RecordingStorage";
import RecordingData from "@/scripts/RecordingData";

export default defineComponent({
  name: "TabSaved",
  components: {
    PageHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonButton,
    IonList,
    Recording,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    loadRecordings();

    //get userUID
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const userUID = currentUser.uid;

    const recordingsRef: Ref<RecordingData[]> = ref([]);
    
    //TODO dynamically load new data
    //
    const getRecordingFolders = async () => {
      const readdir = await Filesystem.readdir({
        path: "/" + userUID,
        directory: Directory.Data,
      });


      console.log(readdir);
      for(const folder of readdir.files){
        //recordingFolders.value.push(folder);
      }
      recordingsRef.value =  getRecordings();
    };

    getRecordingFolders();


    const refresh = async () => {
      await getRecordingFolders();
    }


    const refreshAfterTimeout = async () => {
      window.setTimeout(refresh,100);
    }


    return { t, 
    recordingsRef, 
    refreshAfterTimeout, 
    refresh,
    safeRecordings,
    loadRecordings,
    };

  },


}


);
</script>
<style scoped>
#container {
  text-align: center;
  position: relative;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}


#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

</style>
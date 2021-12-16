<template>
  <ion-page :key="updateKey">
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Gespeichertes</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-button v-on:click="loadEverythingPls()">
        refresh
      </ion-button>
      <ion-list
      lines="full"
      v-if="recordingsRef.length!=0">
          <Recording v-for="item in recordingsRef" v-bind:key="item" v-bind:recording="item" @refreshEmit="refreshAfterTimeout()">
          </Recording>
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
import {UploadToFirebase, deleteAllFromUploadArray, deleteUploadedRecordsFromDevice, RecordingUploadArray} from "@/scripts/RecordingUpload";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList, alertController,
} from "@ionic/vue";
/*
import {
  Filesystem,
  Directory,
  //Encoding,
  //WriteFileResult,
  //ReaddirResult,
} from "@capacitor/filesystem";*/

import Recording from "@/components/Recording.vue";

import {loadRecordings, safeRecordings, getRecordings } from "@/scripts/RecordingStorage";
import RecordingData from "@/scripts/RecordingData";
import {loadUserSettings} from "@/scripts/UserSettingsStorage";
//import {getAlreadyUploadedArray, getUploadArray, getInUploadArrayIdent} from "@/scripts/UserSettingsStorage";
//import {setUploadArrays} from "@/scripts/RecordingUpload";
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

  /*methods:{
    async setUpUploadArray(){
      await loadUserSettings();
      await loadRecordings();
    }
  },
  mounted(){
    this.setUpUploadArray();
  },*/

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const recordingsRef: Ref<RecordingData[]> = ref([]);
    const initialize = async () => {
      await loadRecordings().then(()=>{recordingsRef.value =  getRecordings();});

    }
    initialize();

    const updateKey = ref(0);
    const forceUpdate = ()=>{
      updateKey.value += 1;

    }

    const refresh = async () => {
      recordingsRef.value = getRecordings(); 
      forceUpdate();
    }

    const loadEverythingPls = async () => {
      await safeRecordings();
      await UploadToFirebase();
      await refresh()
      if(RecordingUploadArray.length > 0) {
        const alert = await alertController.create({
          message: "Do you want to delete the records you just uploaded from your device?",
          buttons: [
            {
              text: "Cancel",
              handler: () => {
                deleteAllFromUploadArray();
                console.log("confirm Cancel");
                refresh()
              },
            },
            {
              text: "OK",
              handler: () => {
                deleteUploadedRecordsFromDevice();
                refresh()
              },
            },
          ],
        });
        await alert.present();
      }
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
    updateKey,
      UploadToFirebase,
      loadEverythingPls,
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
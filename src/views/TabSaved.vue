<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Gespeichertes</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-list
      v-if="recordingFolders.length!=0">
        <ol>
          <Recording v-for="item in recordingFolders" v-bind:key="item" v-bind:folder="item">
          </Recording>
        </ol>
      </ion-list>
  <div id="container" v-else>
    <p>Du hast auf diesem Gerät noch keine gespeicherten Aufnahmen </p>
  </div>

    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  
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

export default defineComponent({
  components: {
    PageHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    
    IonList,
    Recording,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    //get userUID
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const userUID = currentUser.uid;

    const recordingFolders = ref(['']);

    //TODO dynamically load new data
    //
    const getRecordingFolders = async () => {
      recordingFolders.value.pop();
      const readdir = await Filesystem.readdir({
        path: "/" + userUID,
        directory: Directory.Data,
      });
      console.log(readdir);
      for(const folder of readdir.files){
        recordingFolders.value.push(folder);
      }
    };

    getRecordingFolders();
    //recordingFolders.value = getRecordingFolders();
    console.log(recordingFolders.value.length);
    return { t, recordingFolders };
  },
});
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
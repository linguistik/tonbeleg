<template >
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Hochgeladenes</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-refresher slot="fixed" @ionRefresh="refresh">
        <ion-refresher-content> </ion-refresher-content>
      </ion-refresher>

      <ion-button expand="block" @click="uploadExternal()">
        Externe Aufnahme hochladen</ion-button
      >

      <ion-list lines="full" v-if="uploadedRecordings.length != 0">
        <Recording
          v-for="item in uploadedRecordings"
          v-bind:key="item"
          v-bind:recording="item"
          v-bind:provideFunctionality="false"
        >
        </Recording>
      </ion-list>
      <div id="container" v-else>
        <p>{{ errorMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonButton,
} from "@ionic/vue";

import RecordingData from "@/scripts/RecordingData";
import Recording from "@/components/Recording.vue";

import firebase from "@/backend/firebase-config";
import RegionData from "@/scripts/editing/RegionData";
import { FileSelector } from "capacitor-file-selector";
import { convertToMp3 } from "@/scripts/editing/AudioUtils";
import { arrayBufferToBase64String } from "@/scripts/Base64Utils";
import { ConnectionStatus, Network } from "@capacitor/network";
import {getLicense} from "@/scripts/UserSettingsStorage";

export default defineComponent({
  name: "TabUploaded",

  components: {
    PageHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonList,
    Recording,
    IonButton,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const uploadedRecordings: Ref<RecordingData[]> = ref([]);
    const errorMessage = ref(
      "Du hast auf diesem Account keine hochgeladenenen Aufnahmen oder du bist nicht mit dem Internet verbunden"
    );

    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const userUID = currentUser.uid;

    const loadRecordingsFromDatabase = async () => {
      try{
        const networkStatus: ConnectionStatus = await Network.getStatus();
        if(!networkStatus.connected){
          errorMessage.value = "Du bist nicht mit dem Internet verbunden";
          return;
        }


      const buffer: RecordingData[] = [];

      //await delay(10000);
      const collection = await db
        .collection("users")
        .doc(userUID)
        .collection("recordings")
        .get();

      for (const doc of collection.docs) {
        const partsCollection = await db
          .collection("users")
          .doc(userUID)
          .collection("recordings")
          .doc(doc.id)
          .collection("parts")
          .get();

        const partNames: RegionData[] = [];
        partsCollection.forEach(
          (
            partDoc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
          ) => {
            partNames.push(new RegionData(null, partDoc.get("name")));
          }
        );
        buffer.push(
          new RecordingData(
            doc.get("timestamp"),
            doc.get("name"),
            partNames,
            doc.get("length"),
            false,
            false,
            doc.get("license"),
            doc.get("userID"),
            ["language"]
          )
        );
      } //foreach doc
        uploadedRecordings.value = buffer;
        if(buffer.length == 0){
          errorMessage.value = "Du hast auf diesem Account keine hochgeladenenen Aufnahmen";
        }
      }catch(error){
          errorMessage.value = "Verbindung zur Datenbank konnte nicht aufgebaut werden. Möglicherweise bist du nicht mir dem Internet verbunden";
      }
    };
    const refresh = async (event: any) => {
      await await await loadRecordingsFromDatabase();
      await event.target.complete();
    };

    //https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
    function generateUUID() {
      // Public Domain/MIT
      let d = new Date().getTime(); //Timestamp
      let d2 =
        (typeof performance !== "undefined" &&
          performance.now &&
          performance.now() * 1000) ||
        0; //Time in microseconds since page-load or 0 if unsupported
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          let r = Math.random() * 16; //random number between 0 and 16
          if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
          } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
          }
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
      );
    }

    /* eslint-disable @typescript-eslint/camelcase */
    FileSelector.addListener("onFilesSelected", async (data) => {
      //bei einem doppelklick kann es passieren, dass der eventhandler 2 mal aufgerufen wird!!!
      for (let i = 0; i < data.length; i++) {
        const blob = new Blob([data.item(i)], { type: data.item(i).type });
        const buf = await blob.arrayBuffer();
        //convert buf to mp3
        new AudioContext().decodeAudioData(buf, function (decodedBuffer) {
          const arrBuffer: ArrayBuffer = convertToMp3(decodedBuffer);
          const uuid = generateUUID();
          //upload metadata
          const nameWithFileExtension = data.item(i).name;
          const nameWithout =  nameWithFileExtension.substring(0, nameWithFileExtension.lastIndexOf('.'));
          db.collection("users")
            .doc(currentUser.uid)
            .collection("recordings")
            .doc(uuid)
            .set(
              {
                userID: currentUser.uid,
                timestamp: data.item(i).lastModified,
                name: "external: " + nameWithout,
                length: decodedBuffer.duration,
                license: getLicense(),
              },
              { merge: true }
            );
          //upload arraybuffer
          const base64String = arrayBufferToBase64String(arrBuffer);

          db.collection("users")
            .doc(currentUser.uid)
            .collection("recordings")
            .doc(uuid)
            .collection("parts")
            .doc("complete")
            .set({
              data: base64String,
              name: "complete",
            });
        });
      }
    });

    const uploadExternal = async () => {
      let ext = ["audios"];
      ext = ext.map((v) => v.toLowerCase());

      await FileSelector.fileSelector({
        multiple_selection: true,
        ext: ext,
      });
    };

    loadRecordingsFromDatabase();

    return { t, refresh, uploadedRecordings, errorMessage, uploadExternal };
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
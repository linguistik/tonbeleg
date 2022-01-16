<template>
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
} from "@ionic/vue";

import RecordingData from "@/scripts/RecordingData";
import Recording from "@/components/Recording.vue";

import firebase from "@/backend/firebase-config";

export default defineComponent({
  name: "TabAccount",

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
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const uploadedRecordings: Ref<RecordingData[]> = ref([]);
    const errorMessage = ref(
      "Du hast auf diesem Account keine gespeicherten Aufnahmen oder du bist nicht mit dem Internet verbunden"
    );

    const loadRecordingsFromDatabase = async () => {
      const buffer: RecordingData[] = [];

      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;

      await db
        .collection("users")
        .doc(userUID)
        .collection("recordings")
        .get()
        .then((collection) => {
          collection.forEach((doc) => {
            buffer.push(
              new RecordingData(
                doc.get("timestamp"),
                doc.get("name"),
                [], //create array with length = doc.get("data").length();
                doc.get("length"),
                false,
                false,
                doc.get("license"),
                doc.get("userID"),
                ["language"]
              )
            );
          });
        });

      uploadedRecordings.value = buffer;
    };
    const refresh = async (event: any) => {
      await loadRecordingsFromDatabase();
      event.target.complete();
    };

    loadRecordingsFromDatabase();

    return { t, refresh, uploadedRecordings, errorMessage };
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
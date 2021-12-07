<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Einstellungen</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list lines="full">
        <ion-item>
          <ion-button slot="start" @click="logOut"> Abmelden </ion-button>
          <ion-label>
            <p>{{ mail }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label text-wrap>
            <h2></h2>
            <p>Tonbelege nur im Wlan hochladen.</p>
          </ion-label>
          <ion-toggle
            slot="start"
            name="RecordingWifi"
            v-bind:checked="wifiOnlyActivated"
            @IonChange="optionChanged($event)"
          ></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";
import { ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonToggle,
  IonLabel,
  IonList,
  IonButton,
} from "@ionic/vue";

import "firebase/firestore";
import { setWifi, getWifi } from "@/scripts/UserSettingsStorage";
import firebase from "@/backend/firebase-config";
import router from "@/router";

export default defineComponent({
  components: {
    PageHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonItem,
    IonToggle,
    IonLabel,
    IonList,
    IonButton,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const wifiOnlyActivated = ref(false);

    const mail = ref("");

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    if (currentUser.email != null) {
      mail.value = currentUser.email;
    }

    const optionChanged = (event: any) => {
      wifiOnlyActivated.value = !wifiOnlyActivated.value;
      setWifi(wifiOnlyActivated.value);
    };

    const logOut = () => {
      firebase.auth().signOut();
      router.push("/");
    };

    return { t, optionChanged, wifiOnlyActivated, mail, logOut };
  },
});
</script>
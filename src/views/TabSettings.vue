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
            slot="end"
            name="RecordingWifi"
            v-bind:checked="wifiOnlyActivated"
            @IonChange="optionChanged($event)"
          ></ion-toggle>
        </ion-item>

      <ion-button expand="block" @click="deleteAcc()">Account löschen</ion-button>
      <ion-button expand="block" @click="deleteData()">Alle Aufnahmen löschen</ion-button>
        
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
  alertController
} from "@ionic/vue";

import { setWifi } from "@/scripts/UserSettingsStorage";
import firebase from "@/backend/firebase-config";
import router from "@/router";
import {removeAllRecordingEntry} from "@/scripts/RecordingStorage"
import {deleteUserSettings} from "@/scripts/UserSettingsStorage";

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

    /**
     *triggered when the user changes his upload via wifi settings
     */
    const optionChanged = (event: any) => {
      wifiOnlyActivated.value = !wifiOnlyActivated.value;
      setWifi(wifiOnlyActivated.value);
    };

    /**
     * deletes the users acc in teh database
     */
    const deleteAccInDatabase = async () =>{
      //TODO
      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so user can be deleted\n\n");
        return;
      }

      /*currentUser.delete().then(() => {
        // User deleted.
      }
      ).catch((error) => {
        // An error ocurred
        // ...
      });*/
      }



    const logOut = () => {
      firebase.auth().signOut();
      router.push("/");
    };

    const yesDeleteAcc = () =>{
      removeAllRecordingEntry(); //ich glaube es ist wichtig dass das zuerst passiert
      deleteUserSettings()
      deleteAccInDatabase();
    }


    /**
     * creates an alert asking the user if he really wants to delete his account
     */
    const deleteAcc = async () =>{
      const alert = await alertController.create({
        message: 'Do you really want to delete this account along with all the local recordings permanently?',
        buttons: [{
          text:'Cancel',
          handler: () =>{
            console.log('confirm Cancel');
          },
        }, {
          text: 'OK',
          handler: () =>{
            yesDeleteAcc();
          },
        }],
      });
      await alert.present();
    }

    /**
     * creates an alert asking the user if he really wants to delete all his recordings on the device
     */
    const deleteData = async () =>{
      const alert = await alertController.create({
        message: 'Do you really want to delete all the local recordings permanently?',
        buttons: [{
          text:'Cancel',
          handler: () =>{
            console.log('confirm Cancel');
          },
        }, {
          text: 'OK',
          handler: () =>{
            removeAllRecordingEntry();
          },
        }],
      });
      await alert.present();
    }

    return { t,
    optionChanged,
      wifiOnlyActivated,
      deleteAcc,
      deleteData,
      mail, logOut, removeAllRecordingEntry, deleteUserSettings,
      yesDeleteAcc,
    }
  }
})
</script>
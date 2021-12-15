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
        
        
    <ion-item>
      <ion-label text-wrap>
        <p> Account löschen</p>
      </ion-label>
      <ion-button @click="deleteAcc()"></ion-button>
    </ion-item>

    <ion-item>
      <ion-label text-wrap>
        <p> Alle Aufnahmen löschen</p>
      </ion-label>
      <ion-button @click="deleteData()"></ion-button>
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

    const optionChanged = (event: any) => {
      wifiOnlyActivated.value = !wifiOnlyActivated.value;
      setWifi(wifiOnlyActivated.value);
    };

    const deleteAccInDatabase = async () =>{
      //TODO
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so user can be deleted\n\n");
        return;
      }

      try {
        //await currentUser.delete();
      }
      catch(error){
        //TODO
        //problem ist rauszufinden welche sign in methode
        const providerId = currentUser.providerId;
        if(providerId == "www.google.com"){
         //TODO pls help i cant do it
        }
      }
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
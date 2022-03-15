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
            @IonChange="optionChanged()"
          ></ion-toggle>
        </ion-item>

        <div  style="margin-left: 10%;margin-right: 10%;">
          <ion-button  expand="block"
                     color="primary"
                     class="ion-margin-top"
                     @click="onChangePassword()">  Passwort ändern</ion-button>

          <ion-button  expand="block"
                   color="clear"
                   class="ion-margin-top"

                   @click="deleteData()"> <p style="color:red"> Alle Aufnahmen löschen </p></ion-button>

          <ion-button  expand="block"
                       color="clear"
                       class="ion-margin-top"

                       @click="deleteAcc()"> <p style="color:red"> Account löschen </p> </ion-button>
          </div>
        
      </ion-list>
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
  IonItem,
  IonToggle,
  IonLabel,
  IonList,
  IonButton,
  alertController, toastController
} from "@ionic/vue";

import { setWifi } from "@/scripts/UserSettingsStorage";
import firebase from "@/backend/firebase-config";
import router from "@/router";
import {removeAllRecordingEntry} from "@/scripts/RecordingStorage"
import {deleteUserSettings} from "@/scripts/UserSettingsStorage";
export default defineComponent({
  name: "TabSettings",
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
    const optionChanged = () => {
      wifiOnlyActivated.value = !wifiOnlyActivated.value;
      setWifi(wifiOnlyActivated.value);
    };

    /**
     *log the user out and send him to the login page
     */
    const logOut = () => {
      firebase.auth().signOut();
      router.push("/");
    };

    /**
     * deletes the users acc in teh database
     */
    const deleteAccInDatabase = async () =>{
      //TODO
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so user can be deleted\n\n");
        return;
      }
      else{
        try {
          await currentUser.delete();
          console.log("deleted")
          await router.push("/");
        }
        catch{
          let provider ;

          const result = await currentUser.getIdTokenResult(false).then((res)=>res.signInProvider);
          if(result==null){
            return
          }
          console.log("authenticating");
          let credential;
          if(result.includes("google.com")){
            provider = new firebase.auth.GoogleAuthProvider();
            credential = await currentUser.reauthenticateWithPopup(provider);

            if(credential.credential==null){
              console.log("credential null")
              return
            }
            console.log("popUpDone")
            await currentUser.reauthenticateWithCredential(credential.credential);
            console.log("authenticated")
            await currentUser.delete();
            console.log("deleted")
            await router.push("/");
          }
          if(result.includes("password")){
            console.log("password, so pls sign in again")
            const toast = await toastController
                .create({
                  message: 'Your have not signed in lately, pls sign in again',
                  position: 'middle',
                  duration: 1200
                })
            await toast.present();
            logOut();
          }
        }
      }
    }

    /**
     * actually deletes the recordings, the users data and the account in firebase
     */
    const yesDeleteAcc = () =>{
      console.log("deletingRecordings")
      removeAllRecordingEntry(); //delete all recordings on the device
      //console.log("delete user settings")
      deleteUserSettings()     //delete the usersettings
      console.log("delete acc in database")
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
            removeAllRecordingEntry(); //deletes all recordings
          },
        }],
      });
      await alert.present();
    }

    const onChangePassword = ()=>{
      router.push("/changePassword");
    }

    return { t,
    optionChanged,
      wifiOnlyActivated,
      deleteAcc,
      deleteData,
      mail, logOut, removeAllRecordingEntry, deleteUserSettings,
      yesDeleteAcc,
      onChangePassword,
    }
  }
})
</script>
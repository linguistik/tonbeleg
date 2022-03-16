<template>
  <ion-page :key="updateKey">
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true" slot="fixed">
      <ion-card-modal v-show="openModal" >
        <ion-content fullscreen slot="fixed">
            <ion-item>
          <ion-label>Name:</ion-label>
          <ion-input
            v-model="newName"
            placeholder="wähle einen Namen"
            maxlength="20"
            minlength="1"
            inputmode="text"
            v-model:value="lastRecording.name"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Sprache festlegen</ion-label>
          <ion-select v-model="newLanguage">
            <ion-select-option v-for="[short, language] in languages" v-bind:key="short" v-bind:value="short">{{language}}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>Lizenz bestimmen</ion-label>
          <ion-textarea v-show="!openLicenseModal" v-model="newLicense" v-model:value="exportedLicensePTR" v-model:placeholder="exportedLicensePTR" :disabled="true"></ion-textarea>
          <ion-button v-show="!openLicenseModal" @click="selectNewLicense()" v-model:name="exportedLicensePTR">Ändern</ion-button>
            <ion-card-modal v-show="openLicenseModal" :fullscreen="true">
              <ion-list slot="end">
              <ion-item>
                <ion-label text-wrap>
                  <h2>
                    Namensnennung
                  </h2>
                </ion-label>
                <ion-toggle
                    slot="start"
                    name = "isMentioningActivated"
                    @ionChange="optionChangedForPopUp($event)"
                    v-bind:checked="isMentioningActivated"
                    v-bind:disabled="isMentioningActivatedDeactivated"
                ></ion-toggle>
              </ion-item>

              <ion-item>
                <ion-label text-wrap>
                  <h2>
                    Kommerzielle Nutzung
                  </h2>
                </ion-label>
                <ion-toggle
                    slot="start"
                    name = "isComerciallyUseAllowed"
                    @ionChange="optionChangedForPopUp($event)"
                    v-bind:checked="isComerciallyUseAllowed"
                    v-bind:disabled="isComerciallyUseAllowedDeactivated"
                ></ion-toggle>
              </ion-item>

              <ion-item>
                <ion-label text-wrap>
                  <h2>
                    Bearbeitung
                  </h2>
                </ion-label>
                <ion-toggle
                    slot="start"
                    name="isRemixingAllowed"
                    @ionChange="optionChangedForPopUp($event)"
                    v-bind:checked="isRemixingAllowed"
                    v-bind:disabled="isRemixingAllowedDeactivated"
                ></ion-toggle>
              </ion-item>

              <ion-item>
                <ion-label text-wrap>
                  <h2>
                    Weitergabe unter beliebigen Bedingungen
                  </h2>
                </ion-label>
                <ion-toggle
                    slot="start"
                    name="isSharingAllowed"
                    @ionChange="optionChangedForPopUp($event)"
                    v-bind:checked="isSharingAllowed"
                    v-bind:disabled="isSharingAllowedDeactivated"
                ></ion-toggle>
              </ion-item>

              </ion-list>

              <div id="container">
                <ion-label text-wrap>
                  <h2>
                    Deine Lizenz
                  </h2>
                    <strong>{{licensePopUp}}</strong>
                </ion-label>
              </div>
              <ion-button @click="evaluateNewLicense()" slot="end">OK</ion-button>

            </ion-card-modal>
        </ion-item>

        <ion-button color="danger" @click="deleteLastRecording()"
          >Löschen</ion-button
        >
        <ion-button color="success" @click="saveChanges()"> Speichern</ion-button>
        </ion-content>
      </ion-card-modal>

      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Aufnehmen</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-fab v-show="!openModal" vertical="center" horizontal="center" slot="fixed">
        <ion-fab-button
          v-if="recordingStatus == recordingStatusEnums.NOT_RECORDING"
          color="success"
          v-on:click="startRecordingTrigger()"
        >
          <ion-icon :icon="caretForwardOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
          v-else-if="recordingStatus == recordingStatusEnums.DOING_SMT"
          color="medium-shade"
        >
          <ion-icon :icon="caretForwardOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
          v-else
          color="danger"
          v-on:click="stopRecordingTrigger()"
        >
          <ion-icon :icon="stopSharp"></ion-icon>
        </ion-fab-button>

        <!--  Pause and Resume  -->
        <ion-fab-button
          v-if="recordingStatus == recordingStatusEnums.IS_RECORDING"
          color="primary-contrast"
          v-on:click="pauseRecordingTrigger()"
        >
          <ion-icon :icon="pauseOutline"></ion-icon>
        </ion-fab-button>

        <ion-fab-button
          v-if="recordingStatus == recordingStatusEnums.RECORDING_PAUSED"
          color="primary-contrast"
          v-on:click="continueRecordingTrigger()"
        >
          <ion-icon :icon="playOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <div v-show="!openModal" id="text">
        <!--  Timer  -->
        <p>Zeit: {{ timerString }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/layout/PageHeader.vue";
import {
  setRecordingEntryLanguage,
  setRecordingEntryName,
  getRecordingEntry,
  setRecordingLicense,
    insertRecordingEntry,
    removeRecordingEntry,
} from "@/scripts/RecordingStorage";
import { onIonViewDidEnter, toastController} from "@ionic/vue";
import {UploadToFirebase} from "@/scripts/RecordingUpload";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonItem,
  IonSelect,
  IonButton,IonSelectOption,IonToggle,IonList,IonTextarea,
} from "@ionic/vue";
import {
  VoiceRecorder,
  GenericResponse,
  //RecordingData,
  // VoiceRecorderPlugin,
  // CurrentRecordingStatus
} from "capacitor-voice-recorder";

import {
  caretForwardOutline,
  stopSharp,
  playSkipForwardOutline,
  playOutline,
  pauseOutline,
} from "ionicons/icons";

import firebase from "@/backend/firebase-config";
import {
  Filesystem,
  Directory,
    Encoding,
} from "@capacitor/filesystem";
import RecordingData from "@/scripts/RecordingData";
import {getLicense, getFirstLanguage, setLicense, loadUserSettings} from "@/scripts/UserSettingsStorage";

import {
  isSharingAllowed,
  isSharingAllowedDeactivated,
  isRemixingAllowedDeactivated,
  isRemixingAllowed,
  isMentioningActivatedDeactivated,
  isMentioningActivated,
  isComerciallyUseAllowedDeactivated,
  isComerciallyUseAllowed,
  exportedLicensePTR,
  evaluateButtonSettingsFromLicense,
  evaluateLicenseAndDeactivations,
  optionChangedForPopUp,
  licensePopUp,
} from "@/scripts/LicenseSettings";

export default defineComponent({
  name: "TabRecord",
  components: {
    PageHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonFab,
    IonFabButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,IonButton,IonToggle,IonList,IonTextarea
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();

    const lastRecording = ref(
      new RecordingData(0, "", [], 0, false, false, "", "", [])
    );
    const openModal = ref(false);
    const openLicenseModal = ref(false);
    const newName = ref("");
    const newLanguage = ref([""]);
    const newLicense = ref("");

    const recordingAllowed = ref(false);
    loadUserSettings();

    const firstModalOpen = ref(true);

    const timer = ref(new Date(0));
    const timerString = ref(timer.value.toISOString().substr(11, 8));

    const languages: string[][]=[];

    const updateKey = ref(0);
    const forceUpdate = ()=>{
      updateKey.value += 1;
    }


    //https://expertcodeblog.wordpress.com/2018/07/05/typescript-sleep-a-thread/


    // sources for voice recorder: https://github.com/tchvu3/capacitor-voice-recorder#usage
    try {
      // checks if microphone exists otherwise messages user

      VoiceRecorder.canDeviceVoiceRecord()
        .then((result: GenericResponse) => {
          console.log(`Gibt es ein Mic? ${result.value}`);
        })
        .catch((error) => {
          console.log(error);
        });

      // browser asks user for microphone permissions in popup window
      VoiceRecorder.requestAudioRecordingPermission()
        .then((result: GenericResponse) => {
          console.log(`Ist das Mic eingeschaltet? ${result.value}`);
          recordingAllowed.value = result.value;
        })
        .catch((error) => {
          console.log(error);
        });


      VoiceRecorder.hasAudioRecordingPermission()
        .then((result: GenericResponse) => {
          console.log(`Darf die App aufzeichnen? ${result.value}`);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }

    const recordingStatusEnums = {
      NOT_RECORDING: 0,
      IS_RECORDING: 1,
      RECORDING_PAUSED: 2,
      DOING_SMT: 3,
    };

    // Start & Stop Recoding
    const recordingStatus = ref(recordingStatusEnums.NOT_RECORDING);

    /**
     * pause recording
     */
    const pauseRecordingTrigger = async () => {
      await VoiceRecorder.pauseRecording()
        .then(() => {
          recordingStatus.value = recordingStatusEnums.RECORDING_PAUSED;
          console.log(recordingStatus);
        })
        .catch((error) => {
          recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
          console.log(error);
        });
    };

    /**
     * continue recording
     */
    const continueRecordingTrigger = async () => {
      await VoiceRecorder.resumeRecording()
        .then(() => {
          recordingStatus.value = recordingStatusEnums.IS_RECORDING;
          console.log(recordingStatus);
        })
        .catch((error) => {
          recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
          console.log(error);
        });
    };

    /**
     * starts the recording and tells the user if this is not possible
     */
    const startRecordingTrigger = async () => {
      if(openModal.value==false) {
        timer.value.setSeconds(0);
        if(recordingAllowed.value == false){
          const toast = await toastController
              .create({
                message: 'Website cannot record audio. Make sure to give microphone permission to this website.',
                position: 'middle',
                duration: 2000
              })
          return toast.present();
        }
        recordingStatus.value = recordingStatusEnums.DOING_SMT;
        await VoiceRecorder.startRecording()
            .then((result: GenericResponse) => {
              console.log(recordingStatus);
              console.log(result.value);
            })
            .catch((error) => {
              recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
              console.log(error);
            });
        recordingStatus.value = recordingStatusEnums.IS_RECORDING;
      }
    };

    /**
     * stop the recording and save it
     */
    const stopRecordingTrigger = async () => {
      await loadUserSettings();
      recordingStatus.value = recordingStatusEnums.DOING_SMT;
      let recordingData;
      console.log(recordingStatus);
      try { //stop the voicerecorder and set the recording Status to "not_recording"
        recordingData = await VoiceRecorder.stopRecording();
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        console.log(recordingData.value);
      } catch (error) {
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        console.log(error);

        //TODO error handling
        return;
      }
      //get userUID
      const currentUser = firebase.auth().currentUser; //authenticate user in firebase
      if (currentUser == null) return;
      const userUID = currentUser.uid;

      //create timestamp
      const timestamp = Date.now();

      //create folder for the specific user and save to "Directory.Data" if it does not exist already
      try {
        await Filesystem.mkdir({
          path: "/" + userUID,
          directory: Directory.Data,
        });
      } catch (error) {
        if (error.message == "Current directory does already exist.") {
          console.log("file exists already");
        } else {
          console.log(error);
        }
      }
      // create folder for the timestamp
      try {
        await Filesystem.mkdir({
          path: "/" + userUID + "/" + timestamp,
          directory: Directory.Data,
        });
      } catch (error) {
        console.log(error);
        //if that folder does already exist or cannot be created, we stop here. The data will be lost
        //TODO fix this
        return;
      }

      console.log(
        "write to:" + "/" + userUID + "/" + timestamp + "/" + "0.raw"
      );

      //write file
      try {
        await Filesystem.writeFile({
          path: "/" + userUID + "/" + timestamp + "/" + "0.raw",
          data: recordingData.value.recordDataBase64,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
      } catch (error) {
        console.log(error);
        //TODO exception handling
      }
      const dateObject = new Date(timestamp);
      const shownName =
        dateObject.getUTCDate().toString() +
        "." +
        (dateObject.getMonth() + 1).toString() +
        "." +
        dateObject.getFullYear().toString() +
        ", " +
        dateObject.getHours().toString() +
        ":" +
        (dateObject.getMinutes() <= 9
          ? +"0" + dateObject.getMinutes().toString()
          : +dateObject.getMinutes().toString());
      //create Entry in RecordingStorage
      insertRecordingEntry(
        new RecordingData(
          timestamp,
          shownName,
          [],
          timer.value.getSeconds(),
          false,
          false,
          getLicense(),
          currentUser.uid,
          getFirstLanguage()
        )
      );
      newLanguage.value = getFirstLanguage();
      openModal.value = !openModal.value;
      openLicenseModal.value = false;
      await loadUserSettings();
      exportedLicensePTR.value = getLicense();
      await evaluateButtonSettingsFromLicense();
      lastRecording.value = getRecordingEntry(timestamp);
      timer.value = new Date(0);
      timerString.value = timer.value.toISOString().substr(11, 8);
    };


    /**
     * handles timer
     */
    const timerHandler = async () => {
      if (recordingStatus.value == recordingStatusEnums.IS_RECORDING) {
        timer.value.setSeconds(timer.value.getSeconds() + 1);
        timerString.value = timer.value.toISOString().substr(11, 8);
      }
    };

    /**
     * reset all the values the user might have changed before saving the recording
     */
    const clearVariables = async () => {
      newName.value = "";
      newLanguage.value = [""];
      newLicense.value = "";
      firstModalOpen.value = true;
    };

    /**
     * deletes the last recording in case the user doesnt want it
     */
    const deleteLastRecording = async () => {
      removeRecordingEntry(lastRecording.value); //deletes the last recording
      await clearVariables();
      exportedLicensePTR.value = getLicense();  //reset the license value to the global license
      evaluateButtonSettingsFromLicense();      //set the toggles accordingly
      openModal.value = !openModal.value;
      openLicenseModal.value = !openLicenseModal.value;
      const toast = await toastController
          .create({
            message: 'Your recording has been deleted',
            position: 'middle',
            duration: 1500
          })
      return toast.present();
    };

    setInterval(() => {
      timerHandler();
    }, 1000);



    /**
     * load languages for pop up window from database;
     */
    const loadLanguages = async () => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("languages").get();
      for(let i=0;i<18;i++){
        languages[i]=snapshot.get(i.toString())
      }
      console.log(languages)
    };
    
    const initData = async () => {
      await loadLanguages();
    }
    initData();

    /**
     * closes the licenses modal in the popUp
     */
    const selectNewLicense = async() =>{
      openLicenseModal.value=!openLicenseModal.value;
      setLicense(getLicense());
      exportedLicensePTR.value = getLicense();
      licensePopUp.value = getLicense();
      evaluateButtonSettingsFromLicense();
      forceUpdate();
    }

    /**
     * determines the license chosen by the user
     */
    const evaluateNewLicense = () =>{
      openLicenseModal.value=!openLicenseModal.value;
      evaluateLicenseAndDeactivations();
      newLicense.value = exportedLicensePTR.value;
    }

    /**
     * saves the changes the users makes to a recordings standard values just after recording(in the popUp)
     */
    const saveChanges = async () => {

      if (newName.value != "") {
        setRecordingEntryName(lastRecording.value.timestamp, newName.value);
      }
      if (newLanguage.value != [""]) {
        setRecordingEntryLanguage(lastRecording.value.timestamp,
          newLanguage.value
        );
      }
      if (newLicense.value != "") {
        await evaluateLicenseAndDeactivations();
        newLicense.value = exportedLicensePTR.value;
        setRecordingLicense(lastRecording.value.timestamp, newLicense.value);
      }
      await clearVariables();
      openModal.value = !openModal.value;
      openLicenseModal.value = !openLicenseModal.value;

      const toast = await toastController
          .create({
            message: 'Your recording has been saved',
            position: 'middle',
            duration: 700
          })
      return toast.present();
    };


    /**
     * when the RecordTab is entered selected recordings are uploaded to firebase if possible
     * happens also at each application start since RecordTab is the starting tab
     */
    onIonViewDidEnter(async () => {
      console.log('entering record page, uploading to firebase');
      await UploadToFirebase();
    });

    return {
      t,
      recordingStatus,
      startRecordingTrigger,
      stopRecordingTrigger,
      continueRecordingTrigger,
      pauseRecordingTrigger,
      getLicense,
      setRecordingEntryLanguage,
      setRecordingEntryName,
      setRecordingLicense,
      getFirstLanguage,
      caretForwardOutline,
      stopSharp,
      recordingStatusEnums,
      playSkipForwardOutline,
      playOutline,
      timerString,
      pauseOutline,
      openModal,
      openLicenseModal,
      selectNewLicense,
      evaluateNewLicense,
      saveChanges,
      deleteLastRecording,
      evaluateButtonSettingsFromLicense,
      evaluateLicenseAndDeactivations,
      optionChangedForPopUp,
      lastRecording,
      newName,
      newLanguage,
      newLicense,
      exportedLicensePTR,
      languages,
      isMentioningActivated,
      isComerciallyUseAllowed,
      isRemixingAllowed,
      isSharingAllowed,
      isMentioningActivatedDeactivated,
      isComerciallyUseAllowedDeactivated,
      isRemixingAllowedDeactivated,
      isSharingAllowedDeactivated,
      licensePopUp,
      updateKey,
    };
  },
});
</script>
<style scoped>
ion-fab-button {
  margin-bottom: 20px;
  padding: 0px;
  height: 80px;
  width: 80px;
}
p {
  font-size: x-large;
  text-align: center;
  position: relative;
  margin-top: 60px;
}
</style>
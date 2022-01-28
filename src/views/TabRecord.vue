<template>
  <ion-page>
    <PageHeader v-bind:title="t('general.appname')" />

    <ion-content :fullscreen="true">
      <ion-card-modal v-show="openModal"><!---brauch eig nen modal das kann man nicht wegklicken--->
        <ion-content fullscreen>
            <ion-item>
          <ion-label v-model:position="fixed">Name:</ion-label>
          <ion-input
            v-model="newName"
            placeholder="choose a Name"
            v-model:inputmode="text"
            v-model:value="lastRecording.name"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Select Language</ion-label>
          <ion-select v-model="newLanguage" v-model:value="getFirstLanguage()[0]" v-model:placeholder="getFirstLanguage()[0]">
            <ion-select-option v-for="[short,language] in languages" v-bind:key="short" v-bind:value="short">{{language}}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>Select License</ion-label>
          <ion-textarea v-show="!openLicenseModal" v-model="newLicense" v-model:value="lastRecording.license" v-model:placeholder="lastRecording.license" :disabled="true"></ion-textarea>
          <ion-button v-show="!openLicenseModal" @click="selectNewLicense()" v-model:name="licensePTR">change</ion-button>
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
                    @ionChange="optionChanged($event)"
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
                    @ionChange="optionChanged($event)"
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
                    @ionChange="optionChanged($event)"
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
                    @ionChange="optionChanged($event)"
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
                    <strong>{{licensePTR}}</strong>
                </ion-label>
              </div>
              <ion-button @click="evaluateNewLicense()" slot="end">OK</ion-button>

            </ion-card-modal>
        </ion-item>

        <ion-button color="danger" @click="deleteLastRecording()"
          >delete</ion-button
        >
        <ion-button color="success" @click="saveChanges()"> ok</ion-button>
        </ion-content>
      </ion-card-modal>

      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Aufnehmen</ion-title>
        </ion-toolbar>
      </ion-header>
      <!--  Hier ist der Button in der Mitte  -->
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
  removeLastRecordingEntry,
  getRecordingEntry,
  setRecordingLicense,
} from "@/scripts/RecordingStorage";
import {onIonViewDidEnter, toastController} from "@ionic/vue";
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
  //Encoding,
  //WriteFileResult,
  //ReaddirResult,
} from "@capacitor/filesystem";
//import { CapacitorException } from "@capacitor/core";

import { insertRecordingEntry } from "@/scripts/RecordingStorage";
import RecordingData from "@/scripts/RecordingData";
import {getLicense, getFirstLanguage, userSettings} from "@/scripts/UserSettingsStorage";
import { Encoding } from "@capacitor/filesystem";
import {loadUserSettings} from "@/scripts/UserSettingsStorage";
//import router from "@/router";

export default defineComponent({
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
    IonSelectOption,IonButton,IonToggle,IonList,IonTextarea,
  },

  setup() {
    // multi-lingual support
    const { t } = useI18n();
    //const timer =ref( 0);
    //PopUpValuesForRecording
    const lastRecording = ref(
      new RecordingData(0, "", [], 0, false, false, "", "", [])
    );
    const openModal = ref(false);
    const openLicenseModal = ref(false);
    const newName = ref("");
    const newLanguage = ref("");
    const newLicense = ref("");

    const recordingAllowed = ref(false);
    loadUserSettings();
    const licensePTR = ref(getLicense());
    const firstModalOpen = ref(true);

    const timer = ref(new Date(0));
    const timerString = ref(timer.value.toISOString().substr(11, 8));

    const options = new Map<string, boolean>([
      ["isMentioningActivated", false],
      ["isComerciallyUseAllowed", true],
      ["isRemixingAllowed", true],
      ["isSharingAllowed", true],
    ]);

    const isMentioningActivated = ref(false);
    const isComerciallyUseAllowed = ref(true);
    const isRemixingAllowed = ref(true);
    const isSharingAllowed = ref(true);

    const isMentioningActivatedDeactivated = ref(false);
    const isComerciallyUseAllowedDeactivated = ref(true);
    const isRemixingAllowedDeactivated = ref(true);
    const isSharingAllowedDeactivated = ref(true);

    const languages: string[][]=[];

    //7 different licenses
    const evaluateLicenseAndDeactivations = ()=>{
      if(options.get("isMentioningActivated")){
        //user does not want attribution
        //deactivate all other toggles
        isComerciallyUseAllowedDeactivated.value = false;
        isRemixingAllowedDeactivated.value = false;
        isSharingAllowedDeactivated.value = false;
        //set license
        licensePTR.value = "CC BY 4.0";

        //if one of the lower toggles is unchecked, deactivate the top one
        if(!(options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && options.get("isSharingAllowed"))){
          isMentioningActivatedDeactivated.value = true;

          licensePTR.value = "something else";
          //combinations of the last 3 values
          if(options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && !options.get("isSharingAllowed")){
            //BY-SA
            isRemixingAllowedDeactivated.value = true;
            licensePTR.value = "CC BY-SA 4.0";
          }else if(options.get("isComerciallyUseAllowed") && !options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
            //BY-ND
            isSharingAllowedDeactivated.value = true;
            licensePTR.value = "CC BY-ND 4.0";
          }else if(!options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
            //BY-NC
            licensePTR.value = "CC BY-NC 4.0";
          }else if(!options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && !options.get("isSharingAllowed")){
            //BY-NC-SA
            isRemixingAllowedDeactivated.value =true;
            licensePTR.value = "CC BY-NC-SA 4.0";
          }else if(!options.get("isComerciallyUseAllowed") && !options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
            //BY-NC-ND
            isSharingAllowedDeactivated.value = true;
            licensePTR.value = "CC BY-NC-ND 4.0";
          }else{
            console.log("ERROR");
          }
        }else{
          isMentioningActivatedDeactivated.value = false;
        }

      }else{
        isComerciallyUseAllowedDeactivated.value = true;
        isRemixingAllowedDeactivated.value = true;
        isSharingAllowedDeactivated.value = true;
        licensePTR.value = "CC0 1.0";
      }

    }

    const evaluateButtonSettingsFromLicense = async ()=>{
    await loadUserSettings();
    if(firstModalOpen.value==true) {
      licensePTR.value = getLicense();
      firstModalOpen.value = false;
    }
      if(licensePTR.value == "CC0 1.0"){
        return;//leave everything default
      }
      options.set("isMentioningActivated", true);
      isMentioningActivated.value = true;
      if(licensePTR.value.includes("NC")){
        options.set("isComerciallyUseAllowed", false);
        isComerciallyUseAllowed.value = false;
      }
      if(licensePTR.value.includes("SA")){
        options.set("isSharingAllowed", false);
        isSharingAllowed.value = false;
      }
      if(licensePTR.value.includes("ND")){
        options.set("isRemixingAllowed", false);
        isRemixingAllowed.value = false;
      }
      evaluateLicenseAndDeactivations();
    }

    //https://expertcodeblog.wordpress.com/2018/07/05/typescript-sleep-a-thread/
    //const delay = (ms: number)=>{return new Promise(resolve =>setTimeout(resolve,ms));};

    // Alles von hier: https://github.com/tchvu3/capacitor-voice-recorder#usage
    try {
      // Überprüfe ob ein Mic existiert.
      // z.B. Zeige eine Nachricht in der App an, dass ein Mic angeschlossen werden muss.
      VoiceRecorder.canDeviceVoiceRecord()
        .then((result: GenericResponse) => {
          console.log(`Gibt es ein Mic? ${result.value}`);
        })
        .catch((error) => {
          console.log(error);
        }); //Do remove the .catch block. The test won't like that

      // Der Browser fragt den Benutzer ob das Mikrofon aktiviert werden darf.
      // Das ist so ein kleines PopUp-Fenster im Browser.
      VoiceRecorder.requestAudioRecordingPermission()
        .then((result: GenericResponse) => {
          console.log(`Ist das Mic eingeschaltet? ${result.value}`);
          recordingAllowed.value = result.value;
        })
        .catch((error) => {
          console.log(error);
        }); //Do remove the .catch block. The test won't like that

      //
      VoiceRecorder.hasAudioRecordingPermission()
        .then((result: GenericResponse) => {
          console.log(`Darf die App aufzeichnen? ${result.value}`);
        })
        .catch((error) => {
          console.log(error);
        }); //Do remove the .catch block. The test won't like that
    } catch (error) {
      console.log(error);
    }

    const recordingStatusEnums = {
      NOT_RECORDING: 0,
      IS_RECORDING: 1,
      RECORDING_PAUSED: 3,
      DOING_SMT: 4,
    };
    // Start & Stop Recoding
    const recordingStatus = ref(recordingStatusEnums.NOT_RECORDING);

    const pauseRecordingTrigger = async () => {
      await VoiceRecorder.pauseRecording()
        .then(() => {
          recordingStatus.value = recordingStatusEnums.RECORDING_PAUSED;
          console.log(recordingStatus);
        })
        .catch((error) => {
          recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
          // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
          console.log(error);
        });
    };

    const continueRecordingTrigger = async () => {
      await VoiceRecorder.resumeRecording()
        .then(() => {
          recordingStatus.value = recordingStatusEnums.IS_RECORDING;
          console.log(recordingStatus);
        })
        .catch((error) => {
          recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
          // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
          console.log(error);
        });
    };
    const startRecordingTrigger = async () => {
      if(openModal.value==false) {
        timer.value.setSeconds(0);
        if(recordingAllowed.value == false){
          const toast = await toastController
              .create({
                message: 'Website cannot record audio. Make sure to give microphone permission to this website.',
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
              // "MISSING_PERMISSION", "ALREADY_RECORDING", "MICROPHONE_BEING_USED", "DEVICE_CANNOT_VOICE_RECORD", or "FAILED_TO_RECORD"
              console.log(error);
            });
        recordingStatus.value = recordingStatusEnums.IS_RECORDING;
      }
    };

    /*let audioRef = new Audio();
    const stopRecordingTrigger = async () =>{
      let recordingData;
      VoiceRecorder.stopRecording()
          .then((result: RecordingData) => {
            console.log(result.value);
            audioRef = new Audio(result.value.recordDataBase64)
            audioRef.oncanplaythrough = () => audioRef.play()
            audioRef.load()
          })
          .catch(error => console.log(error))
    };*/

    const stopRecordingTrigger = async () => {
      recordingStatus.value = recordingStatusEnums.DOING_SMT;
      let recordingData;
      console.log(recordingStatus);
      try {
        recordingData = await VoiceRecorder.stopRecording();
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        console.log(recordingData.value);
      } catch (error) {
        recordingStatus.value = recordingStatusEnums.NOT_RECORDING;
        // "RECORDING_HAS_NOT_STARTED" or "FAILED_TO_FETCH_RECORDING"
        console.log(error);

        //TODO error handling
        return;
      }

      //get userUID
      const currentUser = firebase.auth().currentUser;
      if (currentUser == null) return;
      const userUID = currentUser.uid;

      //create timestamp
      const timestamp = Date.now();

      //create folder for the specific user and safe to Directory.Data if it does not exist already
      try {
        await Filesystem.mkdir({
          path: "/" + userUID,
          directory: Directory.Data,
        });
      } catch (error) {
        if (error.message == "Current directory does already exist.") {
          //do nothing
          console.log("ahh yes the file is already created :D");
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
      //create Entry in RecordingStorage //evtl über alert
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
      openModal.value = !openModal.value;
      openLicenseModal.value = false;
      await loadUserSettings();
      licensePTR.value = getLicense();
      await evaluateButtonSettingsFromLicense();
      lastRecording.value = getRecordingEntry(timestamp);
      timer.value = new Date(0);
      timerString.value = timer.value.toISOString().substr(11, 8);
    }; //method: stopRecordingTrigger

    //Timer

    const timerHandler = async () => {
      if (recordingStatus.value == recordingStatusEnums.IS_RECORDING) {
        timer.value.setSeconds(timer.value.getSeconds() + 1);
        timerString.value = timer.value.toISOString().substr(11, 8);
        console.log(timer.value);
      }
    };

    const clearVariables = async () => {
      newName.value = "";
      newLanguage.value = "";
      newLicense.value = "";
      licensePTR.value = getLicense();
      await evaluateButtonSettingsFromLicense();
      firstModalOpen.value = true;
    };


    const deleteLastRecording = async () => {
      //TODO
      removeLastRecordingEntry();
      await clearVariables();
      openModal.value = !openModal.value;
      openLicenseModal.value = !openLicenseModal.value;
    };

    setInterval(() => {
      timerHandler(); // Now the "this" still references the component
    }, 1000);

    // Abspielen: https://github.com/tchvu3/capacitor-voice-recorder#playback

    /**
     * Sprachen für Pop-up Fenster aus DB laden;
     * Scheint zu funktionieren
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

    const selectNewLicense = async() =>{

      openLicenseModal.value=!openLicenseModal.value;
    }

    const evaluateNewLicense = () =>{
      openLicenseModal.value=!openLicenseModal.value;
      evaluateLicenseAndDeactivations()
      newLicense.value = licensePTR.value;
    }

    const optionChanged = (event: any)=>{
      options.set(event.target.name, event.target.checked);
      evaluateLicenseAndDeactivations();
      console.log("changingLicense");
    }

    const saveChanges = async () => {
      //TODO
      if (newName.value != "") {
        setRecordingEntryName(lastRecording.value.timestamp, newName.value);
      }
      if (newLanguage.value != "") {
        setRecordingEntryLanguage(lastRecording.value.timestamp, [
          newLanguage.value,
        ]);
      }
      //console.log(lastRecording.value.languages[0])
      if (newLicense.value != "") {
        //console.log("changingLicense")
        newLicense.value = licensePTR.value;
        setRecordingLicense(lastRecording.value.timestamp, newLicense.value);
      }
      await clearVariables();
      openModal.value = !openModal.value;
      openLicenseModal.value = !openLicenseModal.value;
    };


    onIonViewDidEnter(async () => {
      console.log('Home page will be left');
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
      optionChanged,
      lastRecording,
      newName,
      newLanguage,
      newLicense,
      licensePTR,
      languages,
      isMentioningActivated,
      isComerciallyUseAllowed,
      isRemixingAllowed,
      isSharingAllowed,
      isMentioningActivatedDeactivated,
      isComerciallyUseAllowedDeactivated,
      isRemixingAllowedDeactivated,
      isSharingAllowedDeactivated,

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
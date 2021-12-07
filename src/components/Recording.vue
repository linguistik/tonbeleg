<template>
  <ion-item v-if="isOpen">
    <ion-label>
      <strong>
        {{ recording.name }}
      </strong>
      <h5>
        Aufgenommen am:
        {{ getRecordingDate() }}
        <br>
      </h5>
    </ion-label>
    <ion-icon Left-icon :icon="playing ? pause : play" @click="playRec()"></ion-icon>
    <ion-icon :color= "selectedForUpload ? 'success' : 'medium' " :icon="arrowUp" @click="upload()" ></ion-icon>
    <ion-icon :icon="trash" @click="deleteRecording()"  ></ion-icon>
    <ion-icon :icon="pencil" @click="rename()"></ion-icon>
    <ion-icon :icon="cut" @click="edit()"></ion-icon>
    <ion-icon :icon="help" @click="changeLicense()"></ion-icon>
    <ion-icon :icon="chevronDownOutline" @click="toggleOpen()"></ion-icon>
  </ion-item>

  <ion-item v-else>
    <ion-label text-wrap>
      <strong>
        {{ recording.name }}
      </strong> </ion-label>
    <ion-icon  :icon="chevronBackOutline" @click="toggleOpen()"></ion-icon>
  </ion-item>
</template>


<script lang="ts">
import {ref} from "vue";

import {useI18n} from "vue-i18n";

import {arrowUp, chevronBackOutline, chevronDownOutline, cut, help, pause, pencil, play, trash} from "ionicons/icons";

import {alertController, IonIcon, IonItem, IonLabel} from "@ionic/vue";


import router from '@/router';
import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import firebase from "@/backend/firebase-config";

import RecordingData from "@/scripts/RecordingData";
import {
  getRecordingEntryUploadBoolean,
  removeRecordingEntry,
  setRecordingEntryName,
  setRecordingEntryUploadBoolean
} from "@/scripts/RecordingStorage";

export default {
  name: "Recording",
  components: {
    IonItem,
    IonIcon,
    IonLabel,
  },

  props: {
    recording: RecordingData,
  },

  setup(props: any, context: any) {
    // multi-lingual support

    const {t} = useI18n();

    const isOpen = ref(false);

    const playing = ref(false);
    const selectedForUpload = ref(props.recording.upload);

    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const UserUID = currentUser.uid;


    const getRecordingDate = () => {
      const date = new Date(parseInt(props.recording.timestamp));
      let day = date.getDate().toString();
      let month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      let hours = date.getHours().toString();
      let minutes = date.getMinutes().toString();

      if(minutes.length==1){
        minutes ="0" + minutes; 
      }
      if(hours.length==1){
        hours = "0" + hours;
      }
      if(month.length==1){
        month = "0" + month;
      }
      if(day.length==1){
        day = "0" + day;
      }

      return (
          day +
          "." +
          month +
          "." +
          year +
          ", " +
          hours +
          ":" +
          minutes

      );
    };//method: getRecordingDate

    const edit = ()=>{
      router.push("/edit/" + props.recording.timestamp);
    }

    const changeLicense = async () =>{
      const alert = await alertController.create({
        message: 'Do you really want to delete this file?',
        buttons: [{
          text:'Cancel',
          handler: () =>{
            console.log('confirm Cancel');
          },
        }, {
          text: 'OK',
          handler: () =>{
            //TODO
          },
        }],
      });
      await alert.present();
    }

    const upload = () => {
      //TODO
      setRecordingEntryUploadBoolean(props.recording.timestamp, !props.recording.upload);
      selectedForUpload.value = !selectedForUpload.value;
      console.log("upload this thing", props.recording.upload);
    }

    const playRec = async () =>{
      //const audioRef = new Audio("/" + props.recording.userUID + "/" + props.recording.timestamp + "/" + "0.raw");
          const audioRef = await Filesystem.readFile({
            path: "/" + currentUser.uid + "/" + props.recording.timestamp + "/" + "0.raw",
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });

      const audioString = new Audio(audioRef.data);
      if(playing.value == false){
        //TODO
        audioString.oncanplay = () => audioString.play()
        audioString.load()
        playing.value = !playing.value
      }
      else{
        audioString.pause();
        playing.value = !playing.value
      }
    }

    const actualDelete = async () =>{
      removeRecordingEntry(props.recording);
      context.emit('refreshEmit');
    }//method: deleteFolder


    const actualRename = (name: string) => {//props.recording is just a copy of the real object
      setRecordingEntryName(props.recording.timestamp, name);
      context.emit('refreshEmit');
    }//method: actualRename

    const rename = async ()=> {
      //TODO
      const alert = await alertController.create({
        message: 'Choose a name',
        inputs: [
          {
            name:'textField',
            id: 'textField',
            type: 'text',
            attributes: {
              required: true,
              minlength: 1,
              maxlength: 20,
              inputMode: 'text',
            },
            handler: () => {
              console.log('texteingabe erfolgt');//is this handler really necessary? For some reason it is^^
            }
          }
        ],//inputs
        buttons:[{
          text: 'cancel',
          handler: ()=>{
            console.log('confirm cancel');
          },
        },
          {
          text: 'OK',
            handler: (data) =>{
                const x = data.textField;
                console.log(x);
                actualRename(x);
            }
        }
        ]//buttons
      });//create alert
      await alert.present();
    }//method rename

    const deleteRecording = async (folder: string)=>{
      //TODO delete entry in outsourced
      const alert = await alertController.create({
        message: 'Do you really want to delete this file?',
        buttons: [{
          text:'Cancel',
          handler: () =>{
            console.log('confirm Cancel');
          },
        }, {
          text: 'OK',
          handler: () =>{
            actualDelete();
          },
        }],
      });
      await alert.present();
    }//method: deleteRecording


    return {
      t,
      trash,
      arrowUp,
      pencil,
      cut,
      chevronDownOutline,
      chevronBackOutline,
      isOpen,
      play,
      pause,
      help,
      toggleOpen,
      getRecordingDate,
      edit,
      upload,
      deleteRecording,
      rename,
      playRec,
      playing,
      selectedForUpload,
      getRecordingEntryUploadBoolean,
      changeLicense,
    };//return

  },//setup


};//export default

</script>
<style scoped>
ion-icon {
  position: unset;
  right: 0px;
  top: 0;
}
ion-item {
  /* --min-height: 100px;*/
}
ion-contenc {
  --scroll-x: false;
  --scroll-y: false;
  scroll-x: false;
  scroll-y: false;
}
</style>
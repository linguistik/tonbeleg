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
    <ion-icon :icon="arrowUp" @click="upload()"></ion-icon>
    <ion-icon :icon="trash" @click="delteRecording()"  ></ion-icon>
    <ion-icon :icon="pencil" @click="rename()"></ion-icon>
    <ion-icon :icon="cut" @click="edit()"></ion-icon>
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

import {arrowUp, pencil, trash, chevronDownOutline, chevronBackOutline, cut} from "ionicons/icons";


import {IonIcon, IonItem, IonLabel} from "@ionic/vue";
import {alertController} from "@ionic/vue";


import router from '@/router';
import {Directory, Filesystem} from "@capacitor/filesystem";
import firebase from "@/backend/firebase-config";

import RecordingData from "@/scripts/RecordingData";
import {removeRecordingEntry, setRecordingEntryName} from "@/scripts/RecordingStorage";

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

    const upload = () => {
      //TODO
      console.log("updload this thing");
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

    const delteRecording = async (folder: string)=>{
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
      toggleOpen,
      getRecordingDate,
      edit,
      upload,
      delteRecording,
      rename,
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
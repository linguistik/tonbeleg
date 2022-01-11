<template>

  <ion-item>
    <ion-grid>
    <ion-row>
    <ion-col size="2">
    <ion-icon 
      :icon="removeCircle"
      @click="removeFromParent()"
      color="danger"
      size="large"
    ></ion-icon>
    </ion-col>
    <ion-col>
      <ion-select v-model="input" @ionChange="inputChanged" value="English">
              <ion-select-option v-for="[short,language] in loadLanguages()" v-bind:key="short" v-bind:value="short">{{language}}</ion-select-option>
      </ion-select>
    </ion-col>
    </ion-row>
    </ion-grid>
 </ion-item>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { IonIcon, IonItem, IonSelect, IonGrid, IonRow, IonCol, IonSelectOption } from "@ionic/vue";

import { removeCircle } from "ionicons/icons";
import firebase from '@/backend/firebase-config';
import 'firebase/firestore';

export default defineComponent({
  components: {
    IonItem,
    IonIcon,
    IonSelect,
    IonGrid,
    IonRow,
    IonCol,
    IonSelectOption,

  },

  props: {
    id: Number,
  },


  setup(props: any, context: any) {
    async function loadLanguages() {
      const languages: string[][]=[];
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("languages").get();
      for(let i=0;i<18;i++){
        languages[i]=snapshot.get(i.toString())
      }
      console.log(languages[0])
      return languages;
    }
    const input = ref();
    const removeFromParent = () => {
      context.emit("remove", props.id);
    };
    const inputChanged = () => {
      context.emit("change", input.value, props.id);
    };
    


    const initName = (name: string, index: number) => {

      if(props.id != index){console.log("hier is5t was schief gegangen")}
      input.value=name;

    };
    return { removeCircle, removeFromParent, inputChanged, input, initName, 
        loadLanguages
    };
  },
});
</script>

<style scoped>
ion-row{
  padding: 0px;
  margin: 0px;
}
ion-col{
  padding: 0px;
  margin: 0px;
}
ion-grid{
  padding: 0px;
  margin: 0px;
}

</style>
<template>

  <ion-item>
    <ion-grid>
    <ion-row>
    <ion-col size="1">
    <ion-icon 
      :icon="removeCircle"
      @click="removeFromParent()"
      color="danger"
      size="large"
    ></ion-icon>
    </ion-col>
    <ion-col>
      <ion-item>
      <ion-label>
            Zweitsprache wählen
          </ion-label>
      <ion-select v-model="input" @ionChange="inputChanged()" >
        <ion-select-option 
            v-for="[short,language] in languages" 
            v-bind:key="short" 
            v-bind:value="short">
          {{language}}
        </ion-select-option>
      </ion-select>
      </ion-item>
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
  name: "MultipleElementsChild",
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
    const languages: string[][]=[];
    const input = ref("");
    let tempLang = " ";
    const loadLanguages = async() => {
      const db = firebase.firestore();
      const snapshot = await db.collection("data").doc("languages").get();
      for(let i=0;i<18;i++){
        languages[i]=snapshot.get(i.toString())
      }
    }
    const initData = async () => {
      await loadLanguages();
      input.value=tempLang;
      // context.emit("change", input.value, props.id);
    };
    initData();
    
    const removeFromParent = () => {
      context.emit("remove", props.id);
    };
    const inputChanged = () => {
      context.emit("change", input.value, props.id);
    };

    /**
     * sets saved name on first load
     * @param name, saved name
     * @param index, index of child elements to make sure, correct child element gets the name
     */
    const initName = (name: string, index: number) => {

      if(props.id != index){console.log("hier is5t was schief gegangen")}
      tempLang=name;

    };
    return { removeCircle, removeFromParent, inputChanged, input, initName, 
         languages, initData, loadLanguages
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
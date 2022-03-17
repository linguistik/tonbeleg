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
            v-for="[short,language] in languagesGlobal"
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
import {loadLanguagesFromFirebase,languagesGlobal} from "@/scripts/loadingFromDataBase";
import { IonIcon, IonItem, IonSelect, IonGrid, IonRow, IonCol, IonSelectOption, IonLabel } from "@ionic/vue";

import { removeCircle } from "ionicons/icons";
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
    IonSelectOption, IonLabel,

  },

  props: {
    id: Number,
  },


  setup(props: any, context: any) {
    const input = ref("");
    const tempLanguage = " ";


    /**
     *initializes child component with empty name and laods all languages
     */
    const initData = async () => {
      await loadLanguagesFromFirebase();
      input.value=tempLanguage;
    };
    initData();

    /**
     * emits deletion of this child to parent element
     */
    const removeFromParent = () => {
      context.emit("remove", props.id);
    };

    /**
     * emits a changed input value of this child to parent element
     */
    const inputChanged = () => {
      context.emit("change", input.value, props.id);
    };

    /**
     * sets saved name on first load
     * @param name, saved name
     * @param index, index of child elements to make sure, correct child element gets the name
     */
    const initName = (name: string, index: number) => {
      if(props.id != index){console.log("err: shouldn`t exist")}
      input.value=name;

    };

    return {
      removeCircle,
      removeFromParent,
      inputChanged,
      input,
      initName,
      initData,
      languagesGlobal,

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
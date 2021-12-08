<template>

  <ion-item>
    <ion-label>
      {{ text }}
    </ion-label>
    <ion-icon
      :icon="addCircle"
      @click="addChildElement()"
      color="success"
    ></ion-icon>
  </ion-item>
  <MultipleElementsChild

      v-for="item in children"
      v-bind:key="item"
      v-bind:id="item"
      :ref="form"
      @remove="remove"
      @change="childChanged"
  />
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";

import { IonIcon, IonItem, IonLabel } from "@ionic/vue";

import { addCircle } from "ionicons/icons";

import MultipleElementsChild from "@/components/dynamicElement/MultipleElementsChild.vue";

export default defineComponent({
  components: {
    IonItem,
    IonLabel,
    IonIcon,
    MultipleElementsChild,
  },

  props: {
    text: String,
  },

//ermöglicht auf alle kindelemente mit itemRefs[] zuzugreifen

  data() {
    return {
      itemRefs: []
    }
  },

  methods: {
    form(el: any) {
      if (el) {
        this.itemRefs.push(el)
      }
    }
  },

  beforeUpdate() {
    this.itemRefs = []
  },

  updated() {
    console.log(this.itemRefs)
  },
// bis hier


  setup(props: any, context: any) {

    const children: Ref<number[]> = ref([]);
    const data = new Map<number, string>();
    let lastIndex = 0;

    const addChildElement = () => {
      data.set(lastIndex, "");
      children.value.push(lastIndex++);
    };

    const emitChange = ()=>{
        const ret: string[] = [];
        data.forEach((value)=>{
            if(value!=""){
                ret.push(value);
            }
        });
        context.emit("valuesChanged", ret);
    }

    const remove = (id: number) => {
      const index = children.value.indexOf(id);
      if (index > -1) {
        children.value.splice(index, 1);
      }
      if(data.delete(id)){//element had data entry
          emitChange();
      }
    };


    const childChanged = (childData: string, id: number)=>{
        if(data.get(id)==childData){
            return;
        }
        if(!data.has(id)){
            return;
        }
        data.set(id, childData);
        emitChange();
    }


     const onInit  = async(languages: string[]) => {
      languages.forEach((value, index)=>{
        addChildElement();
        data.set(index, value);
      });
      console.log(data);


    };


    return { addCircle, addChildElement, children, remove,childChanged, onInit};
  },


});

</script>
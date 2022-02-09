import { ref } from "vue";

const toggleSwipeMenu = ref(true);
export const useMenuSettings = ()=>{
    return {toggleSwipeMenu}
}
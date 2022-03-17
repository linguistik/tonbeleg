import firebase from "@/backend/firebase-config";

export let dialectsGlobal: string[] = [];
export const languagesGlobal: string[][]=[];
/**
 * loads dialects from firebase
 */
export const loadDialectsFromFirebase = async () => {
    const db = firebase.firestore();
    const snapshot = await db.collection("data").doc("dialects").get();
    dialectsGlobal = snapshot.get("dialects");
};

/**
 * loads languages from firebase
 */
export const loadLanguagesFromFirebase = async () => {
    const db = firebase.firestore();
    const snapshot = await db.collection("data").doc("languages").get();
    const size = (await db.collection("data").doc("languages").get()).get("NoLanguages");
    for(let i=0;i<size;i++){
        languagesGlobal[i]=snapshot.get(i.toString())
    }
};
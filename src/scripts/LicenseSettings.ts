import {ref} from "vue";
import firebase from "@/backend/firebase-config";
import {getLicense, loadUserSettings, setLicense} from "@/scripts/UserSettingsStorage";
import {alertController, toastController} from "@ionic/vue";
import {setRecordingLicense} from "@/scripts/RecordingStorage";

/**
 * the current license value when configuring the license
 */
export const exportedLicensePTR = ref('CC0 1.0');
export const licenseLicenseTab = ref('CC0 1.0');
export const licensePopUp = ref('CC0 1.0');

/**
 * the options when configuring the license
 */
export const options = new Map<string, boolean>([
    ["isMentioningActivated", false],
    ["isComerciallyUseAllowed", true],
    ["isRemixingAllowed", true],
    ["isSharingAllowed", true],
]);

//since the checked property is one way bounded, these are only used for initialisation
export const isMentioningActivated = ref(false);
export const isComerciallyUseAllowed = ref(true);
export const isRemixingAllowed = ref(true);
export const isSharingAllowed = ref(true);

export const isMentioningActivatedDeactivated = ref(false);
export const isComerciallyUseAllowedDeactivated = ref(true);
export const isRemixingAllowedDeactivated = ref(true);
export const isSharingAllowedDeactivated = ref(true);

//7 different licenses
/**
 * determine the correct license according to the selected toggles
 */
export const evaluateLicenseAndDeactivations = ()=>{
    if(options.get("isMentioningActivated")){
        //user does not want attribution
        //deactivate all other toggles
        isComerciallyUseAllowedDeactivated.value = false;
        isRemixingAllowedDeactivated.value = false;
        isSharingAllowedDeactivated.value = false;
        //set license
        exportedLicensePTR.value = "CC BY 4.0";

        //if one of the lower toggles is unchecked, deactivate the top one
        if(!(options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && options.get("isSharingAllowed"))){
            isMentioningActivatedDeactivated.value = true;

            exportedLicensePTR.value = "something else";
            //combinations of the last 3 values
            if(options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && !options.get("isSharingAllowed")){
                //BY-SA
                isRemixingAllowedDeactivated.value = true;
                exportedLicensePTR.value = "CC BY-SA 4.0";
            }else if(options.get("isComerciallyUseAllowed") && !options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
                //BY-ND
                isSharingAllowedDeactivated.value = true;
                exportedLicensePTR.value = "CC BY-ND 4.0";
            }else if(!options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
                //BY-NC
                exportedLicensePTR.value = "CC BY-NC 4.0";
            }else if(!options.get("isComerciallyUseAllowed") && options.get("isRemixingAllowed") && !options.get("isSharingAllowed")){
                //BY-NC-SA
                isRemixingAllowedDeactivated.value =true;
                exportedLicensePTR.value = "CC BY-NC-SA 4.0";
            }else if(!options.get("isComerciallyUseAllowed") && !options.get("isRemixingAllowed") && options.get("isSharingAllowed")){
                //BY-NC-ND
                isSharingAllowedDeactivated.value = true;
                exportedLicensePTR.value = "CC BY-NC-ND 4.0";
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
        exportedLicensePTR.value = "CC0 1.0";
    }
}

/**
 * set the toggles correctly from the chosen and saved license
 */
export const evaluateButtonSettingsFromLicense = ()=>{
    if(exportedLicensePTR.value == "CC0 1.0"){
        return;//leave everything default
    }
    options.set("isMentioningActivated", true);
    isMentioningActivated.value = true;
    if(exportedLicensePTR.value.includes("NC")){
        options.set("isComerciallyUseAllowed", false);
        isComerciallyUseAllowed.value = false;
    }
    if(exportedLicensePTR.value.includes("SA")){
        options.set("isSharingAllowed", false);
        isSharingAllowed.value = false;
    }
    if(exportedLicensePTR.value.includes("ND")){
        options.set("isRemixingAllowed", false);
        isRemixingAllowed.value = false;
    }
    evaluateLicenseAndDeactivations();
}

/**
 * upload the license to firebase
 */
export const uploadLicense = ()=>{

    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const userUID = currentUser.uid;

    console.log("Start uploading");

    db.collection("users").doc(userUID).set({
        license: exportedLicensePTR.value
    },{merge: true});
    console.log("wrote to database");
}


/**
 * load the usersettings saved on the device and set the toggles according to that saved license
 */
export const loadLocalData = async () =>{
    const user = firebase.auth().currentUser;
    if (user == null) return;
    await loadUserSettings();
    exportedLicensePTR.value=getLicense();
    evaluateButtonSettingsFromLicense();
}

/**
 * set the license in the local usersettings and save it
 */
export const saveLocalData = async () =>{
    const user = firebase.auth().currentUser;
    if (user == null) return;
    setLicense(exportedLicensePTR.value);
    const toast = await toastController
        .create({
            message: 'Your license Changes have been saved',
            duration: 500
        })
    return toast.present();
}

/**
 * called when one of the toggles is triggered
 * evaluates the new license
 * saves the new license and uploads it to firebase
 * @param event the event from the toggle that was clicked
 */
export const optionChanged = (event: any)=>{
    options.set(event.target.name, event.target.checked);
    evaluateLicenseAndDeactivations();
    setLicense(exportedLicensePTR.value);
    licenseLicenseTab.value = exportedLicensePTR.value;
    saveLocalData();
    uploadLicense();
}

/**
 * called when one of the toggles in the popUp after a recording is stopped is triggered
 * @param event the event from the toggle that was clicked
 */
export const optionChangedForPopUp = (event: any)=>{
    options.set(event.target.name, event.target.checked);
    evaluateLicenseAndDeactivations();
    licensePopUp.value = exportedLicensePTR.value;
}

/**
 * called when one of the toggles in the popUp after a recording is stopped is triggered
 * @param event the event from the toggle that was clicked
 */
export const optionChangedForPopUpSavedTab= (name: any, checked: any)=>{
    options.set(name, checked);
    evaluateLicenseAndDeactivations();
    licensePopUp.value = exportedLicensePTR.value;
}

/**
 * changes the license of the recording
 */
export const changeLicense = async () => {
    await loadUserSettings();
    //exportedLicensePTR.value = props.recording.license;
    //licensePopUp.value = props.recording.license;
    //console.log(props.recording.license);
    evaluateButtonSettingsFromLicense();
    const alert = await alertController.create({
        message: licensePopUp.value,
        inputs:[{
            type: "checkbox",
            name: "isMentioningActivated",
            id: "checkbox1",
            label: "Namensnennung",
            checked: isMentioningActivated.value,
            disabled: isMentioningActivatedDeactivated.value,
            handler: async (event)=>{
                optionChangedForPopUpSavedTab(event.name, event.checked);
                evaluateButtonSettingsFromLicense();
                alert.message = licensePopUp.value;
                alert.inputs[0].checked = isMentioningActivated.value;
                alert.inputs[0].disabled = isMentioningActivatedDeactivated.value;
                alert.inputs[1].checked = isComerciallyUseAllowed.value;
                alert.inputs[1].disabled = isComerciallyUseAllowedDeactivated.value;
                alert.inputs[2].checked = isRemixingAllowed.value;
                alert.inputs[2].disabled = isRemixingAllowedDeactivated.value;
                alert.inputs[3].checked = isSharingAllowed.value;
                alert.inputs[3].disabled = isSharingAllowedDeactivated.value;
                await alert.present();
            }
        },
            {
                type: "checkbox",
                name: "isComerciallyUseAllowed",
                id: "checkbox2",
                label: "commercialUse",
                checked: isComerciallyUseAllowed.value,
                disabled: isComerciallyUseAllowedDeactivated.value,
                handler: async (event)=>{
                    optionChangedForPopUpSavedTab(event.name, event.checked);
                    evaluateButtonSettingsFromLicense();
                    alert.message = licensePopUp.value;
                    alert.inputs[0].checked = isMentioningActivated.value;
                    alert.inputs[0].disabled = isMentioningActivatedDeactivated.value;
                    alert.inputs[1].checked = isComerciallyUseAllowed.value;
                    alert.inputs[1].disabled = isComerciallyUseAllowedDeactivated.value;
                    alert.inputs[2].checked = isRemixingAllowed.value;
                    alert.inputs[2].disabled = isRemixingAllowedDeactivated.value;
                    alert.inputs[3].checked = isSharingAllowed.value;
                    alert.inputs[3].disabled = isSharingAllowedDeactivated.value;
                    await alert.present();
                }
            },
            {
                type: "checkbox",
                name: "isRemixingAllowed",
                id: "checkbox3",
                label: "editing",
                checked: isRemixingAllowed.value,
                disabled: isRemixingAllowedDeactivated.value,
                handler: async (event)=>{
                    optionChangedForPopUpSavedTab(event.name, event.checked);
                    evaluateButtonSettingsFromLicense();
                    console.log(licensePopUp.value);
                    alert.message = licensePopUp.value;
                    alert.inputs[0].checked = isMentioningActivated.value;
                    alert.inputs[0].disabled = isMentioningActivatedDeactivated.value;
                    alert.inputs[1].checked = isComerciallyUseAllowed.value;
                    alert.inputs[1].disabled = isComerciallyUseAllowedDeactivated.value;
                    alert.inputs[2].checked = isRemixingAllowed.value;
                    alert.inputs[2].disabled = isRemixingAllowedDeactivated.value;
                    alert.inputs[3].checked = isSharingAllowed.value;
                    alert.inputs[3].disabled = isSharingAllowedDeactivated.value;
                    await alert.present();
                }
            },
            {
                type: "checkbox",
                name: "isSharingAllowed",
                id: "checkbox4",
                label: "anyLicense",
                checked: isSharingAllowed.value,
                disabled: isSharingAllowedDeactivated.value,
                handler: async (event)=>{
                    optionChangedForPopUpSavedTab(event.name, event.checked);
                    evaluateButtonSettingsFromLicense();
                    alert.message = licensePopUp.value;
                    alert.inputs[0].checked = isMentioningActivated.value;
                    alert.inputs[0].disabled = isMentioningActivatedDeactivated.value;
                    alert.inputs[1].checked = isComerciallyUseAllowed.value;
                    alert.inputs[1].disabled = isComerciallyUseAllowedDeactivated.value;
                    alert.inputs[2].checked = isRemixingAllowed.value;
                    alert.inputs[2].disabled = isRemixingAllowedDeactivated.value;
                    alert.inputs[3].checked = isSharingAllowed.value;
                    alert.inputs[3].disabled = isSharingAllowedDeactivated.value;
                    await alert.present();
                }
            },
        ],
        buttons: [
            {
                text: "Cancel",
                handler: () => {
                    console.log("confirm Cancel");
                    exportedLicensePTR.value = getLicense();
                    evaluateButtonSettingsFromLicense();
                },
            },
            {
                text: "OK",
                handler: () => {
                    //setRecordingLicense(props.recording.timestamp, licensePopUp.value);
                    exportedLicensePTR.value = getLicense();
                    evaluateButtonSettingsFromLicense();
                },
            },
        ],
    });
    await alert.present();
};



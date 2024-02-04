import Controller from "sap/ui/core/mvc/Controller"
import JSONModel from "sap/ui/model/json/JSONModel"

/**
 * @namespace sap.ui.core.tutorial.odatav4
 */
export default class App extends Controller {
    public onInit(): void {
        const oJSONData = {
                busy : false
            },
        oModel = new JSONModel(oJSONData);

        this.getView()?.setModel(oModel, "appView");
    }    
} 

import UIComponent from "sap/ui/core/UIComponent";
import models from "./model/models";


/**
 * @namespace sap.ui.core.tutorial.odatav4
 */
export default class Component extends UIComponent {
	public static metadata : {
		manifest : "json"
	}

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls
	 * the init method once.
	 * @public
	 * @override
	 */
	public init() : void {
		super.init();

		// set the device model
		this.setModel(models.createDeviceModel(), "device");
	}	

}

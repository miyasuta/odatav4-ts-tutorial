"use strict";

sap.ui.define(["sap/ui/core/UIComponent", "./model/models"], function (UIComponent, __models) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const models = _interopRequireDefault(__models);
  /**
   * @namespace sap.ui.core.tutorial.odatav4
   */
  const Component = UIComponent.extend("sap.ui.core.tutorial.odatav4.Component", {
    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls
     * the init method once.
     * @public
     * @override
     */
    init: function _init() {
      UIComponent.prototype.init.call(this);

      // set the device model
      this.setModel(models.createDeviceModel(), "device");
    }
  });
  return Component;
});
//# sourceMappingURL=Component-dbg.js.map

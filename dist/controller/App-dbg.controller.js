"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
  "use strict";

  /**
   * @namespace sap.ui.core.tutorial.odatav4
   */
  const App = Controller.extend("sap.ui.core.tutorial.odatav4.App", {
    onInit: function _onInit() {
      const oJSONData = {
          busy: false
        },
        oModel = new JSONModel(oJSONData);
      this.getView()?.setModel(oModel, "appView");
    }
  });
  return App;
});
//# sourceMappingURL=App-dbg.controller.js.map

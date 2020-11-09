sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("ns.EBilliaApp.controller.SystemSettings", {

            onInit: function () {
                console.log("on login componet view");

            },
            goToMain:function () {
                 var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
                oRouter.navTo("main", {
             });
        }
           
        });
    })
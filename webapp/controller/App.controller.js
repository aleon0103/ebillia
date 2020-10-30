sap.ui.define([
		"sap/ui/core/mvc/Controller"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller) {
		"use strict";

		return Controller.extend("ns.EBilliaApp.controller.App", {
			onInit: function () {

            },
               handleListItemPress: function (oEvent) {
                   console.log('on login navigation')
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
                oRouter.navTo("login", {
                   
                });
            }
		});
	});

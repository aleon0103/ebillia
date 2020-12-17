// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/FormatterREP",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, FormatterREP, JSONModel, MessageToast,Device) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.MasterReviewForecast", {
            _oModel: null,
            formatter: FormatterREP,
            _proveedoresModel: null,

            onInit: function () {
                console.log('on init component view');
    
                this._proveedoresModel = new JSONModel({});
                this.getView().setModel(this._proveedoresModel, "proveedores");

                var oModel = new JSONModel({ busy: false });
                this.getOwnerComponent().setModel(oModel, "pronosticoModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("RevisionPronosticosDemanda").attachPatternMatched(this._routePatternMatched, this);

   
            },

            onAfterRendering: function () {
                console.log('on Master Review Forecast View After Render');

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE MATCH")

                this._oModel = this.getModel("user");

                var poModel = this.getModel("pronosticoModel");
                poModel.setProperty('/Count', 0);

                this._getPronosticos();

            },

         
            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    
                    this.onRefresh();
                    return;
                }

                var sQuery = oEvent.getParameter("query");

                if (sQuery) {
                    //	this._oListFilterState.aSearch = [new Filter("CustomerName", FilterOperator.Contains, sQuery)];
                    
                    this._getASNByNumber(sQuery);
                } else {
                    //	this._oListFilterState.aSearch = [];
                    this._getPronosticos();
                }

                var itemId = this.getView().byId("list");
                    itemId.removeSelections(true);

            },

            onRefresh: function () {
                this.byId("refresh0").hide();
                this._getPronosticos();
                this._showDetail(null);

                var itemId = this.getView().byId("list");
                    itemId.removeSelections(true);
            },

            onSelectionChange: function (oEvent) {

                var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected"); 

                // skip navigation when deselecting an item in multi selection mode
                if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
                    // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                    this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
                  
                }
            },
             


		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = !Device.system.phone;
            
            var id;
            if (oItem === null) {
                 id = '0';
            } else {    
                id = oItem.getBindingContext("pronosticoModel").getProperty("idInbox")
            }
            
          
			this.getRouter().navTo("RevisionPronosticosDemandaDetail", {
				orderId : id
            }, bReplace);
            
		},

            /**Method to get POrchaseOrder List */

            _getPronosticos: function () {
                var poModel = this.getModel("pronosticoModel");
                poModel.setProperty('/busy', true);

                var proveedor = this._oModel.getProperty('/id');
               
              
                    var me = this;
                    var path = API.serviceList().GET_NOTIFICATIONS_ENV + `${proveedor}/`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            poModel.setProperty('/busy', false);
                            if (respJson && respJson.data) {


                                poModel.setProperty('/Pronosticos', respJson.data)
                                if (respJson.data) {
                                    poModel.setProperty('/Count', respJson.data.length)

                                } else {
                                    poModel.setProperty('/Count', 0)
                                }

                                
                                poModel.refresh();

                            
                            }
                        }, function (err) {
                            poModel.setProperty('/busy', false);

                            console.log("error in processing your request", err);
                    });
              

                
            },

          
            

        });
    })
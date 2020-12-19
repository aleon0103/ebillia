// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast,Device) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.MasterRevokeAsn", {

            formatter: formatter,
            _proveedoresModel: null,

            onInit: function () {
                console.log('on init component view');
    
                this._proveedoresModel = new JSONModel({});
                this.getView().setModel(this._proveedoresModel, "proveedores");

                var oModel = new JSONModel({ busy: false });
                this.getOwnerComponent().setModel(oModel, "asnModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cancelarASN").attachPatternMatched(this._routePatternMatched, this);

   
            },

            onAfterRendering: function () {
                console.log('on Revoke asn View After Render');

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE MATCH")

                var poModel = this.getModel("asnModel");
                poModel.setProperty('/Count', 0);

                this.getView().byId("searchFieldAsn").setEnabled(false);

            },

            getProveedores: function (value) {
                var me = this;
                var path = API.serviceList().GET_PROVEEDORES_CATALOG + `?value=${value}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        
                        if (respJson) {
                            me.proveedoresData = respJson;

                            var localModel = me.getModel("proveedores");
							localModel.setData(me.proveedoresData);
                            sap.ui.getCore().setModel(localModel);
                            me._proveedoresModel.refresh(true);
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                });
            },

            handleChangeProv: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();

                if (sValue.trim() == "") {
                    this.getView().byId("searchFieldAsn").setValue("");
                } else {
                    this.getProveedores(sValue);
                }
                
            },

            providerSelected: function (oControlEvent) {
               var poModel = this.getModel("asnModel");
               var prov = this.getView().byId("proveedorCA").getSelectedKey();
               
               if (prov.trim() !== "") {
                    this._getASNs(prov);
                    this.getView().byId("searchFieldAsn").setEnabled(true);
               } else {
                   this.getView().byId("searchFieldAsn").setEnabled(false);
                    var itemId = this.getView().byId("list");
                    itemId.removeSelections(true);
                  
                   this._showDetail(null);
                  

                   poModel.setProperty('/ASN', [])
                   poModel.setProperty('/Count', 0)
                   poModel.refresh();
               }

                
               
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
                    this._getASNs();
                }

                var itemId = this.getView().byId("list");
                    itemId.removeSelections(true);

            },

            onRefresh: function () {
                this.getView().byId("searchFieldAsn").setValue("");
                this._getASNs();
                this._showDetail(null);
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
                id = oItem.getBindingContext("asnModel").getProperty("noAsn")
            }
            
           
			this.getRouter().navTo("cancelarASNDetail", {
				orderId : id
            }, bReplace);
            
		},

            /**Method to get POrchaseOrder List */

            _getASNs: function (proveedor) {
                var poModel = this.getModel("asnModel");
                poModel.setProperty('/busy', true);

               var prov = this.getView().byId("proveedorCA").getSelectedKey();
               
               if (prov.trim() !== "") {
                    var me = this;
                    var path = API.serviceList().GET_ALL_ASN + `${prov}`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            poModel.setProperty('/busy', false);
                            if (respJson && respJson.data) {


                                poModel.setProperty('/ASN', respJson.data)
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
               } else {
                   poModel.setProperty('/ASN', [])
                   poModel.refresh();
               }

                
            },

            _getASNByNumber: function (asn) {
                var poModel = this.getModel("asnModel");
                poModel.setProperty('/busy', true);
               
                var me = this;
                var path = API.serviceList().GET_ASN_BY_NUMBER + `${asn}/NA`;
                API.Get(path).then(
                    function (respJson, paramw, param3) { 
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) { 

                            if (respJson.data.length === 0) {
                                poModel.setProperty('/ASN', [])
                                poModel.setProperty('/Count', 0)
                               
                            } else {
                                var response = [respJson.data];
                                poModel.setProperty('/ASN', response)
                                poModel.setProperty('/Count', 1)
                                
                            }
                            
                            
                            poModel.refresh();

                            me._showDetail(null);
                        
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },
            

        });
    })
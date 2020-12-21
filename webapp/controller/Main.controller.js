sap.ui.define([
    './BaseController',
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/syncStyleClass',
    'sap/m/ActionSheet',
    'sap/m/Button',
    'sap/m/library',
    './APIController',
    'sap/ui/Device'
],
    function (BaseController, Controller, syncStyleClass, ActionSheet, Button, mobileLibrary, API, Device) {
        "use strict";

        // shortcut for sap.m.PlacementType
        var PlacementType = mobileLibrary.PlacementType;

        // shortcut for sap.m.VerticalPlacementType
        var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

        // shortcut for sap.m.ButtonType
        var ButtonType = mobileLibrary.ButtonType;

        return BaseController.extend("ns.EBilliaApp.controller.Main", {
            _bExpanded: true,

            onInit: function () {
                console.log('on main component view init');
                // this._userModel = this.getModel("user");
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());


                this._oRouter = this.getRouter();
                this._oRouter.getRoute("main").attachPatternMatched(this._routePatternMatched, this);


                // if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
                if (Device.resize.width <= 1024) {
                    this.onSideNavButtonPress();
                }
                Device.media.attachHandler(function (oDevice) {
                    if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
                        this.onSideNavButtonPress();
                        // set the _bExpanded to false on tablet devices
                        // extending and collapsing of side navigation should be done when resizing from
                        // desktop to tablet screen sizes)
                        this._bExpanded = (oDevice.name === "Desktop");
                    }
                }.bind(this));


            },

            /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf com.vitro.BillerDirect.CrearDisputa.view.NotFound
     */
            onAfterRendering: function () {
                console.log('on Main View After Render');
            },

            onNotificationPress: function (oEvent) {

                console.log('on notifications push');
            },


            _routePatternMatched: function (oEvent) {

                console.log("ROUTE MAIN MATCH")

                // gets called for ...#/
                // gets called for ...#/products/
                // gets called for ...#/products/Product/<productId>
                // for example: ...#/products/Product/1 . 
                // or #/products/Product/123

                if (this.hasSession()) {
                    console.log('has session ', this.hasSession());

                    this._initNotifications();
                    this._configureMenu();

                } else {
                    this.onLogOut();
                }


            },



            onSideNavButtonPress: function () {
                var oToolPage = this.byId("main");
                var bSideExpanded = oToolPage.getSideExpanded();
                // this._setToggleButtonTooltip(bSideExpanded);
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            },

            _setToggleButtonTooltip: function (bSideExpanded) {
                var oToggleButton = this.byId('sideNavigationToggleButton');
                /*
                this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function (sTooltipText) {
                    oToggleButton.setTooltip(sTooltipText);
                });
                */
            },


            onUserNamePress: function (oEvent) {
                var me = this;
                var oSource = oEvent.getSource();
                console.log(this.getModel("i18n"));
                this.getModel("i18n").getResourceBundle().then(function (oBundle) {
                    // close message popover
                    var oMessagePopover = this.byId("errorMessagePopover");
                    if (oMessagePopover && oMessagePopover.isOpen()) {
                        oMessagePopover.destroy();
                    }
                    var fnHandleUserMenuItemPress = function (oEvent) {
                        /*
                        this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function (sClickHandlerMessage) {
                            MessageToast.show(sClickHandlerMessage);
                        });
                        */
                    }.bind(this);

                    var fnHandleUserLogoutPress = function () {
                        console.log(this)
                        this.getRouter().navTo("login", {
                        });
                    }.bind(this);





                    var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
                        title: oBundle.getText("userHeaderTitle"),
                        showCancelButton: false,
                        buttons: [
                            new Button({
                                text: '{i18n>userAccountUserSettings}',
                                type: ButtonType.Transparent,
                                press: fnHandleUserMenuItemPress
                            }),

                            new Button({
                                text: '{i18n>userAccountLogout}',
                                type: ButtonType.Transparent,
                                press: fnHandleUserLogoutPress
                            })
                        ],
                        afterClose: function () {
                            oActionSheet.destroy();
                        }
                    });
                    this.getView().addDependent(oActionSheet);
                    // forward compact/cozy style into dialog
                    syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
                    oActionSheet.openBy(oSource);
                }.bind(this));
            },


            _initNotifications: function () {
                console.log('loading notifications...');


                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');

                console.log(rol, userId);
                if (rol && rol != 1) {
                    this._getCotizaciones(userId);
                    this._getPronosticos(userId);
                }



            },

            _getCotizaciones: function (userid) {

                var notifictionsModel = this.getModel("notifications");
                var me = this;

                var path = API.serviceList().GET_BADGE_COTIZACIONES + `${userid}/CREADO`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson && respJson.data) {
                            notifictionsModel.setProperty('/Cotizaciones', respJson.data)
                            notifictionsModel.refresh(true);
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });



            },

            _getPronosticos: function (userid) {
                var notifictionsModel = this.getModel("notifications");
                var me = this;
                var path = API.serviceList().GET_BADGE_PRONOSTICOS + `${userid}/PENDIENTE`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        if (respJson && respJson.data) {
                            notifictionsModel.setProperty('/Pronosticos', respJson.data)
                            notifictionsModel.refresh(true);
                        }

                        console.log(notifictionsModel);

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });



            },

            _configureMenu: function () {
                var oModel = this.getModel("user");
                var menuModel = this.getModel("side");
                console.log('MODELO ROLES');
                menuModel.setProperty('/navigation', []);

                var modulos = oModel.getProperty('/permisos/modulos');
                var roles = menuModel.getProperty('/roles');

                console.log(roles);


                var navigation = [];

                console.log(modulos);

                for (var x of modulos) {
                    console.log(x.id);
                    var temItems = [];

                    var tempNavItem = {};
                    tempNavItem["titleI18nKey"] = roles[x.id].titleI18nKey;
                    tempNavItem["icon"] = roles[x.id].icon;
                    tempNavItem["expanded"] = false;
                    //  tempNavItem["key"]=  roles[x.id].key;
                    tempNavItem["items"] = this._getSubModulos(x.submodulos);



                    navigation.push(tempNavItem)
                    /***
                     * 
                     * {
			"titleI18nKey": "sideContentHome",
			"icon": "sap-icon://home",
			"expanded": true,
			"key": "home",
			"items": []
		},
                     * 
                     */

                }

                console.log(navigation);
                menuModel.setProperty('/navigation', navigation);

            },

            _getSubModulos: function (submodulos) {
                var menuModel = this.getModel("side");
                var subroles = menuModel.getProperty('/subroles');
                var navArray = [];


                for (var x of submodulos) {
                    console.log(x.id);
                    var tempNavItem = {};
                    if (subroles[x.id]) {
                        tempNavItem["titleI18nKey"] = subroles[x.id].titleI18nKey ? subroles[x.id].titleI18nKey : '';
                        tempNavItem["icon"] = subroles[x.id].icon ? subroles[x.id].icon : '';
                        tempNavItem["expanded"] = false;
                        tempNavItem["key"] = subroles[x.id].key ? subroles[x.id].key : '';
                        // navArray.push(tempNavItem)
                        if (navArray.filter(item => item.key == tempNavItem.key).length == 0) {
                            navArray.push(tempNavItem);
                        }
                    }
                }


                return navArray;


            },

            camelize: function (str) {
                return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
                    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
                    return index === 0 ? match.toLowerCase() : match.toUpperCase();
                });
            },


        	/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
            getBundleText: function (sI18nKey, aPlaceholderValues) {
                return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
            },

            mergeNotifications: function (cotizaciones, pronosticos) {
                var cCount = cotizaciones ? cotizaciones.length : 0;
                var pCount = pronosticos ? pronosticos.length : 0;
                console.log(cCount + pCount);

                return (cCount + pCount).toString();
            }


        });
    })
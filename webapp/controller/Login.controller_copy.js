sap.ui.define([
    "./BaseController",
    './APIController',
    	"sap/ui/model/json/JSONModel",
],
    function (BaseController, Api,JSONModel) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.Login", {



            onInit: function () {
                console.log("on login componet view");
                console.log('print api controller');
                var oData = {
                    loginObj: {
                        busy: false,
                        username: "",
                        password: "",
                        error:"",
                        errorVisible: false
                    }
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "loginModel");
                
               
               

            },
            goToMain: function () {
                var me = this;
                var URL = '/auth/login';
                	var loginModel = this.getView().getModel("loginModel");
                    var loginData = loginModel.getProperty("/loginObj");
                  loginModel.setProperty("/loginObj/errorVisible", false)
                Api.Login(URL, {
                    "user": loginData.username,
                    "pass": loginData.password,
                    "idioma": "es"
                }).then(
                    function (respJson, paramw, param3) {
                        console.log("Auth success");
                        //console.log(param3.getResponseHeader('Authorization'));
                        Api.setJwt(param3.getResponseHeader('Authorization'))

                        console.log(me)
                        me.getUserInfo(loginData.username);

                    }, function (err) {
                        console.log("error in processing your request", err);
                       
                        
                        loginModel.setProperty("/loginObj/errorVisible", true)
                        if(err.status === 401){
                            loginModel.setProperty("/loginObj/error", "El usuario y/o password son incorrectos")
                        }                        
                    });
            },

            getUserInfo: function (user) {
                var userModel = this.getModel("user");
                var me = this;
                var URL = '/portal_cloud_api/masterdata-services/users/1/' + user;
                Api.Get(URL).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        userModel.setData( respJson.usuario[0]);
                          console.log(userModel);
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(me);
                      
                        oRouter.navTo("main", {
                        });


                    }, function (err) {
                        console.log("error in processing your request", err);
                    });


            }

        });
    })
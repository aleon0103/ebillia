sap.ui.define([

], function () {
    "use strict";

    var jwt;
    var user;
    var URL = 'https://arcade.flexi.com.mx:8762';

    var endpoints = {
        GET_BADGE_PRONOSTICOS:'/portal_cloud_api/logistic-services/pronostico/getNotifications/',
        GET_BADGE_COTIZACIONES:'/portal_cloud_api/logistic-services/quotation/getNotifications/',
        PROVEEDORES_FACTURAS:'/portal_cloud_api/logistic-services/Proveedores-facturas/',
        FACTURAS_PENDIENTES:'/portal_cloud_api/payment-services/master-factura/',
        ENVIO_ARCHIVOS_COMPLEMENTOS: '/portal_cloud_api/payment-services/complementos/',
        MASTER_DATA_CATALOG:'/portal_cloud_api/masterdata-services/catalog/',
        MASTER_DATA_MONEDA:'/portal_cloud_api/masterdata-services/moneda/'
    };
    return {


        Login: function (path, data, callback) {

            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                url: URL+path,

            })
        },
        signOut: function () {
            user = {};
            jwt = null;
        },

        getJwt: function () {
            return jwt;
        },

        serviceList: function (){
            return endpoints;

        },

        setJwt: function (token) {
            console.log(token);
            jwt = token
        },

        getCurrentUser: function () {
            return user;
        },

        Get: function (path, callback) {
            console.log(path);
            return $.ajax({
                method: "GET",
                headers: {
                    'Authorization': jwt
                },
                url: URL+path,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
        },

        Post: function (url, data, callback) {
            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                url: url,
            })


        },
            Put: function (path, data, callback) {
            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                headers: {
                    'Authorization': jwt
                },
                contentType: "application/json",
                method: "PUT",
                url: URL+path,
            })


        },

        PostFiles: function (path, formData, callback) {
            return $.ajax({
                data: formData,
                processData: false,
                contentType: false,
                headers: { 
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Authorization': jwt
                 },
                type: "POST",
                url: URL+path,
            })
        },

        Update: function () {



        },
        Delete: function () {



        },

    };

});
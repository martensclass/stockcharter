 'use strict';
  /* global angular */
      var ngapp = angular.module('ngapp', []);
      
      ngapp.controller('main',['$scope','$http', 'socket', function($scope, $http, socket){
      
        $scope.stocks=[];
        $http.get('api/allstocks').success(function(result){
         $scope.stocks=result;
             $scope.chart1 = new Highcharts.Chart({
                   chart: {
                       renderTo: 'chartspot',
                       type: 'line',
                     
                       zoomType: 'x'
                   },
                   title: {
                       text: 'Stock Prices:  Highlight chart area to zoom in'
                   },
                   xAxis: {
                       type: 'datetime',
                       labels: {
                          format: '{value:%Y-%m-%d}'
                       }
                  
                  },
                   yAxis: {
                       title: {
                           text: 'Closing Price'
                       }
                   }
              });
            
        for(var i=0; i<$scope.stocks.length; i++){
                $scope.chart1.addSeries({
                 name: $scope.stocks[i].name,
                 data: $scope.stocks[i].data
                });
        }
         
         
        });
        
      socket.on('newstock',function(result){
         $scope.stocks.push({"symbol": result.symbol, "name": result.name, "data": result.data});
         $scope.chart1.addSeries({
                 name: result.symbol,
                 data: result.data
         });
         $scope.chart1.redraw();
      });
      
      socket.on('delstock',function(sym){
          var loc=-1;
          for(var i=0; i<$scope.stocks.length; i++){
            if(sym==$scope.stocks[i].symbol) loc=i;
         }
         $scope.stocks.splice(loc,1);
         $scope.chart1.series[loc].remove(false);
         $scope.chart1.redraw();
         
      });
        
        $scope.addStock=function(symbol){
         var found=false;
         for(var i=0; i<$scope.stocks.length; i++){
            if(symbol==$scope.stocks[i].symbol) found=true;
         }
         if(found){
           $scope.sym='Duplicate Symbol';
                $scope.boxStyle={
                     "border": "2px solid red",
                     "border-radius": "4px"
               }
            return;
         } 
             $http.get('/api/getstock/' + symbol).success(function(result){
              if(result != 'error'){
               // $scope.stocks.push({"symbol": symbol, "name": result.name, "data": result.data});
               // $scope.chart1.addSeries({
               //  name: symbol,
               //  data: result.data
              //  });
               $scope.sym='';
               $scope.boxStyle={
                     "border": "1px solid #ccc",
                     "border-radius": "4px"
               }
              }
              else{
                $scope.sym='ERROR-Not a symbol';
                $scope.boxStyle={
                     "border": "2px solid red",
                     "border-radius": "4px"
               }
               }
              });
        }
        
        $scope.removeStock=function(index){
           var sym = $scope.stocks[index].symbol;
          // $scope.stocks.splice(index,1);
         //  $scope.chart1.series[index].remove(false);
           $http.delete('/api/stocks/' + sym, null);
            $scope.boxStyle={
           "border": "1px solid #ccc",
           "border-radius": "4px"
        }
        //$scope.chart1.redraw();
        }
        
        $scope.boxStyle={
           "border": "1px solid #ccc",
           "border-radius": "4px"
        }
      
      }]);
      
      ngapp.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}]);
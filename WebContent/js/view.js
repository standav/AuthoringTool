'use strict';

var v = angular.module('gloria.view', []);

function loadDependencies($q, $rootScope, name, gloriaView) {
	var deferred = $q.defer();

	gloriaView.init(function() {
		var view = gloriaView.getViewInfo(name);

		$script(view.js, function() {
			$rootScope.$apply(function() {
				deferred.resolve();
			});
		});
	});

	return deferred.promise;
}

function ViewCtrl($scope, $route, gloriaView) {
	$scope.templateUrl = gloriaView.getViewInfo($route.current.pathParams.name).html;
}

v.service('gloriaView', function($http) {

	var views = {};

	var gView = {

		init : function(then) {
			var url = 'conf/views.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				views = data;
				if (then != undefined) {
					then();
				}
			}).error(function() {
				alert("View resource problem!");
			});
		},
		getViewInfo : function(name) {
			return views[name];
		}
	};

	return gView;
});

v.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/experiments/:name', {
		templateUrl : 'partials/wrapper.html',
		controller : ViewCtrl,
		resolve : {
			deps : function($q, $rootScope, gloriaView, $route) {
				return loadDependencies($q, $rootScope, $route.current.pathParams.name, gloriaView);
			}
		}
	}).otherwise({
		redirectTo : '/'
	});
} ]);

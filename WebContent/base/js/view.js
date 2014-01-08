'use strict';

var v = angular.module('gloria.view', []);

function loadDependencies($q, $rootScope, name, gloriaView) {
	var deferred = $q.defer();

	gloriaView.init(function() {
		var view = gloriaView.getViewInfo(name);

		if (view != undefined && view.js.length > 0) {
			$script(view.js, function() {
				$rootScope.$apply(function() {
					deferred.resolve();
				});
			});
		} else {
			deferred.resolve();
		}
	});

	return deferred.promise;
}

function ExperimentViewCtrl($scope, $route, $location, gloriaView) {

	var view = gloriaView.getViewInfo($route.current.pathParams.name);

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path('/wrong');
	}
}

function ViewCtrl($scope, $route, $location, gloriaView) {

	var view = gloriaView.getViewInfo($location.path().slice(1));

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path('/wrong');
	}
}

v.service('gloriaView', function($http) {

	var views = null;

	var gView = {

		init : function(then) {
			if (views == null) {
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
			} else {
				if (then != undefined) {
					then();
				}
			}
		},
		getViewInfo : function(name) {
			return views[name];
		}
	};

	return gView;
});

v.config(function($routeProvider, $locationProvider) {
	$routeProvider.when(
			'/experiments/:name',
			{
				template : '<div ng-include src="templateUrl"></div>',
				controller : ExperimentViewCtrl,
				resolve : {
					deps : function($q, $rootScope, gloriaView, $route) {
						return loadDependencies($q, $rootScope,
								$route.current.pathParams.name, gloriaView);
					}
				}
			}).when('/wrong', {
		template : '<div ng-include src="templateUrl"></div>',
		controller : ViewCtrl,
		resolve : {
			deps : function($q, $rootScope, gloriaView, $route) {
				return loadDependencies($q, $rootScope, 'wrong', gloriaView);
			}
		}
	}).otherwise({
		redirectTo : '/wrong',
	});
});

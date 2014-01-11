toolbox.service('$gloriaEnv', function($http) {

	var options = null;
	var initDone = false;

	var afterSuccess = [];

	var gEnv = {

		init : function() {
			var url = 'conf/env.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				options = data;

				initDone = true;

				afterSuccess.forEach(function(then) {
					if (then != undefined) {
						then();
					}
				});
			}).error(function() {
				alert("Options resource problem!");
				requested = false;
			});
		},
		getOption : function(name) {
			return options[name];
		},
		getBaseLangPath : function() {
			return options['baseLangPath'];
		},
		after : function(then) {
			if (!initDone) {
				afterSuccess.push(then);
			} else {
				then();
			}
		}
	};

	return gEnv;
});

toolbox.config(function($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([ 'self',
			'https://rawgithub.com/fserena/**' ]);
});

toolbox.run(function($gloriaLocale, $gloriaEnv, $rootScope) {
	
	$rootScope.titleLoaded = false;
	
	$gloriaLocale.loadResource('lang', 'title', function() {

		$gloriaEnv.after(function() {
			if ($gloriaEnv.getOption('navbar')
					&& $gloriaEnv.getOption('navbarHtml') != undefined) {
				$rootScope.navbarHtml = $gloriaEnv.getOption('navbarHtml');
			}

			if ($gloriaEnv.getOption('hubref') != undefined) {
				$rootScope.hubref = $gloriaEnv.getOption('hubref');
			}

			if ($gloriaEnv.getOption('headerHtml') != undefined) {
				$rootScope.headerHtml = $gloriaEnv.getOption('headerHtml');

			}

			if ($gloriaEnv.getOption('footerHtml') != undefined) {
				$rootScope.footerHtml = $gloriaEnv.getOption('footerHtml');
			}

			if ($gloriaEnv.getOption('wrongHtml') != undefined) {
				$rootScope.wrongHtml = $gloriaEnv.getOption('wrongHtml');
			}

			$rootScope.titleLoaded = true;
		});
		
		$gloriaEnv.init();
	});
});

function MainController($scope, $http, $window, $location,
		$gloriaLocale, $gloriaEnv) {

	$scope.ready = false;

	$scope.gotoHub = function() {
		if ($scope.hubref != undefined) {

			if ($scope.hubref.app != undefined) {
				$window.location.hash = '';
				$window.location.pathname = $scope.hubref.app;
			}

			if ($scope.hubref.url != undefined) {
				$window.location.href = $scope.hubref.url;
			}

			if ($scope.hubref.path != undefined) {
				$location.path($scope.hubref.path);
			}
		}
	};
}
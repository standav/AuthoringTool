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
		getContentPath : function() {
			return options['basePath'].content;
		},
		getLangPath : function() {
			return options['basePath'].lang;
		},
		getHtmlPath : function() {
			return options['basePath'].html;
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
			'https://rawgithub.com/fserena/**', 'http://fserena.github.io/**' ]);
});

toolbox.run(function($gloriaLocale, $gloriaEnv, $rootScope) {
	
	$rootScope.titleLoaded = false;
	
	$gloriaLocale.loadResource('lang', 'title', function() {

		$gloriaEnv.after(function() {
			if ($gloriaEnv.getOption('hubref') != undefined) {
				$rootScope.hubref = $gloriaEnv.getOption('hubref');
			}
			
			var basePath = $gloriaEnv.getOption('basePath');
					
			if (basePath != undefined) {
				
				$rootScope.contentPath = basePath.content;
				$rootScope.langPath = basePath.lang;
				
				$rootScope.htmlPath = basePath.html;
				$rootScope.headerHtml = $rootScope.htmlPath + '/header.html';
				$rootScope.footerHtml = $rootScope.htmlPath + '/footer.html';
				
				if ($gloriaEnv.getOption('navbar')) {						
					$rootScope.navbarHtml = $rootScope.htmlPath + '/navbar.html';
				}			
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
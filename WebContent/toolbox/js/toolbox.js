'use strict';

/*
 * Locale module
 */

var locale = angular.module('gloria.locale', []);

locale.controller('LocaleController', function($scope, $sce, $gloriaLocale, $window, $gloriaView) {

	$scope.languages = $gloriaLocale.getLanguages();
	$scope.language = $gloriaLocale.getPreferredLanguage();

	$scope.setLanguage = function(index) {
		$gloriaLocale.setPreferredLanguage($scope.languages[index]);
		$window.location.reload();
	};
});

locale.service('$gloriaLocale',
		function($locale, $http, $window, $cookieStore) {

			var languages = [ 'en', 'es', 'it', 'pl', 'cz', 'ru' ];

			$locale.dictionary = {};
			locale.preferredLang = $cookieStore.get('preferredLang');
			if (locale.preferredLang == undefined) {
				locale.preferredLang = $window.navigator.userLanguage
						|| $window.navigator.language || 'en';

				var languageParts = locale.preferredLang.split("-");
				locale.preferredLang = languageParts[0];
			}

			$locale.id = locale.preferredLang;

			var gLocale = {

				getLanguages : function() {
					return languages;
				},
				getDictionary : function() {
					return $locale.dictionary;
				},
				getLocale : function() {
					return $locale;
				},
				getLanguage : function() {
					return $locale.id;
				},
				loadResource : function(path, name, then) {
					var url = path + '/lang_' + name + '_' + $locale.id
							+ '.json';
					$http({
						method : "GET",
						url : url,
						cache : false
					}).success(function(data) {
						$locale.dictionary[name] = data;
						if (then != undefined) {
							then();
						}
					}).error(function() {
						var url = path + '/lang_' + name + '_en.json';
						$http({
							method : "GET",
							url : url,
							cache : false
						}).success(function(data) {
							$locale.dictionary[name] = data;
						}).error(function() {
							alert("Locale resource problem: " + name);
						});

					});
				},
				loadCore : function(path, lang, post) {
					var url = path + '/lang_core_' + lang + '.json';
					$http({
						method : "GET",
						url : url,
						cache : false
					}).success(function(data) {
						$locale.DATETIME_FORMATS = data.DATETIME_FORMATS;
						$locale.NUMBER_FORMATS = data.NUMBER_FORMATS;
						$locale.id = data.id;
						if (post != undefined) {
							post();
						}
					}).error(function() {
						var url = path + '/lang_core_en.json';
						$http({
							method : "GET",
							url : url,
							cache : false
						}).success(function(data) {
							$locale.DATETIME_FORMATS = data.DATETIME_FORMATS;
							$locale.NUMBER_FORMATS = data.NUMBER_FORMATS;
							$locale.id = data.id;
							if (post != undefined) {
								post();
							}
						}).error(function() {
							alert("Locale core problem!");
						});

					});
				},
				getPreferredLanguage : function() {
					return locale.preferredLang;
				},
				setPreferredLanguage : function(lang) {
					locale.preferredLang = lang;
					$cookieStore.put('preferredLang', lang);
				}
			};

			return gLocale;
		});

locale.run(function($gloriaEnv, $gloriaLocale, $rootScope) {
	$rootScope.headerReady = false;

	$gloriaEnv.after(function() {
		$gloriaLocale.loadCore($gloriaEnv.getLangPath(), locale.preferredLang,
				function() {
					$gloriaLocale.loadResource($gloriaEnv.getLangPath(),
							'base', function() {
								$rootScope.headerReady = true;
							});
				});
	});
});

locale.filter('i18n', function($gloriaLocale) {
	return function(key, p) {

		var dictionary = $gloriaLocale.getDictionary();

		var keyParts = key.split('.');
		var value = undefined;
		keyParts.forEach(function(key) {
			if (value == undefined) {
				value = dictionary[key];
			} else {
				value = value[key];
			}
		});

		if (typeof value != 'undefined' && value != '') {

			var result = (typeof p === "undefined") ? value : value.replace(
					'@{}@', p);
			return result;
		}

		// return '?';
	};
});

/*
 * Views module
 */

var v = angular.module('gloria.view', []);

function loadDependencies($q, $rootScope, $location, $gloriaView) {
	var deferred = $q.defer();

	$gloriaView.init(function() {
		var view = $gloriaView.getViewInfoByPath($location.path());

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

function BasicViewCtrl($scope, $route, $location, $gloriaView) {

	var view = $gloriaView.getViewInfoByPath($location.path());

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path($gloriaView.getWrongPathView().path);
	}
}

function MainViewCtrl($scope, $route, $location, $gloriaView) {

	var view = $gloriaView.getViewInfoByPath($location.path());

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path($gloriaView.getWrongPathView().path);
	}

	var views = $gloriaView.getViews();

	$scope.views = [];

	var i = 0;
	for ( var key in views) {
		$scope.views.push(views[key]);
		$scope.views[i].name = key;
		i++;
	}

	$scope.gotoView = function(name) {
		$location.path(name);
	};
}

v.service('$gloriaView', function($http) {

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
		getViewInfoByName : function(name) {
			return views[name];
		},
		getViewInfoByPath : function(path) {
			for ( var key in views) {
				if (views[key].path == path) {
					return views[key];
				}
			}

			return undefined;
		},
		getWrongPathView : function(path) {
			for ( var key in views) {
				if (views[key].type == 'wrong-path') {
					return views[key];
				}
			}

			return '/';
		},
		getMainView : function(path) {
			for ( var key in views) {
				if (views[key].type == 'main') {
					return views[key];
				}
			}

			return '/';
		},
		getViews : function() {
			return views;
		}
	};

	return gView;
});

v.config(function($routeProvider) {
	v.lazy = {
		route : $routeProvider	
	}; 
});

v.run(function($rootScope, $route, $gloriaView) {
	$gloriaView.init(function() {
		var views = $gloriaView.getViews();

		for ( var key in views) {

			var type = views[key].type;
			var reqController = BasicViewCtrl;

			if (type == 'main') {
				reqController = MainViewCtrl;
			}

			v.lazy.route.when(views[key].path, {
				template : '<div ng-include src="templateUrl"></div>',
				controller : reqController,
				resolve : {
					deps : function($q, $rootScope, $location, $gloriaView) {
						return loadDependencies($q, $rootScope, $location,
								$gloriaView);
					}
				}
			});
		}

		v.lazy.route.otherwise({
			redirectTo : $gloriaView.getWrongPathView().path,
		});

		$route.reload();
	});
});


/*
 * Toolbox module (main)
 */

var toolbox = angular.module('toolbox', [ 'ngCookies', 'ngRoute', 'ngAnimate',
		'gloria.locale', 'gloria.view', 'gloria.api', 'ui.bootstrap' ]);

toolbox.filter('utc', [ function() {
	return function(date) {
		if (angular.isNumber(date)) {
			date = new Date(date);
		}
		return new Date(date.getUTCFullYear(), date.getUTCMonth(), date
				.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date
				.getUTCSeconds());
	};
} ]);

toolbox.directive('jtooltip', function() {
	return {
		// Restrict it to be an attribute in this case
		restrict : 'A',
		// responsible for registering DOM listeners as well as updating the DOM
		link : function(scope, element, attrs) {
			$(element).popover(scope.$eval(attrs.jtooltip));
			$(element).popover('show');
		}
	};
});

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
		getJsPath : function() {
			return options['basePath'].js;
		},
		getImgPath : function() {
			return options['basePath'].img;
		},
		getLangPath : function() {
			return options['basePath'].lang;
		},
		getHtmlPath : function() {
			return options['basePath'].html;
		},
		getCssPath : function() {
			return options['basePath'].css;
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

toolbox.config(function ($sceDelegateProvider, $filterProvider) {
    
	$sceDelegateProvider.resourceUrlWhitelist([ 'self',
	                                			'https://rawgithub.com/fserena/**', 'http://fserena.github.io/**' ]);
	
	// save references to the providers
    toolbox.lazy = {
        filter: $filterProvider.register,        
    };    
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
				
				$rootScope.jsPath = basePath.js;
				$rootScope.cssPath = basePath.css;
				$rootScope.imgPath = basePath.img;
				$rootScope.langPath = basePath.lang;
				
				$rootScope.htmlPath = basePath.html;
				$rootScope.headerHtml = $rootScope.htmlPath + '/header.html';
				$rootScope.footerHtml = $rootScope.htmlPath + '/footer.html';
				$rootScope.bodyHtml = $rootScope.htmlPath + '/body.html';
				
				if ($gloriaEnv.getOption('navbar')) {						
					$rootScope.navbarHtml = $rootScope.htmlPath + '/navbar.html';
				}			
			}
			
			$rootScope.titleLoaded = true;
			$rootScope.toolboxReady = true;
		});
		
		$gloriaEnv.init();
	});
});

toolbox.controller('MainController', function($scope, $http, $window, $location,
		$gloriaLocale, $gloriaEnv) {

	$scope.ready = false;

	$scope.gotoHub = function() {
		if ($scope.hubref != undefined) {

			if ($scope.hubref.app != undefined) {
				
				var url = $window.location.origin;				
				if ($scope.hubref.app.length > 0) {
					 url += '/';
				}
				 url += $scope.hubref.app + '/#';
				if ($scope.hubref.path != undefined) {
					url += $scope.hubref.path;
				}
				$window.location.href = url;
			} else if ($scope.hubref.url != undefined) {
				$window.location.href = $scope.hubref.url;
			} else if ($scope.hubref.path != undefined) {
				$location.path($scope.hubref.path);
			}
		}
	};
});

toolbox.controller('LoginController', function($scope, $location, Login, $gloriaView) {

	$scope.loaded = false;
	$scope.login = {};
	$scope.login.user = null;
	$scope.verified = false;

	Login.verifyToken(function() {
		$scope.login.user = Login.getUser();
		$scope.verified = true;
	}, function() {
		$scope.verified = true;
	});
	
	$scope.gotoMain = function() {
		$location.path($gloriaView.getMainView().path);		
	};

	$scope.login.connect = function() {

		if ($scope.login.email != null && $scope.login.password != null) {
			Login.authenticate($scope.login.email, $scope.login.password).then(
					function() {
						$scope.login.user = $scope.login.email;
						$scope.gotoMain();
					}, function() {
						$scope.login.user = null;
						$scope.login.email = null;
						$scope.login.password = null;
					});
		}
	};

	$scope.login.disconnect = function() {
		Login.disconnect();
		$scope.login.user = null;
		$scope.login.email = null;
		$scope.login.password = null;
		document.execCommand("ClearAuthenticationCache");
		$scope.gotoMain();
	};

	$scope.$on('unauthorized', function() {
		console.log("unauthorized event received!");
		$scope.login.disconnect();
	});

	$scope.$on('server down', function() {
		console.log("server down event received!");
		$scope.login.disconnect();
	});
});

toolbox.service('$gloriaNav', function($http) {

	var menus = [];
	var objMenus = [];
	var initDone = false;

	var afterSuccess = [];

	var gNav = {

		init : function() {
			var url = 'conf/navbar.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				for ( var key in data) {

					var menu = data[key];
					menu.name = key;

					menus.push(menu);
				}

				objMenus = data;

				initDone = true;

				afterSuccess.forEach(function(then) {
					if (then != undefined) {
						then();
					}
				});

			}).error(function() {
				alert("Navbar resource problem!");
			});
		},
		getMenu : function(name) {
			return objMenus[name];
		},
		getMenusArray : function() {
			return menus;
		},
		after : function(then) {
			if (!initDone) {
				afterSuccess.push(then);
			} else {
				then();
			}
		}
	};

	return gNav;
});

toolbox.run(function($gloriaLocale, $gloriaNav, $rootScope) {
	
	$rootScope.navReady = false;
	
	$gloriaLocale.loadResource('lang', 'navbar', function() {
		$gloriaNav.after(function() {
			$rootScope.navReady = true;
		});
		$gloriaNav.init();
	});
});

toolbox.controller('NavbarCtrl', function($scope, $http, $location, $window, $gloriaLocale,
		$gloriaNav) {

	$scope.navClass = function(menu) {
		var currentRoute = $location.path();

		var cl = '';

		if ($gloriaNav.getMenu(menu).href != undefined) {
			cl = $gloriaNav.getMenu(menu).href.path === currentRoute ? 'active'
					: '';
		} else {
			if ($gloriaNav.getMenu(menu).child != undefined) {
				cl += ' dropdown';

				$gloriaNav.getMenu(menu).child.forEach(function(child) {
					if (child.href != undefined) {
						cl += ' '
								+ (child.href.path === currentRoute ? 'active'
										: '');
					}
				});
			}
		}

		return cl;
	};

	$scope.linkClass = function(menu) {
		var cl = '';

		if ($gloriaNav.getMenu(menu).child != undefined) {
			cl = 'dropdown-toggle';
		}

		return cl;
	};

	$scope.childClass = function(type) {
		if (type == 'header') {
			return 'nav-header';
		} else if (type == 'divider') {
			return 'divider';
		}

		return '';
	};

	$scope.changePath = function(href) {
		if (href != undefined) {

			if (href.app != undefined) {
				var url = $window.location.origin;
				if (href.app.length > 0) {
					 url += '/';
				}
				 url += href.app + '/#';
				if (href.path != undefined) {
					url += href.path;
				}
				$window.location.href = url;
			} else if (href.url != undefined) {
				$window.location.href = href.url;
			} else if (href.path != undefined) {
				$location.path(href.path);
			}
		}
	};

	$gloriaNav.after(function() {
		$scope.menus = $gloriaNav.getMenusArray();
	});
});

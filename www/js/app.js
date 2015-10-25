// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


//var viewSt= '';
//var teamNum = 0;
//var categories = ['Pré-Novice', 'Novice', 'Atome', 'Pee-Wee', 'Bantam', 'Midget', 'Junior', 'Autre'];
//var levels = ['AAA', 'AA', 'BB', 'CC', 'A', 'B', 'C', 'F'];
//var teams = ['1', '2', '3', '4', '5'];

angular.module('open_schedule', ['ionic']) 

// home page controller that loads the page... may be this can be put in as a service later on
/* TODO : put in service */

.controller('catController',  ['$scope', 'huskyModel', function($scope, huskyModel) {
  var self = this;
  self.huskyModel = huskyModel;
  
  self.selectCategory = function(category) {
        huskyModel.setSelectedCategory(category);
        huskyModel.setLevelList(category);
  };
  self.isCatSelected = function(category) {
      return category === huskyModel.selectedCategory;
  };
  
}])
  

.controller('levelController',  ['$scope', 'huskyModel', function($scope, huskyModel) {
  var self = this;
  self.levelList = huskyModel.levelList
  
  self.selectLevel = function(level) {
        huskyModel.setSelectedLevel(level);
        huskyModel.setTeamList(level);
  };
  self.isLvlSelected = function(level) {
      return level === huskyModel.selectedLevel;
  };
}])

.controller('teamController', ['$scope', 'huskyModel', function($scope, huskyModel) {
  var self = this;
  self.teamList = huskyModel.teamList;
  
  self.selectTeam = function(team) {
        huskyModel.setSelectedTeam(team);
  };
  self.isTeamSelected = function(team) {
      return team === huskyModel.selectedTeam;
  };

}])


.service('huskyModel', [function ($http) {
  
  var promise = $http.get("http://huskyco.com/php/newevents.php").then(function(response) {
     this.gameModel = getModel(response.data);
  });
  
  
  this.categoryList = [];
  angular.forEach(this.gameModel, function(category) {
    this.categoryList.push(category.category);
  });
  
  this.levelList = [];
  this.setLevelList = function(category) {
    angular.forEach(category.levels, function(level) {
      this.levelList.push(level.level);
    });
  };

  this.teamList = [];
  this.setTeamList = function(level) {
    angular.forEach(level.teams, function(team) {
        this.levelList.push(team.team);
    });
  };

  
  this.selectedCategory = null;
  this.setSelectedCategory = function(category) {
    angular.forEach(this.gameModel, function(category) {
        if (category.category == category) {
          this.selectedCategory = category;
        }
    });
  };

  this.selectedLevel = null;
  this.setSelectedLevel = function(level) {
    angular.forEach(this.selectedCategory.levels, function(level) {
        if (level.level == level) {
          this.selectedLevel = level;
        }
    });
  };
  
  this.selectedTeam = null;
  this.setSelectedTeam = function(team) {
    angular.forEach(this.selectedLevel.teams, function(team) {
        if (team.team == team) {
          this.selectedTeam = team;
        }
    });
  };
}])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  //$httpProvider.defaults.withCredentials = true;
  
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('home', {
      url: '/home',
      views: {
        home: {
          templateUrl: 'templates/categories.html',
          controller: 'catController'
        }
      }
    })
    
    .state('levels', {
      url: '/home',
      views: {
        teams: {
          templateUrl: 'templates/levels.html',
          controller: 'levelController'
        }
      }
    })
    
    .state('teams', {
      url: '/home',
      views: {
        teams: {
          templateUrl: 'templates/teams.html',
          controller: 'teamController'
        }
      }
    })
    
    .state('help', {
      url: '/help',
      views: {
        help: {
          templateUrl: 'templates/help.html'
        }
      }
    })
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
}); 


function getDay(trStr) {
  return trStr.slice(trStr.indexOf('5\'>')+3, trStr.indexOf('</td>'));
}

function getModel(htmlStr) {
  var categoriesDM = [];
  var found = false;
  var day = '';
  var newGame;
  var newTeam;
  var newLevel;
  var newCategory;
  
  var trList = htmlStr.split("<tr");
  
  for (var i = 2; i < trList.length; i++) {                                           // loop through teams to single them out and create the vm
    var nEntry = parseTr(trList[i], day);                                             // parsed data (cat, lvl, tm, d, t, loc)
    if (trList[i].indexOf('eventListDayRowHeader') > 0) {                             // modify this to get the date
      day = getDay(trList[i]);                                                        // get the displayed day
    } else {
      newGame = new dmGame(nEntry[i].day, nEntry[i].time, nEntry[i].loction);             // add game regardless
      if (categoriesDM.length ==0) {                                                    // array is empty
        newTeam = new dmTeams(nEntry[i].team, newGame);
        newLevel = new dmLevels(nEntry[i].level, newTeam);
        newCategory = new dmCategories(nEntry[i].category, newLevel);
        categoriesDM.push(newCategory);
      } else {            // not found, we're going to search
        angular.forEach(categoriesDM, function(category) {
          if (category.category == nEntry[i].category) {
            angular.forEach(category.levels, function(level) {
              if (levels.level == nEntry[i].level) {
                angular.forEach(level.teams, function(team) {
                  if (teams.team == nEntry[i].team) {
                    found = true;
                  }
                });
                if (!found) {                                       // team not found
                  newTeam = new dmTeams(nEntry[i].team, newGame);
                }
                found = true;
              }
            });
            if (!found) {
              newTeam = new dmTeams(nEntry[i].team, newGame);
              newLevel = new dmLevels(nEntry[i].level, newTeam);
            }
            found = true;
          }
        });
        if (!found) {
              newTeam = new dmTeams(nEntry[i].team, newGame);
              newLevel = new dmLevels(nEntry[i].level, newTeam);
              newCategory = new dmCategories(nEntry[i].category, newLevel);
        }
      }
    }
  }
  return dmCategories;
}

function dmCategories(cat, lvl) {
  this.category = cat;
  this.levels = [];
  this.levels.push(lvl);
}

function dmLevels(lvl,tm) {
  this.level = lvl;
  this.teams = [];
  this.teams.push(tm);
}

function dmTeams(tm, gm) {
  this.team = tm;
  this.games = [];
  this.games.push(tm);
}

function dmGame(dt, tm, loc) {
    this.date = dt;
    this.time = tm;
    this.loction = loc; 
}

function dmEntry(cat, lvl, tm, d, t, loc) {
  this.category = cat;
  this.level = lvl;
  this.team = tm;
  this.day = d;
  this.time = t;
  this.loction = loc;
}

function parseTr(trStr, day) { // returns parsed string
  var trs = trStr.split('<td>');
  var time = trs[1].slice(0, trs[1].indexOf(' '));
  var category = trs[2].slice(0, trs[2].indexOf(' '));
  var level = trs[2].slice(trs[2].indexOf(' ')+1, trs[2].indexOf('</td>'));
  var team = trs[3].slice(trs[3].indexOf(' ')+1, trs[3].indexOf('</td>'));
  var loction = trs[4].slice(trs[4].indexOf('blank\'>')+7, trs[4].indexOf('</a>'));
  var newEntry = new dmEntry(category, level, team, day, time, loction);
  return newEntry;
} 
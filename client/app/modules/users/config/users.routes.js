(function () {
  'use strict';
  angular
    .module('com.module.users')
    .config(function ($stateProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          template: '<login></login>',
          controller: 'LoginCtrl'
        })
        .state('register', {
          url: '/register',
          template: '<register></register>',
          controller: 'RegisterCtrl'
        })
        .state('app.users', {
          abstract: true,
          url: '/users',
          templateUrl: 'modules/users/views/main.html'
        })
        .state('app.users.list', {
          url: '',
          templateUrl: 'modules/users/views/list.html',
          controllerAs: 'ctrl',
          controller: function (users, totalUsers, UserService, $scope) {
            var self=this;
            self.totalUsers= totalUsers;
            self.limit=10;
            self.offset=1;
            self.totalUser=0;
            self.searchText='';
            var countByWhere= function(where){
              return UserService.count(where).then(function(data){
                self.totalUsers=data;
              });
            };
            var getUsers= function(){
              console.log(self.searchText);

              if(self.searchText){
                countByWhere({"where":{ "$text": { "search": self.searchText } }});
                return UserService.findByWhere({"where":{ "$text": { "search": self.searchText } }});
              }
              else{
                self.totalUsers= totalUsers;
                return UserService.find();
              }
            };
            self.searchUser= function(){
              self.offset=1;
              self.totalUser=0;
              self.getUsers();
            };
            self.totalPage=Math.ceil(self.totalUsers.count/self.limit);
            self.currentPage=1;
            self.getUsers= function(){

              self.currentPage = self.currentPage <= self.totalPage ? self.currentPage: self.totalPage;
              getUsers().then(function(data){
                self.totalUser=data;
                self.totalUsers.count=data.length;
                self.users=data.splice(self.offset-1, self.limit);
                self.currentPage=Math.ceil(self.offset/self.limit) <= 0 ? 1 :Math.ceil(self.offset/self.limit);
              })
            };
            self.getUsers();
            self.getGoUser=function(){
              if( self.currentPage >= self.totalPage){
                self.currentPage=self.totalPage;
              }
              else if(self.currentPage <=1){
                self.currentPage=1;
              }
              if(!self.currentPage || self.limit*self.currentPage <=self.totalUsers.count){
                return false;
              }
              else{
                self.offset=self.limit*self.currentPage;
                self.getUsers();
              }
            };
            self.getPrevUsers=function(){
              self.offset-=self.limit;
              self.getUsers();
            };
            self.getNextUsers=function(){
              self.offset+=self.limit;
              self.getUsers();
            };
            self.updateUser= function(user, index) {
              UserService.updateAttributes(user.id,user, function(data){
                self.users[index]=data;
              });
            }

          },
          resolve: {
            users: function (UserService) {
              return UserService.find();
            },
            totalUsers: function(UserService){
              return UserService.count();
            }
          }
        })
        .state('app.users.add', {
          url: '/add',
          templateUrl: 'modules/users/views/form.html',
          controllerAs: 'ctrl',
          controller: function ($state, UserService, user) {
            var self=this;
            self.user = user;
            self.formFields = UserService.getFormFields('add');
            self.formOptions = {};
            self.submit = function () {
              UserService.upsert(self.user).then(function () {
                $state.go('^.list');
              }).catch(function (err) {
                console.log(err);
              });
            };
          },
          resolve: {
            user: function () {
              return {};
            }
          }
        })
        .state('app.users.edit', {
          url: '/edit/:id',
          templateUrl: 'modules/users/views/form.html',
          controllerAs: 'ctrl',
          controller: function ($state, UserService, user) {
            var self=this;
            self.user = user;
            self.formFields = UserService.getFormFields('edit');
            self.formOptions = {};
            self.submit = function () {
              UserService.updateAttributes(self.user.id, self.user).then(function () {
                $state.go('^.list');
              });
            };
          },
          resolve: {
            user: function ($stateParams, UserService) {
              return UserService.findById($stateParams.id);
            }
          }
        })
        .state('app.users.view', {
          url: '/view/:id',
          templateUrl: 'modules/users/views/view.html',
          controllerAs: 'ctrl',
          controller: function (user) {
            var self=this;
            self.user = user;
          },
          resolve: {
            user: function ($stateParams, UserService) {
              return UserService.findById($stateParams.id);
            }
          }
        })
        .state('app.users.delete', {
          url: '/:id/delete',
          template: '',
          controller: function ($stateParams, $state, UserService) {
            UserService.delete($stateParams.id, function () {
              $state.go('^.list');
            }, function () {
              $state.go('^.list');
            });
          }
        })
        .state('app.users.profile', {
          url: '/profile',
          templateUrl: 'modules/users/views/profile.html',
          controllerAs: 'ctrl',
          controller: function ($state, UserService, user) {
            var self=this;
            self.user = user;
            self.formFields = UserService.getFormFields('edit');
            self.formOptions = {};
            self.submit = function () {
              UserService.updateAttributes(self.user.id, self.user).then(function () {
                $state.go('^.profile');
              });
            };
          },
          resolve: {
            user: function (User) {
              return User.getCurrent(function (user) {
                return user;
              }, function (err) {
                console.log(err);
              });
            }
          }
        });
    });

})();

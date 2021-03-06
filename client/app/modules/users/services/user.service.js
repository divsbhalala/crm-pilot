(function () {
  'use strict';
  angular
    .module('com.module.users')
    .service('UserService', function ($state, CoreService, User, gettextCatalog) {

      this.find = function () {
        return User.find().$promise;
      };

      this.findByWhere = function (where) {
        return User.find({filter: where}).$promise;
      };

      this.count = function (where) {
        return User.count({filter:where}).$promise;
      };

      this.findById = function (id) {
        return User.findById({
          id: id
        }).$promise;
      };

      this.upsert = function (user) {
        return User.upsert(user).$promise
          .then(function () {
            CoreService.toastSuccess(
              gettextCatalog.getString('User saved'),
              gettextCatalog.getString('Your user is safe with us!')
            );
          })
          .catch(function (err) {
            CoreService.toastError(
              gettextCatalog.getString('Error saving user '),
              gettextCatalog.getString('This user could no be saved: ' + err)
            );
          }
        );
      };
      this.updateAttributes = function (id, user, successCb, cancelCb) {
        return User.prototype$updateAttributes({id: id}, user).$promise
          .then(function (data) {
            CoreService.toastSuccess(
              gettextCatalog.getString('User saved'),
              gettextCatalog.getString('Your user is safe with us!')
            );
            if(successCb){
              successCb(data)
            }
          })
          .catch(function (err) {
            CoreService.toastError(
              gettextCatalog.getString('Error saving user '),
              gettextCatalog.getString('This user could no be saved: ' + err)
            );
            if(cancelCb){
              cancelCb(err)
            }
          }
        );
      };

      this.delete = function (id, successCb, cancelCb) {
        CoreService.confirm(
          gettextCatalog.getString('Are you sure?'),
          gettextCatalog.getString('Deleting this cannot be undone'),
          function () {
            User.deleteById({id: id}, function () {
              CoreService.toastSuccess(
                gettextCatalog.getString('User deleted'),
                gettextCatalog.getString('Your user is deleted!'));
              successCb();
            }, function (err) {
              CoreService.toastError(
                gettextCatalog.getString('Error deleting user'),
                gettextCatalog.getString('Your user is not deleted! ') + err);
              cancelCb();
            });
          },
          function () {
            cancelCb();
          }
        );
      };


      this.getFormFields = function (formType) {
        var form = [
          {
            key: 'email',
            type: 'input',
            templateOptions: {
              label: gettextCatalog.getString('Email'),
              required: true,
              type: 'email',
              placeholder: 'Enter email',
              attr: {
                required: true,
                ngMinlength: 4
              },
              msgs: {
                required: gettextCatalog.getString('You need an email address'),
                email: gettextCatalog.getString('Email address needs to be valid')
              }
            },
            validators: {
              // Custom validator to check whether the driver's license
              // number that the user enters is valid or not
              unique: function($viewValue, $modelValue, scope) {
                var value = $modelValue || $viewValue;
                if(value ) {
                  var condition={filter: {'where':{email: value}}};
                  if(scope.model.id){
                    condition={filter: {'where':{email: value, 'id': { 'neq': scope.model.id }}}};
                  }
                  return User.find(condition).$promise.then(function(data){
                    //return data.length ? false : true;
                    if(data.length){
                      throw 'Email already exists'
                    }
                  });
                }
              }
            }
          },
          {
            key: 'username',
            type: 'input',
            templateOptions: {
              label: gettextCatalog.getString('Username'),
              required: true,
              type: 'input',
              placeholder: 'Enter Username',
              attr: {
                required: true,
                ngMinlength: 4
              },
              msgs: {
                required: gettextCatalog.getString('You need an username')
              }
            },
            validators: {
              // Custom validator to check whether the driver's license
              // number that the user enters is valid or not
              unique: function($viewValue, $modelValue, scope) {
                var value = $modelValue || $viewValue;
                //return false;
                if(value ) {
                  var condition={filter: {'where':{email: value}}};
                  if(scope.model.id){
                    condition={filter: {'where':{email: value, 'id': { 'neq': scope.model.id }}}};
                  }
                  return User.find(condition).$promise.then(function(data){
                    //return data.length ? false : true;
                    if(data.length && formType ==='add'){
                      throw 'username already exists'
                    }
                  });
                }
              }
            }
          },
          {
            key: 'firstName',
            type: 'input',
            templateOptions: {
              label: gettextCatalog.getString('First name'),
              placeholder: 'Enter first name'
            }
          },
          {
            key: 'lastName',
            type: 'input',
            templateOptions: {
              label: gettextCatalog.getString('Last name'),
              placeholder: 'Enter last name'
            }
          }
        ];
        if (formType === 'add') {
          form.push({
            key: 'password',
            type: 'input',
            templateOptions: {
              label: gettextCatalog.getString('Password'),
              placeholder: 'Enter password',
              required: true,
              type: 'password',
              attr: {
                ngMinlength: 8,
                required: true
              },
              msgs: {
                required: gettextCatalog.getString('You need an password'),
                minlength: gettextCatalog.getString('Needs to have at least 8 characters')
              }
            }
          });
        }
        return form;
      };

    });

})();

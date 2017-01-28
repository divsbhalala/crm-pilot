var _ = require("lodash");

module.exports = function (user) {

  user.validatesUniquenessOf('email');
  // Set the username to the users email address by default.
  user.observe('before save', function setDefaultUsername(ctx, next) {
    if (ctx.instance) {
      if(ctx.isNewInstance) {
        //ctx.instance.username = ctx.instance.email;
      }
      ctx.instance.status = 'created';
      ctx.instance.created = Date.now();
    }
    next();
  });

  user.afterRemote('create', function (ctx, userInstance, next) {

    var Role = user.app.models.Role;

    Role.findOrCreate(
      {where: {name: 'admin'}}, // find
      {name: 'admin'}, function (err, role, d) {
      //if (err) cb(err);

      //make bob an admin
      role.principals.create({
        principalType: user.app.models.RoleMapping.USER,
        principalId: userInstance.id
      }, function (err, principal) {
        //cb(err);
        next();
      });
    });
  });

  user.observe('loaded', function (ctx, next) {
    ctx.instance = _.map(ctx.instance, function (item, key) {
      if (item && key === '__data') {
       item.display_name=item.firstName + ' ' + item.lastName;
      }
    })
    next();
  });

  user.afterRemote('login', function (ctx, c, next) {
    console.log(ctx.result);
    console.log(ctx.result.user);
    console.log(ctx.result.user.firstname);
    next();
  });

};

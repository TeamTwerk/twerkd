module.exports = {
  init: function (app, mongoose) {
    var Schema = mongoose.Schema;

    var User = new Schema({
      udid: {type: String},
      username: {type: String, default: "new user"}
    });

    var UserModel = mongoose.model('User', User);

    app.get('/api/users/:id', function (req, res) {
      return UserModel.findOne({id: req.params.id}, function (err, user) {
        if (!err) {
          return res.send(user);
        } else {
          return console.err(err);
        }
      });
    });

      app.get('/api/users', function (req, res) {
        return UserModel.find(function (err, user) {
          if (!err) {
            return res.send(user);
          } else {
            return console.err(err);
          }
        });
    });
  }
}

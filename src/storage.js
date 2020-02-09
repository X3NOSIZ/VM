var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  
  logging: false,

  storage: 'database.sqlite'
});


var Vm = sequelize.define('Vm', {
    id: { type: Sequelize.STRING(15), unique: true, primaryKey: true },
    message: Sequelize.TEXT
});

sequelize.sync();


function randomStr() {
    return Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1);
}

function gen(id) {
    var id = randomStr();
    return Vm.findById(id).then(result => result ? gen() : id);
}


module.exports.getVm = function(id) {
    return Vm.findById(id);
}

module.exports.addVm = (message) => gen().then(id => Vm.create({
    id: id,
    message: message
}));

module.exports.deleteVm = function(id) {
    Vm.findById(id).then(vm => vm.destroy());
}

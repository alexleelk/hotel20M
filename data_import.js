var fs = require('fs')
  ,lineReader = require('line-reader')
  ,mongoose = require('mongoose')
  ,Schema = mongoose.Schema;

var read_counter = 0;
var write_counter = 0;

var db, lodgingSchema, lodgingModel;

function main(argv){
  var file = argv[0];
  console.log('The import file is %s, let\'s begin...', file);
  init_db(file);
}

function init_db(file){
  mongoose.connect('mongodb://localhost/hotel');
  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    lodgingSchema = new Schema({
      name: String
      , id: String
      , sex: String
      , birthday: String
      , address: String
      , zipcode: String
      , mobile: String
      , telphone: String
      , email: String
      , company: String
    });
    mongoose.model('lodging', lodgingSchema);
    lodgingModel = mongoose.model('lodging');
    console.log('db init ok...');
    process_file(file);
  });
}

function process_file(file){
  lineReader.eachLine(file, function(line, last) {
    read_counter++;

    //format data to json
    format_data(line, last);

    if (last == true) {
      if (line.length >= 10) {
        format_data(line, last);
      }
    }
  });
}

function format_data(line, last){
  var str = line.split(',');
  //console.log('str[%d]=%s', i, str[i]);
  var data = {
    name: str[0]
    , id: str[4]
    , sex: str[5]
    , birthday: str[6]
    , address: str[7]
    , zipcode: str[8]
    , mobile: str[19]
    , telphone: str[20]
    , email: str[22]
    , company: str[26]
  }
  console.log('current data is :' + data.name);
  write_to_db(data, last);
}

function write_to_db(row_data, last){
  var aLodg = new lodgingModel(row_data);
  //console.log('write to db:' + row_data.name);
  aLodg.save(function (err, aLodg) {
    if (err) return console.error(err);
    write_counter++;
    if (last) {
      console.log('It\'s done, read:%d, write:%d', read_counter, write_counter);
      process.exit(0);
    }
  });
}

main(process.argv.slice(2));

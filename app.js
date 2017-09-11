var Busboy = require('busboy'); // 0.2.9
var express = require('express'); // 4.12.3
var mongo = require('mongodb'); // 2.0.31
var Grid = require('gridfs-stream'); // 1.1.1"
var app = express();
var server = app.listen(9002);

var db = new mongo.Db('test', new mongo.Server('127.0.0.1', 27017));
var gfs;
db.open(function(err, db) {
  if (err) throw err;
  gfs = Grid(db, mongo);
});
 
app.post('/file', function(req, res) {
  var busboy = new Busboy({ headers : req.headers });
  var fileId = new mongo.ObjectId();

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('got file', filename, mimetype, encoding);
    var writeStream = gfs.createWriteStream({
      _id: fileId,
      filename: filename,
      mode: 'w',
      content_type: mimetype,
    });
    file.pipe(writeStream);
  }).on('finish', function() {
    // show a link to the uploaded file
    res.writeHead(200, {'content-type': 'text/html'});
    res.end('<a href="/file/' + fileId.toString() + '">download file</a>');
  });

  req.pipe(busboy);
});

app.get('/', function(req, res) {
  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/file" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="file"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
});

app.get('/file/:id', function(req, res) {
  gfs.findOne({ _id: req.params.id }, function (err, file) {
    if (err) return res.status(400).send(err);
    if (!file) return res.status(404).send('');
    
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
    
    var readstream = gfs.createReadStream({
      _id: file._id
    });
    
    readstream.on("error", function(err) {
      console.log("Got error while processing stream " + err.message);
      res.end();
    });
    
    readstream.pipe(res);
  });
});


// ts的写法 将pdf存入数据库
// import { BaseRoute } from './route';
// import { NextFunction, Request, Response, Router } from 'express';
// import * as fs from 'fs';
// import * as Grid from 'gridfs-stream';
// import * as Gridfs from 'gridfs';
// import * as mongoose from 'mongoose';
// import { Filename } from '../mongose/pdf-name';
// import * as multer from 'multer';
// import  * as Busboy from 'busboy';
// import * as mongo from 'mongodb';


// var db = new mongo.Db('test', new mongo.Server('127.0.0.1', 27017));
// var gfs;
// db.open(function (err, db) {
//     if (err) throw err;
//     gfs = Grid(db, mongo);
// });
// export default class AuthRoute extends BaseRoute {
//     public static AddRouter(router: Router) {
//         router.get('/rules', function (req, res) {
//             Filename.find({}, function (err, names) {
//                 // console.log(names);
//                 let name = names.reverse();
//                 let newfile = [];
//                 name.forEach(function (ele) {

//                 })
//                 res.send(names);
//             });
//         })

//         // let upload = multer({ dest: '/uploads' });

//         router.post('/rules', function (req, res) {
//             var busboy = new Busboy({ headers: req.headers });
//             var fileId = new mongo.ObjectId();
//             busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
//                 console.log('got file', filename, mimetype, encoding);
//                 var writeStream = gfs.createWriteStream({
//                     _id: fileId,
//                     filename: filename,
//                     mode: 'w',
//                     content_type: mimetype,
//                 });
//                 file.pipe(writeStream);
//             }).on('finish', function () {
//                 res.header({ 'content-type': 'text/plain','charset' : 'utf-8'});
//                res.send('上传成功')
//                 // res.end('<a href="/file/' + fileId.toString() + '">download file</a>');
//             });
//             req.pipe(busboy);
//         });
        

//         router.get('/file/:filename', function (req, res) {
//             // console.log(req.param);
//             let filename = req.params.filename;
//             // console.log(filename)
//             var gfss = Gridfs(mongoose.connection.db, mongoose.mongo);
//             gfss.readFile({ 'filename': filename }, function (err, data) {
//                 // console.log(data.toString());
//                 // console.log(data);
//                 res.header('application/pdf; charset=utf-8');
//                 res.end(data);
//             })

//         })






//     }
// }


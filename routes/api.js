/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var MDB = require('../db');
const { body, validationResult } = require('express-validator')

module.exports = function (app) {
      // The method Validate uses express-validator to validate incoming parameters to the different requests and creates erorr message
    var validate = (method) => {
      switch (method) {
        case 'postBook': {
         return [ 
            body('title').exists()           ]   
        }
        case 'postComment': {
         return [ 
            // body('_id').exists().isMongoId(),
            body('comment').exists()
           ]   
        }

      }
    }

  app.route('/api/books')
    .get(function (req, res){
      var db=MDB.get();
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      var db=MDB.get();

      db.collection('books').aggregate([
         {
            $project: {
               title: 1,
               commentcount: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: "0"} }
            }
         }
      ]).toArray((err, docs) => {
          if(err) {
            console.log('ERROR: ' + err)
            res.json([{}]);
          } else {
            res.json(docs);
          }
      });
    
    })
    
    .post(validate('postBook'), function (req, res){
            const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
            if (!errors.isEmpty()) {
              res.status(422).json({ errors: errors.array() });
              return;
            }
            //response will contain new book object including atleast _id and title
            var db=MDB.get();

            var obj={
             title: req.body.title,
             comments: []
            }
          db.collection('books').insertOne(obj
            ,(err, doc) => {
                if(err) {
                    console.log(err);
                    res.redirect({ message: 'could not insert book'});
                } else {
                    res.json(obj);
                }
            });
    })
    
    .delete(function(req, res){
      var db=MDB.get();
      //if successful response will be 'complete delete successful'

      db.collection('books').deleteMany({},(err, doc) => {
          if(err) {
              res.json({ message: 'could not perform complete delete'});
          } else {
              res.json({ message: 'complete delete successful' })
          }
      });
            
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      var db=MDB.get();
    
      if (!ObjectId.isValid(req.params.id)) {
        return res.json({message: 'no book exists'});
      } 
    
      db.collection('books').find({ _id : new ObjectId(bookid) }).toArray((err, docs) => {
          if(err) {
            console.log('ERROR: ' + err)
            res.json([{}]);
          } else {
            //TODO: validar que si no existe responde  'no book exists' 
            if (docs.length==0) return res.json ({message: 'no book exists'});
            res.json(docs);
          }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(validate('postComment'), function (req, res){
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
      if (!ObjectId.isValid(req.params.id)) {
        return res.json({message: 'no book exists'});
      } 
      var bookId = new ObjectId(req.params.id);
      var comment = req.body.comment;
      var db=MDB.get();

      db.collection('books').findOneAndUpdate(
        { _id: bookId},
        {  $push: {comments: comment }},
     {returnOriginal: false}
      ,(err, doc) => {
          if(err) {
              res.json({ message: 'could not update '+ req.params.id });
          } else {
              if (doc.lastErrorObject.updatedExisting==false) return res.json({ message: 'no book exists' });
              //json res format same as .get
              else return res.json([doc.value]);
          }
      });
        
    

    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      var db=MDB.get();
    
      if (!ObjectId.isValid(req.params.id)) {
        return res.json({message: 'no book exists'});
      } 
      //if successful response will be 'delete successful'

      db.collection('books').deleteOne({ _id: new ObjectId(bookid) },(err, doc) => {
          if(err) {
              return res.json({ message: 'no book exists' });
          } else {
              if (doc.deletedCount==1) return res.json({ message: 'delete successful' })
              else return res.json({ message: 'no book exists' });;
          }
      });
    });
  
};

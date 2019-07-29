/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var ObjectId = require('mongodb').ObjectId;
chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    let tempID;
    // I can post a title to /api/books to add a book and returned will be the object with the title and a unique _id.
    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
       chai.request(server)
        .post('/api/books')
        .send({
          title: 'This is the title for the POST test'
        })
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          tempID=res.body._id;
          assert.propertyVal(res.body, 'title', 'This is the title for the POST test' );
           
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
       chai.request(server)
        .post('/api/books')
        .send({ })
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 422);
           
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
        })
      });
      
    });

    // I can get /api/books to retrieve an aray of all books containing title, _id, & commentcount.
    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], 'commentcount');
           
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
         })
      });      
      
    });

    // I can get /api/books/{_id} to retrieve a single object of a book containing title, _id, 
    // & an array of comments (empty array if no comments present).
    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/'+new ObjectId())
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'message', 'no book exists');
           
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
         })

      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/'+ tempID)
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], 'comments');
          assert.isArray(res.body[0].comments); 
           
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
         })

      });
      
    });

    // I can post a comment to /api/books/{_id} to add a comment to a book and 
    // returned will be the books object similar to get /api/books/{_id}.
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
       chai.request(server)
        .post('/api/books/'+ tempID)
        .send({
          comment: 'This is the a comment for the post comment test'
        })
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.property(res.body[0], '_id');
          tempID=res.body[0]._id;
          assert.property(res.body[0], 'comments');
          assert.isArray(res.body[0].comments); 
          assert.include(res.body[0].comments, 'This is the a comment for the post comment test', 'array contains value');
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
        })
      });
      
    });

    suite('DELETE /api/books/[id] ', function(){
      
      test('Test DELETE /api/books/[id] - Existing Id', function(done){
       chai.request(server)
        .delete('/api/books/'+ tempID)
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'message','delete successful');
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
        })
      });
     
      test('Test DELETE /api/books/[id] - Non-existing Id', function(done){
       chai.request(server)
        .delete('/api/books/'+ tempID)
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'message','no book exists');
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
        })
      });
      
      test('Test DELETE /api/books/ - Deletes all books', function(done){
       chai.request(server)
        .delete('/api/books/')
        .end(function(err, res){
         if (err) {
           console.log(err);
           return done(err);
         }try{
           
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'message','complete delete successful');
         } catch(err){
           console.log(err)
           return done(err);
         } 
           done();
        })
      });
    });


    
  });

});

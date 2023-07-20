const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // #1
  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({ issue_title: 'Fix error', issue_text: 'Error posting data', created_by: 'Yogi Bear', assigned_to: 'Steve Smith', status_text: 'In progress' })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.issue_title,
          'Fix error',
          'res.body.issue_title should be "Fix error"'
        )
        assert.equal(
          res.body.issue_text,
          'Error posting data',
          'res.body.issue_text should be "Error posting data"'
        )
        assert.equal(
          res.body.created_by,
          'Yogi Bear',
          'res.body.created_by should be "Yogi Bear"'
        )
        assert.equal(
          res.body.assigned_to,
          'Steve Smith',
          'res.body.assigned_to should be "Steve Smith"'
        )
        assert.equal(
          res.body.status_text,
          'In progress',
          'res.body.status_text should be "In progress"'
        )
        done();
      });
  });

  // #2
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({ issue_title: 'Fix error', issue_text: 'Error posting data', created_by: 'Yogi Bear', assigned_to: '', status_text: '' })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.issue_title,
          'Fix error',
          'res.body.issue_title should be "Fix error"'
        )
        assert.equal(
          res.body.issue_text,
          'Error posting data',
          'res.body.issue_text should be "Error posting data"'
        )
        assert.equal(
          res.body.created_by,
          'Yogi Bear',
          'res.body.created_by should be "Yogi Bear"'
        )
        assert.equal(
          res.body.assigned_to,
          '',
          'res.body.assigned_to should be ""'
        )
        assert.equal(
          res.body.status_text,
          '',
          'res.body.status_text should be ""'
        )
        done();
      });
  });

  // #3
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({ issue_text: 'Error posting data', created_by: 'Yogi Bear', assigned_to: '', status_text: '' })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.error,
          'required field(s) missing',
          'res.body.error should be "required field(s) missing"'
        )
        done();
      });
  });

  // #4
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/functionaltests')
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.isArray(res.body, "It should be an array")
        assert.deepEqual(res.body[0], { 
          "_id": "5871dda29faedc3491ff93bb",
          "issue_title": "Fix error in posting data",
          "issue_text": "When we post data it has an error.",
          "created_on": "2017-01-08T06:35:14.240Z",
          "updated_on": "2017-01-08T06:35:14.240Z",
          "created_by": "Joe",
          "assigned_to": "Joe",
          "open": false,
          "status_text": "In QA"
        })
        done();
      });
  });

  // #5
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/functionaltests?created_by=Curious+George')
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.isArray(res.body, "It should be an array")
        assert.equal(res.body.length, 1, "The array length should be 1")
        assert.deepEqual(res.body[0], { 
          "_id": "5871dda29faedc3491ff93cc",
          "issue_title": "Put bananas in salad",
          "issue_text": "There are no bananas!",
          "created_on": "2017-01-08T06:35:14.240Z",
          "updated_on": "2017-01-08T06:35:14.240Z",
          "created_by": "Curious George",
          "assigned_to": "Steve Smith",
          "open": true,
          "status_text": "In Recipe"
        })
        done();
      });
  });

  // #6
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/functionaltests?created_by=Curious+George&open=true')
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.isArray(res.body, "It should be an array")
        assert.equal(res.body.length, 1, "The array length should be 1")
        assert.deepEqual(res.body[0], { 
          "_id": "5871dda29faedc3491ff93cc",
          "issue_title": "Put bananas in salad",
          "issue_text": "There are no bananas!",
          "created_on": "2017-01-08T06:35:14.240Z",
          "updated_on": "2017-01-08T06:35:14.240Z",
          "created_by": "Curious George",
          "assigned_to": "Steve Smith",
          "open": true,
          "status_text": "In Recipe"
        })
        done();
      });
  });

// #7
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/functionaltests')
      .send({ 
        "_id": "5871dda29faedc3491ff93ee", 
        "issue_title": "", 
        "issue_text": "", 
        "created_by": "Lazlo", 
        "assigned_to": "", 
        "status_text": ""
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.result,
          'successfully updated',
          'res.body.result should be "successfully updated"'
        )
        assert.equal(
          res.body._id,
          '5871dda29faedc3491ff93ee',
          'res.body._id should be "5871dda29faedc3491ff93ee"'
        )
        done();
      });
  });

  // #8
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/functionaltests')
      .send({ 
        "_id": "5871dda29faedc3491ff93ee", 
        "issue_title": "New title", 
        "issue_text": "New text", 
        "created_by": "Lazlo", 
        "assigned_to": "Pablo", 
        "status_text": "Closer still"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.result,
          'successfully updated',
          'res.body.result should be "successfully updated"'
        )
        assert.equal(
          res.body._id,
          '5871dda29faedc3491ff93ee',
          'res.body._id should be "5871dda29faedc3491ff93ee"'
        )
        done();
      });
  });
  
// #9
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/functionaltests')
      .send({ 
        "issue_title": "These unit tests are taking too long", 
        "issue_text": "Taking as long as the coding itself", 
        "created_by": "FCC", 
        "assigned_to": "Me", 
        "open": false, 
        "status_text": "Going along"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.error,
          'missing _id',
          'res.body.error should be "missing _id"'
        )
        done();
      });
  });
  
// #10
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/functionaltests')
      .send({ 
        "_id": "5871dda29faedc3491ff93ee",
        "issue_title": "", 
        "issue_text": "", 
        "created_by": "", 
        "assigned_to": "",          
        "status_text": ""
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.error,
          'no update field(s) sent',
          'res.body.error should be "no update field(s) sent"'
        )
        assert.equal(
          res.body._id,
          '5871dda29faedc3491ff93ee',
          'res.body._id should be "5871dda29faedc3491ff93ee"'
        )
        done();
      });
  });
  
// #11
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/functionaltests')
      .send({ 
        "_id": "blahblahblahinvalid_id",
        "issue_title": "These unit tests are taking too long", 
        "issue_text": "Taking as long as the coding itself", 
        "created_by": "FCC", 
        "assigned_to": "Me", 
        "open": false, 
        "status_text": "Going along"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.error,
          'could not update',
          'res.body.error should be "could not update"'
        )
        assert.equal(
          res.body._id,
          'blahblahblahinvalid_id',
          'res.body._id should be "blahblahblahinvalid_id"'
        )
        done();
      });
  });
  
// #12
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/functionaltests')
      .send({ 
        "_id": "5871dda29faedc3491ff93dd"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.result,
          'successfully deleted',
          'res.body.result should be "successfully deleted"'
        )
        assert.equal(
          res.body._id,
          '5871dda29faedc3491ff93dd',
          'res.body._id should be "5871dda29faedc3491ff93dd"'
        )
        done();
      });
  });
  
// #13
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/functionaltests')
      .send({ 
        "_id": "blahblahblahinvalid_id"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.error,
          'could not delete',
          'res.body.error should be "could not delete"'
        )
        assert.equal(
          res.body._id,
          'blahblahblahinvalid_id',
          'res.body._id should be "blahblahblahinvalid_id"'
        )
        done();
      });
  });
  
// #14
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/functionaltests')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200, 'response status should be 200')
        assert.equal(res.type, 'application/json', 'Response should be json')
        assert.equal(
          res.body.error,
          'missing _id',
          'res.body.error should be "missing _id"'
        )
        done();
      });
  });
  
});
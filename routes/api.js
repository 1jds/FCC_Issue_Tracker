'use strict';
const ObjectId = require('mongodb').ObjectId;

module.exports = function(app, myDatabase) {

  app.route('/api/issues/:project')

    //Get all the issues under a particular project
    .get(async function(req, res) {
      const project = req.params.project;
      const reqQueryObj = req.query
      const reqQueryObjLength = Object.keys(reqQueryObj).length
      const projectArr = await myDatabase.findOne({ name: project })
      const issuesArr = [...projectArr.issues]
      if (reqQueryObjLength > 0) {
        const returnArr = issuesArr.filter(item => {
          let counterForMatches = 0;
          for (const property in reqQueryObj) {
            // The reason for adding + '' here is because the url query object contains only strings, whereas the database returned objects contain booleans as well such as the value of the 'open' property. So the boolean in, for example, 'open: true' needs to first be cast to a string before comparison to ensure accurate comparison.
            if (reqQueryObj[property] === item[property] + '') {
              counterForMatches++
            }
          }
          return counterForMatches === reqQueryObjLength ? item : null
        })
        res.send([...returnArr])
        return
      }
      res.send([...projectArr.issues])
      return
    })

    //Submit an issue to a particular project
    .post(async function(req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      if (!issue_title || !issue_text || !created_by) {
        res.send({ error: 'required field(s) missing' })
        return
      }
      const doesProjectDocAlreadyExist = await myDatabase.countDocuments({ name: project })
      if (doesProjectDocAlreadyExist === 0) {
        const insertedDocument = await myDatabase.insertOne({
          name: project,
          issues: []
        });
      }

      const currentDateZuluTime = new Date().toISOString()
      const newId = new ObjectId().toString()
      const newIssueToInsert = {
        assigned_to: assigned_to ? assigned_to : "",
        status_text: status_text ? status_text : "",
        open: true,
        _id: newId,
        issue_title,
        issue_text,
        created_by,
        created_on: currentDateZuluTime,
        updated_on: currentDateZuluTime,
      }

      const insertedIssue = await myDatabase.updateOne(
        { name: project },
        { $push: { issues: newIssueToInsert } }
      )

      res.send(newIssueToInsert)
    })


    //Update an issue for a particular project
    .put(async function(req, res) {
      const project = req.params.project;
      const reqBody = req.body;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = reqBody

      if (!_id) {
        res.send({ error: 'missing _id' })
        return
      } else if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        res.send({ error: 'no update field(s) sent', '_id': _id })
        return
      }

      const projectArr = await myDatabase.findOne({ name: project })
      //could insert error handling here in the case that the searched for project doesn't exist on the database
      const issuesArr = [...projectArr.issues]
      const issueToUpdate = issuesArr.filter(item => item._id === _id)
      if (issueToUpdate.length === 0) {
        res.send({ error: 'could not update', '_id': _id })
        return
      }

      const issueToUpdateUpdatedObj = {
        ...issueToUpdate[0],
        issue_title: issue_title ? issue_title : issueToUpdate[0].issue_title,
        issue_text: issue_text ? issue_text : issueToUpdate[0].issue_text,
        created_by: created_by ? created_by : issueToUpdate[0].created_by,
        status_text: status_text ? status_text : issueToUpdate[0].status_text,
        assigned_to: assigned_to ? assigned_to : issueToUpdate[0].assigned_to,
        updated_on: new Date().toISOString(),
        open: open ? false : issueToUpdate[0].open
      }

      console.log(issueToUpdateUpdatedObj)

      const responseToUpdatedObj = await myDatabase.updateOne(
        { name: project, "issues._id": _id },
        { $set: { "issues.$": issueToUpdateUpdatedObj } }
      )
      if (responseToUpdatedObj.modifiedCount === 1) {
        res.send({ result: 'successfully updated', '_id': _id })
        return
      } else {
        res.send({ error: 'could not update', '_id': _id })
        return
      }
    })

    //Delete an issue for a particular project
    .delete(async function(req, res) {
      const project = req.params.project;
      const { _id } = req.body
      if (!_id) {
        res.send({ error: 'missing _id' })
        return
      }
      const deletedResult = await myDatabase.updateOne({ name: project }, { $pull: { issues: { _id: _id } } })
      console.log(deletedResult)
      if (deletedResult.modifiedCount === 1 && deletedResult.matchedCount === 1) {
        res.send({ result: 'successfully deleted', '_id': _id })
        return
      } else {
        res.send({ error: 'could not delete', '_id': _id })
        return
      }
    });
};

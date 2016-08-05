'use strict';

const Tool = require('../../lib');
const shortid = require('shortid');

class OneTool extends Tool {
  constructor(dependencies, configuration) {
    const instance = super(dependencies, configuration);
    /*if (instance.singleton && instance.fullyInitialized) {
      return instance;
    }*/
    const uid = shortid.generate();
    console.log(`Setting uid to ${uid}`);
    this.uid = uid;
    //this.fullyInitialized = true;
  }
}

module.exports = OneTool;

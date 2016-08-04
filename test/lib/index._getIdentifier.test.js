'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mockrequire = require('mock-require');
const _ = require('lodash');

const Tool = require('../../lib/index');
const hash = require('object-hash');

const DEFAULTDEPENDENCIES = {};
const DEFAULTCONFIG = {
  name: 'tool',
  properties: {
    foo: 'foo',
    bar: 111,
    qux: {
      baz: [1, 2, 3],
      quuz: true,
    },
  },
};

describe('Tool - _getIdentifier', function() {
  let tool;
  let result;
  before(function() {
    tool = new Tool(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
    result = tool._getIdentifier(tool.properties);
  });
  after(function() {
    mockrequire.stopAll();
  });
  it('should return hash from tool.properties', function() {
    expect(result).to.equal(hash(tool.properties));
  });

  it('should equal hash returned with same argument', function() {
    const cloneArgument = _.cloneDeep(tool.properties);
    expect(result).to.equal(hash(cloneArgument));
  });

  it('should equal hash returned with similar argument', function() {
    const cloneArgument = _.cloneDeep(tool.properties);
    delete cloneArgument.foo;
    cloneArgument.foo = tool.properties.foo;
    expect(result).to.equal(hash(cloneArgument));
  });

  it('should equal not hash returned with (slightly) different argument', function() {
    const cloneArgument = _.cloneDeep(tool.properties);
    cloneArgument.qux.quuz = false;
    expect(result).to.not.equal(hash(cloneArgument));
  });
});

'use strict';

const chai = require('chai');
const assert = chai.assert;
const OneTool = require('./index.true.singleton.testdata');

const instances = {};
const uid = {};
const config = {
  name: 'oneTool',
  properties: {},
};
const dependencies = {};

describe('True singleton', () => {
  it('should return same instances when singleton set to true', () => {
    config.singleton = true;
    instances.one = new OneTool(dependencies, config);
    instances.one.foo = 'bar';
    uid.one = instances.one.uid; // store in memory the uid value after first invocation of constructor
    instances.two = new OneTool(dependencies, config);
    uid.two = instances.two.uid;
    assert.strictEqual(instances.two.foo, 'bar');
    assert.strictEqual(uid.two, uid.one);
    instances.two.bar = 'foo';
    assert.strictEqual(instances.one.bar, 'foo');
    instances.three = new OneTool(dependencies, config);
    uid.three = instances.three.uid;
    assert.strictEqual(instances.three.foo, 'bar');
    assert.strictEqual(instances.three.bar, 'foo');
    assert.strictEqual(uid.three, uid.one);
  });
  it('should return different instances when singleton set to false', () => {
    config.singleton = false;
    instances.ten = new OneTool(dependencies, config);
    uid.ten = instances.ten.uid;
    assert.notProperty(instances.ten, 'foo');
    assert.notProperty(instances.ten, 'bar');
    assert.notEqual(uid.ten, uid.one);
    instances.ten.prop = 'prop';
    instances.eleven = new OneTool(dependencies, config);
    uid.eleven = instances.eleven.uid;
    assert.notProperty(instances.eleven, 'foo');
    assert.notProperty(instances.eleven, 'bar');
    assert.notProperty(instances.eleven, 'prop');
    assert.notEqual(uid.eleven, uid.one);
    assert.notEqual(uid.eleven, uid.ten);
  });
});

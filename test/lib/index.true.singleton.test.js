'use strict';

const chai = require('chai');
const assert = chai.assert;
const OneTool = require('./index.true.singleton.testdata');

const instances = {};
const config = {
  name: 'oneTool',
  properties: {},
  singleton: true,
};
const dependencies = {};

describe('True singleton', () => {
  it('should return same instance', (done) => {
    instances.one = new OneTool(dependencies, config);
    instances.one.foo = 'bar';
    const uidone = instances.one.uid; // store in memory the uid value after first invocation of constructor
    // setTimeout(() => {
    instances.two = new OneTool(dependencies, config);
    assert.strictEqual(instances.two.foo, 'bar');
    assert.strictEqual(instances.two.uid, uidone);
    instances.two.bar = 'foo';
    assert.strictEqual(instances.one.bar, 'foo');
    // setTimeout(() => {
    instances.three = new OneTool(dependencies, config);
    assert.strictEqual(instances.three.foo, 'bar');
    assert.strictEqual(instances.three.bar, 'foo');
    assert.strictEqual(instances.three.uid, uidone);
    done();
    // }, 10);
    // }, 10);
  });
  it('should return different instance', () => {
    config.singleton = false;
    instances.ten = new OneTool(dependencies, config);
    assert.notProperty(instances.ten, 'foo');
    assert.notProperty(instances.ten, 'bar');
    assert.notEqual(instances.ten.uid, instances.one.uid);
    assert.notEqual(instances.ten.uid, instances.two.uid);
    assert.notEqual(instances.ten.uid, instances.three.uid);
    instances.ten.prop = 'prop';
    instances.eleven = new OneTool(dependencies, config);
    assert.notProperty(instances.eleven, 'foo');
    assert.notProperty(instances.eleven, 'bar');
    assert.notProperty(instances.eleven, 'prop');
    assert.notEqual(instances.eleven.uid, instances.one.uid);
    assert.notEqual(instances.eleven.uid, instances.two.uid);
    assert.notEqual(instances.eleven.uid, instances.three.uid);
    assert.notEqual(instances.eleven.uid, instances.ten.uid);
  });
});

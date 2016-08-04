'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const _ = require('lodash');

const Tool = require('../../lib/index');
const GLOBALKEY = Symbol.for(Tool.name);
const DEFAULTDEPENDENCIES = {};
const DEFAULTCONFIG = {
  name: 'tool',
  properties: {},
};

describe('Tool - constructor', function() {
  context('when instance should not be a singleton', function() {
    before(function() {
      // stubbing and spying global Map to ensure it is not used
      global[GLOBALKEY] = new Map();
      sinon.spy(global[GLOBALKEY], 'set');
    });
    after(function() {
      global[GLOBALKEY].clear();
    });

    context(`when missing/incorrect 'dependencies' argument`, function() {
      it('should throw an Error', function() {
        return expect(function() {
          return new Tool(null, DEFAULTCONFIG);
        }).to.throw(Error, `missing/incorrect 'dependencies' object argument`);
      });
    });

    context(`when missing/incorrect 'configuration' argument`, function() {
      it('should throw an Error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, null);
        }).to.throw(Error, `missing/incorrect 'configuration' object argument`);
      });
    });

    context('when missing/incorrect name string property in configuration', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.name = {};
      it('should throw an error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, config);
        }).to.throw(Error, `missing/incorrect 'name' string property in configuration`);
      });
    });

    context('when incorrect singleton boolean property in configuration', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.singleton = {};
      it('should throw an error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, config);
        }).to.throw(Error, `incorrect 'singleton' boolean property in configuration`);
      });
    });

    context('when missing/incorrect properties object property in configuration', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.properties = '';
      it('should throw an error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, config);
        }).to.throw(Error, `incorrect 'properties' object property in configuration`);
      });
    });

    context('when valid', function() {
      let tool;
      before(function() {
        sinon.stub(Tool.prototype, '_doConstruct');
        tool = new Tool(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
      });
      after(function() {
        Tool.prototype._doConstruct.restore();
      });
      it('should call _doConstruct method', function() {
        sinon.assert.called(Tool.prototype._doConstruct);
      });
      it('instantiate with 2 params', () => {
        assert.deepEqual(tool.dependencies, DEFAULTDEPENDENCIES);
        assert.deepEqual(tool.configuration, DEFAULTCONFIG);
        assert.equal(tool.name, DEFAULTCONFIG.name);
        assert.equal(tool.properties, DEFAULTCONFIG.properties);
      });
      it('should not set the instance in the global Map', function() {
        sinon.assert.notCalled(global[GLOBALKEY].set);
      });
    });
  });

  context('when instance should be a singleton', function() {
    const getIdentifier = function(parameters) {
      return [parameters.foo, parameters.bar].join('-');
    };

    context('when configuration does not match existing instances', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.singleton = true;
      config.properties = {
        foo: 'toto',
        bar: 2,
      };
      let identifier;
      let instance;
      before(function() {
        sinon.stub(Tool.prototype, '_getIdentifier', getIdentifier);
        sinon.stub(Tool.prototype, '_doConstruct');
        identifier = getIdentifier(config.properties);
        delete global[GLOBALKEY];
        instance = new Tool(DEFAULTDEPENDENCIES, config);
      });

      after(function() {
        Tool.prototype._getIdentifier.restore();
        Tool.prototype._doConstruct.restore();
        delete global[GLOBALKEY];
      });

      it('should call _doConstruct method', function() {
        sinon.assert.called(Tool.prototype._doConstruct);
      });

      it('should set a new instance in the global Map', function() {
        expect(global[GLOBALKEY].has(identifier)).to.equal(true);
        expect(global[GLOBALKEY].get(identifier)).to.equal(instance);
      });
    });

    context('when configuration matches an existing instances', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.singleton = true;
      config.properties = {
        foo: 'toto',
        bar: 2,
      };
      let identifier;
      let instance;
      before(function() {
        sinon.stub(Tool.prototype, '_doConstruct');
        sinon.stub(Tool.prototype, '_getIdentifier', getIdentifier);
        identifier = getIdentifier(config.properties);
        global[GLOBALKEY] = new Map();
        global[GLOBALKEY].set(identifier, new Tool(DEFAULTDEPENDENCIES, config));
        instance = new Tool(DEFAULTDEPENDENCIES, config);
      });

      after(function() {
        Tool.prototype._doConstruct.restore();
        Tool.prototype._getIdentifier.restore();
        global[GLOBALKEY].clear();
      });

      it('should return an existing instance of Tool', function() {
        expect(instance).to.be.equal(global[GLOBALKEY].get(identifier));
      });
    });
  });
});

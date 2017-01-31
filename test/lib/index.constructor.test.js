'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const mockrequire = require('mock-require');
const _ = require('lodash');

const Tool = require('../../lib/index');
const GLOBALKEY = Symbol.for(Tool.name);
const DEFAULTDEPENDENCIES = {
  logger: {
    info: function() {},
    author: function() {
      return {
        info: sinon.stub(),
      };
    },
  },
};
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

    context('when missing/incorrect \'dependencies\' argument', function() {
      it('should throw an Error', function() {
        return expect(function() {
          return new Tool(null, DEFAULTCONFIG);
        }).to.throw(Error, 'missing/incorrect \'dependencies\' object argument');
      });
    });

    context('when missing/incorrect \'configuration\' argument', function() {
      it('should throw an Error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, null);
        }).to.throw(Error, 'missing/incorrect \'configuration\' object argument');
      });
    });

    context('when missing/incorrect name string property in configuration', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.name = {};
      it('should throw an error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, config);
        }).to.throw(Error, 'missing/incorrect \'name\' string property in configuration');
      });
    });

    context('when incorrect singleton boolean property in configuration', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.singleton = {};
      it('should throw an error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, config);
        }).to.throw(Error, 'incorrect \'singleton\' boolean property in configuration');
      });
    });

    context('when missing/incorrect properties object property in configuration', function() {
      const config = _.cloneDeep(DEFAULTCONFIG);
      config.properties = '';
      it('should throw an error', function() {
        return expect(function() {
          return new Tool(DEFAULTDEPENDENCIES, config);
        }).to.throw(Error, 'incorrect \'properties\' object property in configuration');
      });
    });

    context('when valid', function() {
      let tool;
      before(function() {
        tool = new Tool(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
      });
      after(function() {
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

    context('when valid and logger instance exists in dependencies', function() {
      let tool;
      let mockLoggerAuthorResult;
      before(function() {
        mockLoggerAuthorResult = {
          info: sinon.stub(),
        };
        sinon.stub(DEFAULTDEPENDENCIES.logger, 'author').withArgs(DEFAULTCONFIG.name).returns(mockLoggerAuthorResult);
        tool = new Tool(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
      });
      after(function() {
        DEFAULTDEPENDENCIES.logger.author.restore();
      });
      it('should set instance returned by dependencies.logger.author() method as a property of the Tool instance', function() {
        expect(tool).to.have.property('logger', mockLoggerAuthorResult);
      });
      it('should log a logger initialized message', function() {
        sinon.assert.calledWith(mockLoggerAuthorResult.info, `Initialized logger for Tool ${tool.name}`);
      });
    });

    context('when valid ok and logger instance does not exist in dependencies', function() {
      let tool;
      const dependencies = _.cloneDeep(DEFAULTDEPENDENCIES);
      delete dependencies.logger;
      let MockLoggerConstructor;
      let mockLogger;
      let mockLoggerAuthorResult;
      before(function() {
        mockLoggerAuthorResult = {
          info: sinon.stub(),
        };
        mockLogger = {
          author: sinon.stub().withArgs(DEFAULTCONFIG.name).returns(mockLoggerAuthorResult),
        };
        MockLoggerConstructor = sinon.stub().returns(mockLogger);
        mockrequire('cta-logger', MockLoggerConstructor);
        tool = new Tool(dependencies, DEFAULTCONFIG);
      });
      after(function() {
      });
      it('should create a new Logger', function() {
        sinon.assert.called(MockLoggerConstructor);
      });
      it('should set instance returned by new logger.author() method as a property of the Tool instance', function() {
        expect(tool).to.have.property('logger', mockLoggerAuthorResult);
      });
      it('should log a logger initialized message', function() {
        sinon.assert.calledWith(mockLoggerAuthorResult.info, `Initialized logger for Tool ${tool.name}`);
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
        identifier = getIdentifier(config.properties);
        delete global[GLOBALKEY];
        instance = new Tool(DEFAULTDEPENDENCIES, config);
      });

      after(function() {
        Tool.prototype._getIdentifier.restore();
        delete global[GLOBALKEY];
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
        sinon.stub(Tool.prototype, '_getIdentifier', getIdentifier);
        identifier = getIdentifier(config.properties);
        global[GLOBALKEY] = new Map();
        global[GLOBALKEY].set(identifier, new Tool(DEFAULTDEPENDENCIES, config));
        instance = new Tool(DEFAULTDEPENDENCIES, config);
      });

      after(function() {
        Tool.prototype._getIdentifier.restore();
        global[GLOBALKEY].clear();
      });

      it('should return an existing instance of Tool', function() {
        expect(instance).to.be.equal(global[GLOBALKEY].get(identifier));
      });
    });
  });
});

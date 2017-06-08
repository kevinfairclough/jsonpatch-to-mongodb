var assert = require('assert');
var toMongodb = require('../');
var chai = require('chai');

describe('rfc6902 to mongodb', function () {

  describe('arrays', function () {
    it('should work with single add of an array', function () {
      var patches = [{
        op: 'add',
        path: '/name',
        value: ['1', '2', '3']
      }];

      var expected = {
        $set: {
          name: ['1', '2', '3']
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with array set', function () {
      var patches = [{
        op: 'add',
        path: '/name/1',
        value: 'dave'
      }];

      var expected = {
        $set: {
          "name.1": 'dave'
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple set', function () {
      var patches = [{
        op: 'add',
        path: '/name/1',
        value: 'dave'
      }, {
        op: 'add',
        path: '/name/2',
        value: 'bob'
      }];

      var expected = {
        $set: {
          "name.1": 'dave', "name.2": "bob"
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with array append operator', function () {
      var patches = [{
        op: 'add',
        path: '/names/-',
        value: 'dave'
      }
      ];

      var expected = {
        $push: {
          names: {
            $each: ['dave']
          }

        }
      }

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with array append operator for multiple additions', function () {
      var patches = [{
        op: 'add',
        path: '/names/-',
        value: 'dave'
      }, {
        op: 'add',
        path: '/names/-',
        value: 'bob'
      }];

      var expected = {
        $push: {
          names: {
            $each: ['dave', 'bob']
          }
        }
      }

      assert.deepEqual(toMongodb(patches), expected);
    })

    it('should work with remove for array', function () {
      var patches = [{
        op: 'remove',
        path: '/names/1'
      }];

      var expected = {
        $unset: {
          "names.1": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for array', function () {
      var patches = [{
        op: 'remove',
        path: '/names/2'
      }, {
        op: 'remove',
        path: '/names/1'
      }];

      var expected = {
        $unset: {
          "names.2": 1,
          "names.1": 1
        }
      };
      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for array - empty an array with 2 elements (rfc6902 way)', function () {
      var patches = [{
        op: 'remove',
        path: '/names/0'
      }, {
        op: 'remove',
        path: '/names/0'
      }];

      var expected = {
        $unset: {
          "names.1": 1,
          "names.0": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for array - empty an array with 3 elements (rfc6902 way)', function () {
      var patches = [{
        op: 'remove',
        path: '/names/0'
      }, {
        op: 'remove',
        path: '/names/0'
      }, {
        op: 'remove',
        path: '/names/0'
      }];

      var expected = {
        $unset: {
          "names.2": 1,
          "names.1": 1,
          "names.0": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for array - deleting some elements (rfc6902 way)', function () {
      //
      //["a","b","c","d","e","f"]
      //      x   x       x   x
      //
      //results in patches |
      //                  \ /
      //                   '
      var patches = [{
        op: 'remove',
        path: '/names/1'
      }, {
        op: 'remove',
        path: '/names/1'
      }, {
        op: 'remove',
        path: '/names/2'
      }, {
        op: 'remove',
        path: '/names/2'
      }];

      var expected = {
        $unset: {
          "names.1": 1,
          "names.2": 1,
          "names.4": 1,
          "names.5": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for a sub-array - deleting some elements', function () {
      //
      //["a","b","c","d","e","f"]
      //      x   x       x   x
      //
      //results in patches |
      //                  \ /
      //                   '
      var patches = [{
        op: 'remove',
        path: '/prop/names/1'
      }, {
        op: 'remove',
        path: 'prop/names/1'
      }, {
        op: 'remove',
        path: 'prop/names/2'
      }, {
        op: 'remove',
        path: 'prop/names/2'
      }];

      var expected = {
        $unset: {
          "prop.names.1": 1,
          "prop.names.2": 1,
          "prop.names.4": 1,
          "prop.names.5": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for multiple array - empty an array with 2 element (rfc6902 way)', function () {
      var patches = [{
        op: 'remove',
        path: '/names/1'
      }, {
        op: 'remove',
        path: '/names/1'
      }, {
        op: 'remove',
        path: '/names2/1'
      }, {
        op: 'remove',
        path: '/names2/1'
      }];

      var expected = {
        $unset: {
          "names.2": 1,
          "names.1": 1,
          "names2.2": 1,
          "names2.1": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

    it('should work with multiple remove for multiple array at different levels - empty an array with 2 element (rfc6902 way)', function () {
      var patches = [{
        op: 'remove',
        path: '/names/1'
      }, {
        op: 'remove',
        path: '/names/1'
      }, {
        op: 'remove',
        path: '/names2/1'
      }, {
        op: 'remove',
        path: '/names2/1'
      }, {
        op: 'remove',
        path: '/aprop/names2/1'
      }, {
        op: 'remove',
        path: '/aprop/names2/1'
      }];

      var expected = {
        $unset: {
          "names.2": 1,
          "names.1": 1,
          "names2.2": 1,
          "names2.1": 1,
          "aprop.names2.2": 1,
          "aprop.names2.1": 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });



  })

  describe("add", function () {
    it('should work with single add', function () {
      var patches = [{
        op: 'add',
        path: '/name',
        value: 'dave'
      }];

      var expected = {
        $set: {
          name: 'dave'
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });



    it('should work with add sub-object', function () {
      var patches = [{
        op: 'add',
        path: '/name/first',
        value: 'dave'
      }];

      var expected = { $set: { "name.first": "dave" } };

      assert.deepEqual(toMongodb(patches), expected);
    })

    it('should work with multiple adds', function () {
      var patches = [{
        op: 'add',
        path: '/name',
        value: 'dave'
      }, {
        op: 'add',
        path: '/name',
        value: 'bob'
      }, {
        op: 'add',
        path: '/name',
        value: 'john'
      }];

      var expected = {
        $set: {
          name: 'john'
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });
  })

  describe("remove", function () {
    it('should work with remove', function () {
      var patches = [{
        op: 'remove',
        path: '/name',
        value: 'dave'
      }];

      var expected = {
        $unset: {
          name: 1
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });

  })

  describe("replace", function () {
    it('should work with replace', function () {
      var patches = [{
        op: 'replace',
        path: '/name',
        value: 'dave'
      }];

      var expected = {
        $set: {
          name: 'dave'
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    });
  })

  describe("test", function () {
    it('should work with test', function () {
      var patches = [{
        op: 'test',
        path: '/name',
        value: 'dave'
      }];

      var expected = {};

      assert.deepEqual(toMongodb(patches), expected);
    });
  })

  describe("move", function () {
    it('should blow up on move', function () {
      var patches = [{
        op: 'move',
        path: '/name',
        from: '/old_name'
      }];

      chai.expect(function () { toMongodb(patches) }).to.throw('Unsupported Operation! op = move');

    });
  })

  describe("copy", function () {
    it('should blow up on copy', function () {
      var patches = [{
        op: 'copy',
        path: '/name',
        from: '/old_name'
      }];

      chai.expect(function () { toMongodb(patches) }).to.throw('Unsupported Operation! op = copy');
    });
  });

  describe("whole hog", function () {

    it("Should do the whole hog", function () {
      var patches = [{
        op: 'add',
        path: '/name',
        value: ['1', '2', '3']
      }, {
        op: 'add',
        path: 'myprop',
        value: 'abcdef'
      },{
        op: 'add',
        path: 'myprop2/subprop',
        value: 'hello'
      }
      ];

      var expected = {
        $set: {
          name: ['1', '2', '3'],
          myprop: 'abcdef',
          'myprop2.subprop': 'hello'
        }
      };

      assert.deepEqual(toMongodb(patches), expected);
    })

  })

});

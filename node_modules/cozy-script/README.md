# CozyScript

CozyScript is a CoffeeScript fork and dialect.

This is an experimental project for implementing programming language. The popularity of CoffeeScript
and its clear implementation make it a good start.

CozyScript keeps all syntaxs of CoffeeScript but integrates and implements some useful language features
from other CoffeeScript dialects such as LiveScript.

## Differences to CoffeeScript

* Backcall function
* Implicit function call
* Currying
* Partially applied function
* Access/Call shorthand

    Introducing access/call shorthand syntax causes two CoffeeScript tests to fail (in test/operators.coffee).
    Failed tests are:

        test "multiple operators should space themselves", ->
          eq (+ +1), (- -1)
      
        test "#1703, ---x is invalid JS", ->
          x = 2
          eq (- --x), -1
      
    That is because CoffeeScript allows unary '+' and '-' to precede expression with space (e.g., + 1).
    Allowing spaces following those operators confuses an access/call shorthand with an unary operator usage
    for the case such as (+ +1). In CoffeeScript, the first '+' would be recognized as unary '+' for
    next expression +1. But for the syntax of access/call shorthand, it would be a binary operator '+'
    without left operand. To solve this confusion, by introducing access/call shorthand syntax, it is
    not allowd that unary '+' and '-' to precede expression with space.

## Backcall function

-- CozyScript --

    <- $ 1, 2, _
      console.log('test')

    (x) <- $ 1, _, 2
      console.log('test')

    <- $()
      console.log('test')

    x <- func 1, _, 2
      console.log('test')

    <- func_one()
      console.log('test')

      x <- func 1, _, 2
        console.log('test')



    phantom = require "phantom"
      (ph) <- phantom.create()
        (page) <- ph.createpage()
          (status) <- page.open google
            console.log "opened google? #{status}"
            page.evaluate (-> document.title), (it) ->
              console.log "page title is #{it}"
              ph.exit



-- Compile to JavaScript --

    $(1, 2, function() {
      return console.log('test');
    });

    $(1, function(x) {
      return console.log('test');
    }, 2);

    $(function() {
      return console.log('test');
    });

    func(1, function(x) {
      return console.log('test');
    }, 2);

    func_one(function() {
      console.log('test');
      return func(1, function(x) {
        return console.log('test');
      }, 2);
    });

    var phantom;
    phantom = require("phantom");

    phantom.create(function(ph) {
      return ph.createpage(function(page) {
        return page.open(google, function(status) {
          console.log("opened google? " + status);
          return page.evaluate((function() {
            return document.title;
          }), function(it) {
            console.log("page title is " + it);
            return ph.exit;
          });
        });
      });
    });

## Implicit function call

-- CozyScript --

    func = (one, two, three) -> one: '1', two: '2'

    func()
    func!

    eq func().two, '2'
    eq func!.two, '2'

    func_array = -> [1, 2, 3]

    eq func_array()[0], 1
    eq func_array![0], 1

-- Compile to JavaScript --

    func = function(one, two, three) {
        return {
            one: '1',
            two: '2'
        };
    };
    
    func();

    func();

    eq(func().two, '2');

    eq(func().two, '2');

    func_array = function() {
        return [1, 2, 3];
    };

    eq(func_array()[0], 1);

    eq(func_array()[0], 1);

### Currying function

-- CozyScript --

    times = (x, y) --> x * y
    
-- Compile to JavaScript --
    
    times = curry$(function(x, y) {
      return x * y;
    });

    function curry$(f, args){     # Currying javascript codes from LiveScript
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        return params.push.apply(params, arguments) < f.length && arguments.length ?
        curry$.call(this, f, params) : f.apply(this, params);
      } : f;
    };

### Partially applied function

-- CozyScript --

    filterNum = filter _, [1..5]
    
    filterNum (it) ->  # [4, 5]
      it > 3

-- Compile to JavaScript --
    
    filterNum = __partialize.apply(this, [filter, [void 0, [1, 2, 3, 4, 5]], [0]]);
    
    filterNum(function(it) {
        return it > 3;
    });

    __partialize = function partialize$(f, args, where){  # particalize$() javascript codes from LiveScript
      var context = this;
      return function(){
        var params = __slice.call(arguments), i,
            len = params.length, wlen = where.length,
            ta = args ? args.concat() : [], tw = where ? where.concat() : [];
        for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
        return len < wlen && len ?
          partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
      };
    }

### Access/Call shorthand

-- CozyScript --

    ( +1)

    (+ 1)

    (1 -)

    (1-)

    (>1)

    (<1)

    (> 1 > 2)

    (.x)
    
    (++x)

    (+ +1)
    (- -1)

    (- --x)

    obj =
      x: 1
      y: 2

    f = (input, cb) ->
      cb(input)

    f obj, (.x)

    filter (> 3), [1..5]  # [4, 5]


-- Compile to JavaScript --

  
    +1;

    (function(it) {
      return it + 1;
    });

    (function(it) {
      return 1 - it;
    });

    (function(it) {
      return 1 - it;
    });

    (function(it) {
      return it > 1;
    });

    (function(it) {
      return it < 1;
    });

    (function(it) {
      return (it > 1 && 1 > 2);
    });

    (function(it) {
      return it.x;
    });
    
    ++x;

    (function(it) {
      return it + +1;
    });

    (function(it) {
      return it - -1;
    });

    (function(it) {
      return it - --x;
    });    

    obj = {
      x: 1,
      y: 2
    };

    f = function(input, cb) {
      return console.log(cb(input));
    };

    f(obj, (function(it) {
      return it.x;
    }));


    filter((function(it) {
      return it > 3;
    }), [1, 2, 3, 4, 5]);








const { expect } = require('chai');
const transformCode = require('../helper/babel');

function expectNoTransformation(source) {
   // The second call to transform without plugins is done because sometimes babel strips "useless"
   // stuff out of the source code, such as left-hand parens for addition (don't ask me why).
   // Thus, we compare it to a transformation that occurs with no plugins enabled, so that we know
   // that any potential transformations are the work of Babel, and not us.
   expect(transformCode(source)).to.equal(transformCode(source, true));
}

function expectSpecificTransformation(source, desiredOutput) {
   expect(transformCode(source)).to.equal(desiredOutput);
}

function expectAnyTransformation(source) {
   expect(transformCode(source)).to.not.equal(transformCode(source, true));
}

function binaryExpressionTests(symbol, methodName) {
   describe(`a ${symbol} b [${methodName}]`, function () {
      describe(`numeric literal ${symbol} other`, function () {
         it('does not perform any transformations when other is a numeric literal', function () {
            expectNoTransformation(`1 ${symbol} 2;`);
         });

         it('generates the operator when other is not a numeric literal', function () {
            expectSpecificTransformation(`1 ${symbol} a`, `Operator.${methodName}(1, a);`);
         });

         describe('nested expressions', function () {
            it('does not transform when all variables are numeric literals, on the right side', function () {
               expectNoTransformation(`1 ${symbol} (2 ${symbol} (3 ${symbol} (4 ${symbol} (5 ${symbol} 6 ${symbol} 7 ${symbol} 8 ${symbol} (9 ${symbol} 10)))));`);
            });

            it('does not transform when all variables are numeric literals, on the left side', function () {
               expectNoTransformation(`(((((9 ${symbol} 10) ${symbol} 8 ${symbol} 7 ${symbol} 6 ${symbol} 5) ${symbol} 4) ${symbol} 3) ${symbol} 2) ${symbol} 1;`);
            });
         });
      });

      describe(`non numeric literal ${symbol} other`, function () {
         it(`generates the operator when both are identifiers`, function () {
            expectSpecificTransformation(`a ${symbol} b`, `Operator.${methodName}(a, b);`);
         });

         it(`generates the operator when either one is a member expression`, function () {
            expectSpecificTransformation(`cat.a ${symbol} b`, `Operator.${methodName}(cat.a, b);`);
            expectSpecificTransformation(`a ${symbol} cat.b`, `Operator.${methodName}(a, cat.b);`);
            expectSpecificTransformation(`cat.a ${symbol} cat.b`, `Operator.${methodName}(cat.a, cat.b);`);
         });
      });
   });
}

function assignmentExpressionTests(symbol, methodName) {
   describe(`a ${symbol}= b [${methodName}]`, function () {
      it(`transforms when performing ${methodName} on a numeric literal to an identifier`, function () {
         expectSpecificTransformation(`a ${symbol}= 2`, `a = Operator.${methodName}(a, 2);`);
      });

      it(`transforms when performing ${methodName} on a numeric literal to a member expression`, function () {
         expectSpecificTransformation(`cat.a ${symbol}= 2`, `cat.a = Operator.${methodName}(cat.a, 2);`);
      });

      it(`transforms when performing ${methodName} on a binary expression of an identifier to an identifier`, function () {
         expectSpecificTransformation(`a ${symbol}= (b ${symbol} 5)`, `a = Operator.${methodName}(a, Operator.${methodName}(b, 5));`);
      });
   });
}

function updateExpressionTests(symbol, methodName) {
   describe(`${symbol}a [prefix ${methodName}]`, function () {
      it('transforms when on its own', function () {
         expectSpecificTransformation(`${symbol}a`, `a = Operator.${methodName}(a);`);
      });

      it('transforms when assigning to a value', function () {
         expectSpecificTransformation(`a = ${symbol}b`, `a = b = Operator.${methodName}(b);`);
      });
   });

   describe(`a${symbol} [postfix ${methodName}]`, function () {
      it('transforms when on its own', function () {
         expectSpecificTransformation(`a${symbol}`, `(_temp = a) && ((a = Operator.${methodName}(a)) || _temp) && _temp;`);
      });

      it('transforms when assigning to a value', function () {
         expectSpecificTransformation(`a = b${symbol}`, `a = (_temp = b) && ((b = Operator.${methodName}(b)) || _temp) && _temp;`);
      });
   });
}

function unaryExpressionTests(symbol, methodName) {
   describe(`${symbol}a [${methodName}]`, function () {
      it('does not transform types that are not identifiers/member expressions', function () {
         expectNoTransformation(`${symbol}2`);
         expectNoTransformation(`${symbol}[]`);
         expectNoTransformation(`${symbol}true`);
         expectNoTransformation(`${symbol}'cat'`);
         expectAnyTransformation(`${symbol}a`);
         expectAnyTransformation(`${symbol}cat.a`);
      });
   });
}

const assignmentOperatorTestCaseData = [
   ['+', 'add'],
   ['-', 'subtract'],
   ['*', 'multiply'],
   ['%', 'mod'],
   ['/', 'divide'],
   ['**', 'pow'],
   ['&', 'logicalAnd'],
   ['|', 'logicalOr'],
   ['^', 'logicalXor'],
   ['<<', 'leftShift'],
   ['>>', 'rightShift']
];

const binaryOperatorTestCaseData = [
   ...assignmentOperatorTestCaseData,
   ['==', 'unsafeEqual'],
   ['!=', 'unsafeNotEqual'],
   ['===', 'strictEqual'],
   ['!==', 'strictNotEqual'],
   ['<', 'lessThan'],
   ['>', 'greaterThan'],
   ['<=', 'lessEqual'],
   ['>=', 'greaterEqual']
];

const updateOperatorTestCaseData = [
   ['++', 'increment'],
   ['--', 'decrement']
];

const unaryOperatorTestCaseData = [
   ['-', 'negate'],
   ['+', 'positive'],
   ['~', 'logicalNot'],
   ['!', 'not']
];

function runOperatorTests(test, tests) {
   for (const [symbol, methodName] of tests) {
      test(symbol, methodName);
   }
}

describe('babel transformer', function () {
   describe('Binary Expressions', () => runOperatorTests(binaryExpressionTests, binaryOperatorTestCaseData));

   describe('Assignment Expressions', () => runOperatorTests(assignmentExpressionTests, assignmentOperatorTestCaseData));

   describe('Unary Expressions', () => runOperatorTests(unaryExpressionTests, unaryOperatorTestCaseData));

   describe('Update Expressions', () => runOperatorTests(updateExpressionTests, updateOperatorTestCaseData));
});
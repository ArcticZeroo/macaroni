const { expect } = require('chai');
const transformCode = require('../helper/babel');

function expectNoTransformation(source) {
   expect(transformCode(source)).to.equal(source);
}

function expectTransformation(source, desiredOutput) {
   expect(transformCode(source)).to.equal(desiredOutput);
}

describe('babel transformer', function () {
   describe('Binary Expressions', function () {
      // TODO: Run this in a for loop across all supported binary operators to ensure that behavior is consistent
      describe('addition', function () {
         describe('numeric literal + other', function () {
            it('does not perform any transformations when other is a numeric literal', function () {
               expectNoTransformation('1 + 2;');
            });

            it('does not perform any transformations for nested numeric literal operations', function () {
               // TODO: Fix this test!!!
               expectNoTransformation('1 + (2 + (3 + (4 + (5 + 6 + 7 + 8 + (9 + 10)))));');
            });

            it('generates the operator when other is not a numeric literal', function () {
               expectTransformation('1 + a;', 'Operator.add(1, a);');
            });
         });

         describe('non-NumericLiteral + other', function () {
            it('generates the operator when other is a')
         });
      });
   });

   describe('Assignment Expressions', function () {

   });

   describe('Unary Expressions', function () {

   });
});
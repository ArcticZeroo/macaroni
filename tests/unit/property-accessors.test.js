const { expect } = require('chai');
const { operators, capturePropertyAccess } = require('../../dist');

const getSymbol = Symbol('Getter');

const getTrap = function (prop) {
   if (prop === 'symbol') {
      return getSymbol;
   }

   return prop;
};

const expectGetTrapped = function (trapped) {
   expect(trapped.cat).to.equal('cat');
   expect(trapped[2]).to.equal('2');
   expect(trapped['2']).to.equal('2');
   expect(trapped.symbol).to.equal(getSymbol);
};

const expectSetTrapped = function(trapped) {
   trapped.cat = true;

   expect(trapped).to.not.have.property('cat');
   expect(trapped['trapped_cat']).to.equal(true);

   trapped[2] = 'rabbit';

   expect(trapped).to.not.have.property('2');
   expect(trapped['trapped_2']).to.equal('rabbit');
};

describe('Property Accessors', function () {
   describe('Get', function () {
      it('Traps gets for classes that have not yet been constructed', function () {
         const GetTrap = capturePropertyAccess(class GetTrap {
            [operators.getProperty](prop) {
               return getTrap(prop);
            }
         });

         expectGetTrapped(new GetTrap());
      });

      it('Traps gets for classes that have already been constructed', function () {
         class GetTrap {
            [operators.getProperty](prop) {
               return getTrap(prop);
            }
         }

         const trapped = capturePropertyAccess(new GetTrap());

         expectGetTrapped(trapped);
      });

      it('Traps gets for objects', function () {
         const trapped = capturePropertyAccess({
            [operators.getProperty](prop) {
               return getTrap(prop);
            }
         });

         expectGetTrapped(trapped);
      });
   });

   describe('Set', function () {
      it('Traps sets for classes that have not yet been constructed', function () {
         const SetTrap = capturePropertyAccess(class SetTrap {
            [operators.setProperty](prop, value) {
               this[`trapped_${prop}`] = value;
               return true;
            }
         });

         expectSetTrapped(new SetTrap());
      });

      it('Traps sets for classes that have already been constructed', function () {
         class SetTrap {
            [operators.setProperty](prop, value) {
               this[`trapped_${prop}`] = value;
               return true;
            }
         }

         const trapped = capturePropertyAccess(new SetTrap());

         expectSetTrapped(trapped);
      });

      it('Traps sets for objects', function () {
         const trapped = capturePropertyAccess({
            [operators.setProperty](prop, value) {
               this[`trapped_${prop}`] = value;
               return true;
            }
         });

         expectSetTrapped(trapped);
      });
   });
});
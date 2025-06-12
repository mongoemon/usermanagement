const test = require('firebase-functions-test')();
const chai = require('chai');
const sinon = require('sinon');
const admin = require('firebase-admin');

const expect = chai.expect;

describe('Cloud Functions', () => {
  let myFunctions;
  let adminInitStub;
  let firestoreStub, authStub;

  before(() => {
    // Stub admin.initializeApp to prevent it from being called
    adminInitStub = sinon.stub(admin, 'initializeApp');
    myFunctions = require('../index');
  });

  after(() => {
    // Restore stubs
    adminInitStub.restore();
    test.cleanup();
  });

  describe('createUser', () => {
    beforeEach(() => {
      // Stub the admin SDK methods
      const userRecord = { uid: 'test-uid', email: 'test@test.com' };
      authStub = {
        createUser: sinon.stub().resolves(userRecord),
        setCustomUserClaims: sinon.stub().resolves(),
      };
      firestoreStub = {
        collection: sinon.stub().returns({
          doc: sinon.stub().returns({
            set: sinon.stub().resolves(),
          }),
        }),
      };
      
      // Replace the real admin SDK with our stubbed version
      sinon.stub(admin, 'auth').get(() => () => authStub);
      sinon.stub(admin, 'firestore').get(() => () => firestoreStub);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should create a user when called by an admin', async () => {
      const wrapped = test.wrap(myFunctions.createUser);

      const data = { email: 'test@test.com', password: 'password', role: 'editor' };
      const context = { auth: { token: { role: 'admin' } } };

      const result = await wrapped(data, context);

      expect(result.result).to.equal('User test@test.com created successfully.');
      expect(authStub.createUser.calledOnce).to.be.true;
      expect(authStub.setCustomUserClaims.calledOnceWith('test-uid', { role: 'editor' })).to.be.true;
      expect(firestoreStub.collection('users').doc('test-uid').set.calledOnce).to.be.true;
    });

    it('should deny access if called by a non-admin', async () => {
      const wrapped = test.wrap(myFunctions.createUser);

      const data = { email: 'test@test.com', password: 'password', role: 'editor' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        // If it resolves, the test should fail
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
        expect(error.message).to.equal('Only admins can create new users.');
      }
    });
  });

  describe('updateUserRole', () => {
    beforeEach(() => {
      authStub = { setCustomUserClaims: sinon.stub().resolves() };
      firestoreStub = {
        collection: sinon.stub().returns({
          doc: sinon.stub().returns({
            update: sinon.stub().resolves(),
          }),
        }),
      };
      sinon.stub(admin, 'auth').get(() => () => authStub);
      sinon.stub(admin, 'firestore').get(() => () => firestoreStub);
    });
    
    afterEach(() => {
      sinon.restore();
    });

    it('should update a user role when called by an admin', async () => {
      const wrapped = test.wrap(myFunctions.updateUserRole);
      const data = { uid: 'test-uid', role: 'editor' };
      const context = { auth: { token: { role: 'admin' } } };

      const result = await wrapped(data, context);

      expect(result.result).to.equal('User role updated successfully.');
      expect(authStub.setCustomUserClaims.calledOnceWith('test-uid', { role: 'editor' })).to.be.true;
      expect(firestoreStub.collection('users').doc('test-uid').update.calledOnceWith({ role: 'editor' })).to.be.true;
    });

    it('should deny access if called by a non-admin', async () => {
      const wrapped = test.wrap(myFunctions.updateUserRole);
      const data = { uid: 'test-uid', role: 'editor' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
      }
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      authStub = { deleteUser: sinon.stub().resolves() };
      firestoreStub = {
        collection: sinon.stub().returns({
          doc: sinon.stub().returns({
            delete: sinon.stub().resolves(),
          }),
        }),
      };
      sinon.stub(admin, 'auth').get(() => () => authStub);
      sinon.stub(admin, 'firestore').get(() => () => firestoreStub);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should delete a user when called by an admin', async () => {
      const wrapped = test.wrap(myFunctions.deleteUser);
      const data = { uid: 'test-uid' };
      const context = { auth: { token: { role: 'admin' } } };

      const result = await wrapped(data, context);

      expect(result.result).to.equal('User deleted successfully.');
      expect(authStub.deleteUser.calledOnceWith('test-uid')).to.be.true;
      expect(firestoreStub.collection('users').doc('test-uid').delete.calledOnce).to.be.true;
    });

    it('should deny access if called by a non-admin', async () => {
      const wrapped = test.wrap(myFunctions.deleteUser);
      const data = { uid: 'test-uid' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
      }
    });
  });

  describe('updateArticle', () => {
    beforeEach(() => {
      // Stub the parts of the admin SDK that our function uses
      firestoreStub = {
        collection: sinon.stub().returns({
          doc: sinon.stub().returns({
            update: sinon.stub().resolves(),
          }),
        }),
      };
      
      const firestore = () => firestoreStub;
      // Add a stub for FieldValue
      firestore.FieldValue = {
        serverTimestamp: sinon.stub(),
      };

      sinon.stub(admin, 'firestore').get(() => firestore);
    });

    afterEach(() => {
      sinon.restore();
    });

    ['admin', 'editor'].forEach(role => {
      it(`should allow a(n) ${role} to update an article`, async () => {
        const wrapped = test.wrap(myFunctions.updateArticle);
        const data = { id: 'test-article', title: 'New Title', content: 'New Content', status: 'published' };
        const context = { auth: { token: { role } } };

        const result = await wrapped(data, context);
        
        expect(result.result).to.include('updated successfully');
        expect(firestoreStub.collection('articles').doc('test-article').update.calledOnce).to.be.true;
      });
    });
    
    it('should deny access if called by a non-admin/non-editor', async () => {
      const wrapped = test.wrap(myFunctions.updateArticle);
      const data = { id: 'test-article' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
      }
    });
  });

  describe('deleteArticle', () => {
    beforeEach(() => {
      firestoreStub = {
        collection: sinon.stub().returns({
          doc: sinon.stub().returns({
            delete: sinon.stub().resolves(),
          }),
        }),
      };
      sinon.stub(admin, 'firestore').get(() => () => firestoreStub);
    });

    afterEach(() => {
      sinon.restore();
    });
    
    ['admin', 'editor'].forEach(role => {
      it(`should allow a(n) ${role} to delete an article`, async () => {
        const wrapped = test.wrap(myFunctions.deleteArticle);
        const data = { id: 'test-article' };
        const context = { auth: { token: { role } } };

        const result = await wrapped(data, context);
        
        expect(result.result).to.equal('Article deleted successfully.');
        expect(firestoreStub.collection('articles').doc('test-article').delete.calledOnce).to.be.true;
      });
    });

    it('should deny access if called by a non-admin/non-editor', async () => {
      const wrapped = test.wrap(myFunctions.deleteArticle);
      const data = { id: 'test-article' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
      }
    });
  });

  describe('createFeatureFlag', () => {
    beforeEach(() => {
      firestoreStub = {
        collection: sinon.stub().returns({
          add: sinon.stub().resolves(),
        }),
      };
      const firestore = () => firestoreStub;
      firestore.FieldValue = {
        serverTimestamp: sinon.stub(),
      };
      sinon.stub(admin, 'firestore').get(() => firestore);
    });

    afterEach(() => {
      sinon.restore();
    });

    ['admin', 'developer'].forEach(role => {
      it(`should allow a(n) ${role} to create a feature flag`, async () => {
        const wrapped = test.wrap(myFunctions.createFeatureFlag);
        const data = { name: 'newFeature', description: 'A test feature' };
        const context = { auth: { token: { role } } };

        await wrapped(data, context);
        expect(firestoreStub.collection('featureFlags').add.calledOnce).to.be.true;
      });
    });

    it('should deny access if called by an unauthorized user', async () => {
      const wrapped = test.wrap(myFunctions.createFeatureFlag);
      const data = { name: 'newFeature', description: 'A test feature' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
      }
    });
  });

  describe('toggleFeatureFlag', () => {
    beforeEach(() => {
        firestoreStub = {
            collection: sinon.stub().returns({
                doc: sinon.stub().returns({
                    update: sinon.stub().resolves(),
                }),
            }),
        };
        sinon.stub(admin, 'firestore').get(() => () => firestoreStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    ['admin', 'developer'].forEach(role => {
        it(`should allow a(n) ${role} to toggle a feature flag`, async () => {
            const wrapped = test.wrap(myFunctions.toggleFeatureFlag);
            const data = { id: 'test-flag', enabled: true };
            const context = { auth: { token: { role } } };

            await wrapped(data, context);
            expect(firestoreStub.collection('featureFlags').doc('test-flag').update.calledOnceWith({ enabled: true })).to.be.true;
        });
    });

    it('should deny access if called by an unauthorized user', async () => {
        const wrapped = test.wrap(myFunctions.toggleFeatureFlag);
        const data = { id: 'test-flag', enabled: true };
        const context = { auth: { token: { role: 'viewer' } } };

        try {
            await wrapped(data, context);
            throw new Error('The function did not throw an error.');
        } catch (error) {
            expect(error.code).to.equal('permission-denied');
        }
    });
  });

  describe('createBugReport', () => {
    beforeEach(() => {
      firestoreStub = {
        collection: sinon.stub().returns({
          add: sinon.stub().resolves(),
        }),
      };
      const firestore = () => firestoreStub;
      firestore.FieldValue = { serverTimestamp: sinon.stub() };
      sinon.stub(admin, 'firestore').get(() => firestore);
    });

    afterEach(() => {
      sinon.restore();
    });

    ['admin', 'developer', 'tester'].forEach(role => {
      it(`should allow a(n) ${role} to create a bug report`, async () => {
        const wrapped = test.wrap(myFunctions.createBugReport);
        const data = { description: 'A bug', stepsToReproduce: 'Do the thing.' };
        const context = { auth: { uid: 'test-uid', token: { email: 'test@test.com', role } } };

        await wrapped(data, context);
        expect(firestoreStub.collection('bugReports').add.calledOnce).to.be.true;
      });
    });

    it('should deny access if called by an unauthorized user', async () => {
      const wrapped = test.wrap(myFunctions.createBugReport);
      const data = { description: 'A bug', stepsToReproduce: 'Do the thing.' };
      const context = { auth: { token: { role: 'viewer' } } };

      try {
        await wrapped(data, context);
        throw new Error('The function did not throw an error.');
      } catch (error) {
        expect(error.code).to.equal('permission-denied');
      }
    });
  });
});

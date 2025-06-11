const functions = require("firebase-functions");
const admin = require("firebase-admin");
const swaggerFile = require("./swagger.json");
const cors = require("cors")({origin: true});

admin.initializeApp();

// This function's only job is to serve the swagger.json file.
exports.apiSpec = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerFile);
  });
});

/**
 * @swagger
 * /createUser:
 *   post:
 *     summary: Creates a new user with a specific role.
 *     description: >-
 *       Requires admin privileges. Creates a user in Firebase Authentication
 *       and a corresponding document in Firestore.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.createUser = functions.https.onCall(async (data, context) => {
  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins can create new users.");
  }
  const {email, password, role} = data;
  try {
    const userRecord = await admin.auth().createUser({email, password});
    await admin.auth().setCustomUserClaims(userRecord.uid, {role});
    await admin.firestore().collection("users").doc(userRecord.uid)
        .set({email, role});
    return {result: `User ${email} created successfully.`};
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new functions.https.HttpsError("internal", "Error creating new user.");
  }
});

/**
 * @swagger
 * /updateUserRole:
 *   post:
 *     summary: Updates a user's role.
 *     description: >-
 *       Requires admin privileges. Updates the user's custom claim and
 *       their role in the Firestore document.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins can update user roles.");
  }
  const {uid, role} = data;
  try {
    await admin.auth().setCustomUserClaims(uid, {role});
    await admin.firestore().collection("users").doc(uid).update({role});
    return {result: "User role updated successfully."};
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new functions.https.HttpsError("internal", "Error updating user role.");
  }
});

/**
 * @swagger
 * /deleteUser:
 *   post:
 *     summary: Deletes a user.
 *     description: >-
 *       Requires admin privileges. Deletes the user from Firebase
 *       Authentication and their document from Firestore.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins can delete users.");
  }
  const {uid} = data;
  try {
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();
    return {result: "User deleted successfully."};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError("internal", "Error deleting user.");
  }
});

/**
 * @swagger
 * /createArticle:
 *   post:
 *     summary: Creates a new article.
 *     description: Requires admin or editor privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.createArticle = functions.https.onCall(async (data, context) => {
  const userRole = context.auth.token.role;
  if (userRole !== "admin" && userRole !== "editor") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins or editors can create articles.");
  }
  const {title, content} = data;
  try {
    await admin.firestore().collection("articles").add({
      title,
      content,
      status: "draft",
      authorId: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {result: `Article "${title}" created successfully.`};
  } catch (error) {
    console.error("Error creating article:", error);
    throw new functions.https.HttpsError("internal", "Error creating article.");
  }
});

/**
 * @swagger
 * /updateArticle:
 *   post:
 *     summary: Updates an existing article.
 *     description: Requires admin or editor privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.updateArticle = functions.https.onCall(async (data, context) => {
  const userRole = context.auth.token.role;
  if (userRole !== "admin" && userRole !== "editor") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins or editors can update articles.");
  }
  const {id, title, content, status} = data;
  try {
    await admin.firestore().collection("articles").doc(id).update({
      title,
      content,
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {result: `Article "${title}" updated successfully.`};
  } catch (error) {
    console.error("Error updating article:", error);
    throw new functions.https.HttpsError("internal", "Error updating article.");
  }
});

/**
 * @swagger
 * /deleteArticle:
 *   post:
 *     summary: Deletes an article.
 *     description: Requires admin or editor privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.deleteArticle = functions.https.onCall(async (data, context) => {
  const userRole = context.auth.token.role;
  if (userRole !== "admin" && userRole !== "editor") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins or editors can delete articles.");
  }
  const {id} = data;
  try {
    await admin.firestore().collection("articles").doc(id).delete();
    return {result: "Article deleted successfully."};
  } catch (error) {
    console.error("Error deleting article:", error);
    throw new functions.https.HttpsError("internal", "Error deleting article.");
  }
});

/**
 * @swagger
 * /createFeatureFlag:
 *   post:
 *     summary: Creates a new feature flag.
 *     description: Requires admin or developer privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.createFeatureFlag = functions.https.onCall(async (data, context) => {
  const userRole = context.auth.token.role;
  if (userRole !== "admin" && userRole !== "developer") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins or developers can create feature flags.");
  }
  const {name, description} = data;
  try {
    await admin.firestore().collection("featureFlags").add({
      name,
      description,
      enabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {result: `Feature flag "${name}" created successfully.`};
  } catch (error) {
    console.error("Error creating feature flag:", error);
    throw new functions.https.HttpsError("internal",
        "Error creating feature flag.");
  }
});

/**
 * @swagger
 * /toggleFeatureFlag:
 *   post:
 *     summary: Toggles a feature flag on or off.
 *     description: Requires admin or developer privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
exports.toggleFeatureFlag = functions.https.onCall(async (data, context) => {
  const userRole = context.auth.token.role;
  if (userRole !== "admin" && userRole !== "developer") {
    throw new functions.https.HttpsError("permission-denied",
        "Only admins or developers can toggle feature flags.");
  }
  const {id, enabled} = data;
  try {
    await admin.firestore().collection("featureFlags").doc(id).update({enabled});
    return {result: "Feature flag toggled successfully."};
  } catch (error) {
    console.error("Error toggling feature flag:", error);
    throw new functions.https.HttpsError("internal",
        "Error toggling feature flag.");
  }
});

/**
 * @swagger
 * /createBugReport:
 *   post:
 *     summary: Creates a new bug report.
 *     description: Requires admin, developer, or tester privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               stepsToReproduce:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
exports.createBugReport = functions.https.onCall(async (data, context) => {
  const userRole = context.auth.token.role;
  const allowedRoles = ["admin", "developer", "tester"];
  if (!allowedRoles.includes(userRole)) {
    throw new functions.https.HttpsError("permission-denied",
        "You do not have permission to submit bug reports.");
  }
  const {description, stepsToReproduce} = data;
  try {
    await admin.firestore().collection("bugReports").add({
      description,
      stepsToReproduce,
      status: "new",
      reporterId: context.auth.uid,
      reporterEmail: context.auth.token.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {result: "Bug report submitted successfully."};
  } catch (error) {
    console.error("Error creating bug report:", error);
    throw new functions.https.HttpsError("internal",
        "Error creating bug report.");
  }
});

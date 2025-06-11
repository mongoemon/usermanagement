const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "User Management System API",
    description: "API documentation for the UMS application",
  },
  host: "localhost:5001/usermanagement-2c34d/us-central1",
  schemes: ["http"],
  definitions: {
    UserInput: {
      $email: "user@example.com",
      $password: "password123",
      $role: "viewer",
    },
    RoleUpdate: {
      $uid: "some-user-id",
      $role: "editor",
    },
    DeleteUser: {
      $uid: "some-user-id",
    },
    ArticleInput: {
      $title: "My Awesome Article",
      $content: "This is the content of the article.",
    },
    ArticleUpdate: {
      $articleId: "some-article-id",
      $title: "My Updated Awesome Article",
      $content: "This is the updated content.",
      $published: true,
    },
    DeleteArticle: {
      $articleId: "some-article-id",
    },
    FeatureFlagInput: {
      $name: "newFeature",
      $enabled: true,
    },
    FeatureFlagUpdate: {
      $flagId: "some-flag-id",
      $enabled: false,
    },
    DeleteFeatureFlag: {
      $flagId: "some-flag-id",
    },
    BugReportInput: {
      $title: "UI Glitch on Login",
      $description: "The login button is misaligned on mobile.",
      $stepsToReproduce: "1. Open on mobile. 2. Look at login button.",
    },
  },
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./index.js"];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);

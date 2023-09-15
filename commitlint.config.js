module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["system", "nx-app", "nx-lib"]],
    "scope-empty": [2, "never"],
    "subject-empty": [2, "never"],
  },
};

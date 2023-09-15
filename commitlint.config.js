module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["system", "useful-implementations"]],
    "scope-empty": [2, "never"],
    "subject-case": [2, "always"],
    "subject-empty": [2, "never"],
  },
};

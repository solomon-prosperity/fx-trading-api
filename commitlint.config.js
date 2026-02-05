module.exports = {
  extends: ['@commitlint/config-conventional'],
  // plugins: ["commitlint-plugin-jira-rules"],
  rules: {
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
  },
};

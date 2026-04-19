const test = require("node:test");
const assert = require("node:assert/strict");

const issue = require("../issue.js");

function createAttributes(entries) {
const attrs = [];
for (const [name, value] of Object.entries(entries)) {
const attr = {name, value};
attrs.push(attr);
attrs[name] = attr;
}
return attrs;
}

test("buildNewIssueUrl handles trailing slash", () => {
assert.equal(issue.buildNewIssueUrl("https://github.com/w3c/webdriver/"), "https://github.com/w3c/webdriver/issues/new");
assert.equal(issue.buildNewIssueUrl("https://github.com/w3c/webdriver"), "https://github.com/w3c/webdriver/issues/new");
});

test("collectIssueInputs includes body and configured params", () => {
const attrs = createAttributes({
"data-issue-url": "https://github.com/w3c/webdriver/",
"data-issue-param-milestone": "Level 1",
"data-issue-param-labels": "editorial",
lang: "en-us",
});

const inputs = issue.collectIssueInputs(attrs);

assert.deepEqual(inputs, {
body: "",
milestone: "Level 1",
labels: "editorial",
});
});

test("formatSelection includes chapter and section context", () => {
const chapterHeading = {id: "design", textContent: "Design"};
const sectionHeading = {id: "compatibility", textContent: "Compatibility"};

const chapterSection = {
parentNode: null,
closest: () => chapterSection,
querySelector: selector => selector === ":scope > h2" ? chapterHeading : null,
};
const subsection = {
parentNode: chapterSection,
closest: () => subsection,
querySelector: selector => selector === ":scope > h3" ? sectionHeading : null,
};

const selection = {
anchorNode: {parentElement: {closest: () => subsection}},
toString: () => "line 1\nline 2",
};

const result = issue.formatSelection(selection, "https://w3c.github.io/webdriver/");

assert.equal(
result,
"In chapter [Design](https://w3c.github.io/webdriver/#design), section [Compatibility](https://w3c.github.io/webdriver/#compatibility):\n> line 1\n> line 2",
);
});

test("formatSelection falls back to quoted text when no section exists", () => {
const selection = {
anchorNode: {parentElement: {closest: () => null}},
toString: () => "single line",
};

assert.equal(issue.formatSelection(selection, "https://w3c.github.io/webdriver/"), "> single line");
});

test("getAbsolutePosition computes coordinates relative to body", () => {
const node = {
getBoundingClientRect: () => ({top: 120, left: 90}),
};
const documentObj = {
body: {
getBoundingClientRect: () => ({top: 20, left: 10}),
},
};

assert.deepEqual(issue.getAbsolutePosition(node, documentObj), {top: 100, left: 80});
});

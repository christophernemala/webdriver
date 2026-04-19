const test = require("node:test");
const assert = require("node:assert/strict");

function loadStickyModule(jqueryMock) {
delete require.cache[require.resolve("../results/html/sticky-headers.js")];
global.jQuery = jqueryMock;
return require("../results/html/sticky-headers.js");
}

test("shouldShowFloatingHeader matches expected visibility boundaries", () => {
const sticky = loadStickyModule(() => {});

assert.equal(sticky.shouldShowFloatingHeader(100, 100, 50), false);
assert.equal(sticky.shouldShowFloatingHeader(101, 100, 50), true);
assert.equal(sticky.shouldShowFloatingHeader(149, 100, 50), true);
assert.equal(sticky.shouldShowFloatingHeader(150, 100, 50), false);
});

test("updateTH toggles floating header visibility from scroll position", () => {
const area = {
offset: () => ({top: 100}),
height: () => 200,
visibility: null,
};

let scrollTop = 0;
global.window = {};

function jqueryMock(selector, context) {
if (selector === ".persist-area") {
return {
each(callback) {
callback.call(area);
},
};
}
if (selector === area) {
return {
offset: area.offset,
height: area.height,
};
}
if (selector === global.window) {
return {
scrollTop: () => scrollTop,
};
}
if (selector === ".floatingHeader" && context === area) {
return {
css(style) {
area.visibility = style.visibility;
},
};
}
if (typeof selector === "function")
return;
throw new Error("Unexpected jQuery call");
}

const sticky = loadStickyModule(jqueryMock);

scrollTop = 150;
sticky.updateTH();
assert.equal(area.visibility, "visible");

scrollTop = 350;
sticky.updateTH();
assert.equal(area.visibility, "hidden");
});

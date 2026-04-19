(function(root, factory) {
	const api = factory();

	if (typeof module !== "undefined" && module.exports)
		module.exports = api;

	if (root.document && root.document.addEventListener) {
		root.document.addEventListener("DOMContentLoaded", function() {
			api.initIssueWidget(root.document, root.window || root, root.location || (root.window && root.window.location));
		}, false);
	}
}(typeof globalThis !== "undefined" ? globalThis : this, function() {
"use strict";

const ISSUE_PARAM_PREFIX = "data-issue-param-";
const BASE_BUTTON_STYLE = `
color: #fff;
cursor: pointer;
text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.15);
background-color: #60b044;
background-image: linear-gradient(#8add6d, #60b044);
border: 1px solid #d5d5d5;
whitespace: nowrap;
border-radius: 3px;
line-height: 20px;
font-weight: 600;
font-size: 12px;
padding: 6px 12px;
border-color: #5ca941;
`;

function buildNewIssueUrl(baseUrl) {
return baseUrl + (baseUrl.endsWith("/") ? "issues/new" : "/issues/new");
}

function collectIssueInputs(attributes) {
let inputs = {body: ""};
[].forEach.call(attributes, attr => {
if (attr.name.startsWith(ISSUE_PARAM_PREFIX))
inputs[attr.name.substr(ISSUE_PARAM_PREFIX.length)] = attr.value;
});
return inputs;
}

function formatSelection(sel, locationHref) {
let quoteText = text => text.split("\n").map(el => "> " + el).join("\n");

let findSection = (el, localName) => {
let sectionEl = el.closest("section");
if (!sectionEl)
return null;
let heading = sectionEl.querySelector(":scope > " + localName);
if (!heading)
return findSection(sectionEl.parentNode, localName);

let relUrl = locationHref + "#" + encodeURIComponent(heading.id);

return {
url: relUrl,
text: heading.textContent,
};
};

let parent = sel.anchorNode.parentElement;

let chapter = findSection(parent, "h2");
let subchapter = findSection(parent, "h3");
let desc = quoteText(sel.toString());

let rv = "";
if (chapter)
rv = `In chapter [${chapter.text}](${chapter.url})`;
if (subchapter)
rv += `, section [${subchapter.text}](${subchapter.url})`;
if (chapter || subchapter)
rv += ":\n";
return rv + desc;
}

function getAbsolutePosition(node, documentObj) {
let bodyRect = documentObj.body.getBoundingClientRect();
let nodeRect = node.getBoundingClientRect();
return {
top: nodeRect.top - bodyRect.top,
left: nodeRect.left - bodyRect.left,
};
}

function initIssueWidget(documentObj, windowObj, locationObj) {
let baseUrl = documentObj.documentElement.attributes["data-issue-url"].value;
let newIssueUrl = buildNewIssueUrl(baseUrl);
let inputs = collectIssueInputs(documentObj.documentElement.attributes);
let locationHref = locationObj.href;

let widget = new class {
constructor(rootEl) {
this.parent = rootEl;
this.el = null;
this.shown = false;
}

show() {
if (!this.el) {
let form = this.parent.appendChild(documentObj.createElement("form"));
form.action = newIssueUrl;
form.target = "_blank";

let submit = form.appendChild(documentObj.createElement("input"));
submit.type = "submit";
submit.accessKey = "f";
submit.value = "File an issue";
submit.style.cssText = BASE_BUTTON_STYLE;

Object.keys(inputs).forEach(name => {
let input = form.appendChild(documentObj.createElement("input"));
input.type = "hidden";
input.name = name;
input.value = inputs[name];
inputs[name] = input;
});

form.addEventListener("submit", this.click);

this.submitEl = submit;
this.el = form;
this.el.style.visibility = "visible";
}

this.el.style.visibility = "visible";
this.shown = true;
this.paint();
}

paint() {
if (!this.shown)
return;

let pos = getAbsolutePosition(windowObj.getSelection().getRangeAt(0), documentObj);

this.el.style.position = "absolute";
this.el.style.top = (pos.top - 40) + "px";
this.el.style.left = (pos.left + 45) + "px";
}

hide() {
if (!this.shown)
return;
this.el.style.visibility = "hidden";
this.shown = false;
}

click() {
let sel = windowObj.getSelection();
if (sel.toString().length > 0)
inputs.body.value = formatSelection(sel, locationHref);
}
}(documentObj.documentElement);

documentObj.addEventListener("selectionchange", () => {
if (windowObj.getSelection().toString().length == 0)
widget.hide();
else
widget.show();
}, false);

documentObj.addEventListener("scroll", widget.paint, false);
return widget;
}

return {
ISSUE_PARAM_PREFIX,
BASE_BUTTON_STYLE,
buildNewIssueUrl,
collectIssueInputs,
formatSelection,
getAbsolutePosition,
initIssueWidget,
};
}));

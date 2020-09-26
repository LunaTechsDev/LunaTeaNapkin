// Variable declaration w/ member expression
let uiAreaWidth = _$LTGlobals_$.$dataSystem.advanced.uiAreaWidth;

// Variable declaration w/ call expression
let padding = _$LTGlobals_$.$gameSystem.windowPadding()

// Variable declaration
let _g2 = _$LTGlobals_$.$plugins;
let _this = _$LTGlobals_$.$plugins;
let _this2 = _$LTGlobals_$.$plugins.stuff();

var find = () => {}
let rawParams = find(_$LTGlobals_$.$plugins, function (p) {
  return p.description.indexOf("<>") != -1;
}).parameters;

let rawParams2 = find(_$LTGlobals_$.$gameSystem.stuff(), function (p) {
  return p.description.indexOf("<>") != -1;
}).parameters;

let rawParams3 = find(_$LTGlobals_$.$gameSystem.stuff, function (p) {
  return p.description.indexOf("<>") != -1;
}).parameters;

// Call expressions
_$LTGlobals_$.$gameSystem.windowPadding();
_$LTGlobals_$.$gameSwitches.setValue(data.id, data.value);

// Member expressions
_$LTGlobals_$.$gameSystem.otherThing = [];

if (
  _$LTGlobals_$.$gameSystem.activeCursor != null &&
  _$LTGlobals_$.$gameSystem.activeCursor != null
) {
  core_CursorLoader.activeData = _$LTGlobals_$.$gameSystem.activeCursor;
}
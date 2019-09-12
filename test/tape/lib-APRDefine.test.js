var test = require('tape'),
	APRDefine = require('../../src/lib/APRDefine');

// Use in loaded files.
window.APRDefine = APRDefine;

test('/lib/APRDefine.js', function (t) {

	function removeScripts (selector) {

		[].forEach.call(document.querySelectorAll(selector),
			function (script) { script.parentNode.removeChild(script); });

	}

	t.test('Should throw (or not) if something is invalid.',
		{'timeout': 3000}, function (st) {

		st.throws(function () {
			APRDefine(function () {});
		}, TypeError, 'The id is needed.');

		st.throws(function () {
			APRDefine(false, [], function () {});
		}, TypeError, 'Non-string ids are invalid.');

		st.throws(function () {
			APRDefine('valid-id', 0, function () {});
		}, TypeError, 'Dependency ids must be valid ids.');

		st.throws(function () {
			APRDefine.load('/url');
		}, TypeError, '"/url" is considered an id, not a url.');

		st.doesNotThrow(function () {
			APRDefine('id', ['/url'], function () { st.fail(); });
		}, TypeError, 'Should never get called because "/url" was never defined.');

		st.throws(function () {
			APRDefine.load(null);
		}, TypeError, 'Only strings, arrays and object literals are allowed.');

		st.end();

	});

	t.doesNotThrow(function () {

		t.test('Should call a module if no dependencies are given.',
			{'timeout': 3000}, function (st) {

			APRDefine('no-dependencies', function () {
				st.pass('The module got called.');
				st.end();
			});

		});

		t.test('Should load files when required.', {'timeout': 3000},
			function (st) {

			delete window.theGlobal;
			
			APRDefine.addFiles({
				'theGlobal': '/assets/APRDefine-test-global.js'
			});

			APRDefine('required-now', [], function () {

				st.is(typeof window.theGlobal, 'undefined');
				st.pass('Module didn\'t load because it wasn\'t needed.');
				
				st.end();
				
			});

		});

		t.test('Should load files and execute them when the dependencies ' +
			'finished loading.', {'timeout': 3000}, function (st) {

			removeScripts(
				'script[src="/assets/APRDefine-test-global.js"], ' +
				'script[src="/assets/APRDefine-test-local.js"]'
			);
			
			APRDefine.clean();

			APRDefine.addFiles({
				'theGlobal': '/assets/APRDefine-test-global.js',
				'theLocal': '/assets/APRDefine-test-local.js'
			}).addGlobals({
				'theGlobal': 'window.theGlobal'
			});

			APRDefine('globals-and-locals', ['theGlobal', 'theLocal'],
			function (theGlobal, theLocal) {

				st.is(theGlobal, 'global');
				st.is(theGlobal, window.theGlobal);

				st.is(theLocal, 'local');
				st.is(typeof window.theLocal, 'undefined');

				st.pass('Dependencies finished loading.');

				st.end();

			});

		});

		t.test('Should return a custom value.', {'timeout': 3000},
			function (st) {

			removeScripts(
				'script[src="/assets/APRDefine-test-global.js"]'
			);

			delete window.theGlobal;
			delete window.theOtherGlobal;

			APRDefine.clean();

			APRDefine.addFiles({
				'theGlobal': '/assets/APRDefine-test-global.js'
			}).load({
				
				'theGlobal': function (error, data) {

					st.is(this instanceof Element, true);
					st.is(error, null);
					
					st.deepEquals(data, {
						'event': data.event,
						'url': this.getAttribute('src'),
						'id': 'theGlobal'
					});

					st.is(data.event instanceof Event, true);

					APRDefine(data.id, window.theOtherGlobal = {});

				}

			});

			APRDefine('modifying-the-value', ['theGlobal'], function (theGlobal) {
				st.is(theGlobal, window.theOtherGlobal);
				st.pass('Value has changed.');
				st.end();
			});

		});

		t.test('Should return any value (not only results from functions).',
			{'timeout': 3000}, function (st) {

			removeScripts(
				'script[src="/assets/APRDefine-test-not-a-function.js"]'
			);
			
			APRDefine.clean();

			APRDefine.addFiles({
				'not-a-function': '/assets/APRDefine-test-not-a-function.js'
			});

			APRDefine('caller', ['not-a-function'], function (notAFunction) {

				st.deepEquals(notAFunction, {
					'an': 'object'
				});

				st.end();

			});

		});

		t.test('Should call modules with recursive dependencies.',
			{'timeout': 3000}, function (st) {

			removeScripts(
				'script[src="/assets/APRDefine-test-recursive-a.js"], ' +
				'script[src="/assets/APRDefine-test-recursive-b.js"]'
			);

			APRDefine.clean();

			APRDefine.addFiles({
				'recursive-a': '/assets/APRDefine-test-recursive-a.js',
				'recursive-b': '/assets/APRDefine-test-recursive-b.js'
			});

			APRDefine('recursive', ['recursive-a', 'recursive-b'], function (a, b) {

				st.is(a, b);

				st.pass('Dependencies finished loading.');

				st.end();

			});

		});

		t.test('Should load anything (not just scripts).', function (st) {

			var url = '/assets/APRDefine-test-non-script.css';
			var tagName = 'link';

			APRDefine.addFiles({
				// Tag names are passed in the urls this way:
				'css': tagName + ' ' + url
			}).load({
				/*
				 * Since this file does not contain any definitions,
				 * you must intercept the load and define the id
				 * by yourself.
				 */
				'css': function (error, data) {
					APRDefine(data.id);
				}
			});

			APRDefine('load-any-file', ['css'], function (css) {
				st.is(css, void 0);
				st.end();
			});

		});

		t.test('Should load files passing only ids.', {'timeout': 3000},
			function (st) {
			APRDefine.addFiles({
				'multiple': '/assets/APRDefine-test-multiple.js'
			});

			APRDefine.load('multiple');
			// "object", "null" and "undefined" are defined in APRDefine-test-multiple.js
			APRDefine('load-string', ['object', 'null', 'undefined'], function () {
				st.pass();
				st.end();
			});
		});

	}, TypeError);
	
	t.end();

});

test.onFinish(function () {
	delete window.APRDefine;
});

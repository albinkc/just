define(['./core', './check'], function (APR, check) {
	
	'use strict';

	return APR.setFn('defaults', /** @lends APR */
	/**
	 * Checks if `value` looks like `defaultValue`.
	 *
	 * @function
	 * @param {*} value - Any value.
	 * @param {*} [defaultValue] - A value with a desired type for `value`.
	 *     If an object literal is given, all the keys of `value` will `default`
	 * 	   to his corresponding key in this object.
	 * @param {object} [opts={@link APR.defaults.DEFAULT_OPTIONS}] Some options.
	 *
	 * @example
	 * defaults([1, 2], {a: 1}); // {a: 1}
	 * 
	 * @example
	 * defaults({}, null); // null: null is not an object literal.
	 * defaults([], null, {'checkLooks': false}); // []: null is an object.
	 * defaults(null, {}); // {}: null is not an object literal.
	 * defaults(null, []); // []: null is not an Array.
	 * 
	 * @example
	 * defaults(1, NaN); // 1 (NaN is an instance of a Number)
	 *
	 * @example
	 * defaults({'a': 1, 'b': 2}, {'a': 'some string'}, {'ignoreDefaultKeys': false}); // {'a': 'some string', 'b': 2}
	 *
	 * @example
	 * defaults({'a': 1}, {'b': 2}, {'ignoreDefaultKeys': false}); // {'a': 1, 'b': 2}
	 * defaults({'a': 1}, {'b': 2}, {'ignoreDefaultKeys': true}); // {'a': 1}
	 *
	 * @returns {value} - `value` if it looks like `defaultValue` or `defaultValue` otherwise.
	 */
	function defaults (value, defaultValue, opts) {

		var options = Object.assign({}, defaults.DEFAULT_OPTIONS,
			opts);
		var k;

		if (options.checkLooks) {
			
			if (!check(value, defaultValue)) {
				return defaultValue;
			}

			if (check(value, {}) && options.checkDeepLooks) {

				for (k in defaultValue) {

					if (!({}).hasOwnProperty.call(defaultValue, k)) {
						continue;
					}

					if (typeof value[k] !== 'undefined') {
						value[k] = defaults(value[k],
							defaultValue[k], options);
					}
					else if (!options.ignoreDefaultKeys) {
						value[k] = defaultValue[k];
					}

				}

			}

			return value;

		}

		return (typeof value === typeof defaultValue
			? value
			: defaultValue
		);

	}, /** @lends APR.defaults */{
		/**
		 * Default options for {@link APR.defaults}.
		 * 
		 * @readonly
		 * @type {object}
		 * @property {boolean} [includeDefaultKeys=false] - If `false` and `defaultValue`
		 *     is an object literal, the default keys will be added to `value`
		 *     or checked against this function for each repeated key.
		 * @property {boolean} [checkLooks=true] -
		 *     If `true`:
		 *         `[]` will match ONLY with another Array.
		 *         `{}` will match ONLY with another object literal.
		 *     If `false`
		 *         `[]` and `{}` will match with any other object.
		 * @property {boolean} [checkDeepLooks=true] -
		 *     Same as `checkLooks` but it works with the inner values
		 *     of the objects.
		 */
		'DEFAULT_OPTIONS': {
			'get': function () {
				return {
					'ignoreDefaultKeys': false,
					'checkLooks': true,
					'checkDeepLooks': true
				};
			}
		}

	});

});
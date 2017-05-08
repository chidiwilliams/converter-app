$(document).ready(function($) {
	
	// Big.js Settings
	Big.E_POS = 15
	Big.E_NEG = -15

	// Main() local functions
	function refresh() {
		$('.conversions > .conv > .value').text('0')
		if(!$('.conv1').hasClass('conv-input')) $('.conv1, .conv2').toggleClass('conv-input')
	}

	function formatNo(n) {
	    var parts = n.toString().split(".")
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	    return parts.join(".")
	}

	function loadUnits(conversions) {
		var html1 = '', html2 = ''
		$.each(conversions[current_category], function(index, val) {
			html1 += (val[3] == 1) ? "<div class='option selected'>" + val[1] + "</div>" : "<div class='option'>" + val[1] + "</div>"
			html2 += (val[3] == 2) ? "<div class='option selected'>" + val[1] + "</div>" : "<div class='option'>" + val[1] + "</div>"
		})
		$('.unit1-select').html(html1)
		$('.unit2-select').html(html2)
	}

	// This function accepts a numeric value inputs 
	// the value in the input field, converts from 
	// the input unit to the output unit, and 
	// outputs the corresponding value in the output
	// field

	function io(value) {

		function output_value() {
			/* 	To convert from value a to value b, convert a to reference value c, by dividing by a's 
				conversion factor of x, and multiply by b's conversion factor of y.
			*/

			x = conversions[current_category][input_unit][2]
			y = conversions[current_category][output_unit][2]

			l = Big(y).div(x)

			bigOutput = Big(input.text().replace(/,/g, '')).times(l).toString()

			myOutput = (function(x) {
				if(x.indexOf('e') >= 0) {
					var splitNum = x.split('e+')
					splitNum[0] = (splitNum[0] * 1).toFixed(16-splitNum[1].length)

					x = splitNum.join('e+')
				} else {
					var man_length = 15 - (x.split('.')[0].replace(/,/g, '').length * 1)

				}
				return x
			})(bigOutput)

			output.text(formatNo(myOutput))			
		}

		input = $('.conv1').hasClass('conv-input') ? $('.conv1 > .value') : $('.conv2 > .value')
		output = $('.conv1').hasClass('conv-input') ? $('.conv2 > .value') : $('.conv1 > .value')
		input_unit = input.parent('.conv').find('.conv-unit').text()
		output_unit = output.parent('.conv').find('.conv-unit').text()

		if(input.text().replace(/,/g, '').length < 15) {
			if(value >= 48 && value <= 57) {
				if(input.text() == 0 && input.text().indexOf('.') < 0) {
					input.text(String.fromCharCode(value))
					output_value()
				} else {
					input.text(formatNo(input.text().replace(/,/g, '') + String.fromCharCode(value)))
					output_value()
				}
			} else if(value == 190) {
				if(input.text().indexOf('.') < 0 && input.text().replace(/,/g, '').length < 14) {
					input.text(input.text() + '.')
					output
				}
			}
		} else if(input.text().indexOf('e') >= 0 && input.text().indexOf('.') >= 0) {
			if(value >= 48 && value <= 57) {
				input.text(String.fromCharCode(value))
				output_value()
			}

			if(value == 190) {
				input.text('0.')
				output_value()
			}
		}

		if(value == 8) {
			if(input.text().length == 1 || input.text().indexOf('e') >= 0) {
				input.text(0)
				output_value()
			} else {
				text = input.text().replace(/,/g, '')
				input.text(formatNo(text.substring(0, text.length-1)))
				output_value()
			}
		} else if(value == 46 || value == 27 ) {
			if ($('.unit1-select').is(':visible')) {
				if (value == 27) {
					$('.unit1-select').hide()
				}
			} else {
				input.text(0)
				output_value()
			}
		}

		if(value == 999) output_value()
	}
	
	/* 	CONVERSION VARIABLES
		The conversion factor of each unit is the number 
		of times the reference unit must be multiplied
		to get the given unit.
		The unit with a c.f. of 1 is the reference unit.
	*/

	// Get JSON file before document is ready
	var current_units = ''
	var current_category = 'Volume'
	var conversions = {
		"Volume": {
			"Barrels (Oil)": ["bbls", "Barrels (Oil)", 6.28981077043210512809, 0],
			"Cubic centimeters": ["cm3", "Cubic centimeters", 1000000, 2],
			"Cubic inches": ["tbsp.", "Cubic inches", 61023.74, 0],
			"Cubic meters": ["m3", "Cubic meters", 1, 1],
			"Cups (US)": ["tbsp.", "Cups (US)", 4226.753, 0],
			"Fluid ounces (US)": ["tbsp.", "Fluid ounces (US)", 33814.023, 0],
			"Gallons (US)": ["tbsp.", "Gallons (US)", 264.1721, 0],
			"Liters": ["l", "Liters", 1000, 0],
			"Milliliters": ["ml", "Milliliters", 1000000, 0],
			"Pints (US)": ["tbsp.", "Pints (US)", 2113.376, 0],
			"Quarts (US)": ["tbsp.", "Quarts (US)", 1056.688, 0],
			"Tablespoons (US)": ["tbsp.", "Tablespoons (US)", 67628.04, 0],
			"Teaspoons (US)": ["tsp.", "Teaspoons (US)", 202884.1, 0]
		},
		"Area": {
			"Square centimeters": ["cm2", "Square centimeters", 10000, 2],
			"Square meters": ["m2", "Square meters", 1, 1]
		}
	}

	// Load types into conversion type select menus
	var html = ''
	for (var i in conversions) {
		html += (i == current_category) ? "<div class='option selected'>" + i + "</div>" : "<div class='option'>" + i + "</div>"
	}
	$('.type-select').html(html)

	// Load units per default category
	loadUnits(conversions)
	

	$('.unit1-select > .option, .unit2-select > .option').click(function(event) {
		var self = $(this)
		var unit = self.parent('.unit1-select').length ? 1 : 2

		if (!$(this).hasClass('selected')) {
			$('.conversions .conv' + unit + ' .conv-unit').text($(this).text())

			$('.unit' + unit + '-select .option.selected').removeClass('selected')
			$(this).addClass('selected')

			// This recalulates the output value using
			// the new conversion unit
			io(999)
		}
		$('.unit' + unit + '-select').hide()
	})

	// TOGGLING INPUT
	$('.value').click(function(event) {
		if(!$(this).parent('.conv').hasClass('conv-input')) $('.value').parent('.conv').toggleClass('conv-input')
	})

	// MOUSE ENTRY
	$('.inputNumber').mousedown(function(event) {
		$(this).addClass('clicked')
	}).mouseup(function(event) {
		$(this).removeClass('clicked')
		io($(this).attr('value'))
	}).mouseout(function(event) {
		$(this).removeClass('clicked')
	})

	// NUMERIC KEYBOARD ENTRY
	$(document).keydown(function(event) {
		$('.inputNumber[value=' + event.which + ']').addClass('clicked')
		io(event.which)
	}).keyup(function(event) {
		$('.inputNumber[value=' + event.which + ']').removeClass('clicked')
	})

	/* 
		SELECTING MENU
	*/

	// OPENING AND POSITIONING MENU
	// Positioning Menu 1
	$('.conv1 .conv-label').click(function(event) {
		switch($('.unit1-select .option.selected').index()) {
			case(0): offsetDistance = '46px'; break;
			case(1): offsetDistance = '7px'; break;
			default: offsetDistance = 0; break;
		}

		$('.unit1-select').css({
			top: offsetDistance
		}).show()
	})

	// Positioning Menu 2
	$('.conv2 .conv-label').click(function(event) {
		var x = $('.unit2-select .option.selected').index()
		var ods = [122, 82, 42, 2]

		if (x > 0) ods.pop(122)
		if (x > 1) ods.pop(82)
		if (x > 2) ods.pop(42)

		var actual_od = 442 - 40 * $('.unit2-select').children().length
		
		var od = ods.sort((a,b) => Math.abs(actual_od-a) - Math.abs(actual_od-b))[0]

		var offsetDistance = od + 'px'
		var maxHeight = 442 - od + 'px'

		$('.unit2-select').css({
			top: offsetDistance,
			'max-height': maxHeight
		}).show()
	})

	// CLOSING MENU BY CLICKING OUTSIDE
	$(document).click(function(event) {
		if(!$(event.target).closest('.unit1-select, .conv1 > .conv-label').length && $('.unit1-select').is(':visible')) $('.unit1-select').hide()
		if(!$(event.target).closest('.unit2-select, .conv2 > .conv-label').length && $('.unit2-select').is(':visible')) $('.unit2-select').hide()
	})
})
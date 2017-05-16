$(document).ready(function($) {

	BigNumber.config({
		EXPONENTIAL_AT: [-15, 15],
		ERRORS: false
	});
	
	// Main() local functions
	function refresh() {
		$('.conversions > .conv > .value').text('0');
		if(!$('.conv1').hasClass('conv-input')) $('.conv1, .conv2').toggleClass('conv-input');

		$('.type-select .option').removeClass('selected');

		$(".type-select .option:contains('" + current_category +"')").addClass('selected');

		$('.unit1-select > .option, .unit2-select > .option').click(function(event) {
			var self = $(this);
			var unit = self.parent('.unit1-select').length ? 1 : 2;

			if (!$(this).hasClass('selected')) {
				$('.conversions .conv' + unit + ' .conv-unit').text($(this).text());

				$('.unit' + unit + '-select .option.selected').removeClass('selected');
				$(this).addClass('selected');

				// This recalulates the output value using
				// the new conversion unit
				io(999);
			}
			$('.unit' + unit + '-select').hide();
		});
	}

	function formatNo(n) {
	    var parts = n.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    return parts.join(".");
	}

	function loadUnits(conversions) {
		var html1 = '', html2 = '', unit1, unit2;
		$.each(conversions[current_category], function(index, val) {
			if (val[3] == 1) {
				unit1 = val[1];
				html1 += "<div class='option selected'>" + val[1] + "</div>";
				html2 += "<div class='option'>" + val[1] + "</div>";
			} else if (val[3] == 2) {
				unit2 = val[1];
				html1 += "<div class='option'>" + val[1] + "</div>";
				html2 += "<div class='option selected'>" + val[1] + "</div>";
			} else {
				html1 += "<div class='option'>" + val[1] + "</div>";
				html2 += "<div class='option'>" + val[1] + "</div>";
			}
		})
		$('.unit1-select').html(html1);
		$('.unit2-select').html(html2);
		$('.conversions .conv1 .conv-unit').html(unit1);
		$('.conversions .conv2 .conv-unit').html(unit2);
		refresh();
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

			x = new BigNumber(conversions[current_category][input_unit][2]);
			y = new BigNumber(conversions[current_category][output_unit][2]);

			l = new BigNumber(y/x);

			bigOutput = new BigNumber(input.text().replace(/,/g, '') * l).toString();

			myOutput = (function(x) {
				console.log(x)
				if(x.indexOf('e') >= 0) {
					// Split number into mantissa and remainder and exponent parts
					var splitNum = x.split('e');
					// Shorten man. + rem. part according to length of exp. part
					splitNum[0] = (splitNum[0] * 1).toFixed(17-splitNum[1].length) * 1;
					// Shorten repeated digits
					if ((splitNum[0]).toString().replace(/(\d)\1{3}/g, 'x').indexOf('x') >= 2) {
						splitNum[0] = parseFloat(splitNum[0]).toFixed((splitNum[0]).toString().replace(/(\d)\1{3}/g, 'x').indexOf('x')+1);
					}
					// Rejoin number parts
					x = splitNum.join('e');
					x = new BigNumber(x).toString();
				} else if (x.indexOf('.') >= 0) {
					if(x > 0.00000000000001 && x < 0.00000001) {
						x = new BigNumber(x).toExponential();
					} else {
						x = (x*1).toFixed(8) * 1;
						if (x.toString().split('.')[1]) {
							var y = x.toString().split('.')[1].replace(/(\d)\1{3}/g, 'x').indexOf('x');
						}
						if ((x>1 && y >= 2) || (x>10)) x = parseFloat(x).toFixed(y+1) * 1;
					}
				}
				return x;
			})(bigOutput);

			output.text(formatNo(myOutput));
		}

		input = $('.conv1').hasClass('conv-input') ? $('.conv1 > .value') : $('.conv2 > .value');
		output = $('.conv1').hasClass('conv-input') ? $('.conv2 > .value') : $('.conv1 > .value');
		input_unit = input.parent('.conv').find('.conv-unit').text();
		output_unit = output.parent('.conv').find('.conv-unit').text();

		if(value >= 48 && value <= 57) {
			if (switched) {
				input.text(String.fromCharCode(value));
			} else {
				if(input.text() == 0 && input.text().indexOf('.') < 0) {
					input.text(String.fromCharCode(value));
				} else if(input.text().replace(/,/g, '').length < 15) {
					input.text(formatNo(input.text().replace(/,/g, '') + String.fromCharCode(value)));
				}
			}
		} else if(value == 190) {
			if (switched) {
				input.text('0.');
			} else {
				if(input.text().indexOf('.') < 0 && input.text().replace(/,/g, '').length < 14) {
					input.text(input.text() + '.');
				}
			}
		}
		
		if(input.text().indexOf('e') >= 0 && input.text().indexOf('.') >= 0) {
			if(value >= 48 && value <= 57) {
				input.text(String.fromCharCode(value));
			} else if(value == 190) {
				input.text('0.');
			}
		}

		if(value == 8) {
			if(switched || input.text().length == 1 || input.text().indexOf('e') >= 0) {
				input.text(0);
			} else {
				text = input.text().replace(/,/g, '');
				input.text(formatNo(text.substring(0, text.length-1)));
			}
		} else if(value == 46 || value == 27 ) {
			if ($('.unit1-select').is(':visible')) {
				if (value == 27) $('.unit1-select').hide();
			} else {
				input.text(0);
			}
		}

		switched = false;
		output_value();
	}
	
	/* 	CONVERSION VARIABLES
		The conversion factor of each unit is the number 
		of times the reference unit must be multiplied
		to get the given unit.
		The unit with a c.f. of 1 is the reference unit.
	*/

	// Get JSON file before document early
	var current_units = '';
	var current_category = 'Volume';
	var switched = false;
	var conversions = {
		"Volume": {
			"Barrels [UK]": ["bbls (UK)", "Barrels [UK]", 6.1102568972, 0],
			"Barrels (Oil)": ["bbls", "Barrels (Oil)", 6.28981077, 0],
			"Cubic centimeters": ["cm3", "Cubic centimeters", '1e+6', 2],
			"Cubic inches": ["tbsp.", "Cubic inches", 61023.744094732, 0],
			"Cubic meters": ["m3", "Cubic meters", 1, 1],
			"Cups (US)": ["cups", "Cups (US)", 4226.753, 0],
			"Fluid ounces (US)": ["oz.", "Fluid ounces (US)", 33814.023, 0],
			"Gallons (US)": ["gals.", "Gallons (US)", 264.1721, 0],
			"Liters": ["l", "Liters", 1000, 0],
			"Milliliters": ["ml", "Milliliters", '1e+6', 0],
			"Pints [US, liquid]": ["pints", "Pints [US, liquid]", 2113.37642, 0],
			"Quarts [US, liquid]": ["quarts", "Quarts [US, liquid]", 1056.68821, 0],
			"Scruples [UK, liquid]": ["scp", "Scruples [UK, liquid]", 844705.56, 0],
			"Tablespoons (US)": ["tbsp.", "Tablespoons (US)", 67628.04, 0],
			"Teaspoons (US)": ["tsp.", "Teaspoons (US)", 202884.1, 0]
		},
		"Length": {
			"Centimeters": ["cm", "Centimeters", 100, 2],
			"Decimeters": ["dm", "Decimeters", 10, 0],
			"Feet": ["ft", "Feet", 3.280839895, 0],
			"Gigameters": ["gm", "Gigameters", '1e-9', 0],
			"Hectometers": ["hm", "Hectometers", 0.01, 0],
			"Inches": ["in", "Inches", 39.3700787, 0],
			"Kilometers": ["km", "Kilometers", '1e-3', 0],
			"Light years": ["light years", "Light years", '1.05702341e-16', 0],
			"Rods": ["rods", "Rods", 0.198838782, 0],
			"Meters": ["m", "Meters", 1, 1]
		},
		"Weight and Mass": {
			"Atomic Mass Units": ["amu", "Atomic Mass Units", '6.022136651675e+26', 0],
			"Carats": ["cat", "Carats", 5000, 0],
			"Centals": ["cental", "Centals", 0.02204622621849, 0],
			"Centigrams": ["cg", "Centigrams", 100000, 0],
			"Dekagrams": ["dg", "Dekagrams", 100, 0],
			"Drams": ["dram", "Drams", 564.3833911933, 0],
			"Grains": ["grain", "Grains", 15432.35835294, 0],
			"Grams": ["g", "Grams", '1e-3', 0],
			"Hundredweight [UK]": ["hundredweight", "Hundredweight [UK]", 0.01968413055222, 0],
			"Kilograms": ["kg", "Kilograms", 1, 1],
			"Micrograms": ["ug", "Micrograms", 1000000000, 0],
			"Milligrams": ["mg", "Milligrams", 1000000, 0],
			"Newtons (Earth)": ["N", "Newtons (Earth)", 9.80665, 0],
			"Ounces": ["oz.", "Ounces", 35.27396194958, 0],
			"Pennyweight": ["dwt", "Pennyweight", 643.0149313726 , 0],
			"Pounds": ["lb.", "Pounds", 2.204622621849, 2],
			"Quarters": ["quarter", "Quarters", 0.07873652220889, 0],
			"Stones": ["st", "Stones", 0.1574730444178, 0],
			"Tons [UK, long]": ["tons", "Tons [UK, long]", 0.0009842065276111, 0],
			"Tons [UK, short]": ["tons", "Tons [UK, short]", 0.001102311310924, 0],
			"Tonnes": ["t", "Tonnes", 0.001, 0],
			"Troy Ounces": ["troy oz.", "Troy Ounces", 32.15074656863, 0]
		},
		"Temperature": {

		},
		"Energy": {

		},
		"Area": {
			"Square centimeters": ["cm2", "Square centimeters", 10000, 2],
			"Square meters": ["m2", "Square meters", 1, 1]
		},
		"Speed": {

		},
		"Time": {

		},
		"Power": {

		},
		"Data": {

		},
		"Pressure": {

		},
		"Angle": {

		}
	};

	// Load types into conversion type select menus
	var html = '';
	for (var i in conversions) {
		html += (i == current_category) ? "<div class='option selected'>" + i + "</div>" : "<div class='option'>" + i + "</div>";
	}
	$('.type-select > .options').append(html);

	// Load units per default category
	loadUnits(conversions);


	// TOGGLING INPUT
	$('.value').click(function(event) {
		if(!$(this).parent('.conv').hasClass('conv-input')) {
			$('.value').parent('.conv').toggleClass('conv-input');
			switched = true;
		}
	})

	// MOUSE ENTRY
	$('.inputNumber').mousedown(function(event) {
		$(this).addClass('clicked');
	}).mouseup(function(event) {
		$(this).removeClass('clicked');
		io($(this).attr('value'));
	}).mouseout(function(event) {
		$(this).removeClass('clicked');
	});

	// NUMERIC KEYBOARD ENTRY
	$(document).keydown(function(event) {
		$('.inputNumber[value=' + event.which + ']').addClass('clicked');
		io(event.which);
	}).keyup(function(event) {
		$('.inputNumber[value=' + event.which + ']').removeClass('clicked');
	});

	// CONVERSION TYPES MENU

	// Opening Menu
	$('.menu-trigger.open').click(function() {$('.type-select').removeClass('closed');});
	$('.menu-trigger.close').click(function() {$('.type-select').addClass('closed');});

	// Selecting conversion type
	$('.type-select .options>.option').click(function(event) {
		var whatIClicked = $(this).text();

		// Load name to header
		$('.conv-category').text(whatIClicked);

		// Load units
		current_category = whatIClicked;
		loadUnits(conversions);

		$('.type-select').addClass('closed');
	});

	 
	// SELECTING UNIT MENU
	

	// OPENING AND POSITIONING MENU
	// Positioning Menu 1
	$('.conv1 .conv-label').click(function(event) {
		var maxHeight = '450px';
		switch($('.unit1-select .option.selected').index()) {
			case(0): offsetDistance = '46px'; maxHeight = '410px'; break;
			case(1): offsetDistance = '7px'; break;
			default: offsetDistance = 0; break;
		}

		$('.unit1-select').css({
			top: offsetDistance,
			'max-height': maxHeight
		}).show();
	});

	// Positioning Menu 2
	$('.conv2 .conv-label').click(function(event) {
		var x = $('.unit2-select .option.selected').index();
		var ods = [122, 82, 42, 2];

		if (x > 0) ods.pop(122);
		if (x > 1) ods.pop(82);
		if (x > 2) ods.pop(42);

		var actual_od = 442 - 40 * $('.unit2-select').children().length;
		var od = ods.sort((a,b) => Math.abs(actual_od-a) - Math.abs(actual_od-b))[0];

		var offsetDistance = od + 'px';
		var maxHeight = 442 - od + 'px';

		$('.unit2-select').css({
			top: offsetDistance,
			'max-height': maxHeight
		}).show();
	});

	// CLOSING MENU BY CLICKING OUTSIDE
	$(document).click(function(event) {
		if(!$(event.target).closest('.unit1-select, .conv1 > .conv-label').length && $('.unit1-select').is(':visible')) $('.unit1-select').hide();
		if(!$(event.target).closest('.unit2-select, .conv2 > .conv-label').length && $('.unit2-select').is(':visible')) $('.unit2-select').hide();
	});
})
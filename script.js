$(document).ready(function() {
    
    
    // YEAR
    var today = new Date();
    var year = today.getFullYear();
    year = year + 1;
    

    // Alpha. sorting (for models)
    Array.prototype.localeSort = function localeSort() {
        return this.sort(function(a, b) { return a.localeCompare(b); });
    };
    

    $('#make').on('change', function () { selectModel(); }); // Models listing
    $('#models').on('change', function () { $("#mainbox").hide(); calc(); }); // Model select
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Make from JSON file (vehicules.json) + select input injection
    $.getJSON('vehicules.json', function(data){
        var results = {}; // Object array
        $.each(data, function(index, x) { results[x.Vehicle_Make] = x.Vehicle_Make_Fullname; }); // Associative array

        var make_select_options = "";

        for (var key in results) {
            make_select_options += '<option value="' + key + '">' + results[key] + '</option>' // Option added
        }
        
        $("#make").append(make_select_options);
    });


    // Models from JSON file (vehicules.json) + select input injection
    function selectModel(){
        var selected_make = $("#make").val();
        var results = [];        

        $.getJSON('vehicules.json', function(data) {

            $.each(data,  function (index, x) { // Standard array
                if(x.Vehicle_Make === selected_make) { results.push(x.Vehicle_Description); } // Result added only if the make is the selected one
            });

            results.localeSort(); // Sorting
            
            var models_select_options = "";

            for(var key in results){
                models_select_options += '<option value="'+ results[key] +'">' + results[key] + '</option>';  // Option added
            }
            
            $("#models").html('<option>Model</option>'); // Purge
            $("#models").append(models_select_options);
        })
    }
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Calcul function
    function calc(){

        var Vehicle_Description = $("#models").val();
        $("#box").html("");
        
        
        // Informations from JSON file (vehicules.json)
        $.getJSON('vehicules.json', function(data) {
            $.each(data,  function (index, x) {
                if(x.Vehicle_Description === Vehicle_Description){ // We get the selected vehicle informations

                    var currentCO2 = x.Vehicle_CO2;
                    if(currentCO2 === 360) { var taxRate = 50; } // If CO2 == 360 >> taxRate = 50

                    // Informations from JSON file (CO2TAX.json)
                    $.getJSON('CO2TAX.json', function(data) {
                        var arr = [];
                        $.each(data[year], function (index, x){ arr.push(x); });
                        
                        for (var i in arr) {
                            if (parseInt(arr[i].CO2) === currentCO2) { taxRate = arr[i].TAX; } // We get the taxRate from the file
                        }

                        // Selected vehicle informations
                        $('#box').html(
                            '<p class="tabtext">Options & Accessories</p>'+
                            '<div class="row rowoption">'+
                            '<p class="info">Click buttons to add the price of your options and acessories (in euro).</p>'+
                            '<div class="col-xs-12 col-md-6">'+
                            '<button class="scrollOption btn btn-primary">options</button>'+
                            '<div class="boxoption"><br>'+
                            'Option 01: <input id="option1" class="options" type="numeric" value="0"><br>'+
                            'Option 02: <input id="option2" class="options" type="text" value="0"><br>'+
                            'Option 03: <input id="option3" class="options" type="text" value="0"><br>'+
                            'Option 04: <input id="option4" class="options" type="text" value="0"><br>'+
                            'Option 05: <input id="option5" class="options" type="text" value="0"><br>'+
                            'Option 06: <input id="option6" class="options" type="text" value="0"><br>'+
                            'Option 07: <input id="option7" class="options" type="text" value="0"><br>'+
                            'Option 08: <input id="option8" class="options" type="text" value="0"><br>'+
                            'Option 09: <input id="option9" class="options" type="text" value="0"><br>'+
                            'Option 10: <input id="option10" class="options" type="text" value="0"><br>'+
                            '</div>'+
                            '</div>'+

                            '<div class="col-xs-12 col-md-6">'+
                            '<button class="scrollAcces btn btn-primary">Accessories</button>'+
                            '<div class="boxacces"><br>'+
                            'Accessory 01: <input id="acces1" class="acces" type="text" value="0"><br>'+
                            'Accessory 02: <input id="acces2" class="acces" type="text" value="0"><br>'+
                            'Accessory 03: <input id="acces3" class="acces" type="text" value="0"><br>'+
                            'Accessory 04: <input id="acces4" class="acces" type="text" value="0"><br>'+
                            'Accessory 05: <input id="acces5" class="acces" type="text" value="0"><br>'+
                            '</div>'+
                            '</div>');

                        $('.boxoption').hide();
                        $('.scrollOption').click(function(){ $('.boxoption').toggle(300); }); // Options toggle

                        $('.boxacces').hide();
                        $('.scrollAcces').click(function(){ $('.boxacces').toggle(300); }); // Accessories toggle

                        $(".options, .acces").on('change', function () { final_calcul(); }); // Calcul on option/accessorie change

                        function final_calcul() {

                            // Options / Accessories values loop
                            var totalPriceOption = 0;
                            for(var i=1; i<$(".options").length+1; i++){
                                totalPriceOption += parseInt($("#option"+i).val()) || 0;
                            }
                            var totalTaxOption = ((totalPriceOption * 0.945) * (taxRate * 0.01)) / (1 - (taxRate * 0.01));
                            var totalOption = totalTaxOption + totalPriceOption;

                            var totalAcces = 0;
                            for(var i=1; i<$(".acces").length+1; i++){
                                totalAcces += parseInt($("#acces"+i).val()) || 0;;
                            }
                            var effectiveTotalAccesOption = (totalAcces + totalPriceOption) - 850;
                            if (effectiveTotalAccesOption < 0 ){
                                effectiveTotalAccesOption = 0;
                            }

                            // Effective Price calculation
                            var effectivePrice = x.Vehicle_Price_including_VAT-3400; // BAD
                            var effectivePrice = x.Vehicle_Price_including_VAT;

                            // Price Tax calculation
                            var pricetax = ((effectivePrice * 0.945) - 250) * (taxRate * 0.01) / (1 - (taxRate * 0.01));

                            // Effective Price calculation
                            var totaltax = pricetax + totalTaxOption;
                            totaltax = Math.round(totaltax * 100)/100;

                            // Total Price calculation : vehicle price + taxes (options)
                            var totalprice = effectivePrice + pricetax + totalOption + totalAcces;
                            totalprice = Math.round(totalprice * 100)/100;

                            // Effective Total Price calculation
                            var effectiveTotalPrice = effectivePrice + effectiveTotalAccesOption;
                            var unlimitedBenefit=(effectiveTotalPrice*0.014);                            
                            unlimitedBenefit= Math.round(unlimitedBenefit / 10) * 10;
                            unlimitedBenefit+= 255;
                            var limitedBenefit=(effectiveTotalPrice*0.014);
                            limitedBenefit= Math.round(limitedBenefit / 10) * 10;
                            limitedBenefit+= 105;

                            $('#boxinfo').html(
                                '<div class="row rowinfo">'+
                                '<p class="tabtext">Informations</p>'+
                                '<div class="colinfo col-xs-12 col-md-6">'+
                                '<div class="viewinfo">'+
                                '<p><strong>List Price : </strong>' + x.Vehicle_Price_including_VAT + ' €</p>'+
                                '<p><strong>CO2-emission: </strong>' + currentCO2 + ' g/km</p>'+
                                '<p><strong>Tax Rate: </strong>' + taxRate + ' %</p>'+
                                '</div>'+
                                '</div>'+
                                '<div class="colinfo col-xs-12 col-md-6">'+
                                '<div class="viewinfo">'+
                                '<p><strong>Model : </strong>' + x.Vehicle_Model + '</p>'+
                                '<p><strong>Fuel Type : </strong>' + x.Fuel_Type + '</p>'+
                                '<p><strong>Max Weight : </strong>' +x.Maximum_Weight + ' Kg</p>'+
                                '</div>'+
                                '</div>'+
                                '</div>'+
                                '<div class="row rowbilan">'+
                                '<div class="colinfo col-xs-12 col-md-6">'+
                                '<p class="tabtext">Total</p>'+
                                '<div class="viewinfo">'+
                                '<p><strong>Total Tax: </strong>' + totaltax + ' €</p>' +
                                '<p><strong>Total Price: </strong>' + totalprice + ' €</p>'+
                                '</div>'+
                                '</div>'+
                                '<div class="colinfo col-xs-12 col-md-6">'+
                                '<p class="tabtext">Benefits</p>'+
                                '<div class="viewinfo">'+
                                '<p><strong>Unlimited Benefit : </strong>' + unlimitedBenefit + ' €</p>'+
                                '<p><strong>Limited Benefit : </strong>' + limitedBenefit + ' €</p>'+
                                '</div>'+
                                '</div>'+
                                '</div>'
                            );

                            $("#mainbox").fadeIn('slow'); //fadeIn
                        }
                        final_calcul();
                    });
                }
            })
        });
    }
});
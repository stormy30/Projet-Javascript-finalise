CREATION D'UN CONVERTISSEUR du taxcalc csv en un fichier json avec une colone renseignat le nom complet des vehicules
<?
function getJsonFromCsv($file,$delimiter) { 
    if (($handle = fopen($file, 'r')) === false) {
        die('Error');
    }

    $headers = fgetcsv($handle, 4000, $delimiter);
    
    $headers = preg_replace('/\s+/', '_', $headers); // Espaces => _
    array_unshift($headers, "Vehicle_Make_Fullname"); // On ajoute une en-tête
    
    $csv2json = array();

    while ($row = fgetcsv($handle, 4000, $delimiter)) {

        //print_r($headers); exit; // Debug
        
        // Manufacturer code
        $manufName = array("AU" => "Audi", "FO" => "Ford", "ME" => "Mercedes Benz", "LR" => "Land Rover", "BM" => "BMW", "VW" => "Volkswagen","M2" => "Mini", "TO" => "Toyota", "RE" => "Renault", "PE" => "Peugeot", "SK" => "Skoda", "VO" => "Volvo", "OP" => "Opel", "HY" => "Hyundai", "KI" => "Kya", "FI" => "Fiat", "JE" => "Jeep", "SE" => "Seat", "JA" => "Jaguar", "CI" => "Citroen", "SZ" => "Suzuki", "PR" => "Porsche", "AR" => "Alfa Romeo", "MA" => "Mazda", "SB" => "Subaru", "SM" => "Smart", "DI" => "Dacia", "MI" => "Mitsubishi","SB" => "Subaru", "BI" => "BMWi", "MF" => "Fuso Canter","IS" => "Isuzu", "DS" => "DS", "SS" => "Ssangyon", "IV" => "Iveco", "TE" => "Tesla", "HO" => "Honda", "LE" => "Lexus");        
        
        array_unshift($row, $manufName[$row[0]]);
    
        $row[3] = preg_replace('/\s+/', ' ', $row[3]); // Espaces => Espace
        $row[4] = number_format($row[4],0,'',''); $row[4] = $row[4] / 10000000; // Vehicle Price including VAT en €
        $row[6] = intval($row['6']); // Vehicle C02
        $row[8] = intval($row['8']); // Vehicle Maximum_Weight
      $csv2json[] = array_combine($headers, $row);
    }

    fclose($handle);
    return json_encode($csv2json); 
}


echo '<pre>';

echo getJsonFromCsv('TAXCALC.CSV',';');

echo '</pre>';
?>
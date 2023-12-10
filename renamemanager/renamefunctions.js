function convertToRoman(num) {

    const roNumerals = {
        M: Math.floor(num / 1000),
        CM: Math.floor(num % 1000 / 900),
        D: Math.floor(num % 1000 % 900 / 500),
        CD: Math.floor(num % 1000 % 900 % 500 / 400),
        C: Math.floor(num % 1000 % 900 % 500 % 400 / 100),
        XC: Math.floor(num % 1000 % 900 % 500 % 400 % 100 / 90),
        L: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 / 50),
        XL: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 % 50 / 40),
        X: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 % 50 % 40 / 10),
        IX: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 % 50 % 40 % 10 / 9),
        V: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 % 50 % 40 % 10 % 9 / 5),
        IV: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 % 50 % 40 % 10 % 9 % 5 / 4),
        I: Math.floor(num % 1000 % 900 % 500 % 400 % 100 % 90 % 50 % 40 % 10 % 9 % 5 % 4 / 1)
    };
    var roNuStr = "";

    for (var prop in roNumerals) {
        for (i = 0; i < roNumerals[prop]; i++) {
            roNuStr += prop;
        }

    }
    return roNuStr;
}

function renameVehicle(ipt, buildingId, buildingType, vehicleType, counter, buildingName) {
    return new Promise(function(resolve) {
        var buildingAliasOne = rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_one ? rename_config.buildings[buildingId].alias_one : "unbekannt";
        var buildingAliasTwo = rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_two ? rename_config.buildings[buildingId].alias_two : "unbekannt";
        var buildingTypeAliasOne = rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].alias_one ? rename_config.building_types[buildingType].alias_one : "unbekannt";
        var buildingTypeAliasTwo = rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].alias_two ? rename_config.building_types[buildingType].alias_two : "unbekannt";
        var vehicleTypeAliasOne = rename_config.vehicle_types && rename_config.vehicle_types[vehicleType] && rename_config.vehicle_types[vehicleType].alias_one ? rename_config.vehicle_types[vehicleType].alias_one : "unbekannt";
        var vehicleTypeAliasTwo = rename_config.vehicle_types && rename_config.vehicle_types[vehicleType] && rename_config.vehicle_types[vehicleType].alias_two ? rename_config.vehicle_types[vehicleType].alias_two : "unbekannt";
        var outCount = rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].zero_before && counter < 10 ? `0${ counter }` : counter;
        var output = ipt
            .replace("{Fahrzeugtyp-Alias 1}", vehicleTypeAliasOne).replace("{Fahrzeugtyp-Alias 2}", vehicleTypeAliasTwo)
            .replace("{Wachentyp-Alias 1}", buildingTypeAliasOne).replace("{Wachentyp-Alias 2}", buildingTypeAliasTwo)
            .replace("{Wachen-Alias 1}", buildingAliasOne).replace("{Wachen-Alias 2}", buildingAliasTwo)
            .replace("{Wachenname}", buildingName).replace("{ZÃ¤hler}", outCount)
            .replace("{rÃ¶m. Ziffer}", convertToRoman(counter)).replace("{Buchstabe}", String.fromCharCode(counter + 64));
        resolve(output);
    });
}

async function renameVehicles(vehicles, buildingType) {
    for (var i in vehicles) {
        var e = vehicles[i];
        $("#reMaStatus").text("Benenne Fahrzeug " + (+i + 1).toLocaleString() + " von " + vehicles.length.toLocaleString() + " um.");
        if (!$("#reMaRename_" + e.vId).length) continue;
        if ($("#reMaRename_" + e.vId).val() !== $("#vehicle_link_" + e.vId).text()) {
            await $.post("/vehicles/" + e.vId, { "vehicle": { "caption": $("#reMaRename_" + e.vId).val().trim() }, "authenticity_token": $("meta[name=csrf-token]").attr("content"), "_method": "put" });
            if (buildingType == 7) {
                $("#vehicle_link_" + e.vId).text($("#reMaRename_" + e.vId).val().trim());
            } else {
                $("a[href='/vehicles/" + e.vId + "']:not(.btn)").text($("#reMaRename_" + e.vId).val().trim());
            }
            $("#reMaRename_" + e.vId).remove();
            $("#reMaSaveNameVehicle_" + e.vId).remove();
        } else {
            $("#reMaRename_" + e.vId).remove();
            $("#reMaSaveNameVehicle_" + e.vId).remove();
        }

    }
    $("#reMaStatus").text("Alle Fahrzeuge erfolgreich umbenannt.");
}
async function getBuildingVehicles() {
    return new Promise(async function(resolve) {
        var arrReturn = [];
        $("#reMaStatus").text("Sammle Daten.");
        $('#vehicle_table >> tr:not(.tablesorter-headerRow)').each(async function() {
            const $this = $(this);
            const vehicleTable = $this.children("td").children("a[href*='/vehicles/']:not(.btn)");
            const vehicleId = vehicleTable.attr("href").replace(/\D+/g, "");
            const vehicle = aVehicles.find(v => v.id == vehicleId) ? aVehicles.find(v => v.id == vehicleId) : await $.getJSON(`/api/vehicles/${ vehicleId }`);
            if (vehicle) {
                arrReturn.push({
                    "vId": vehicleId,
                    "vType": vehicle.vehicle_type
                });
            }
            if (arrReturn.length == $('#vehicle_table >> tr:not(.tablesorter-headerRow)').length) {
                $("#reMaStatus").text("Datensammlung abgeschlossen.");
                resolve(arrReturn);
            }
        });
    });
}

(async function() {
    var buildingId = +window.location.href.replace(/\D+/g, "");
    var buildingType = $("h1").attr("building_type");
    var building = aBuildings.find(obj => obj.id == buildingId) ? aBuildings.find(obj => obj.id == buildingId) : await $.getJSON("/api/buildings/" + buildingId);
    var renamed = false;
    var buildingCounty = "";
    var vehicles = [];

    await $.getJSON("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + building.latitude + "&lon=" + building.longitude + "&zoom=18&addressdetails=1", function(data) {
        $(".active:first").after("<span class='label label-info' style='cursor:default;margin-left:2em'>" + (data.address.county ? data.address.county : (data.address.city ? data.address.city : (data.address.town ? data.address.town : data.address.state))) + "</span>");
        buildingCounty = (data.address.county ? data.address.county : (data.address.city ? data.address.city : (data.address.town ? data.address.town : data.address.state))).replace(/^\w+\s/g, "");
    });

    $("#vehicle_table")
        .before(`<a class="btn btn-success btn-xs" id="reMaTriggerRename">
                    <span class="glyphicon glyphicon-eye-close"> RenameManager</span>
                </a>
                <a class="btn btn-success btn-xs" id="reMaTriggerBuildingAlias">
                    <span class="glyphicon glyphicon-eye-close"> Wachen-Alias</span>
                </a>
                <a class="btn btn-success btn-xs" id="reMaTriggerBuildingTypeAlias">
                    <span class="glyphicon glyphicon-eye-close"> Wachentyp-Alias</span>
                </a>
                <div class="hidden" id="reMaBuildingTypeAlias">
                    <div class="form-group" style="display:inline-block">
                        <label for="reMaBuildingTypeAliasOne">Wachentyp-Alias 1</label>
                        <input type="text" class="form-control" id="reMaBuildingTypeAliasOne" value="${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].alias_one ? rename_config.building_types[buildingType].alias_one : "" }">
                    </div>
                    <div class="form-group" style="display:inline-block">
                        <label for="reMaBuildingTypeAliasTwo">Wachentyp-Alias 2</label>
                        <input type="text" class="form-control" id="reMaBuildingTypeAliasTwo" value="${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].alias_two ? rename_config.building_types[buildingType].alias_two : "" }">
                    </div>
                    <a class="btn btn-success" id="reMaSaveBuildingTypeAliasBuilding">Wachentyp-Alias speichern</a>
                </div>
                <div class="hidden" id="reMaBuildingAlias">
                    <div class="form-group" style="display:inline-block">
                        <label for="reMaBuildingTypeAliasOne">Wachen-Alias 1</label>
                        <input type="text" class="form-control" id="reMaBuildingAliasOne" value="${ rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_one ? rename_config.buildings[buildingId].alias_one : "" }">
                    </div>
                    <div class="form-group" style="display:inline-block">
                        <label for="reMaBuildingTypeAliasTwo">Wachen-Alias 2</label>
                        <input type="text" class="form-control" id="reMaBuildingAliasTwo" value="${ rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_two ? rename_config.buildings[buildingId].alias_two : "" }">
                    </div>
                    <a class="btn btn-success" id="reMaSaveBuildingAliasBuilding">Wachen-Alias speichern</a>
                </div>
                <div class="hidden" id="reMaRenameField">
                    <div class="btn-group" style="display:flex">
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Fahrzeugtyp-Alias 1}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Fahrzeugtyp-Alias 2}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Wachentyp-Alias 1}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Wachentyp-Alias 2}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Wachen-Alias 1}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Wachen-Alias 2}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Wachenname}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{ZÃ¤hler}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{rÃ¶m. Ziffer}</a>
                        <a class="btn btn-info btn-xs placeholder" style="flex:1">{Buchstabe}</a>
                    </div>
                    <input type="text" class="form-control" id="reMaRenameTextarea" value="${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].textarea ? rename_config.building_types[buildingType].textarea : "" }">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="reMaZeroBefore" ${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].zero_before ? "checked" : "" }>
                        <label class="form-check-label" for="reMaZeroBefore">0 vor einstelligem ZÃ¤hler</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="reMaCountyAlias1" ${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].county ? "checked" : "" }>
                        <label class="form-check-label" for="reMaCountyAlias1">Landkreis/ kreisfreie Stadt als Wachen-Alias 1</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="reMaNoKnown" ${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].known_vehicles ? "checked" : "" }>
                        <label class="form-check-label" for="reMaNoKnown">kein Textfeld bei Ã¼bereinstimmenden Namen generieren</label>
                    </div>
                    <div class="btn-group">
                        <a class="btn btn-info" id="reMaStartRenameBuilding">Umbenennen</a>
                        <a class="btn btn-success" id="reMaSaveNamesBuilding">Alle speichern</a>
                    </div>
                    <span class="label label-info" id="reMaStatus">Status: Warte auf Eingabe</span>
                </div>`);

    if (buildingType === "9") {
        $("#reMaNoKnown")
            .parent()
            .after(`<div class="form-check">
                        <input type="checkbox" class="form-check-input" id="reMaThwSecondName" ${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].second_vehicle ? "checked" : "" }>
                        <label class="form-check-label" for="reMaThwSecondName">Ersetze "{Fahrzeugtyp-Alias 1}" gegen "{Fahrzeugtyp-Alias 2}" beim zweiten Fahrzeug des gleichen Typs (Nur THW!)</label>
                    </div>`);
    } else {
        $("#reMaNoKnown")
            .parent()
            .after(`<div class="form-check">
                        <input type="checkbox" class="form-check-input" id="reMaAliasAsType" ${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].counter_alias ? "checked" : "" }>
                        <label class="form-check-label" for="reMaAliasAsType">Nutze "{Fahrzeugtyp-Alias 1}" als ZÃ¤hler, statt dem TypenzÃ¤hler (Nicht THW!)</label>
                    </div>`);
    }

    if (rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].county) {
        $("#reMaBuildingAliasOne").val(rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_one ? rename_config.buildings[buildingId].alias_one : buildingCounty);
    }

    $("body").on("click", "#reMaStartRenameBuilding", async function() {
        var counterTypes = {};
        vehicles = await getBuildingVehicles();

        if (vehicles.length > 1) vehicles.sort((a, b) => a.vId > b.vId ? 1 : -1);

        for (var i in vehicles) {
            var e = vehicles[i];
            $("#reMaStatus").text("Generiere Name " + (+i + 1).toLocaleString() + " von " + vehicles.length.toLocaleString());
            var vehicleCounterType = rename_config.building_types[buildingType].counter_alias === true ? rename_config.vehicle_types[e.vType].alias_one : e.vType;
            counterTypes[vehicleCounterType] ? counterTypes[vehicleCounterType]++ : counterTypes[vehicleCounterType] = 1;
            var textField = $("#reMaRenameTextarea").val();
            if (buildingType === "9" && rename_config.building_types[buildingType].second_vehicle === true && counterTypes[vehicleCounterType] === 2) {
                textField = textField.replace("{Fahrzeugtyp-Alias 1}", "{Fahrzeugtyp-Alias 2}");
            }
            var vehicleNewName = await renameVehicle(textField, buildingId, buildingType, e.vType, counterTypes[vehicleCounterType], building.caption.trim());
            if ($("#reMaNoKnown")[0].checked && vehicleNewName == $("a[href='/vehicles/" + e.vId + "']:not(.btn)").text()) {
                continue;
            }
            if ($("#reMaRenameTextarea").val() && !$("#reMaRename_" + e.vId).length) {
                renamed = true;
                $("a[href='/vehicles/" + e.vId + "']:not(.btn)")
                    .parent()
                    .append(`<input type="text" class="form-control" id="reMaRename_${ e.vId }" value="${ vehicleNewName }">
                             <a class="btn btn-success btn-xs saveSingleName" id="reMaSaveNameVehicle_${ e.vId }">Speichern</a>`);
            }
            if ($("#reMaRename_" + e.vId).length) {
                $("#reMaRename_" + e.vId).val(vehicleNewName);
            }
        }
        $("#reMaStatus").text("Alle Fahrzeugnamen generiert.");
    });

    $("body").on("click", "#vehicle_table .saveSingleName", async function() {
        const $this = $(this);
        const vehicleId = $this.attr("id").replace(/\D+/g, "");
        if ($("#reMaRename_" + vehicleId).val()) {
            if ($("#reMaRename_" + vehicleId).val() !== $("a[href='/vehicles/" + vehicleId + "']:not(.btn)").text()) {
                await $.post("/vehicles/" + vehicleId, { "vehicle": { "caption": $("#reMaRename_" + vehicleId).val().trim() }, "authenticity_token": $("meta[name=csrf-token]").attr("content"), "_method": "put" });
                $("a[href='/vehicles/" + vehicleId + "']:not(.btn)").text($("#reMaRename_" + vehicleId).val().trim());
                $("#reMaRename_" + vehicleId).remove();
                $("#reMaSaveNameVehicle_" + vehicleId).remove();
            } else {
                $("#reMaRename_" + vehicleId).remove();
                $("#reMaSaveNameVehicle_" + vehicleId).remove();
            }
        }
    });

    $("body").on("click", "#reMaSaveBuildingTypeAliasBuilding", async function() {
        if (!rename_config.building_types) rename_config.building_types = {};
        if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
        rename_config.building_types[buildingType].alias_one = $("#reMaBuildingTypeAliasOne").val().trim();
        rename_config.building_types[buildingType].alias_two = $("#reMaBuildingTypeAliasTwo").val().trim();
        await saveRenameConfig();
        alert("Wachentyp-Alias gespeichert.");
        console.debug("Wachentyp-Alias im GebÃ¤ude gespeichert!", rename_config);
    });

    $("body").on("click", "#reMaSaveBuildingAliasBuilding", async function() {
        if (!rename_config.buildings) rename_config.buildings = {};
        if (!rename_config.buildings[buildingId]) rename_config.buildings[buildingId] = {};
        rename_config.buildings[buildingId].alias_one = $("#reMaBuildingAliasOne").val().trim();
        rename_config.buildings[buildingId].alias_two = $("#reMaBuildingAliasTwo").val().trim();
        await saveRenameConfig();
        alert("Wachen-Alias gespeichert.");
        console.debug("Wachen-Alias im GebÃ¤ude gespeichert!", rename_config);
    });

    $("body").on("click", "#reMaSaveNamesBuilding", async function() {
        if (renamed === true) {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].textarea = $("#reMaRenameTextarea").val().trim();
            await saveRenameConfig();

            renameVehicles(vehicles, buildingId);
        }
    });

    $("body").on("click", "#reMaTriggerRename", function() {
        if ($("#reMaRenameField").hasClass("hidden")) {
            $("#reMaRenameField").removeClass("hidden");
            $("#reMaTriggerRename .glyphicon").removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
        } else {
            $("#reMaRenameField").addClass("hidden");
            $("#reMaTriggerRename .glyphicon").removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
        }
    });

    $("body").on("click", "#reMaTriggerBuildingTypeAlias", function() {
        if ($("#reMaBuildingTypeAlias").hasClass("hidden")) {
            $("#reMaBuildingTypeAlias").removeClass("hidden");
            $("#reMaTriggerBuildingTypeAlias .glyphicon").removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
        } else {
            $("#reMaBuildingTypeAlias").addClass("hidden");
            $("#reMaTriggerBuildingTypeAlias .glyphicon").removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
        }
    });

    $("body").on("click", "#reMaTriggerBuildingAlias", function() {
        if ($("#reMaBuildingAlias").hasClass("hidden")) {
            $("#reMaBuildingAlias").removeClass("hidden");
            $("#reMaTriggerBuildingAlias .glyphicon").removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
        } else {
            $("#reMaBuildingAlias").addClass("hidden");
            $("#reMaTriggerBuildingAlias .glyphicon").removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
        }
    });

    $("body").on("click", "#reMaRenameField .placeholder", function() {
        if (!$("#reMaRenameTextarea").val().includes($(this).text())) {
            $("#reMaRenameTextarea").val($("#reMaRenameTextarea").val() + $(this).text());
        }
        $("#reMaRenameTextarea").focus();
    });

    $("body").on("click", "#reMaZeroBefore", async function() {
        if ($("#reMaZeroBefore")[0].checked) {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].zero_before = true;
            await saveRenameConfig();
        } else {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].zero_before = false;
            await saveRenameConfig();
        }
    });

    $("body").on("click", "#reMaCountyAlias1", async function() {
        if ($("#reMaCountyAlias1")[0].checked) {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].county = true;
            $("#reMaBuildingAliasOne").val(rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_one ? rename_config.buildings[buildingId].alias_one : buildingCounty);
            await saveRenameConfig();
        } else {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].county = false;
            $("#reMaBuildingAliasOne").val(rename_config.buildings && rename_config.buildings[buildingId] && rename_config.buildings[buildingId].alias_one ? rename_config.buildings[buildingId].alias_one : "");
            await saveRenameConfig();
        }
    });

    $("body").on("click", "#reMaThwSecondName", async function() {
        if ($("#reMaThwSecondName")[0].checked) {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].second_vehicle = true;
            await saveRenameConfig();
        } else {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].second_vehicle = false;
            await saveRenameConfig();
        }
    });

    $("body").on("click", "#reMaAliasAsType", async function() {
        if ($("#reMaAliasAsType")[0].checked) {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].counter_alias = true;
            await saveRenameConfig();
        } else {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].counter_alias = false;
            await saveRenameConfig();
        }
    });

    $("body").on("click", "#reMaNoKnown", async function() {
        if ($("#reMaNoKnown")[0].checked) {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].known_vehicles = true;
            await saveRenameConfig();
        } else {
            if (!rename_config.building_types) rename_config.building_types = {};
            if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {};
            rename_config.building_types[buildingType].known_vehicles = false;
            await saveRenameConfig();
        }
    });

})();
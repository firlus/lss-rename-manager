async function getDispatchVehicles() {
    return new Promise(async function (resolve) {
        var arrReturn = [];
        $("#reMaStatus").text("Sammle Daten.");
        $('#vehicle_table >> tr:not(.tablesorter-headerRow)').each(async function () {
            var $this = $(this);
            var vehicleId = +$this.children("td").children("span").attr("id").replace(/\D+/g, "");
            var vehicle = aVehicles.find((obj) => obj.id == vehicleId) ? aVehicles.find((obj) => obj.id == vehicleId) : await $.getJSON("/api/vehicles/" + vehicleId);
            var building = aBuildings.find((obj) => obj.id == vehicle.building_id) ? aBuildings.find((obj) => obj.id == vehicle.building_id) : await $.getJSON("/api/buildings/" + vehicle.building_id);
            arrReturn.push({
                "vId": vehicleId,
                "vType": vehicle.vehicle_type,
                "bId": building.id,
                "bType": building.building_type,
                "bCaption": building.caption
            });
            if ($('#vehicle_table >> tr:not(.tablesorter-headerRow)').length == arrReturn.length) {
                $("#reMaStatus").text("Datensammlung abgeschlossen.");
                resolve(arrReturn);
            }
        });
    });
}

(async function () {
    var buildingId = +window.location.href.replace(/\D+/g, "");
    var buildingType = $("h1").attr("building_type");
    var building = aBuildings.find(obj => obj.id == buildingId) ? aBuildings.find(obj => obj.id == buildingId) : await $.getJSON("/api/buildings/" + buildingId);
    var renamed = false;
    var buildingCounty = "";
    var vehicles = [];

    $("h1").attr("building_type") == "7" && $('#tab_vehicle').on('DOMNodeInserted', 'script', async function () {
        $("#vehicle_table")
            .before(`<a class="btn btn-success btn-xs" id="reMaTriggerRename">
                       <span class="glyphicon glyphicon-eye-close"> RenameManager</span>
                     </a>
                     <a class="btn btn-success btn-xs" id="renameManagement" data-toggle="modal" data-target="#reMaModal">
                       <span class="glyphicon glyphicon-cog"> Einstellungen</span>
                     </a>
                     <div class="hidden" id="reMaRenameField">
                       <input type="text" class="form-control" value="Das Textfeld der Wachentypen wird in der Leitstelle Ã¼bernommen." readonly>
                       <div class="form-check">
                         <input type="checkbox" class="form-check-input" id="reMaNoKnown" ${ rename_config.building_types && rename_config.building_types[buildingType] && rename_config.building_types[buildingType].known_vehicles ? "checked" : "" }>
                         <label class="form-check-label" for="reMaNoKnown">kein Textfeld bei Ã¼bereinstimmenden Namen generieren</label>
                       </div>
                       <div class="btn-group">
                         <a class="btn btn-info" id="reMaStartRenameDispatch">Umbenennen</a>
                         <a class="btn btn-success" id="reMaSaveNamesDispatch">Alle speichern</a>
                       </div>
                       <span class="label label-info" id="reMaStatus">Status: Warte auf Eingabe</span>
                     </div>`);
    });

    $("body").on("click", "#reMaStartRenameDispatch", async function () {
        var counterTypes = {};
        vehicles = await getDispatchVehicles();

        if (vehicles.length > 1) vehicles.sort((a, b) => a.vId > b.vId ? 1 : -1);

        for (var i in vehicles) {
            var e = vehicles[i];
            $("#reMaStatus").text("Generiere Name " + (+i + 1).toLocaleString() + " von " + vehicles.length.toLocaleString());
            if (!counterTypes[e.bId]) counterTypes[e.bId] = {};
            var vehicleCounterType = rename_config.building_types[e.bType].counter_alias === true ? rename_config.vehicle_types[e.vType].alias_one : e.vType;
            counterTypes[e.bId][vehicleCounterType] ? counterTypes[e.bId][vehicleCounterType]++ : counterTypes[e.bId][vehicleCounterType] = 1;
            var confBuildingType = rename_config.building_types && rename_config.building_types[e.bType] ? rename_config.building_types[e.bType] : {};
            var confBuilding = rename_config.buildings && rename_config.buildings[e.bId] ? rename_config.buildings[e.bId] : {};
            var textField = confBuildingType.textarea;
            if (e.bType === "9" && rename_config.building_types[e.bType].second_vehicle === true && counterTypes[vehicleCounterType] === 2) {
                textField = textField.replace("{Fahrzeugtyp-Alias 1}", "{Fahrzeugtyp-Alias 2}");
            }
            if (confBuildingType.textarea && !$("#reMaRename_" + e.vId).length) {
                var vehicleNewName = await renameVehicle(confBuildingType.textarea, e.bId, e.bType, e.vType, counterTypes[e.bId][e.vType], e.bCaption);
                if ($("#reMaNoKnown")[0].checked && vehicleNewName == $("#vehicle_link_" + e.vId).text()) {
                    continue;
                }
                $("#vehicle_link_" + e.vId)
                    .after(`<input type="text" class="form-control" id="reMaRename_${ e.vId }" value="${ vehicleNewName }">
                            <a class="btn btn-success btn-xs saveSingleName" id="reMaSaveNameVehicle_${ e.vId }">Speichern</a>`);
            }
            if ($("#reMaRename_" + e.vId).length) {
                $("#reMaRename_" + e.vId).val(await renameVehicle(confBuildingType.textarea, e.bId, e.bType, e.vType, counterTypes[e.bId][e.vType], e.bCaption));
            }
        }
        $("#reMaStatus").text("Alle Fahrzeugnamen generiert.");
    });

    $("body").on("click", "#reMaSaveNamesDispatch", function () {
        renameVehicles(vehicles, buildingType);
    });

    $("body").on("click", "#vehicle_table .saveSingleName", async function () {
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

    $("body").on("click", "#reMaTriggerRename", function () {
        if ($("#reMaRenameField").hasClass("hidden")) {
            $("#reMaRenameField").removeClass("hidden");
            $("#reMaTriggerRename .glyphicon").removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
        } else {
            $("#reMaRenameField").addClass("hidden");
            $("#reMaTriggerRename .glyphicon").removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
        }
    });

})();
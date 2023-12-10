$("body")
    .prepend(`<div class="modal fade bd-example-modal-lg" id="reMaModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&#x274C;</span>
                            </button>
                        <h4 class="modal-title"><center>Rename-Manager</center></h4>
                            <div class="btn-group">
                                <a class="btn btn-success btn-xs" id="reMaVeTypes">Fahrzeugtypen</a>
                                <a class="btn btn-success btn-xs" id="reMaBuTypes">Wachentypen</a>
                                <a class="btn btn-success btn-xs" id="reMaBuFields">Rename-Felder</a>
                            </div>
                            <select class="custom-select" id="reMaSelBuType">
                                <option selected>GebÃ¤udetyp wÃ¤hlen</option>
                            </select>
                    </div>
                    <div class="modal-body" id="reMaModalBody">
                    </div>
                    <div class="modal-footer">
                        <div class="btn-group pull-right">
                            <a class="btn btn-success" id="reMaSave" save_type="">Speichern</a>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">SchlieÃŸen</button>
                        </div>
                        <div class="pull-left">v ${ rename_version }</div>
                    </div>
                </div>
            </div>`);

for (var i in buildingTypes) {
    var e = buildingTypes[i];
    $("#reMaSelBuType").append(`<option value="${ e.id }">${ e.name }</option>`);
}

$("body").on("click", "#reMaVeTypes", function() {
    buildingAndVehicleTypeTable(aVehicleTypesNew, "vehicle_types");
});

$("body").on("click", "#reMaBuTypes", function() {
    buildingAndVehicleTypeTable(buildingTypes, "building_types");
});

$("body").on("click", "#reMaSelBuType", function() {
    if (!isNaN(+$("#reMaSelBuType").val())) {
        $("#reMaModalBody").html("<center>wird generiert ...</center>");
        buildingTable(+$("#reMaSelBuType").val(), "buildings");
    }
});

$("body").on("click", "#reMaModalBody span", async function() {
    var $this = $(this);
    var lat = $this.attr("lat");
    var lon = $this.attr("lon");
    await $.getJSON("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon + "&zoom=18&addressdetails=1", function(data) {
        $this.text(data.address.county ? data.address.county : (data.address.city ? data.address.city : (data.address.town ? data.address.town : data.address.state)));
    });
    $this.css({ "cursor": "default" });
});

$("body").on("click", "#reMaSave", function() {
    saveRenameToLocalStorage($(this).attr("save_type"));
});

$("body").on("click", "#renameManagement", async function() {
    if (!isNaN(+$("#reMaSelBuType").val())) {
        $("#reMaModalBody").html("<center>wird generiert ...</center>");
        buildingTable(+$("#reMaSelBuType").val(), "buildings");
    } else {
        $("#reMaModalBody").html("");
        $("#reMaSave").attr("save_type", "");
    }
});

$("body").on("click", "#reMaBuFields", function() {
    var modalContent = `<table class="table">
                              <thead>
                                <tr>
                                  <th class="col-1">Wachentyp</th>
                                  <th class="col">Rename-Field</th>
                                </tr>
                              </thead>
                              <tbody>`;

    for (var i in buildingTypes) {
        var e = buildingTypes[i];
        modalContent += `<tr>
                            <td class="col-1">${ e.name }</td>
                            <td class="col">
                                <div class="btn-group" style="display:flex">
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Fahrzeugtyp-Alias 1}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Fahrzeugtyp-Alias 2}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Wachentyp-Alias 1}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Wachentyp-Alias 2}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Wachen-Alias 1}</a>
                                </div>
                                <div class="btn-group" style="display:flex">
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Wachen-Alias 2}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Wachenname}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{ZÃ¤hler}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{rÃ¶m. Ziffer}</a>
                                    <a class="btn btn-info btn-xs plchldrDispatch" style="flex:1" building_type="${ e.id }">{Buchstabe}</a>
                                </div>
                                <input type="text" class="form-control" id="reMaRenameTextarea_${ e.id }" value="${ rename_config.building_types && rename_config.building_types[e.id] && rename_config.building_types[e.id].textarea ? rename_config.building_types[e.id].textarea : "" }">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" building_type="${ e.id }" ${ rename_config.building_types && rename_config.building_types[e.id] && rename_config.building_types[e.id].zero_before ? "checked" : "" }>
                                    <label class="form-check-label" for="reMaZeroBefore">0 vor einstelligem ZÃ¤hler</label>
                                </div>`;
    }
    modalContent += "</tbody></table>";
    $("#reMaSave").attr("save_type", "rename_fields");
    $("#reMaModalBody").html(modalContent);
});

$("body").on("click", "#reMaModalBody .form-check-input", async function() {
    var $this = $(this);
    var buildingType = $this.attr("building_type");
    if (!rename_config.building_types) rename_config.building_types = {};
    if (!rename_config.building_types[buildingType]) rename_config.building_types[buildingType] = {}
    rename_config.building_types[buildingType].zero_before = $this[0].checked;
    await saveConfig();
});

$("body").on("click", ".plchldrDispatch", function() {
    var $this = $(this);
    var buildingType = $this.attr("building_type");
    var placeholder = $this.text();

    if (!$("#reMaRenameTextarea_" + buildingType).val().includes(placeholder)) {
        $("#reMaRenameTextarea_" + buildingType).val($("#reMaRenameTextarea_" + buildingType).val() + placeholder);
    }
    $("#reMaRenameTextarea_" + buildingType).focus();
});
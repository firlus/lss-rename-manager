const buildingTypes = [
    { "id": 0, "name": "Feuerwehr" },
    { "id": 2, "name": "Rettungswache" },
    { "id": 5, "name": "Rettungshubschrauber-Station" },
    { "id": 6, "name": "Polizei" },
    { "id": 9, "name": "THW" },
    { "id": 11, "name": "Bereitschaftspolizei" },
    { "id": 12, "name": "SEG" },
    { "id": 13, "name": "Polizeihubschrauber-Station" },
    { "id": 15, "name": "Wasserrettungswache" },
    { "id": 17, "name": "Polizei Sondereinheiten" },
    { "id": 21, "name": "Rettungshundestaffel" }
],
    rename_version = "2.0.0";

let rename_config = {};

async function checkUserId(id) {

    return { locked: false, name: null };
}

async function buildingTable(filterType, type) {
    var buildingDatabase = aBuildings.filter(b => b.building_type === filterType);
    var modalContent = `<table class="table">
                              <thead>
                                <tr>
                                  <th class="col">Bezeichnung</th>
                                  <th class="col">Alias 1</th>
                                  <th class="col">Alias 2</th>
                                </tr>
                              </thead>
                              <tbody>`;
    var i, e;

    buildingDatabase.sort((a, b) => a.caption.toUpperCase() > b.caption.toUpperCase() ? 1 : -1);

    for (i in buildingDatabase) {
        e = buildingDatabase[i];
        modalContent += `<tr>
                          <td class="col">
                            <a class="lightbox-open" href="/buildings/${ e.id }">${ e.caption }</a>
                            <br>
                            <span class="badge badge-info" lat="${ e.latitude }" lon="${ e.longitude }" style="cursor:pointer">Landkreis oder kreisfreie Stadt anzeigen</span>
                          </td>
                          <td class="col">
                            <input type="text" class="form-control form-control-sm" value="${ rename_config[type] && rename_config[type][e.id] && rename_config[type][e.id].alias_one ? rename_config[type][e.id].alias_one : "" }" id="alias_one_${ e.id }">
                          </td>
                          <td class="col">
                            <input type="text" class="form-control form-control-sm" value="${ rename_config[type] && rename_config[type][e.id] && rename_config[type][e.id].alias_two ? rename_config[type][e.id].alias_two : "" }" id="alias_two_${ e.id }">
                          </td>
                        </tr>`;
    }
    modalContent += "</tbody></table>";
    $("#reMaSave").attr("save_type", type);
    $("#reMaModalBody").html(modalContent);
}

async function buildingAndVehicleTypeTable(arrDatabase, type) {
    //arrDatabase.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1);
    var modalContent = `<table class="table">
                              <thead>
                                <tr>
                                  <th class="col">Bezeichnung</th>
                                  <th class="col">Alias 1</th>
                                  <th class="col">Alias 2</th>
                                </tr>
                              </thead>
                              <tbody>`;

    for (var i in arrDatabase) {
        var e = arrDatabase[i];
        modalContent += `<tr>
                          <td class="col">${ e.name }${ e.short_name ? ("<br>(" + e.short_name + ")") : "" }</td>
                          <td class="col">
                            <input type="text" class="form-control form-control-sm" value="${ rename_config[type] && rename_config[type][e.id] && rename_config[type][e.id].alias_one ? rename_config[type][e.id].alias_one : "" }" id="alias_one_${ e.id }">
                          </td>
                          <td class="col">
                            <input type="text" class="form-control form-control-sm" value="${ rename_config[type] && rename_config[type][e.id] && rename_config[type][e.id].alias_two ? rename_config[type][e.id].alias_two : "" }" id="alias_two_${ e.id }">
                          </td>
                        </tr>`;
    }
    modalContent += "</tbody></table>";
    $("#reMaSave").attr("save_type", type);
    $("#reMaModalBody").html(modalContent);
}
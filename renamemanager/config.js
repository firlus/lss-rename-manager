function getNotesText() {
    return new Promise(async resolve => {
        await $.get("/note", data => {
            resolve($("#note_message", data).text());
        });
    });
}

function getRenameConfig() {
    return new Promise(async resolve => {
        const placeholderDatabase = "=====DATABASE_RENAME_MANAGER=====",
            databaseStart = "=====DATABASE=====",
            databaseEnd = "\n=====RENAME_END=====",
            renameRegex = /(?:=====DATABASE_RENAME_MANAGER=====\n)(?<json>\{[.\D\d]+\})(?:\n=====RENAME_END=====)/gm,
            notes = await getNotesText(),
            databases = notes.split(databaseStart)[1] ? notes.split(databaseStart)[1].trim() : "";
        if (databases.includes(placeholderDatabase)) {
            if (databases.includes(databaseEnd)) {
                sessionStorage.renameManager = JSON.parse(databases.match(renameRegex)[0].replace(placeholderDatabase, "").replace(databaseEnd, "").trim()).value;
            } else {
                sessionStorage.renameManager = LZString.compressToUTF16(databases.match(/(?:=====DATABASE_RENAME_MANAGER=====\n)(?<json>\{.+\})/gm)[0].replace(placeholderDatabase, "").trim());
            }
            resolve(JSON.parse(LZString.decompressFromUTF16(sessionStorage.renameManager)));
        } else {
            resolve({});
        }
    });
}

async function saveRenameConfig() {
    const placeholderDatabase = "=====DATABASE_RENAME_MANAGER=====",
        databaseStart = "=====DATABASE=====",
        databaseEnd = "\n=====RENAME_END=====",
        renameRegex = /(?:=====DATABASE_RENAME_MANAGER=====\n)(?<json>\{[.\D\d]+\})(?:\n=====RENAME_END=====)/gm,
        notes = await getNotesText(),
        personalNotes = notes.split(databaseStart)[0] ? notes.split(databaseStart)[0].trim() : "",
        databases = notes.split(databaseStart)[1] ? notes.split(databaseStart)[1].trim() : "",
        utf16rename_config = JSON.stringify({ "value": LZString.compressToUTF16(JSON.stringify(rename_config)) }),
        replaceingRegex = databases.includes(databaseEnd) ? renameRegex : /(?:=====DATABASE_RENAME_MANAGER=====\n)(?<json>\{.+\})/gm,
        newContent = placeholderDatabase + "\n" + utf16rename_config + databaseEnd,
        newDatabases = databases ? (databases.includes(placeholderDatabase) ? databases.replace(replaceingRegex, newContent) : (databases + "\n" + newContent)) : (databaseStart + "\n" + newContent),
        databaseContent = personalNotes + "\n\n\n\n\n" + databaseStart + "\n" + newDatabases;
    await $.post("/note", { "note": { "message": databaseContent }, "authenticity_token": $("meta[name=csrf-token]").attr("content"), "_method": "put" });
    sessionStorage.renameManager = LZString.compressToUTF16(JSON.stringify(rename_config));
}

async function saveRenameToLocalStorage(type) {
    var i, e;
    if (!rename_config[type]) rename_config[type] = {};
    if (type == "vehicle_types") {
        for (i in aVehicleTypesNew) {
            e = aVehicleTypesNew[i];
            if (!rename_config[type][e.id]) rename_config[type][e.id] = {};
            rename_config[type][e.id].alias_one = $("#alias_one_" + e.id).val() ? $("#alias_one_" + e.id).val().trim() : "";
            rename_config[type][e.id].alias_two = $("#alias_two_" + e.id).val() ? $("#alias_two_" + e.id).val().trim() : "";
        }
    } else if (type == "building_types") {
        for (i in buildingTypes) {
            e = buildingTypes[i];
            if (!rename_config[type][e.id]) rename_config[type][e.id] = {};
            rename_config[type][e.id].alias_one = $("#alias_one_" + e.id).val() ? $("#alias_one_" + e.id).val().trim() : "";
            rename_config[type][e.id].alias_two = $("#alias_two_" + e.id).val() ? $("#alias_two_" + e.id).val().trim() : "";
        }
    } else if (type == "buildings") {
        for (i in aBuildings) {
            e = aBuildings[i];
            if (e.building_type == $("#reMaSelBuType").val()) {
                if (!rename_config[type][e.id]) rename_config[type][e.id] = {};
                rename_config[type][e.id].alias_one = $("#alias_one_" + e.id).val() ? $("#alias_one_" + e.id).val().trim() : "";
                rename_config[type][e.id].alias_two = $("#alias_two_" + e.id).val() ? $("#alias_two_" + e.id).val().trim() : "";
            }
        }
    } else if (type == "rename_fields") {
        delete rename_config[type];
        if (!rename_config.building_types) rename_config.building_types = {};
        $("#reMaModalBody input[id*='reMaRenameTextarea_']").each(function() {
            var $this = $(this);
            var fieldId = +$this.attr("id").replace(/\D+/g, "");
            var fieldValue = $this.val().trim();
            if (!rename_config.building_types[fieldId]) rename_config.building_types[fieldId] = {};
            rename_config.building_types[fieldId].textarea = fieldValue;
        });
    }
    await saveRenameConfig();
    alert("Die Einstellungen wurden gespeichert.");
    console.debug("Einstellungen im Modal gespeichert!", rename_config);
}
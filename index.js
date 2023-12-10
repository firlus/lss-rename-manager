const rename_url = "https://scripts.drtraxx.de",
    datestring = new Date().getTime();

var aVehicleTypesNew = aVehicleTypesNew || [],
    aBuildings = aBuildings || [],
    aVehicles = aVehicles || [];

(async function () {
    await $.getScript("https://api.lss-cockpit.de/lib/utf16convert.js");

    $('head').append(`<link rel="stylesheet" href="${ rename_url }/renamemanager/main.css?${ new Date().getTime() }" type="text/css" />`);

    // temporÃ¤re Nachricht an Nutzer
    if (!sessionStorage.msg_traxx) {
        $("body")
            .prepend(`<div class="modal modal_rema" tabindex="-1" role="dialog" style="display:block !important">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Wichtige Mitteilung zum Rename-Manager</h5>
                                    <button type="button" class="close" onclick="$('.modal_rema').remove()" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <p>Lieber Spieler,</p>
                                    <br>
                                    <p>Es ist zwar noch nicht der 1.3., aber leider habe ich schon jetzt schlechte Nachrichten.</p>
                                    <p>Der Support hat sich mittlerweile zu meinem Anliegen geÃ¤ÃŸert. Dies habe ich auch Deinem und eurem Engagement zu verdanken. An dieser Stelle ein dickes DankeschÃ¶n an Dich und alle anderen!</p>
                                    <p>Das Ergebnis fiel leider sehr bescheiden aus. Die Sperre bleibt bestehen, man wolle aber auch nicht auf die HintergrÃ¼nde eingehen. Man wolle immerhin die "IntegritÃ¤t der Untersuchungsmethoden" wahren. Zudem batem sie, von RÃ¼ckfragen abzusehen.</p>
                                    <p>Ich mÃ¶chte mich bei Dir fÃ¼r die Zeit im LSS, so wie das entgegengebrachte Vertrauen gegenÃ¼ber meiner (ab und an auch mal missglÃ¼ckten) Scripts bedanken. Es war eine schÃ¶ne Zeit und hat auch die meiste Zeit wirklich viel SpaÃŸ gemacht.</p>
                                    <p>Ich bitte um Dein VerstÃ¤ndnis, dass meine Scripts mit sofortiger Wirkung abgeschaltet und ersatzlos gestrichen sind.</p>
                                    <p>Vielleicht sieht, hÃ¶rt und/ oder schreibt man sich ja irgendwann in einem anderen Spiel.</p>
                                    <br>
                                    <p>Liebe GrÃ¼ÃŸe</p>
                                    <p>DrTraxx</p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" onclick="$('.modal_rema').remove()">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>`);
        sessionStorage.msg_traxx = "message shown";
    }

    return;

    if (aVehicleTypesNew.length === 0) {
        if (!localStorage.aVehicleTypesNew || JSON.parse(localStorage.aVehicleTypesNew).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
            await $.getJSON("https://api.lss-cockpit.de/de_DE/vehicletypes.json").done(data => localStorage.setItem('aVehicleTypesNew', JSON.stringify({ lastUpdate: new Date().getTime(), value: data })));
        }
        aVehicleTypesNew = JSON.parse(localStorage.aVehicleTypesNew).value;
    }

    if (aBuildings.length === 0) {
        if (!sessionStorage.cBuildings || JSON.parse(sessionStorage.cBuildings).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.cBuildings).userId != user_id) {
            await $.getJSON('/api/buildings').done(data => sessionStorage.setItem('cBuildings', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
        }
        aBuildings = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.cBuildings).value));
    }

    if (aVehicles.length === 0) {
        if (!sessionStorage.cVehicles || JSON.parse(sessionStorage.cVehicles).lastUpdate < (new Date().getTime() - 5 * 1000 * 60) || JSON.parse(sessionStorage.cVehicles).userId != user_id) {
            await $.getJSON('/api/vehicles').done(data => sessionStorage.setItem('cVehicles', JSON.stringify({ lastUpdate: new Date().getTime(), value: LZString.compressToUTF16(JSON.stringify(data)), userId: user_id })));
        }
        aVehicles = JSON.parse(LZString.decompressFromUTF16(JSON.parse(sessionStorage.cVehicles).value));
    }

    const path = window.location.pathname.replace(/\d+/g, "");

    await $.getScript(`${ rename_url }/renamemanager/config.js?${ datestring }`);
    await $.getScript(`${ rename_url }/renamemanager/variables_functions.js?${ datestring }`);
    await $.getScript(`${ rename_url }/renamemanager/renamefunctions.js?${ datestring }`);

    const securityCheck = await checkUserId(user_id);

    if (securityCheck.locked === true) {
        alert(`Hallo ${ securityCheck.name },\nDu darfst mein Script nicht nutzen!`);
        window.location.reload;
        return false;
    }

    if (path === "/") {
        $("#navbar_profile_link")
            .parent()
            .after(`<li role="presentation"><a style="cursor:pointer" id="renameManagement" data-toggle="modal" data-target="#reMaModal" ><span class="glyphicon glyphicon-home"></span> Rename-Manager</a></li>`);
        rename_config = sessionStorage.renameManager ? JSON.parse(LZString.decompressFromUTF16(sessionStorage.renameManager)) : await getRenameConfig();
        if (!rename_config.vehicle_types) {
            rename_config.vehicle_types = {};
            for (var a in aVehicleTypesNew) {
                var c = aVehicleTypesNew[a];
                rename_config.vehicle_types[c.id] = {};
                rename_config.vehicle_types[c.id].alias_one = c.short_name;
                rename_config.vehicle_types[c.id].alias_two = c.name;
            }
            await saveRenameConfig();
        }
        await $.getScript(`${ rename_url }/renamemanager/modal.js?${ datestring }`);
    }

    if (path === "/buildings/") {
        var found = $.map(buildingTypes, function (value) {
            if (value.id == $("h1").attr("building_type")) return true;
        });
        if (found.length === 0) found.push(false);

        if (found[0] === false && $("h1").attr("building_type") != "7") return false;

        rename_config = sessionStorage.renameManager ? JSON.parse(LZString.decompressFromUTF16(sessionStorage.renameManager)) : await getRenameConfig();

        if ($("h1").attr("building_type") === "7") {
            await $.getScript(`${ rename_url }/renamemanager/dispatch.js?${ datestring }`);
            await $.getScript(`${ rename_url }/renamemanager/modal.js?${ datestring }`);
        } else {
            await $.getScript(`${ rename_url }/renamemanager/buildings.js?${ datestring }`);
        }
    }

})();

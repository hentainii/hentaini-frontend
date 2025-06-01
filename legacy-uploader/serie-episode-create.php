<?php
require_once('../app/config.php');
require_once('../app/session.php');
require_once('../app/functions.php');
require_once('../app/dbconnection.php');
require_once('app/validate_authorization.php');

$data = array();
$data['current_menu'] = 'serie';
date_default_timezone_set('America/Bogota');
//$data['current_submenu'] = 'episode-create';

$data['serie'] = DB::queryFirstRow('SELECT * FROM serie WHERE id=%s', $_GET['serie_id']);

$data['players'] = DB::query('SELECT * FROM player ORDER BY id ASC');

if (trim($data['serie']['image_banner']) == '') {
    $data['episode_image'] = $config['adminpath'] . '/assets/web.png';
} else {
    $data['episode_image'] = getSerieScreenshot($data['serie']['image_screenshot']);
}

$data['visible'] = array(
    array(
        'id' => 'yes',
        'name' => 'Si',
        'selected' => true,
    ),
    array(
        'id' => 'no',
        'name' => 'No',
        'selected' => false,
    ),
);

$data['languages'] = DB::query('SELECT * FROM language ORDER BY name ASC');
foreach ($data['languages'] as $key => $value) {
    $data['languages'][$key]['selected'] = (bool) $data['languages'][$key]['selected'];
}

require_once('_header.php');
?>
<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
        <h1>
            Agregar Capitulo:
            <small><?php echo $data['serie']['name']; ?></small>
        </h1>
        <ol class="breadcrumb">
            <li><a href="<?php echo $config['adminpath']; ?>/"><i class="fa fa-dashboard"></i> Inicio</a></li>
            <li><a href="<?php echo $config['adminpath']; ?>/serie/<?php echo $data['serie']['id']; ?>/episodes"><i class="fa fa-youtube-play"></i> <?php echo $data['serie']['name']; ?></a></li>
            <li class="active">Agregar Capitulo</li>
        </ol>
    </section>

    <section class="content">
        <div class="row">
            <form name="formCap" id="formCap" onsubmit="return false">
                <div class="col-md-6">
                    <div class="box box-info">
                        <div class="box-header with-border">
                            <h3 class="box-title">Información</h3>
                        </div>
                        <div class="box-body">
                            <div class="form-group col-xs-6">
                                <label>Id Serie:</label>
                                <input style="background: #ddd;" type="text" class="form-control" name="codserie" value="<?php echo htmlspecialchars($data['serie']['id']); ?>" id="codigo" readonly />
                            </div>
                            <div class="form-group col-xs-3">
                                <label>Nro. Episodio (Requerido)</label>
                                <input type="text" class="form-control" name="nroepi" id="episodio" placeholder="ej. 1, 2, 100, etc"/>
                            </div>
                            <div class="form-group col-xs-3">
                                <label>Ep. Multiples (Opcional)</label>
                                <input type="text" class="form-control" name="groepi" id="episodiogrupo" placeholder="ej. 1-3, 1-10, etc." />
                            </div>
                            <div class="form-group col-xs-6">
                                <label>Fecha</label>
                                <input type="text" class="form-control" name="fecha" id="fecha" value="<?php echo date('Y-m-d'); ?>" />
                            </div>
                            <!-- <div class="form-group col-xs-4">
                                <label>Actualizar Fecha</label><br>
                                <input type="checkbox" value="" name="update_date" />
                            </div> -->
                            <div class="form-group col-xs-6">
                                <label>Visible</label>
                                <select name="visible" class="form-control">
                                    <?php foreach ($data['visible'] as $visible) { ?>
                                        <option value="<?php echo $visible['id']; ?>" <?php echo ($visible['selected'] == true ? ' selected' : ''); ?>><?php echo $visible['name']; ?></option>
                                    <?php } ?>
                                </select>
                            </div>
                            <div class="form-group col-xs-6">
                                <label>Idioma</label>
                                <select name="titulo" class="form-control">
                                    <?php foreach ($data['languages'] as $language) { ?>
                                        <option value="<?php echo $language['id']; ?>" <?php echo ($language['selected'] == true ? ' selected' : ''); ?>><?php echo $language['name']; ?></option>
                                    <?php } ?>
                                </select>
                            </div>
                            <!-- <div class="form-group col-xs-6">
                                <label>¿Enviar Notificacion?</label>
                                <input type="checkbox" name="send_notification" id="send_notification">
                                <input type="text" class="form-control" name="text_notification" value="Nuevo capitulo de <?php echo $data['serie']['name']; ?>">
                            </div> -->
                            <div class="form-group col-xs-6">
                                <?php
                                    $release_date = DB::query('SELECT release_date FROM serie WHERE id=%i', $data['serie']['id']);
                                    $actual_next_episode_date = DB::query('SELECT date_next_episode FROM serie WHERE id=%i', $data['serie']['id']);
                                    $actual_date = date("Y-m-d");
                                    if(!empty($actual_next_episode_date[0]['date_next_episode'])) {
                                        if($actual_next_episode_date[0]['date_next_episode'] <= $actual_date){
                                            $day_of_release = date("l", strtotime($release_date[0]['release_date']));
                                            $next_episode_date = date("Y-m-d", strtotime("next " . $day_of_release));
                                        } else {
                                            $next_episode_date = $actual_next_episode_date[0]['date_next_episode'];
                                        }
                                    }
                                ?>
                                <label>¿Actualizar fecha de siguiente cap?</label>
                                <input type="text" class="form-control" name="update_date_next_episode_data" value="<?php echo $next_episode_date; ?>" id="update_date_next_episode_control" />
                                <input type="checkbox" checked name="update_date_next_episode" id="update_date_next_episode">
                            </div>
                            <div class="form-group col-xs-6">
                                <label>Imagen Facebook</label>
                                <input type="text" class="form-control" value="" onblur="vista_previa(this.value)" name="facebook" />
                            </div>
                            <!-- /input-group -->
                        </div>
                        <!-- /.box-body -->
                    </div>

                </div>

                <div class="col-md-6">
                    <div class="box box-success">
                        <div class="box-header with-border">
                            <h3 class="box-title">IMAGEN</h3>
                        </div>
                        <div class="box-body">
                            <div class="form-group">
                                <center><img id="imgRepro" src="<?php echo $data['episode_image']; ?>" class="user-image img-responsive" style="padding: 2px;border: 1px solid #999;border-radius: 2px;height: 270px;" height="247px" width="509.5px"></center>
                            </div>

                            <div class="form-group col-xs-9">
                                <div class="alert alert-info" id="error_add" style="display:none;">
                                </div>

                                <div class="progress progress-striped active" id="precarga_envio" style="display:none;">
                                    <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-success" name="enviar" id="AddCap"><i class=" fa fa-plus-square"></i> Agregar</button>
                            </div>
                            <!-- /input-group -->
                        </div>
                        <!-- /.box-body -->
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="box box-info">
                        <div class="box-header with-border">
                            <h3 class="box-title">Reproductores</h3>
                        </div>
                        <div class="box-body">

                            <div class="form-group">
                                <div class="callout callout-danger lead">
                                    <p style="font-size:11px;">
                                        No repetir los reproductores, en caso de querer usar el mismo con otro codigo, ingresar un nuevo reproductor con otro nombre y la misma url!.
                                    </p>
                                </div>
                                <table class="table table-bordered" id="repros">
                                    <tbody id="op_repros">
                                        <tr>
                                            <th></th>
                                            <th>Reproductor</th>
                                            <th>Codigo</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <a class="btn btn-default" href="javascript:;" id="arepro">Agregar Reproductor</a>
                            <a class="btn btn-success" href="javascript:;" id="modeloEmision">Modelo Emision</a>
                            <a class="btn btn-danger" href="javascript:;" id="modeloFinalizados">Modelo Finalizados</a>
                            <a class="btn btn-default" href="javascript:;" id="modeloReset">Restaurar Campos</a>
                            <!-- /input-group -->
                        </div>
                        <!-- /.box-body -->
                    </div>

                </div>

                <div class="col-md-6">
                    <div class="box box-danger">
                        <div class="box-header with-border">
                            <h3 class="box-title">Enlaces de Descarga</h3>
                        </div>
                        <div class="box-body">

                            <table class="table table-bordered" id="descargas">
                                <tbody id="op_descarga">
                                    <tr>
                                        <th>Enlace</th>
                                    </tr>
                                </tbody>
                            </table>

                            <a class="btn btn-default" href="javascript:;" id="adescarga">Agregar Descarga</a>
                            <!-- /input-group -->
                        </div>
                        <!-- /.box-body -->
                    </div>

                </div>
                
            </form>
            <!-- Uploader  -->
            <div class="col-md-12">
                <div class="box box-danger">
                    <div class="box-header with-border">
                        <h3 class="box-title">Uploader V1</h3>
                    </div>
                    <div class="box-body">
                        <div class="container-fluid" style="margin-top: 20px;">
                            <div class="row">
                                <div class="form-group">
                                    <div class="col-md-12">
                                        <form id="uploadForm">
                                            <label for="videoFile" class="control-label">Selecciona un video</label>
                                            <input class="form-control" type="file" id="videoFile" name="videoFile" accept=".mp4" required>
                                            <button type="submit" class="btn btn-primary" style="margin-top:20px;">Subir</button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div class="row" style="margin-top: 20px;">
                                <div class="col-xs-12">
                                    <h4>Progreso Subidas</h4>
                                    <div class="table-responsive">
                                        <table id="serviceTable" class="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Cargando... Espere...</th>
                                                </tr>
                                            </thead>
                                            <tbody id="uploadProgressTableBody">
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

</div>
<!-- /.content-wrapper -->

<?php startZone(); ?>
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script> <!-- Carga jQuery 3.7.1 -->
<script>var $j = jQuery.noConflict(true);</script> <!-- Libera el uso de $ para otras librerías -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script> <!-- Carga el JS de Bootstrap 3.6 para el uploader (modal) -->
<script src="<?php echo $config['adminpath']; ?>/themes/frans185/js/components/bootstrap-datepicker.min.js"></script>
<script src="<?php echo $config['adminpath']; ?>/themes/frans185/js/components/bootstrap-datepicker.es.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script type="module">
    import { Storage } from 'https://unpkg.com/megajs/dist/main.browser-es.mjs';
    function uploadToMega(file, account, progressCallback) {
        return new Promise((resolve, reject) => {
            try {
                const storage = new Storage({
                    email: account.email,
                    password: account.password,
                    userAgent: 'Mozilla/5.0'
                }).ready;

                storage.then(storage => {
                    const upload = storage.upload({
                        name: file.name,
                        size: file.size
                    });

                    upload.on('progress', progressCallback);

                    const reader = new FileReader();
                    reader.onload = async function(event) {
                        const fileData = new Uint8Array(event.target.result);
                        upload.write(fileData);
                        upload.end();
                        
                        try {
                            const uploadedFile = await upload.complete;
                            const link = await uploadedFile.link();
                            const embedCode = link.split('file/')[1];
                            resolve(embedCode);
                        } catch (uploadError) {
                            console.error('Error durante la subida a Mega:', uploadError);
                            reject(uploadError);
                        }
                    };
                    reader.readAsArrayBuffer(file);
                }).catch(error => {
                    console.error('Error durante la conexión a Mega:', error);
                    reject(error);
                });
            } catch (error) {
                console.error('Error durante la inicialización de Mega:', error);
                reject(error);
            }
        });
    }
    function uploadToYourupload(file, account, updateProgress) {
        return new Promise((resolve, reject) => {
            try {
                // Primero, obtenemos los datos de autenticación necesarios para YourUpload
                $.ajax({
                    type: "POST",
                    url: '<?php echo $config['uploaderpath']; ?>/yourupload-getfolder.php',
                    dataType: "json",
                    data: {
                        email: account.email,
                        password: account.password
                    },
                    success: function(respuesta) {
                        // Usamos uploadInChunks con los datos de respuesta y enviamos el archivo en fragmentos
                        uploadInChunks(file, '<?php echo $config['uploaderpath']; ?>/yourupload-uploadfile.php', {
                            cookie: respuesta.cookie,
                            folder: respuesta.folder
                        }, updateProgress).then(resolve).catch(reject);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        reject(`Error al obtener cookie y folder: ${textStatus} ${errorThrown}`);
                    }
                });
            } catch (error) {
                console.error('Error durante la inicialización de yourupload:', error);
                reject(error);
            }
        });
    }
    function uploadToMp4upload(file, account, updateProgress) {
        return uploadInChunks(file, '<?php echo $config['uploaderpath']; ?>/mp4upload-handler.php', {
            api_key: account.api_key,
            username: account.username,
            password: account.password
        }, updateProgress);
    }
    function uploadToVHide(file, account, updateProgress) {
        return uploadInChunks(file, '<?php echo $config['uploaderpath']; ?>/vhide-handler.php', {
            api_key: account.api_key
        }, updateProgress);
    }
    function uploadToSTREAM2(file, account, updateProgress) {
        return uploadInChunks(file, '<?php echo $config['uploaderpath']; ?>/STREAM2-handler.php', {
            api_key: account.api_key
        }, updateProgress);
    }

    function uploadInChunks(file, url, additionalData = {}, progressCallback) {
        const chunkSize = 1 * 1024 * 1024; // Tamaño de 10 MB por fragmento
        const totalChunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        let uploadedBytes = 0; // Track uploaded bytes

        return new Promise((resolve, reject) => {
            function sendChunk() {
                const start = currentChunk * chunkSize;
                const end = Math.min(file.size, start + chunkSize);
                const chunk = file.slice(start, end);

                let formData = new FormData();
                formData.append('chunk', chunk);
                formData.append('file_name', file.name);
                formData.append('chunk_number', currentChunk);
                formData.append('total_chunks', totalChunks);

                for (let key in additionalData) {
                    formData.append(key, additionalData[key]);
                }

                $.ajax({
                    type: "POST",
                    url: url,
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        if (response.success) {
                            uploadedBytes += chunk.size;
                            currentChunk++;

                            // Update progress with total bytes uploaded and file size
                            progressCallback({ bytesUploaded: uploadedBytes, bytesTotal: file.size });

                            if (currentChunk < totalChunks) {
                                sendChunk(); // Enviar siguiente fragmento
                            } else {
                                resolve(response.file_code || response.message);
                            }
                        } else {
                            reject(`Error en el servidor: ${response.error || 'No se recibió mensaje de error'}`);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        reject(`Error en la carga del fragmento: ${textStatus} ${errorThrown || jqXHR.responseText}`);
                    }
                });
            }

            sendChunk();
        });
    }


    $j(document).ready(async function() {
        let services = [];
        let accounts = [];
        let currentSerie = null;
        
        const serviceTable = $j('#serviceTable');
        const uploadProgressTableBody = $j('#uploadProgressTableBody');

        function handleApiError(error) {
            console.error('Error en la API:', error);
            alert('Ocurrió un error: ' + error.responseText);
        }

        function loadAccounts() {
            $j.get('<?php echo $config['adminpath']; ?>/uploader/player-list.php')
                .done(function(response) {
                    services = response.map(account => {
                        return { id: account.id, service: account.service, username: account.username, api_key: account.api_key, up_available: account.up_available, name: account.name}
                    });
                    const filteredServices = response.filter(service => service.accounts.length > 0);
                    filteredServices.forEach(service => {
                        service.accounts.forEach(account => {
                            const index = account.id.toString()
                            accounts[index] = {
                                ...account,
                                service_id: service.id
                            }
                        });
                    });
                    generateColumnsOnServiceTable();
                    createProgressBars();
                })
                .fail(handleApiError);
        }

        function generateColumnsOnServiceTable() {
            serviceTable.find('thead tr').empty();
            serviceTable.find('thead tr').append('<th>Anime</th>');
            services.forEach(service => {
                if (service.up_available === "1") {
                    serviceTable.find('thead tr').append(`
                    <th width="100px">${service.name.charAt(0).toUpperCase() + service.name.slice(1)}</th>
                `);
                }
            });
        }

        function createProgressBars() {
            const animeName = "<?php echo $data['serie']['name']; ?>";
            let progressRow = $j('<tr>').append(
                $j('<td>').text(animeName)
            );

            // En la generación de la tabla de progreso
            services.forEach(service => {
                if (service.up_available === "1") {
                    const uniqueId = service.name;
                    progressRow.append(
                        $j('<td>').append(
                            $j('<div>').addClass('progress').addClass(uniqueId).prepend(
                                $j('<div>').addClass(`progress-bar progress-bar-${uniqueId} progress-bar-striped active`).attr({
                                    role: 'progressbar',
                                    'aria-valuemin': 0,
                                    'aria-valuemax': 100
                                }).text('0%')
                            ),
                            // Agrega un contenedor para el botón de Retry
                            $j('<div>').addClass(`retry-btn-container-${uniqueId}`).hide(),
                            // Agrega un contenedor para mensajes de error
                            $j('<div>').addClass(`error-message-${uniqueId}`).css('color', 'red').hide()
                        )
                    );
                }
            });

            uploadProgressTableBody.empty().append(progressRow);
        }

        function retryUpload(file, account, updateProgress) {
            return handleUploadByService(file, account, updateProgress);
        }

        async function handleUploadByService(file, account, updateProgress) {
            switch (account.service) {
                case 'M':
                    return await uploadToMega(file, account, updateProgress); // Mega soporta progreso real
                case 'YourUpload':
                    // Progreso simulado para YourUpload
                    const yourUploadCode = await uploadToYourupload(file, account, updateProgress);
                    return yourUploadCode;
                case 'Mp4upload':
                    // Progreso simulado para Mp4upload
                    const mp4UploadCode = await uploadToMp4upload(file, account, updateProgress);
                    return mp4UploadCode;
                case 'VHide':
                    // Progreso simulado para VHide
                    const vHideCode = await uploadToVHide(file, account, updateProgress);
                    return vHideCode;
                case 'STREAM2':
                    // Progreso simulado para VHide
                    const STREAM2 = await uploadToSTREAM2(file, account, updateProgress);
                    return STREAM2;
                default:
                    throw new Error(`Servicio no reconocido: ${account.service}`);
            }
        }

        loadAccounts();

        // Manejo de subida
        $j('#uploadForm').on('submit', async function(e) {
            const animeName = "<?php echo $data['serie']['name']; ?>";
            $j('#uploadForm button').prop('disabled', true);
            e.preventDefault();
            
            if (accounts.length === 0) {
                alert('No hay cuentas disponibles para subir el archivo. Ve a los reproductores y añade una.');
                return;
            }
            const file = $j('#videoFile')[0].files[0];

            if (!file) {
                alert('Por favor, selecciona un archivo.');
                return;
            }

            const uploadPromises = accounts.map(async account => {
                if (!account) return;

                const updateProgress = (progress) => {
                    if (!progress || typeof progress.bytesUploaded === 'undefined' || typeof progress.bytesTotal === 'undefined') {
                        console.warn("Información de progreso no disponible.");
                        return;
                    }
                    const percentage = (progress.bytesUploaded / progress.bytesTotal * 100).toFixed(2);
                    const uniqueId = account.service;
                    console.log(percentage, uniqueId)
                    uploadProgressTableBody.find(`.progress-bar-${uniqueId}`)
                        .css('width', percentage + '%')
                        .attr('aria-valuenow', percentage)
                        .text(percentage + '%');
                    if (progress.bytesUploaded === progress.bytesTotal) {
                        uploadProgressTableBody.find(`.progress-bar-${uniqueId}`).addClass('progress-bar-success').text('Completado');
                    }
                };

                try {
                    let embedCode = await handleUploadByService(file, account, updateProgress);
                    addPlayerFromUploader('added_3', account.id, account.service_id, account.service, embedCode);
                } catch (error) {
                    console.error(`Error al subir a ${account.service}`, error);
                    // Mostrar mensaje de error en la interfaz
                    uploadProgressTableBody.find(`.error-message-${uniqueId}`).text(`Error: ${error.message || error}`).show();
                    // Mostrar el botón de Retry
                    const retryButton = $j(`<button class="btn btn-warning btn-xs retry-btn">Retry</button>`);
                    retryButton.on('click', async () => {
                        retryButton.prop('disabled', true); // Deshabilitar mientras se reintenta
                        try {
                            uploadProgressTableBody.find(`.error-message-${uniqueId}`).hide();
                            let embedCode = await retryUpload(file, account, updateProgress);
                            addPlayerFromUploader('added_3', account.id, account.service_id, account.service, embedCode);
                            // Actualizar la barra de progreso
                            uploadProgressTableBody.find(`.progress-bar-${uniqueId}`).addClass('progress-bar-success').text('Completado');
                            // Ocultar el botón de retry
                            retryButton.hide();
                        } catch (retryError) {
                            console.error(`Error al reintentar subir a ${account.service}`, retryError);
                            uploadProgressTableBody.find(`.error-message-${uniqueId}`).text(`Error: ${retryError.message || retryError}`).show();
                            retryButton.prop('disabled', false); // Rehabilitar el botón si falla el reintento
                        }
                    });
                    
                    uploadProgressTableBody.find(`.retry-btn-container-${account.service}`).empty().append(retryButton).show();
                }
            });

            await Promise.all(uploadPromises);
        });

        var contentForUploader = $("#op_repros"); //ID del contenedor
        function addPlayerFromUploader(added, contador, player, playername, code) {
            $(contentForUploader).append('<tr id="cvideo_' + contador + '" class="' + added + ' sortable-row"><td class="drag-handle"><i class="fa fa-bars"></i></td><td><div class="form-group"><select class="form-control" name="video[]"><option value="' + player + '">' + playername + '</option><?php foreach ($data['players'] as $player) { ?><option value="<?php echo htmlspecialchars($player['id']); ?>"><?php echo str_replace("'", "\\'", $player['name']); ?></option><?php } ?></select></div></td><td><div class="form-group"><input type="text" class="form-control" value="' + code + '" name="codigo[]"/></div></td><td><div class="form-group"><a id="video_' + contador + '" class="btn btn-danger btn-xs eliminar-vid"><i class="fa fa-times"></i></a></div></td></tr>');
        }

        // Inicializar Sortable.js en la tabla de reproductores
        var el = document.getElementById('op_repros');
        var sortable = Sortable.create(el, {
            handle: '.drag-handle', // Arrastrar usando el handle
            animation: 150
        });
    });
</script>
<script type="text/javascript">
    var urlWeb = '<?php echo $config['adminpath']; ?>';

    function vista_previa(result) {
        if (result != '') {
            $('#imgRepro').attr("src", result);
        } else {
            $('#imgRepro').attr("src", "<?php echo $data['episode_image']; ?>");
        }
    }
    $(document).ready(function() {
        $('#update_date_next_episode_control').datepicker({
            language: 'es',
            autoclose: true,
            format: 'yyyy-mm-dd',
        });
        var players = <?php echo json_encode($data['players']);?>;
        function addPlayer(added, contador) {
            $(content).append('<tr id="cvideo_' + contador + '" class="' + added + ' sortable-row"><td class="drag-handle"><i class="fa fa-bars"></i></td><td><div class="form-group"><select class="form-control" name="video[]"><?php foreach ($data['players'] as $player) { ?><option value="<?php echo htmlspecialchars($player['id']); ?>"><?php echo str_replace("'", "\'", $player['name']); ?></option><?php } ?></select></div></td><td><div class="form-group"><input type="text" class="form-control" value="" name="codigo[]"/></div></td><td><div class="form-group"><a id="video_' + contador + '" class="btn btn-danger btn-xs eliminar-vid"><i class="fa fa-times"></i></a></div></td></tr>');
        }
        function genModelo(added, contador, modeloId, modeloNamesId) {
            $(content).append('<tr id="cvideo_' + contador + '" class="' + added + ' sortable-row"><td class="drag-handle"><i class="fa fa-bars"></i></td><td><div class="form-group"><select class="form-control" name="video[]"><option value="' + modeloId + '">' + modeloNamesId + '</option><?php foreach ($data['players'] as $player) { ?><option value="<?php echo htmlspecialchars($player['id']); ?>"><?php echo str_replace("'", "\'", $player['name']); ?></option><?php } ?></select></div></td><td><div class="form-group"><input type="text" class="form-control" value="" name="codigo[]"/></div></td><td><div class="form-group"><a id="video_' + contador + '" class="btn btn-danger btn-xs eliminar-vid"><i class="fa fa-times"></i></a></div></td></tr>');
        }
        var MaxInputs = 9; //Número Maximo de Campos
        var contenedor = $("#op_descarga"); //ID del contenedor
        var AddButton = $("#adescarga"); //ID del Botón Agregar
        //var x = número de campos existentes en el contenedor
        var x = $("#descargas tr").length + 1;
        var FieldCount = x - 1; //para el seguimiento de los campos

        /*variables reproductor*/
        var max = 24; //Número Maximo de Campos
        var content = $("#op_repros"); //ID del contenedor
        var AddButtonRepro = $("#arepro"); //ID del Botón Agregar
        var modeloEmision = $("#modeloEmision");
        var modeloFinalizados = $("#modeloFinalizados");
        //var x = número de campos existentes en el contenedor
        var y = $("#repros tr").length + 1;
        var contador = y - 1; //para el seguimiento de los campos

        $(AddButtonRepro).click(function(e) {
            
            if (y <= max) //max input box allowed
            {
                contador++;
                //agregar campo
                addPlayer('added_3',contador);
                y++; //text box increment
            }
            return false;
        });

        $(modeloEmision).click(function(){
            $(".added_1").remove();
            var modelo = [
                '17', '6', '15','16','2','21','12', '22','3', '25'
            ];
            var modeloNames = [
                'TERA', 'YourUpload', 'M', 'STREAM2', 'VHide', 'Burst', 'Ru', 'Fireload', 'Mp4upload', 'Senvid'
            ];
            var y = $("#repros tr").length + 1;
            for (i = y - 2; i <= modeloNames.length - 1; i++){
                contador++;
                genModelo('added_2',i,modelo[i],modeloNames[i]);
                y++;
            }
            return true;
        });

        $(modeloFinalizados).click(function(){
            $(".added_2").remove();
            var modelo = [
                '17','6','16','2','22','21','3','4','15'
            ];
            var modeloNames = [
                'TERA','YourUpload', 'STREAM2', 'VHide', 'Fireload','Burst',  'Mp4upload', 'Senvid', 'Mega'
            ];
            var y = $("#repros tr").length + 1;
            for (i = y - 2; i <= modeloNames.length - 1; i++){
                contador++;
                genModelo('added_1',i,modelo[i],modeloNames[i]);
                y++;
            }
        });

        $(modeloReset).click(function(){
            $(".added_1").remove();
            $(".added_2").remove();
            $(".added_3").remove();
        });

        $("body").on("click", ".eliminar-vid", function(e) { //click en eliminar campo
            var numero1 = $(this).attr('id');
            var n1 = numero1.replace('video_', '');
            $("#cvideo_" + n1).remove();
            return false;
        });

        $(AddButton).click(function(e) {
            if (x <= MaxInputs) //max input box allowed
            {
                FieldCount++;
                //agregar campo
                $(contenedor).append('<tr id="cont_descarga_' + FieldCount + '"><th> <div class="form-group"> <input type="text" class="form-control" value="" name="url[]" id="campo_1"/> </div></th> <th> <div class="form-group"> <a id="del_' + FieldCount + '" class="btn btn-danger btn-xs eliminar"><i class="fa fa-times"></i></a> </div></th></tr>');
                x++; //text box increment
            }
            return false;
        });

        $("body").on("click", ".eliminar", function(e) { //click en eliminar campo
            var numero = $(this).attr('id');
            if (x > 1) {
                var n = numero.replace('del_', '');;
                $("#cont_descarga_" + n).remove();
                x--;
            }
            return false;
        });


        $('#AddCap').click(function() {
            var nroepi = $("#episodio").val();
            var fecha = $("#fecha").val();
            var codserie = $("#codigo").val();
            if (nroepi == "" || fecha == "" || codserie == "") {
                $('#error_add').html('Completa los campos');
                $('#error_add').hide().fadeIn();
            } else {
                $('#error_add').css("display", "none");
                $('#precarga_envio').css("display", "block");
                document.getElementById('AddCap').disabled = true;
                var este = $('#formCap');
                setTimeout(function() {
                    $.ajax({
                        type: 'POST',
                        url: urlWeb + '/api/c.subir-cap.php',
                        data: este.serialize(),
                        success: function(html) {
                            if (html == 'subido') {
                                location.href = urlWeb + '/serie/' + codserie + '/episodes';
                            } else {
                                $('#precarga_envio').css("display", "none");
                                $('#error_add').html(html);
                                $('#error_add').hide().fadeIn();
                                document.getElementById('AddCap').disabled = false;
                            }
                        }
                    });
                }, 2000);
            }
        });

    });
</script>
<?php
$footer_js = endZone();

require_once('_footer.php');
